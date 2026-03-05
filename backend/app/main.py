"""
Social Media Sentiment Analyzer - FastAPI Backend
Main application entry point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import nltk

from app.database.db import connect_db, close_db
from app.routes import analyze, upload, results, statistics, keywords


def download_nltk_resources():
    """Download required NLTK data packages."""
    resources = ["punkt", "stopwords", "averaged_perceptron_tagger", "vader_lexicon"]
    for resource in resources:
        try:
            nltk.download(resource, quiet=True)
        except Exception:
            pass


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle handler."""
    download_nltk_resources()
    await connect_db()
    yield
    await close_db()


app = FastAPI(
    title="Social Media Sentiment Analyzer API",
    description="Analyze social media comments for sentiment using NLP",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route modules
app.include_router(analyze.router, prefix="/analyze", tags=["Analyze"])
app.include_router(upload.router, prefix="/upload", tags=["Upload"])
app.include_router(results.router, prefix="/results", tags=["Results"])
app.include_router(statistics.router, prefix="/statistics", tags=["Statistics"])
app.include_router(keywords.router, prefix="/keywords", tags=["Keywords"])


@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint."""
    return {"status": "ok", "message": "Sentiment Analyzer API is running"}


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}
