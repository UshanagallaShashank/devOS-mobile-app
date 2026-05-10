# Quick Start Guide

## Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL 14+
- Docker (optional, for deployment)

## Local Development

### 1. Clone & Setup
```bash
git clone <repo>
cd DevOS-mobile-app
cp .env.example .env  # Fill in your API keys
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm start  # Opens Expo Dev Tools
```

### 3. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py  # Runs on http://localhost:8000
```

### 4. Database Setup
```bash
# In another terminal
createdb devos
cd backend && alembic upgrade head
```

## Available Commands

**Frontend:**
- `npm start` — Start dev server
- `npm run ios` — Run on iOS simulator
- `npm run android` — Run on Android emulator
- `npm test` — Run tests

**Backend:**
- `python main.py` — Start server
- `pytest -v` — Run tests
- `alembic upgrade head` — Run migrations

## Folder Structure at a Glance

```
frontend/        → React Native app
├── app/         → Routes (file-based)
├── components/  → UI components
├── hooks/       → Custom hooks
└── services/    → API + storage

backend/         → FastAPI server
├── agents/      → LangGraph workflows
├── api/         → REST endpoints
├── db/          → Database models
└── main.py      → Entry point

docs/            → Documentation
```

## Troubleshooting

**Port 8000 in use?**
```bash
kill -9 $(lsof -t -i :8000)
```

**PostgreSQL connection error?**
```bash
psql postgres  # Check if running
brew services start postgresql  # macOS
```

**Expo connection issues?**
```bash
npm start -- --tunnel  # Use tunnel instead of LAN
```

---

See [docs/](docs/) for detailed guides.
