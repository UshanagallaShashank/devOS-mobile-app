# Project Structure Reference

```
DevOS-mobile-app/
│
├── 📁 frontend/                          # React Native (Expo) - iOS, Android, Web
│   ├── 📁 app/
│   │   └── 📁 (tabs)/                    # Tab navigation routes
│   │       ├── today.tsx                 # Daily schedule & streaks
│   │       ├── learn.tsx                 # AI learning topics
│   │       ├── dsa.tsx                   # DSA challenges
│   │       ├── ideas.tsx                 # Project ideas
│   │       ├── resume.tsx                # Resume review
│   │       ├── jobs.tsx                  # Job matching
│   │       └── news.tsx                  # AI news brief
│   │
│   ├── 📁 components/                    # Reusable UI components
│   │   ├── StreakCard.tsx                # Streak display (30 lines)
│   │   ├── TaskList.tsx                  # Task list component (30 lines)
│   │   └── index.ts                      # Exports
│   │
│   ├── 📁 hooks/                         # Custom React hooks
│   │   ├── useAppLifecycle.ts            # App state tracking (30 lines)
│   │   ├── useFetch.ts                   # Data fetching hook (30 lines)
│   │   └── index.ts                      # Exports
│   │
│   ├── 📁 services/                      # API & storage
│   │   ├── api.ts                        # HTTP client (30 lines)
│   │   ├── storage.ts                    # Secure storage (30 lines)
│   │   └── index.ts                      # Exports
│   │
│   ├── 📁 utils/                         # Utility functions
│   │   ├── date.ts                       # Date formatting (30 lines)
│   │   ├── response.ts                   # Response helpers (30 lines)
│   │   └── index.ts                      # Exports
│   │
│   ├── 📁 config/                        # Configuration
│   │   ├── env.ts                        # Environment variables
│   │   └── constants.ts                  # App constants
│   │
│   ├── 📁 types/
│   │   └── index.ts                      # TypeScript types
│   │
│   └── package.json                      # Dependencies
│
├── 📁 backend/                           # FastAPI - Python server
│   ├── 📁 agents/                        # LangGraph agent orchestration
│   │   ├── 📁 nodes/                     # Individual agent nodes
│   │   │   ├── resume.py                 # Resume review node (30 lines)
│   │   │   ├── job.py                    # Job search node (30 lines)
│   │   │   ├── learn.py                  # Learning node (30 lines)
│   │   │   └── __init__.py               # Exports
│   │   │
│   │   ├── 📁 tools/                     # Agent tools/utilities
│   │   │   ├── search.py                 # Web search (30 lines)
│   │   │   ├── resume.py                 # Resume analysis (30 lines)
│   │   │   └── __init__.py               # Exports
│   │   │
│   │   ├── types.py                      # State & types (30 lines)
│   │   ├── graph.py                      # LangGraph orchestration (30 lines)
│   │   └── __init__.py                   # Exports
│   │
│   ├── 📁 api/                           # REST endpoints
│   │   ├── users.py                      # User endpoints (30 lines)
│   │   ├── agents.py                     # Agent trigger endpoints (30 lines)
│   │   └── __init__.py                   # Exports
│   │
│   ├── 📁 db/                            # Database layer
│   │   ├── models.py                     # SQLAlchemy models (30 lines)
│   │   ├── session.py                    # DB session setup (30 lines)
│   │   └── __init__.py                   # Exports
│   │
│   ├── config.py                         # Configuration (30 lines)
│   ├── schemas.py                        # Pydantic models (30 lines)
│   ├── utils.py                          # Utilities (30 lines)
│   ├── mocks.py                          # Mock data for testing (30 lines)
│   ├── evals.py                          # LangSmith evaluators (30 lines)
│   ├── main.py                           # FastAPI app entry (30 lines)
│   └── requirements.txt                  # Python dependencies
│
├── 📁 docs/                              # Documentation
│   ├── ARCHITECTURE.md                   # System design
│   ├── DATABASE_SETUP.md                 # DB setup guide
│   ├── API_REFERENCE.md                  # API endpoints
│   ├── BACKEND_GUIDE.md                  # Backend best practices
│   └── DEPLOYMENT.md                     # Deployment instructions
│
├── 📁 .vscode/                           # VS Code settings (optional)
│   └── extensions.json                   # Recommended extensions
│
├── README.md                             # Project overview
├── QUICK_START.md                        # Quick start guide
├── setup.md                              # Original setup doc
├── .instructions.md                      # Claude development rules
├── .agent.md                             # Agent specialization
├── .env.example                          # Environment template
├── .gitignore                            # Git ignore rules
└── package-lock.json / poetry.lock       # Dependency locks
```

## File Size Overview

- **All source files:** ≤ 30 lines (enforced)
- **Single comment** per function/block
- **Type hints** on all functions
- **No commented-out code** (delete or document)

## Key Principles

✅ **Modularity:** One concern per file  
✅ **Readability:** Simple, focused code  
✅ **Maintainability:** Clear structure  
✅ **Testing:** Easy to unit test  
✅ **Scalability:** Add features without refactoring  
✅ **Documentation:** Self-explanatory code  

---

See [README.md](README.md) for architecture overview.
