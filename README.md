# 🤖 DevOS — Personal AI Career Engine

> AI-powered daily mobile app for junior engineers: Track growth, build resume, hunt jobs, learn AI/DSA.

## 🚀 Quick Start

```bash
# Frontend
cd frontend && npm install && npm start

# Backend
cd backend && pip install -r requirements.txt && python main.py
```

## 📁 Project Structure

```
devos-app/
├── frontend/               # React Native (Expo)
│   ├── app/               # File-based routing
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Custom hooks
│   ├── services/          # API & storage
│   └── config/            # Constants & env
├── backend/               # Python FastAPI
│   ├── agents/            # LangGraph agents
│   ├── api/               # REST endpoints
│   ├── db/                # Database models
│   ├── tools/             # Agent tools
│   ├── evals/             # LangSmith evals
│   └── main.py            # Entry point
├── docs/                  # Documentation
└── .env.example           # Template
```

## 🏗️ Architecture

- **Frontend:** React Native + Expo Router + NativeWind + Reanimated
- **Backend:** FastAPI + LangGraph + Gemini 2.5 Pro
- **Database:** Supabase (PostgreSQL + Auth + Realtime)
- **Deployment:** GCP Cloud Run + Cloud Scheduler

## 📱 Core Modules

| Module | Purpose |
|--------|---------|
| **Today** | Daily schedule, checklist, streaks |
| **Learn** | AI topics, learning tracks |
| **DSA** | Problems, MCQ tests, weak area tracking |
| **Ideas** | AI-generated project ideas |
| **Resume** | Nightly review, improvements |
| **Jobs** | Smart job matching, apply links |
| **AI News** | Morning brief, curated news |

## 🔧 Tech Stack

**Frontend:** Expo, React Native, Tailwind (NativeWind), Reanimated, Gesture Handler
**Backend:** Python 3.11, FastAPI, LangGraph, LangChain
**LLM:** Gemini 2.5 Pro/Flash
**Database:** Supabase (PostgreSQL)
**Infrastructure:** GCP Cloud Run, Cloud Scheduler
**Tools:** Serper API (search), LangSmith (tracing)

## 📝 Development

- Run `npm run dev` (frontend) in one terminal
- Run `python main.py` (backend) in another
- Database migrations: `cd backend && alembic upgrade head`

## 🚢 Deployment

Frontend deploys to Expo, Backend to GCP Cloud Run via GitHub Actions.

## 📚 Documentation

See [docs/](docs/) folder for detailed guides on architecture, agents, and setup.

## 📄 License

MIT
