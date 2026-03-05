"""
Pydantic schemas for request validation and response serialization.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime


class AnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000, description="Comment text to analyze")

    @field_validator("text")
    @classmethod
    def text_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("text must not be blank")
        return v.strip()


class AnalyzeResponse(BaseModel):
    comment: str
    sentiment: str
    confidence: float
    compound: float
    polarity: float
    subjectivity: float
    processed_text: str
    timestamp: str


class SentimentLog(BaseModel):
    id: Optional[str] = None
    comment: str
    sentiment: str
    confidence: float
    polarity: float = 0.0
    subjectivity: float = 0.0
    source: str = "manual"
    timestamp: str


class StatisticsResponse(BaseModel):
    total: int
    positive: int
    negative: int
    neutral: int
    positive_pct: float
    negative_pct: float
    neutral_pct: float


class KeywordItem(BaseModel):
    word: str
    count: int


class TrendPoint(BaseModel):
    date: str
    positive: int
    negative: int
    neutral: int
