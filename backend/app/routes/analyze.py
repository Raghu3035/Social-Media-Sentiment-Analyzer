"""
Route: /analyze
POST /analyze  — analyze a single comment
"""

from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone

from app.models.schemas import AnalyzeRequest, AnalyzeResponse
from app.nlp.sentiment_engine import analyze
from app.database.db import insert_log

router = APIRouter()


@router.post("", response_model=AnalyzeResponse)
async def analyze_comment(req: AnalyzeRequest):
    """
    Analyze a single comment for sentiment.
    Saves result to database and returns analysis.
    """
    try:
        result = analyze(req.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"NLP processing error: {str(e)}")

    timestamp = datetime.now(timezone.utc).isoformat()

    doc = {
        "comment": req.text,
        "sentiment": result["sentiment"],
        "confidence": result["confidence"],
        "polarity": result["polarity"],
        "subjectivity": result["subjectivity"],
        "source": "manual",
        "timestamp": timestamp,
    }

    try:
        await insert_log(doc)
    except Exception as e:
        # Non-fatal — return result even if DB write fails
        print(f"DB insert warning: {e}")

    return AnalyzeResponse(
        comment=req.text,
        sentiment=result["sentiment"],
        confidence=result["confidence"],
        compound=result["compound"],
        polarity=result["polarity"],
        subjectivity=result["subjectivity"],
        processed_text=result["processed_text"],
        timestamp=timestamp,
    )
