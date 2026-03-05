"""
Keyword Extraction Module
Extracts most frequent meaningful words from a collection of comments.
"""

from collections import Counter
from typing import List, Dict, Any

from app.nlp.text_preprocessing import preprocess


# Domain-specific noise words to exclude even after stopword removal
_NOISE = {
    "product", "get", "got", "one", "would", "could", "also",
    "even", "really", "much", "go", "going", "went", "come",
    "like", "just", "use", "used", "using", "make", "made",
}


def extract_keywords(comments: List[str], top_n: int = 20) -> List[Dict[str, Any]]:
    """
    Extract top N keywords from a list of comment strings.
    Returns list of {word, count} dicts sorted by frequency.
    """
    word_counter: Counter = Counter()

    for comment in comments:
        if not comment:
            continue
        processed = preprocess(comment)
        tokens = processed.split()
        # Keep only alphabetic tokens of length >= 3
        tokens = [t for t in tokens if t.isalpha() and len(t) >= 3 and t not in _NOISE]
        word_counter.update(tokens)

    return [
        {"word": word, "count": count}
        for word, count in word_counter.most_common(top_n)
    ]


def extract_keywords_by_sentiment(
    docs: List[Dict],
    sentiment: str,
    top_n: int = 10,
) -> List[Dict[str, Any]]:
    """
    Extract keywords filtered by a specific sentiment label.
    docs: list of dicts with 'comment' and 'sentiment' keys.
    """
    filtered = [d["comment"] for d in docs if d.get("sentiment") == sentiment]
    return extract_keywords(filtered, top_n=top_n)
