"""
Text Preprocessing Module
Cleans and normalizes raw comment text before sentiment analysis.
"""

import re
import string
from typing import List

import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

# Ensure required NLTK data is present
for _pkg in ("punkt", "stopwords", "punkt_tab"):
    try:
        nltk.download(_pkg, quiet=True)
    except Exception:
        pass

_STOP_WORDS = set()
try:
    _STOP_WORDS = set(stopwords.words("english"))
except Exception:
    pass

# Words that carry sentiment — keep them even if they're "stop words"
_SENTIMENT_KEEP = {
    "not", "no", "never", "very", "too", "but", "however",
    "excellent", "terrible", "good", "bad", "great", "awful",
}
_EFFECTIVE_STOPS = _STOP_WORDS - _SENTIMENT_KEEP


def to_lowercase(text: str) -> str:
    return text.lower()


def remove_urls(text: str) -> str:
    return re.sub(r"https?://\S+|www\.\S+", "", text)


def remove_mentions_hashtags(text: str) -> str:
    return re.sub(r"[@#]\w+", "", text)


def remove_punctuation(text: str) -> str:
    return text.translate(str.maketrans("", "", string.punctuation))


def remove_special_characters(text: str) -> str:
    return re.sub(r"[^a-zA-Z0-9\s]", " ", text)


def remove_extra_whitespace(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def tokenize(text: str) -> List[str]:
    try:
        return word_tokenize(text)
    except Exception:
        return text.split()


def remove_stopwords(tokens: List[str]) -> List[str]:
    return [t for t in tokens if t not in _EFFECTIVE_STOPS and len(t) > 1]


def preprocess(text: str) -> str:
    """
    Full preprocessing pipeline.
    Returns cleaned text suitable for sentiment analysis.
    """
    if not text or not isinstance(text, str):
        return ""

    text = to_lowercase(text)
    text = remove_urls(text)
    text = remove_mentions_hashtags(text)
    text = remove_special_characters(text)
    text = remove_punctuation(text)
    text = remove_extra_whitespace(text)

    tokens = tokenize(text)
    tokens = remove_stopwords(tokens)

    return " ".join(tokens)


def preprocess_keep_structure(text: str) -> str:
    """
    Light preprocessing that preserves sentence structure
    (used for TextBlob/VADER which work better on natural sentences).
    """
    if not text or not isinstance(text, str):
        return ""
    text = remove_urls(text)
    text = remove_mentions_hashtags(text)
    text = remove_extra_whitespace(text)
    return text
