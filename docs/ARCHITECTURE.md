# DevOS Architecture

## System Overview

```
┌─────────────────────────────────────────────────────┐
│           React Native App (Expo)                   │
│  ┌────────────────────────────────────────────────┐ │
│  │ Screens: Today, Learn, DSA, Ideas, Resume, Jobs│ │
│  └────────────────────────────────────────────────┘ │
└──────────────────┬──────────────────────────────────┘
                   │ HTTP/WebSocket
┌──────────────────▼──────────────────────────────────┐
│           FastAPI Backend                           │
│  ┌────────────────────────────────────────────────┐ │
│  │ LangGraph Agents: Resume, Job, Learn, DSA, etc│ │
│  │ ┌──────────────────────────────────────────┐   │ │
│  │ │ Gemini 2.5 Pro/Flash                     │   │ │
│  │ └──────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────┘ │
└──────────────────┬──────────────────────────────────┘
        ┌──────────┼──────────┬──────────────┐
        │          │          │              │
┌───────▼──┐ ┌──────▼──┐ ┌────▼──┐ ┌────────▼──┐
│ Supabase │ │ Serper  │ │Google │ │ LangSmith │
│  (DB)    │ │ (Search)│ │  AI   │ │(Tracing)  │
└──────────┘ └─────────┘ └───────┘ └───────────┘
```

## Data Flow

### Daily Cycle

1. **Morning (08:00)**
   - Resume agent reviews against JDs
   - Job agent searches + filters matches
   - Learn agent picks today's topic
   - News agent curates AI news

2. **Throughout Day**
   - User opens app, completes tasks
   - DSA agent suggests problems
   - Ideas agent generates from user input

3. **Evening (22:00)**
   - Eval scorers run on MCQ performance
   - Agent prompts fine-tuned based on evals

## Module Responsibilities

| Module | Owner Agent | Frequency |
|--------|-------------|-----------|
| Resume | ResumeAgent | Nightly |
| Jobs | JobAgent | Nightly |
| Learn | LearnAgent | Daily (morning) |
| DSA | DSAAgent | On-demand |
| News | NewsAgent | Daily (morning) |
| Ideas | IdeaAgent | On-demand |
| Today | ScheduleAgent | Daily |

## Technology Choices

### Why React Native?
- Single codebase (iOS + Android + Web)
- Expo Router for native-feeling routing
- Reanimated for 60fps animations on UI thread

### Why LangGraph?
- Deterministic agent flows
- Easy state management
- Human-in-the-loop integration
- Tracing via LangSmith

### Why FastAPI?
- Async-first (non-blocking agents)
- Automatic OpenAPI docs
- WebSocket support for real-time updates
- Type hints with Pydantic

### Why Supabase?
- PostgreSQL reliability
- Built-in auth (Google OAuth)
- Realtime subscriptions for live updates
- Managed infrastructure (no DevOps)

---

See `/docs` for detailed guides on each component.
