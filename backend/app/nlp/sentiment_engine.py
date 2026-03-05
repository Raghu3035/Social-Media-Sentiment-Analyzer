"""
Sentiment Analysis Engine
Uses VADER (primary) with TextBlob as secondary to classify text sentiment.
Returns sentiment label and confidence score.
"""

from typing import Dict, Any, Tuple
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from textblob import TextBlob

from app.nlp.text_preprocessing import preprocess_keep_structure

# Initialize VADER once (expensive to create each call)
_vader = SentimentIntensityAnalyzer()


def _vader_analyze(text: str) -> Tuple[str, float, float]:
    """
    Analyze using VADER.
    Returns (label, confidence, compound_score).
    """
    scores = _vader.polarity_scores(text)
    compound = scores["compound"]

    if compound >= 0.05:
        label = "positive"
        confidence = round((compound + 1) / 2, 4)  # normalize 0-1
    elif compound <= -0.05:
        label = "negative"
        confidence = round((abs(compound) + 1) / 2, 4)
    else:
        label = "neutral"
        # Confidence for neutral is how close to 0
        confidence = round(1 - abs(compound) * 10, 4)
        confidence = max(0.5, min(confidence, 0.99))

    return label, confidence, compound


def _textblob_analyze(text: str) -> Tuple[str, float, float, float]:
    """
    Analyze using TextBlob.
    Returns (label, confidence, polarity, subjectivity).
    """
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity        # -1 to +1
    subjectivity = blob.sentiment.subjectivity  # 0 to 1

    if polarity > 0.05:
        label = "positive"
        confidence = round((polarity + 1) / 2, 4)
    elif polarity < -0.05:
        label = "negative"
        confidence = round((abs(polarity) + 1) / 2, 4)
    else:
        label = "neutral"
        confidence = round(1 - abs(polarity) * 5, 4)
        confidence = max(0.5, min(confidence, 0.99))

    return label, confidence, polarity, subjectivity


def analyze(text: str) -> Dict[str, Any]:
    """
    Main sentiment analysis function.
    Combines VADER and TextBlob for robust results.
    VADER is primary; TextBlob provides polarity/subjectivity metadata.

    Returns:
        {
          "sentiment": "positive" | "negative" | "neutral",
          "confidence": float,
          "compound": float,       # VADER compound score
          "polarity": float,       # TextBlob polarity
          "subjectivity": float,   # TextBlob subjectivity
          "processed_text": str
        }
    """
    if not text or not text.strip():
        return {
            "sentiment": "neutral",
            "confidence": 0.5,
            "compound": 0.0,
            "polarity": 0.0,
            "subjectivity": 0.0,
            "processed_text": "",
        }

    cleaned = preprocess_keep_structure(text)

    vader_label, vader_conf, compound = _vader_analyze(cleaned)
    tb_label, tb_conf, polarity, subjectivity = _textblob_analyze(cleaned)

    # Blend: VADER gets 65% weight, TextBlob 35%
    # For label: if both agree use that, else use VADER
    if vader_label == tb_label:
        final_label = vader_label
        final_conf = round(vader_conf * 0.65 + tb_conf * 0.35, 4)
    else:
        final_label = vader_label
        final_conf = round(vader_conf * 0.65 + tb_conf * 0.35, 4)
        # Reduce confidence when models disagree
        final_conf = round(final_conf * 0.85, 4)

    return {
        "sentiment": final_label,
        "confidence": min(final_conf, 0.99),
        "compound": round(compound, 4),
        "polarity": round(polarity, 4),
        "subjectivity": round(subjectivity, 4),
        "processed_text": cleaned,
    }
