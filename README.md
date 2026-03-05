# 🧠 SentiScope — Social Media Sentiment Analyzer

A **production-ready full-stack** sentiment analysis platform for social media comments.
Built with **FastAPI + React + TailwindCSS + VADER + TextBlob**.

---

## 🚀 Features

| Feature | Details |
|---|---|
| Real-time Sentiment Analysis | Analyze any comment instantly (positive / negative / neutral) |
| CSV Batch Upload | Upload thousands of comments for bulk analysis |
| Interactive Dashboard | Live charts: Pie, Bar, Line (trend), Word Cloud |
| Sentiment Statistics | Counts and percentages for all classes |
| Keyword Extraction | Top words extracted from analyzed comments |
| Analysis History | Paginated logs with filtering by sentiment |
| REST API | Full API with Swagger docs at `/docs` |
| Dark UI | Glassmorphism cards, gradient accents, smooth animations |
| DB Flexible | MongoDB Atlas (primary) or SQLite (auto-fallback) |

---

## 📁 Folder Structure

```
sentiment-analyzer/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── routes/
│   │   │   ├── analyze.py       # POST /analyze
│   │   │   ├── upload.py        # POST /upload
│   │   │   ├── results.py       # GET /results
│   │   │   ├── statistics.py    # GET /statistics
│   │   │   └── keywords.py      # GET /keywords
│   │   ├── nlp/
│   │   │   ├── sentiment_engine.py     # VADER + TextBlob engine
│   │   │   ├── text_preprocessing.py   # Text cleaning pipeline
│   │   │   └── keyword_extractor.py    # Keyword frequency analysis
│   │   ├── models/
│   │   │   └── schemas.py       # Pydantic models
│   │   └── database/
│   │       └── db.py            # MongoDB / SQLite adapter
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx    # Main overview
│   │   │   ├── Analyze.jsx      # Real-time analyzer
│   │   │   ├── Upload.jsx       # CSV uploader
│   │   │   └── History.jsx      # Log browser
│   │   ├── components/
│   │   │   ├── StatCard.jsx
│   │   │   ├── SentimentResult.jsx
│   │   │   ├── WordCloud.jsx
│   │   │   └── RecentComments.jsx
│   │   ├── charts/
│   │   │   ├── SentimentPieChart.jsx
│   │   │   ├── SentimentBarChart.jsx
│   │   │   └── SentimentLineChart.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── dataset/
│   └── social_media_comments.csv   # 1050 balanced comments
├── generate_dataset.py
└── README.md
```

---

## ⚙️ Installation

### Prerequisites

- Python 3.9+
- Node.js 18+

---

### 1. Generate the Dataset (optional — already included)

```bash
python generate_dataset.py
# Creates: dataset/social_media_comments.csv (1050 rows)
```

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
# Edit .env to add MONGO_URI if using MongoDB Atlas
# Leave MONGO_URI blank to use SQLite (no setup needed)

# Start backend
uvicorn app.main:app --reload --port 8000
```

API will be at: **http://localhost:8000**  
Swagger docs: **http://localhost:8000/docs**

---

### 3. Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend will be at: **http://localhost:5173**

---

## 🔌 REST API Reference

### POST /analyze
Analyze a single comment.

```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "I love this product, it is amazing!"}'
```

Response:
```json
{
  "comment": "I love this product, it is amazing!",
  "sentiment": "positive",
  "confidence": 0.9123,
  "compound": 0.7845,
  "polarity": 0.625,
  "subjectivity": 0.6,
  "processed_text": "love product amazing",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### POST /upload
Upload a CSV file for batch analysis.

```bash
curl -X POST http://localhost:8000/upload \
  -F "file=@dataset/social_media_comments.csv"
```

Response:
```json
{
  "status": "success",
  "processed": 1050,
  "counts": {"positive": 412, "negative": 380, "neutral": 258},
  "message": "Successfully analyzed 1050 comments."
}
```

---

### GET /results
Get stored results with optional filtering.

```bash
# All results
curl http://localhost:8000/results

# Filter by sentiment
curl "http://localhost:8000/results?sentiment=positive&limit=20"

# Paginate
curl "http://localhost:8000/results?limit=20&skip=40"
```

---

### GET /statistics
Get sentiment distribution statistics.

```bash
curl http://localhost:8000/statistics
```

Response:
```json
{
  "total": 1050,
  "positive": 412,
  "negative": 380,
  "neutral": 258,
  "positive_pct": 39.2,
  "negative_pct": 36.2,
  "neutral_pct": 24.6
}
```

---

### GET /statistics/trend
Get daily sentiment trend.

```bash
curl "http://localhost:8000/statistics/trend?days=7"
```

---

### GET /keywords
Get top keywords from analyzed comments.

```bash
# All comments
curl http://localhost:8000/keywords

# Filter by sentiment + custom count
curl "http://localhost:8000/keywords?sentiment=positive&top_n=10"
```

---

## 🧠 NLP Pipeline

```
Raw Text
   ↓
Text Preprocessing (lowercase, remove URLs, punctuation, special chars)
   ↓
VADER Sentiment Analysis (primary — 65% weight)
   ↓
TextBlob Sentiment Analysis (secondary — 35% weight)
   ↓
Blended Classification → positive | negative | neutral
   ↓
Confidence Score + Polarity + Subjectivity
```

---

## 🗄️ Database

### MongoDB (preferred)
Set `MONGO_URI` in `.env` to your MongoDB Atlas connection string.  
Collection: `sentiment_logs`

### SQLite (auto-fallback)
If `MONGO_URI` is blank, SQLite is used automatically.  
File stored at: `backend/data/sentiment.db`

**Schema:**
```sql
CREATE TABLE sentiment_logs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    comment     TEXT NOT NULL,
    sentiment   TEXT NOT NULL,
    confidence  REAL NOT NULL,
    polarity    REAL,
    subjectivity REAL,
    source      TEXT,
    timestamp   TEXT
);
```

---

## 🎨 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TailwindCSS |
| Charts | Recharts |
| HTTP Client | Axios |
| Backend | FastAPI |
| NLP | VADER + TextBlob + NLTK |
| Database | MongoDB Atlas / SQLite |
| ORM/Driver | Motor (async Mongo) / SQLAlchemy-free SQLite |

---

## 📊 Dataset

- **1050 comments** total (350 positive, 350 negative, 350 neutral)
- Covers topics: products, delivery, customer service, quality, support
- Located at: `dataset/social_media_comments.csv`
- Regenerate with: `python generate_dataset.py`

---

## 🛡️ Error Handling

- Invalid file type → 400 with clear message
- Empty comment → 422 validation error
- NLP failure → 500 with details
- DB failure → non-fatal for analysis, fatal for upload
- CORS configured for development and production

---

## 📝 License

MIT — free to use, modify, and distribute.
