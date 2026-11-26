# CreatorIQ – Content Intelligence Platform for Social Media Performance & Creator Growth Analytics

> **Quietly Commanding Creator Intelligence**  
> *Author: Rethika S (Infosys Springboard Python Intern)*

CreatorIQ is a full-stack content intelligence and creator growth analytics platform tailored for YouTube creators. Built with an editorial Old Money design system and high-performance engineering, CreatorIQ offers real-time YouTube Data API v3 synchronization, owner-only channel metrics, video performance comparisons, CSV reports, and an AI-driven Pro Channel Strategist.

---

## 🌟 Key Features

### 1. Owner-Centric YouTube Analytics
- **Privacy First:** Eliminates public channel snooping. Creators link their YouTube handle (`@handle` or channel link) directly at registration.
- **Real-Time YouTube Data API v3 Sync:** Pulls authentic subscriber counts, total views, published videos, video thumbnails, likes, comments, and engagement rates directly from YouTube.
- **YouTube Studio Integration:** Quick direct link to YouTube Studio (`https://studio.youtube.com`).

### 2. Performance & Content Intelligence
- **Overview Dashboard:** Channel health KPIs, highest-viewed video highlight, content performance charts, and estimated AdSense earnings.
- **Content Analytics:** Comprehensive table of all synced videos with search filtering, engagement rate calculation `((likes + comments) / views) * 100`, published dates, watch links, and side-by-side video comparisons.
- **Growth & Insights:** Top-performing videos, engagement rankings, rule-based growth recommendations, and YouTube API growth limitation insights.
- **Audience Analytics:** Public subscriber growth tracking and transparent explanations regarding demographic data boundaries.
- **Revenue Analytics:** Illustrative AdSense revenue estimation based on real video impressions + complete CRUD logger for sponsorships and affiliate deals.
- **Reports & CSV Exports:** Export channel summaries and complete video catalogs with views, likes, comments, and engagement rates as downloadable `.csv` files.

### 3. Pro Plan – AI Channel Strategist
- Benchmark channel metrics against top-performing channels in your niche.
- 6-month subscriber forecasts and estimated monthly monetization potential.
- Actionable improvement strategies for thumbnail optimization, upload cadence, and viewer retention.

### 4. Bespoke Old Money UI/UX & GenZ Interactive Cursor
- **Editorial Aesthetic:** Warm Ivory (`#FAF7F2`), Deep Espresso (`#1C1917`), Antique Gold (`#B08D57`), and Heritage Forest (`#2D4A3E`).
- **Interactive Cursor Badge:** GenZ playful cursor follower (`✨ vibes` on idle, scaling up to `⚡ slay` on clickable elements).
- **Cross-Platform Access:** Desktop application guide and mobile Android APK download options.
- *Upcoming Roadmap:* Later Instagram extension will also be introduced.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite, Recharts, Tailwind CSS, Axios, React Router v6.
- **Backend:** Python 3.13, FastAPI, SQLAlchemy 2.0, Alembic, Pydantic v2, Uvicorn.
- **Database:** SQLite (default for local development) / PostgreSQL.
- **Authentication:** JWT (JSON Web Tokens), OAuth2 password bearer flow, Bcrypt password hashing.
- **External Integration:** YouTube Data API v3.

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm

---

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
# Copy .env.example to .env
copy .env.example .env

# Run database migrations
alembic upgrade head

# Start FastAPI development server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The FastAPI backend will start at: `http://127.0.0.1:8000`  
Interactive API Docs (Swagger UI): `http://127.0.0.1:8000/docs`

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

The frontend application will start at: `http://localhost:5173`

---

## 🔑 YouTube Data API v3 Configuration

You can configure your YouTube API key either:
1. **Inside the App:** Navigate to **Settings** (`/settings`) and enter your key in the **YouTube Data API v3 Configuration** card.
2. **In `.env`:** Add `YOUTUBE_API_KEY=AIzaSy...` in `backend/.env`.

---

## 📄 License

Developed by **Rethika S** for the Infosys Springboard Internship Program. All rights reserved.
