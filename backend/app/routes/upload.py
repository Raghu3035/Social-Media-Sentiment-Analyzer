"""
Route: /upload
POST /upload  — upload a CSV file of comments for batch analysis
"""

import io
from datetime import datetime, timezone

import pandas as pd
from fastapi import APIRouter, UploadFile, File, HTTPException

from app.nlp.sentiment_engine import analyze
from app.database.db import bulk_insert_logs

router = APIRouter()

ALLOWED_TYPES = {"text/csv", "application/csv", "application/vnd.ms-excel", "text/plain"}
MAX_ROWS = 5000


@router.post("")
async def upload_csv(file: UploadFile = File(...)):
    """
    Accept a CSV file with a 'comment' (or 'text') column.
    Performs sentiment analysis on all rows and stores results.
    Returns summary of processed records.
    """
    # Validate file type
    if file.content_type not in ALLOWED_TYPES and not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not parse CSV: {str(e)}")

    # Detect comment column (flexible naming)
    col_candidates = ["comment", "text", "review", "message", "content", "Comment", "Text"]
    comment_col = None
    for c in col_candidates:
        if c in df.columns:
            comment_col = c
            break

    if comment_col is None:
        raise HTTPException(
            status_code=400,
            detail=f"CSV must contain a 'comment' or 'text' column. Found: {list(df.columns)}",
        )

    # Drop rows with empty comments
    df = df.dropna(subset=[comment_col])
    df[comment_col] = df[comment_col].astype(str).str.strip()
    df = df[df[comment_col].str.len() > 0]

    if len(df) == 0:
        raise HTTPException(status_code=400, detail="No valid comments found in the CSV.")

    # Cap to MAX_ROWS to prevent abuse
    if len(df) > MAX_ROWS:
        df = df.head(MAX_ROWS)

    # Analyze each row
    docs = []
    counts = {"positive": 0, "negative": 0, "neutral": 0}
    timestamp_base = datetime.now(timezone.utc)

    for i, row in df.iterrows():
        text = row[comment_col]
        try:
            result = analyze(text)
        except Exception:
            result = {"sentiment": "neutral", "confidence": 0.5, "polarity": 0, "subjectivity": 0}

        counts[result["sentiment"]] = counts.get(result["sentiment"], 0) + 1

        docs.append({
            "comment": text,
            "sentiment": result["sentiment"],
            "confidence": result.get("confidence", 0.5),
            "polarity": result.get("polarity", 0),
            "subjectivity": result.get("subjectivity", 0),
            "source": "csv",
            "timestamp": timestamp_base.isoformat(),
        })

    try:
        await bulk_insert_logs(docs)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    return {
        "status": "success",
        "processed": len(docs),
        "counts": counts,
        "message": f"Successfully analyzed {len(docs)} comments.",
    }
