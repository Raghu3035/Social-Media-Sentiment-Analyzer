"""
Route: /keywords
GET /keywords  — top keywords from stored comments
"""

from fastapi import APIRouter, Query
from typing import Optional

from app.database.db import fetch_logs
from app.nlp.keyword_extractor import extract_keywords

router = APIRouter()


@router.get("")
async def get_keywords(
    sentiment: Optional[str] = Query(None),
    top_n: int = Query(20, ge=5, le=50),
):
    """
    Return top N keywords extracted from stored comments.
    Optionally filter by sentiment.
    """
    logs = await fetch_logs(sentiment_filter=sentiment, limit=2000)
    comments = [log.get("comment", "") for log in logs]
    keywords = extract_keywords(comments, top_n=top_n)
    return {"keywords": keywords, "total_comments": len(comments)}
