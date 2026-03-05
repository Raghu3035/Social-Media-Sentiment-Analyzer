"""
Route: /results
GET /results  — retrieve stored sentiment logs with optional filtering
"""

from fastapi import APIRouter, Query
from typing import Optional

from app.database.db import fetch_logs

router = APIRouter()


@router.get("")
async def get_results(
    sentiment: Optional[str] = Query(None, description="Filter by: positive | negative | neutral"),
    limit: int = Query(50, ge=1, le=500),
    skip: int = Query(0, ge=0),
):
    """
    Retrieve stored sentiment analysis results.
    Supports filtering by sentiment label and pagination.
    """
    valid_sentiments = {"positive", "negative", "neutral", None}
    if sentiment and sentiment not in valid_sentiments:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="sentiment must be positive, negative, or neutral")

    logs = await fetch_logs(sentiment_filter=sentiment, limit=limit, skip=skip)
    return {"results": logs, "count": len(logs)}
