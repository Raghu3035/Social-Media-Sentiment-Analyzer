"""
Route: /statistics
GET /statistics  — overall sentiment distribution
GET /statistics/trend  — sentiment trend over time
"""

from fastapi import APIRouter, Query
from app.database.db import fetch_statistics, fetch_trend

router = APIRouter()


@router.get("")
async def get_statistics():
    """Return overall sentiment counts and percentages."""
    stats = await fetch_statistics()
    return stats


@router.get("/trend")
async def get_trend(days: int = Query(7, ge=1, le=30)):
    """Return daily sentiment counts for the last N days."""
    trend = await fetch_trend(days=days)
    return {"trend": trend}
