"""
Database connection manager.
Uses MongoDB via Motor (async) with SQLite fallback via SQLAlchemy.
Set MONGO_URI in .env to enable MongoDB; omit for SQLite fallback.
"""

import os
import json
import sqlite3
from pathlib import Path
from datetime import datetime
from typing import Optional, List, Dict, Any

# Try importing motor for MongoDB
try:
    import motor.motor_asyncio
    MOTOR_AVAILABLE = True
except ImportError:
    MOTOR_AVAILABLE = False

MONGO_URI = os.getenv("MONGO_URI", "")
DB_NAME = os.getenv("DB_NAME", "sentiment_analyzer")
SQLITE_PATH = Path(__file__).parent.parent.parent / "data" / "sentiment.db"

# Global client reference
_mongo_client = None
_use_mongo = False
_sqlite_conn: Optional[sqlite3.Connection] = None


async def connect_db():
    """Initialize database connection (Mongo or SQLite)."""
    global _mongo_client, _use_mongo, _sqlite_conn

    if MOTOR_AVAILABLE and MONGO_URI:
        try:
            _mongo_client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
            await _mongo_client.admin.command("ping")
            _use_mongo = True
            print("✅ Connected to MongoDB")
            return
        except Exception as e:
            print(f"⚠️  MongoDB failed ({e}), falling back to SQLite")

    # SQLite fallback
    SQLITE_PATH.parent.mkdir(parents=True, exist_ok=True)
    _sqlite_conn = sqlite3.connect(str(SQLITE_PATH), check_same_thread=False)
    _sqlite_conn.row_factory = sqlite3.Row
    _init_sqlite(_sqlite_conn)
    print(f"✅ Connected to SQLite at {SQLITE_PATH}")


def _init_sqlite(conn: sqlite3.Connection):
    """Create tables for SQLite."""
    conn.execute("""
        CREATE TABLE IF NOT EXISTS sentiment_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            comment TEXT NOT NULL,
            sentiment TEXT NOT NULL,
            confidence REAL NOT NULL,
            polarity REAL DEFAULT 0,
            subjectivity REAL DEFAULT 0,
            source TEXT DEFAULT 'manual',
            timestamp TEXT NOT NULL
        )
    """)
    conn.commit()


async def close_db():
    global _mongo_client, _sqlite_conn
    if _mongo_client:
        _mongo_client.close()
    if _sqlite_conn:
        _sqlite_conn.close()


def get_collection():
    """Return MongoDB collection or None."""
    if _use_mongo and _mongo_client:
        return _mongo_client[DB_NAME]["sentiment_logs"]
    return None


def get_sqlite() -> Optional[sqlite3.Connection]:
    return _sqlite_conn


def is_mongo() -> bool:
    return _use_mongo


# ─── Unified CRUD helpers ────────────────────────────────────────────────────

async def insert_log(doc: Dict[str, Any]) -> str:
    doc["timestamp"] = doc.get("timestamp", datetime.utcnow().isoformat())
    if is_mongo():
        col = get_collection()
        result = await col.insert_one(doc)
        return str(result.inserted_id)
    else:
        conn = get_sqlite()
        cur = conn.execute(
            """INSERT INTO sentiment_logs
               (comment, sentiment, confidence, polarity, subjectivity, source, timestamp)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                doc.get("comment", ""),
                doc.get("sentiment", ""),
                doc.get("confidence", 0),
                doc.get("polarity", 0),
                doc.get("subjectivity", 0),
                doc.get("source", "manual"),
                doc["timestamp"],
            ),
        )
        conn.commit()
        return str(cur.lastrowid)


async def bulk_insert_logs(docs: List[Dict[str, Any]]):
    for doc in docs:
        doc["timestamp"] = doc.get("timestamp", datetime.utcnow().isoformat())
    if is_mongo():
        col = get_collection()
        if docs:
            await col.insert_many(docs)
    else:
        conn = get_sqlite()
        conn.executemany(
            """INSERT INTO sentiment_logs
               (comment, sentiment, confidence, polarity, subjectivity, source, timestamp)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            [
                (
                    d.get("comment", ""),
                    d.get("sentiment", ""),
                    d.get("confidence", 0),
                    d.get("polarity", 0),
                    d.get("subjectivity", 0),
                    d.get("source", "csv"),
                    d["timestamp"],
                )
                for d in docs
            ],
        )
        conn.commit()


async def fetch_logs(
    sentiment_filter: Optional[str] = None,
    limit: int = 100,
    skip: int = 0,
) -> List[Dict]:
    if is_mongo():
        col = get_collection()
        query = {}
        if sentiment_filter:
            query["sentiment"] = sentiment_filter
        cursor = col.find(query, {"_id": 0}).sort("timestamp", -1).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)
    else:
        conn = get_sqlite()
        if sentiment_filter:
            rows = conn.execute(
                "SELECT * FROM sentiment_logs WHERE sentiment=? ORDER BY id DESC LIMIT ? OFFSET ?",
                (sentiment_filter, limit, skip),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM sentiment_logs ORDER BY id DESC LIMIT ? OFFSET ?",
                (limit, skip),
            ).fetchall()
        return [dict(r) for r in rows]


async def fetch_statistics() -> Dict[str, Any]:
    if is_mongo():
        col = get_collection()
        total = await col.count_documents({})
        pos = await col.count_documents({"sentiment": "positive"})
        neg = await col.count_documents({"sentiment": "negative"})
        neu = await col.count_documents({"sentiment": "neutral"})
    else:
        conn = get_sqlite()
        total = conn.execute("SELECT COUNT(*) FROM sentiment_logs").fetchone()[0]
        pos = conn.execute("SELECT COUNT(*) FROM sentiment_logs WHERE sentiment='positive'").fetchone()[0]
        neg = conn.execute("SELECT COUNT(*) FROM sentiment_logs WHERE sentiment='negative'").fetchone()[0]
        neu = conn.execute("SELECT COUNT(*) FROM sentiment_logs WHERE sentiment='neutral'").fetchone()[0]

    return {
        "total": total,
        "positive": pos,
        "negative": neg,
        "neutral": neu,
        "positive_pct": round(pos / total * 100, 1) if total else 0,
        "negative_pct": round(neg / total * 100, 1) if total else 0,
        "neutral_pct": round(neu / total * 100, 1) if total else 0,
    }


async def fetch_trend(days: int = 7) -> List[Dict]:
    """Return daily sentiment counts for the last N days."""
    if is_mongo():
        col = get_collection()
        # Simple approach: fetch recent docs and group in Python
        cursor = col.find({}, {"sentiment": 1, "timestamp": 1, "_id": 0}).sort("timestamp", -1).limit(5000)
        docs = await cursor.to_list(length=5000)
    else:
        conn = get_sqlite()
        rows = conn.execute(
            "SELECT sentiment, timestamp FROM sentiment_logs ORDER BY id DESC LIMIT 5000"
        ).fetchall()
        docs = [dict(r) for r in rows]

    # Group by date
    from collections import defaultdict
    counts: Dict[str, Dict[str, int]] = defaultdict(lambda: {"positive": 0, "negative": 0, "neutral": 0})
    for d in docs:
        date = d["timestamp"][:10]  # YYYY-MM-DD
        counts[date][d["sentiment"]] = counts[date].get(d["sentiment"], 0) + 1

    sorted_dates = sorted(counts.keys())[-days:]
    return [{"date": dt, **counts[dt]} for dt in sorted_dates]
