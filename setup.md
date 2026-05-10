# DevOS — Your Personal AI Career Engine

> A multi-agent mobile app that tracks your daily growth, builds your resume, hunts jobs, and teaches you AI/DSA — while you're busy at work.

---

## What is DevOS?

You're a junior AI engineer with too many things to track — DSA practice, learning tracks, AI news, resume improvements, job hunting, project ideas, DS calls, work bugs — all running at the same time, every day.

DevOS is a **mobile-first, AI-powered daily OS** built specifically for you. It runs 7 specialized agents in the background, surfaces exactly what you need at the right time, and improves itself based on how you perform.

Think of it like this: you open the app every morning. The agents have already done the work overnight — your resume has been reviewed against 20 JDs, 5 new job matches are waiting, today's AI topic is ready in your style, and your DSA problem is picked from your weak area. You just execute.

---

## Table of Contents

1. [App overview](#app-overview)
2. [Tech stack](#tech-stack)
3. [UI & design system](#ui--design-system)
4. [Animations & interactions](#animations--interactions)
5. [Agent architecture](#agent-architecture)
6. [LangGraph orchestration](#langgraph-orchestration)
7. [LangSmith evals](#langsmith-evals)
8. [Database schema](#database-schema)
9. [Auth & security](#auth--security)
10. [Screens & navigation](#screens--navigation)
11. [Deployment](#deployment)
12. [Build phases](#build-phases)
13. [Environment variables](#environment-variables)
14. [Folder structure](#folder-structure)

---

## App Overview

### Core modules

| Module | What it does |
|---|---|
| **Today** | Schedule, daily checklist, streak counter, progress score |
| **Learn** | Daily AI topic, learning track progress, micro-skill suggestions |
| **DSA** | Topic-based problem picker, 5 hard MCQ mock test, weak area tracker |
| **Ideas** | Agent generates project ideas from what you type + web search |
| **Resume** | Nightly agent review, prioritized improvements, gap analysis |
| **Jobs** | Live job search matched to your skills, fit score 0-100, apply links |
| **AI News** | Morning brief — filtered, summarized, with "why this matters for your projects" |

### What makes it different from a to-do app

- **Agents run without you.** Resume review, job search, news brief — all happen at night via cron. You wake up to results, not tasks.
- **Everything is connected.** Your DSA weak areas feed into what the LearningAgent teaches. Your resume gaps feed into what the JobAgent filters. Your project ideas are matched against your current skill level.
- **LangSmith traces every run.** You can see exactly what each agent did, why, how long it took, and what it cost. No black boxes.
- **It learns.** Eval scorers run on your MCQ performance and resume suggestions. Agent prompts improve automatically based on your scores.

---

## Tech Stack

### Frontend

```
Expo (React Native)        — iOS + Android + Web from one codebase
Expo Router                — File-based routing (like Next.js)
NativeWind (Tailwind)      — Utility-first styling for React Native
React Native Reanimated 3  — 60fps spring animations on UI thread
React Native Gesture Handler — Swipe, drag, pinch gestures
Expo Notifications         — Push notifications for daily brief + streaks
Expo SecureStore           — Encrypted local storage for tokens
React Native Skia          — GPU-accelerated charts and drawing
```

### Backend / AI

```
Python 3.11                — Backend runtime
FastAPI                    — REST API + WebSocket support
LangGraph 0.2+             — Agent orchestration (StateGraph)
LangChain 0.3+             — Tools, chains, memory, retrievers
Gemini 2.5 Pro             — Primary LLM (via Google AI SDK)
Gemini 2.5 Flash           — Fast responses (chat, quick answers)
LangSmith                  — Tracing, evals, dataset management
Serper API                 — Google search for agents (web access)
```

### Database / Infrastructure

```
Supabase                   — PostgreSQL + Auth + Storage + Realtime
Supabase Auth              — Google OAuth (one-tap sign-in)
Supabase Storage           — Resume PDF, profile photos
Supabase Realtime          — Live updates (job matches, agent status)
GCP Cloud Run              — Serverless FastAPI deployment
GCP Cloud Scheduler        — Nightly cron for background agents
GCP asia-south1            — Mumbai region (low latency for India)
```

### Dev tools

```
TypeScript                 — Frontend + type safety
Black + Ruff               — Python formatting
Pytest                     — Backend unit tests
Detox                      — Expo E2E testing
EAS Build                  — Expo Application Services (APK + IPA)
EAS Update                 — OTA updates without app store review
```

---

## UI & Design System

### Design language

DevOS uses a **clean dark-first, card-based design** with deep navy as the base, sharp green accents for active states, and warm amber for alerts. The feel is "developer productivity tool" — dense but not cluttered, fast but not cheap.

Reference aesthetic: Linear app meets Raycast meets a Bloomberg terminal — serious, data-rich, no unnecessary decoration.

### Color palette

```
Background primary     #0D0F14   — Deep navy, main screens
Background secondary   #161921   — Card surfaces
Background tertiary    #1E2230   — Elevated cards, modals
Accent green           #22C55E   — Active states, streaks, success
Accent blue            #3B82F6   — Links, info, agent active
Accent amber           #F59E0B   — Warnings, pending, medium priority
Accent red             #EF4444   — Errors, high priority, overdue
Text primary           #F1F5F9   — Main readable text
Text secondary         #94A3B8   — Subtitles, labels, metadata
Text tertiary          #475569   — Hints, placeholders, disabled
Border subtle          rgba(255,255,255,0.06)  — Card borders
Border strong          rgba(255,255,255,0.12)  — Focused elements
```

### Typography

```
Display        — Geist Mono 600, 28px       — Score numbers, streaks
Heading        — Geist Sans 500, 18px       — Section titles
Subheading     — Geist Sans 500, 15px       — Card titles
Body           — Geist Sans 400, 14px       — Paragraph text
Caption        — Geist Sans 400, 12px       — Labels, badges, timestamps
Code           — Geist Mono 400, 13px       — Code snippets, LeetCode problems
```

### Spacing system

```
xs   4px
sm   8px
md   12px
lg   16px
xl   24px
2xl  32px
3xl  48px
```

### Component library (custom built)

All components are built from scratch — no UI kit dependencies. This keeps the bundle small and gives full control over animations.

| Component | Description |
|---|---|
| `AgentCard` | Pulsing green dot, agent name, last run time, output preview |
| `StreakCalendar` | 7-day row with filled/empty dots and spring bounce on completion |
| `ProgressRing` | SVG ring drawn with React Native Skia, animated fill on mount |
| `MCQOption` | Tap → spring scale → color fill (green/red) → explanation reveal |
| `JobMatchCard` | Fit score bar (animated width), skill gap badges, swipe to save |
| `IdeaCard` | Gradient border on hover, expand animation, "Build it" CTA |
| `ResumeInsight` | Priority badge, improvement text, action button, dismiss swipe |
| `ScheduleTimeline` | Vertical timeline with dot-and-line, current time indicator |
| `TopicProgress` | Segmented progress bar, step labels, tap to jump |
| `NewsCard` | Source favicon, headline, 3-line summary, relevance chip |

### Responsive layout

The app targets mobile first (375px — 430px width) but also works on tablet and web via Expo's responsive utilities.

```typescript
// Breakpoints
const breakpoints = {
  sm: 375,   // iPhone SE
  md: 390,   // iPhone 14
  lg: 430,   // iPhone Pro Max / large Android
  xl: 768,   // iPad / tablet
  web: 1024, // Web browser
}

// Usage
const isTablet = useWindowDimensions().width >= 768;
const columns = isTablet ? 3 : 2;
```

On tablet/web, the app switches to a two-column layout — navigation sidebar on the left, content on the right. Bottom tab bar becomes a left rail.

---

## Animations & Interactions

All animations run on the **UI thread** via React Native Reanimated 3 worklets — they never drop frames even when the JS thread is busy loading agent responses.

### Page transitions

```typescript
// Tab switch — slide + fade
const tabAnimation = useAnimatedStyle(() => ({
  transform: [{ translateX: withSpring(activeTab * SCREEN_WIDTH, SPRING_CONFIG) }],
  opacity: withTiming(isActive ? 1 : 0.3, { duration: 200 }),
}));

// Screen push — iOS-native feel
// Using Expo Router's built-in stack animation + custom interpolator
const cardStyle = useAnimatedStyle(() => ({
  transform: [
    { translateX: withSpring(progress.value * SCREEN_WIDTH) },
    { scale: withSpring(interpolate(progress.value, [0, 1], [1, 0.93])) },
  ],
}));
```

### Card interactions

```typescript
// Every card has a press-down spring
const cardPress = useAnimatedStyle(() => ({
  transform: [{ scale: withSpring(pressed.value ? 0.97 : 1, { damping: 15 }) }],
}));

// Swipe to dismiss (resume insights, job cards)
const swipeGesture = Gesture.Pan()
  .onUpdate((e) => { translateX.value = e.translationX; })
  .onEnd((e) => {
    if (Math.abs(e.translationX) > SWIPE_THRESHOLD) {
      translateX.value = withSpring(Math.sign(e.translationX) * SCREEN_WIDTH);
      runOnJS(handleDismiss)();
    } else {
      translateX.value = withSpring(0);
    }
  });
```

### Agent status animations

When an agent is running, a pulsing green ring animates around the agent card. When it finishes, a checkmark draws itself in with a path animation.

```typescript
// Pulsing ring — agent active
const pulseAnim = useSharedValue(1);
useEffect(() => {
  pulseAnim.value = withRepeat(
    withSequence(
      withTiming(1.15, { duration: 800 }),
      withTiming(1, { duration: 800 })
    ),
    -1, true
  );
}, []);

// Checkmark path draw — agent done
const pathProgress = useSharedValue(0);
useEffect(() => {
  pathProgress.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
}, [done]);
```

### Streak counter

When you complete all daily tasks, the streak counter increments with a number roll animation + confetti burst using `react-native-confetti-cannon`.

```typescript
// Rolling number animation
const displayNumber = useDerivedValue(() =>
  Math.round(interpolate(animatedStreak.value, [prev, next], [prev, next]))
);

// Trigger on completion
streakAnim.value = withSequence(
  withSpring(next + 0.5, { damping: 8 }),
  withSpring(next, { damping: 12 })
);
```

### MCQ answer feedback

```typescript
// Tap option → scale bounce → color fill → explanation slides up
const optionPress = async (isCorrect: boolean) => {
  scale.value = withSequence(withSpring(0.95), withSpring(1));
  await delay(150);
  bgColor.value = withTiming(isCorrect ? GREEN : RED, { duration: 300 });
  await delay(300);
  explanationHeight.value = withSpring(EXPLANATION_HEIGHT, { damping: 14 });
};
```

### Progress bars

All progress bars animate from 0 on screen enter, using `withSpring` with a slight overshoot for a satisfying feel.

```typescript
useEffect(() => {
  progressAnim.value = withDelay(
    index * 100, // stagger per bar
    withSpring(targetProgress, { damping: 12, stiffness: 80 })
  );
}, []);
```

### Bottom nav

Active tab indicator slides horizontally with a spring, not a jump. Active icon does a micro bounce up.

```typescript
const indicatorX = useDerivedValue(() =>
  withSpring(activeIndex * TAB_WIDTH, { damping: 20, stiffness: 150 })
);
```

### Skeleton loaders

While agents are fetching, cards show animated skeleton loaders — a shimmer effect moving left to right using a linear gradient + animation.

```typescript
const shimmerTranslate = useSharedValue(-CARD_WIDTH);
useEffect(() => {
  shimmerTranslate.value = withRepeat(
    withTiming(CARD_WIDTH, { duration: 1200, easing: Easing.linear }),
    -1
  );
}, []);
```

### Scroll behaviors

- **Today tab** — sticky header with the score ring that shrinks as you scroll down (interpolated from scroll position)
- **Jobs tab** — infinite scroll with smooth load-more spinner at bottom
- **Schedule timeline** — auto-scrolls to current time on open, with a smooth `scrollTo` animation

---

## Agent Architecture

### How it works — simple story

Imagine you're the manager. You tap "explain LangGraph to me". Your tap goes to the **Orchestrator** — the head agent. It reads your request, checks your learning state in Supabase, and says "this is a Learn request, send it to LearningAgent". The LearningAgent then picks up its tools — Gemini 2.5, Serper search — does the work, and sends back the result. The Orchestrator packages it and you see it on screen.

Some agents — ResumeAgent, JobAgent, NewsAgent — don't wait for you. They're triggered by Cloud Scheduler at set times. They run, write results to Supabase, and you see them next time you open the app.

### Agent definitions

#### OrchestratorAgent
- **Type:** LangGraph root node (conditional edges)
- **Input:** User intent + session context + Supabase state
- **Does:** Classifies intent → routes to correct agent → manages response state
- **Model:** Gemini 2.5 Flash (fast classification)

#### LearningAgent
- **Type:** LangGraph node
- **Input:** Today's topic from learning track, user's explanation style preference
- **Does:** Fetches topic, searches docs/YouTube, generates story-first explanation with code
- **Tools:** `serper_search`, `gemini_explain`, `supabase_progress_read`
- **Model:** Gemini 2.5 Pro
- **Runs:** On demand (when you open Learn tab)
- **Output:** Topic explanation + key concepts + YouTube link + next topic suggestion

#### DSAAgent
- **Type:** LangGraph node
- **Input:** Active DSA topic, solved problem list, weak area tags
- **Does:** Picks unsolved problem, provides hint-only mode, generates 5 MCQs
- **Tools:** `leetcode_db`, `mcq_generator`, `supabase_dsa_read`, `gemini_explain`
- **Model:** Gemini 2.5 Pro (thinking mode for hard reasoning)
- **Runs:** On demand (when you open DSA tab)
- **Output:** Problem statement + hint + MCQs + solution after timeout

#### ResumeAgent
- **Type:** Background agent
- **Input:** Your resume PDF from Supabase Storage, 20 recent JDs from Serper
- **Does:** Compares resume against JDs, finds keyword gaps, suggests improvements
- **Tools:** `supabase_storage_read`, `serper_job_search`, `gemini_compare`
- **Model:** Gemini 2.5 Pro
- **Runs:** Nightly at 11:00 PM IST via Cloud Scheduler
- **Output:** Prioritized list of improvements saved to `resume_suggestions` table

#### JobAgent
- **Type:** Background agent
- **Input:** Your skills list, experience level, preferred roles, location preference
- **Does:** Searches LinkedIn + Naukri + Wellfound, scores each JD against your profile
- **Tools:** `serper_job_search`, `gemini_fit_scorer`, `supabase_jobs_write`
- **Model:** Gemini 2.5 Flash
- **Runs:** Daily at 7:00 AM IST via Cloud Scheduler
- **Output:** Job matches saved to `job_matches` table with fit score + missing skills

#### IdeaAgent
- **Type:** On-demand agent
- **Input:** Your free-text interest/topic, your current projects context
- **Does:** Searches GitHub Trending + AI news, generates 3 tailored project ideas
- **Tools:** `serper_search`, `github_trending`, `gemini_ideate`
- **Model:** Gemini 2.5 Pro
- **Runs:** When you type in Ideas tab
- **Output:** 3 ideas with title, description, stack, build time, what you learn

#### NewsAgent
- **Type:** Background agent
- **Input:** Your learning tracks, active projects list
- **Does:** Fetches AI dev news, filters for relevance, explains impact on your work
- **Tools:** `serper_search`, `gemini_summarize`, `relevance_filter`
- **Model:** Gemini 2.5 Flash
- **Runs:** Daily at 6:30 AM IST via Cloud Scheduler
- **Output:** 5 summarized news items saved to `daily_news` table

---

## LangGraph Orchestration

### State definition

```python
from typing import TypedDict, Annotated, List, Optional
from langgraph.graph import StateGraph, END
import operator

class DevOSState(TypedDict):
    user_id: str
    intent: str                          # "learn" | "dsa" | "idea" | "resume" | "jobs" | "news"
    user_message: str
    agent_response: Optional[str]
    agent_name: Optional[str]
    tools_used: Annotated[List[str], operator.add]
    supabase_context: dict               # user progress, topics, profile
    error: Optional[str]
    metadata: dict                       # tokens used, latency, cost
```

### Graph structure

```python
graph = StateGraph(DevOSState)

# Nodes
graph.add_node("orchestrator", orchestrator_node)
graph.add_node("learning_agent", learning_agent_node)
graph.add_node("dsa_agent", dsa_agent_node)
graph.add_node("idea_agent", idea_agent_node)
graph.add_node("resume_agent", resume_agent_node)
graph.add_node("job_agent", job_agent_node)
graph.add_node("news_agent", news_agent_node)
graph.add_node("error_handler", error_handler_node)

# Entry point
graph.set_entry_point("orchestrator")

# Conditional routing
graph.add_conditional_edges(
    "orchestrator",
    route_to_agent,                      # returns agent name based on intent
    {
        "learning_agent": "learning_agent",
        "dsa_agent": "dsa_agent",
        "idea_agent": "idea_agent",
        "resume_agent": "resume_agent",
        "job_agent": "job_agent",
        "news_agent": "news_agent",
        "error": "error_handler",
    }
)

# All agents end the graph after running
for agent in ["learning_agent", "dsa_agent", "idea_agent",
              "resume_agent", "job_agent", "news_agent"]:
    graph.add_edge(agent, END)

graph.add_edge("error_handler", END)

app = graph.compile()
```

### Routing logic

```python
def route_to_agent(state: DevOSState) -> str:
    intent_map = {
        "learn": "learning_agent",
        "dsa": "dsa_agent",
        "mock": "dsa_agent",
        "idea": "idea_agent",
        "resume": "resume_agent",
        "jobs": "job_agent",
        "news": "news_agent",
    }
    intent = state.get("intent", "").lower()
    return intent_map.get(intent, "error")
```

### LangSmith tracing

Every graph run is automatically traced. Each node's inputs, outputs, latency, and token count are visible in the LangSmith dashboard.

```python
from langsmith import Client
from langchain_core.tracers import LangChainTracer

os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_PROJECT"] = "DevOS"
os.environ["LANGCHAIN_API_KEY"] = settings.LANGSMITH_API_KEY

# Every graph.invoke() is now traced automatically
result = await app.ainvoke(state, config={"run_name": f"session_{user_id}"})
```

---

## LangSmith Evals

### What gets evaluated

| Agent | What's measured | Scorer |
|---|---|---|
| DSAAgent — MCQ | Answer correctness, difficulty calibration | Rule-based + Gemini judge |
| LearningAgent | Explanation clarity, Shashank-style check | Gemini judge (rubric) |
| ResumeAgent | Suggestion relevance, priority accuracy | Gemini judge + human review |
| JobAgent | Fit score accuracy, skill gap correctness | Rule-based against ground truth |
| NewsAgent | Relevance to user's projects, summary quality | Gemini judge |

### Eval pipeline

```python
from langsmith import Client
from langsmith.evaluation import evaluate

client = Client()

# Create dataset from production traces
dataset = client.create_dataset("devos-mcq-evals")

# Add examples from real runs
client.create_examples(
    inputs=[{"question": q, "options": opts} for q, opts in mcq_examples],
    outputs=[{"correct_answer": a, "explanation": e} for a, e in answers],
    dataset_id=dataset.id,
)

# Define scorer
def mcq_accuracy_scorer(run, example):
    predicted = run.outputs.get("selected_option")
    correct = example.outputs.get("correct_answer")
    return {"score": 1 if predicted == correct else 0, "key": "accuracy"}

# Run eval
results = evaluate(
    lambda inputs: dsa_agent.invoke(inputs),
    data=dataset.name,
    evaluators=[mcq_accuracy_scorer],
    experiment_prefix="mcq-v2",
)
```

### Improvement loop

Every week, eval results are reviewed. If accuracy on a topic type drops below 70%, the DSAAgent's prompt is updated to add more context for that topic. LangSmith shows the before/after diff automatically.

---

## Database Schema

### `users`
```sql
id            uuid        PRIMARY KEY DEFAULT gen_random_uuid()
email         text        UNIQUE NOT NULL
full_name     text
avatar_url    text
created_at    timestamptz DEFAULT now()
last_active   timestamptz
streak_count  integer     DEFAULT 0
streak_last   date
```

### `learning_progress`
```sql
id            uuid        PRIMARY KEY
user_id       uuid        REFERENCES users(id)
track         text        -- 'core_ml' | 'modern_ai' | 'system_design' | 'dsa'
topic         text        -- e.g. 'LangGraph'
status        text        -- 'not_started' | 'in_progress' | 'done'
completed_at  timestamptz
notes         text        -- user's own notes
```

### `dsa_problems`
```sql
id            uuid        PRIMARY KEY
user_id       uuid        REFERENCES users(id)
leetcode_id   integer
title         text
difficulty    text        -- 'Easy' | 'Medium' | 'Hard'
topic         text        -- 'Backtracking' | 'Sliding Window' etc.
status        text        -- 'solved' | 'attempted' | 'skipped'
attempts      integer     DEFAULT 0
solved_at     timestamptz
time_taken    integer     -- seconds
```

### `mock_scores`
```sql
id            uuid        PRIMARY KEY
user_id       uuid        REFERENCES users(id)
session_date  date
topic         text
score         integer     -- 0-5
questions     jsonb       -- [{question, options, correct, selected, explanation}]
created_at    timestamptz
```

### `resume_suggestions`
```sql
id            uuid        PRIMARY KEY
user_id       uuid        REFERENCES users(id)
priority      text        -- 'high' | 'medium' | 'low'
section       text        -- 'experience' | 'skills' | 'projects' | 'summary'
suggestion    text
original_text text
improved_text text
applied       boolean     DEFAULT false
created_at    timestamptz -- nightly cron timestamp
```

### `job_matches`
```sql
id            uuid        PRIMARY KEY
user_id       uuid        REFERENCES users(id)
title         text
company       text
location      text
apply_url     text
fit_score     integer     -- 0-100
missing_skills text[]
matched_skills text[]
source        text        -- 'linkedin' | 'naukri' | 'wellfound'
status        text        -- 'new' | 'saved' | 'applied' | 'dismissed'
found_at      timestamptz
```

### `daily_news`
```sql
id            uuid        PRIMARY KEY
user_id       uuid        REFERENCES users(id)
headline      text
source        text
url           text
summary       text        -- 3-line simple English summary
impact        text        -- "what this means for your projects"
tags          text[]      -- ['LLM', 'RAG', 'fine-tuning', 'tools']
date          date
```

### `ideas`
```sql
id            uuid        PRIMARY KEY
user_id       uuid        REFERENCES users(id)
title         text
description   text
stack         text[]
difficulty    text
build_hours   integer
what_you_learn text
status        text        -- 'idea' | 'planning' | 'building' | 'done'
created_at    timestamptz
```

### Row-level security

All tables have RLS enabled. Users can only read and write their own rows.

```sql
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users see own data" ON learning_progress
  FOR ALL USING (auth.uid() = user_id);
```

---

## Auth & Security

### Sign-in flow

1. User taps "Continue with Google" on the Expo app
2. `supabase.auth.signInWithOAuth({ provider: 'google' })` opens a browser
3. Google redirects back to the app with the auth code
4. Supabase exchanges the code for a JWT
5. JWT is stored in `expo-secure-store` (encrypted, hardware-backed on device)
6. All API requests include `Authorization: Bearer <jwt>` header
7. FastAPI verifies the JWT against Supabase's public key on every request

### Token refresh

```typescript
// Auto-refresh handled by Supabase client
const { data: { session }, error } = await supabase.auth.getSession();

// Listen for token refresh
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    updateLocalToken(session.access_token);
  }
});
```

### API security

```python
# FastAPI dependency — verifies JWT on every protected route
async def get_current_user(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    user = supabase.auth.get_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user.user
```

---

## Screens & Navigation

### Navigation structure

```
(tabs)/
├── index.tsx          — Today (home)
├── learn.tsx          — Learning hub
├── dsa.tsx            — DSA + mock test
├── ideas.tsx          — Idea generator
├── resume.tsx         — Resume insights
├── jobs.tsx           — Job matches
└── news.tsx           — AI news brief

(modal)/
├── topic/[id].tsx     — Full topic explanation
├── problem/[id].tsx   — DSA problem detail
├── job/[id].tsx       — Job detail + apply
├── idea/[id].tsx      — Idea full breakdown
└── settings.tsx       — Profile + preferences

(auth)/
└── index.tsx          — Sign in screen
```

### Screen descriptions

#### Today (`/`)
Full-day schedule as a vertical timeline with a current-time indicator dot. Score ring at the top showing tasks completed. Streak calendar (7-day). Daily checklist with swipe-to-complete. Agent status row showing which background agents ran last night.

#### Learn (`/learn`)
Today's AI/ML topic with simple story explanation. Expandable "code example", "key concepts", "YouTube session" sections. 4 track progress bars (Core ML, Modern AI, System Design, DSA). Micro-skill suggestions from the LearningAgent. Tap any item → modal with full session.

#### DSA (`/dsa`)
Topic filter row at top. Active topic card with today's problem. Hint-only mode toggle. 5-MCQ mock test with animated answer feedback. Solved problems list with difficulty distribution chart. Tap any solved problem → see your solution history.

#### Ideas (`/ideas`)
Text input at top — type anything, IdeaAgent responds. Filter chips: All, AI/ML, SaaS, 1-day, Weekend, Open source. Idea cards with gradient border, expand animation. Saved ideas persist. Swipe to save or dismiss.

#### Resume (`/resume`)
Upload button for PDF (Supabase Storage). Last agent run timestamp with "running now" animation when active. Prioritized suggestions (High/Med/Low badges). Tap suggestion → see original text vs improved text side by side. Apply button marks as done.

#### Jobs (`/jobs`)
Fit score as the dominant UI element on each card — big number, animated bar. Company, title, location. Skill match chips (green = have, red = missing). Swipe right to save, left to dismiss. Applied tab with history. Tap → full JD summary + apply link.

#### AI News (`/news`)
Morning brief at top — date + "5 items ready" count. Filter by topic. Each news card: headline, source, 3-line summary, "what this means for you" section in accent color. Tap → full article link.

---

## Deployment

### Frontend — Expo EAS

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure
eas build:configure

# Build Android APK (for testing)
eas build --platform android --profile preview

# Build production (App Store / Play Store)
eas build --platform all --profile production

# OTA update (no store review needed)
eas update --branch production --message "Fix job agent timeout"
```

### Backend — GCP Cloud Run

```bash
# Build Docker image
docker build -t gcr.io/project-orbit-490207/devos-api:latest .

# Push to GCP Container Registry
docker push gcr.io/project-orbit-490207/devos-api:latest

# Deploy to Cloud Run
gcloud run deploy devos-api \
  --image gcr.io/project-orbit-490207/devos-api:latest \
  --region asia-south1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "SUPABASE_URL=...,GEMINI_API_KEY=..."
```

### Cron jobs — GCP Cloud Scheduler

```bash
# Resume agent — 11:00 PM IST daily
gcloud scheduler jobs create http resume-agent-cron \
  --schedule="0 17 * * *" \
  --uri="https://devos-api-xxxx.run.app/agents/resume/run" \
  --time-zone="UTC" \
  --location="asia-south1"

# Job agent — 7:00 AM IST daily
gcloud scheduler jobs create http job-agent-cron \
  --schedule="30 1 * * *" \
  --uri="https://devos-api-xxxx.run.app/agents/jobs/run" \
  --time-zone="UTC" \
  --location="asia-south1"

# News agent — 6:30 AM IST daily
gcloud scheduler jobs create http news-agent-cron \
  --schedule="0 1 * * *" \
  --uri="https://devos-api-xxxx.run.app/agents/news/run" \
  --time-zone="UTC" \
  --location="asia-south1"
```

---

## Build Phases

### Phase 1 — Foundation (Week 1)
- [ ] Expo project with TypeScript + Expo Router
- [ ] NativeWind setup + design tokens
- [ ] Supabase project (asia-south1) + `users` table
- [ ] Google Sign-In with Supabase Auth
- [ ] Bottom tab navigation shell
- [ ] Today screen — static schedule + checklist
- [ ] Streak counter + progress ring (animated)
- [ ] Deliverable: Working app you can sign into and see your daily schedule

### Phase 2 — First agent (Week 1–2)
- [ ] FastAPI boilerplate + Gemini 2.5 via LangChain
- [ ] LangSmith connected (every call traced)
- [ ] LearningAgent — explains today's topic Shashank-style
- [ ] Supabase: `learning_progress` table
- [ ] Learn screen — topic card, progress bars, animated expand
- [ ] Deliverable: Tap Learn tab → agent explains today's AI topic

### Phase 3 — LangGraph + DSA (Week 2)
- [ ] LangGraph StateGraph — orchestrator + routing
- [ ] DSAAgent — problem picker + hint mode + MCQ generator
- [ ] Supabase: `dsa_problems`, `mock_scores` tables
- [ ] DSA screen — problem card, animated MCQ, score tracking
- [ ] Deliverable: LangGraph routing works, DSA + mock test are live

### Phase 4 — Background agents (Week 3)
- [ ] Supabase Storage bucket for resume PDFs
- [ ] Resume upload screen (Expo DocumentPicker)
- [ ] ResumeAgent — Serper JD fetch + Gemini comparison
- [ ] JobAgent — Serper search + fit scoring
- [ ] Cloud Scheduler cron jobs for both agents
- [ ] Resume + Jobs screens
- [ ] Deliverable: Wake up to resume suggestions and job matches

### Phase 5 — Evals + polish (Week 3–4)
- [ ] LangSmith datasets for MCQ, resume, job agents
- [ ] Eval scorers + weekly eval pipeline
- [ ] IdeaAgent + Ideas screen
- [ ] NewsAgent + News screen
- [ ] Push notifications (daily brief, streak reminders)
- [ ] OTA update pipeline with EAS
- [ ] Deliverable: All 7 agents live, evals running, app on your phone

---

## Environment Variables

### Expo (`.env.local`)
```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
EXPO_PUBLIC_API_BASE_URL=https://devos-api-xxxx.a.run.app
EXPO_PUBLIC_GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
```

### FastAPI (`.env`)
```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...            # service_role key (not anon)
SUPABASE_JWT_SECRET=your-jwt-secret

GEMINI_API_KEY=AIza...
SERPER_API_KEY=xxxx

LANGSMITH_API_KEY=ls__...
LANGCHAIN_TRACING_V2=true
LANGCHAIN_PROJECT=DevOS

GCP_PROJECT_ID=project-orbit-490207
GCP_REGION=asia-south1

ENVIRONMENT=production
```

---

## Folder Structure

```
devos/
├── app/                          — Expo frontend
│   ├── (auth)/
│   │   └── index.tsx             — Sign in screen
│   ├── (tabs)/
│   │   ├── index.tsx             — Today
│   │   ├── learn.tsx             — Learn
│   │   ├── dsa.tsx               — DSA + mock test
│   │   ├── ideas.tsx             — Idea generator
│   │   ├── resume.tsx            — Resume insights
│   │   ├── jobs.tsx              — Job matches
│   │   └── news.tsx              — AI news
│   ├── (modal)/
│   │   ├── topic/[id].tsx
│   │   ├── problem/[id].tsx
│   │   ├── job/[id].tsx
│   │   └── settings.tsx
│   └── _layout.tsx               — Root layout + auth guard
│
├── components/                   — Reusable UI
│   ├── AgentCard.tsx
│   ├── StreakCalendar.tsx
│   ├── ProgressRing.tsx
│   ├── MCQOption.tsx
│   ├── JobMatchCard.tsx
│   ├── IdeaCard.tsx
│   ├── ResumeInsight.tsx
│   ├── ScheduleTimeline.tsx
│   ├── TopicProgress.tsx
│   ├── NewsCard.tsx
│   └── SkeletonLoader.tsx
│
├── hooks/                        — Custom hooks
│   ├── useAgent.ts               — Agent API calls + loading state
│   ├── useStreak.ts              — Streak logic
│   ├── useSupabase.ts            — Auth + DB helpers
│   └── useAnimations.ts          — Shared animation configs
│
├── store/                        — Zustand state
│   ├── userStore.ts
│   ├── agentStore.ts
│   └── progressStore.ts
│
├── lib/                          — Utilities
│   ├── supabase.ts               — Supabase client
│   ├── api.ts                    — FastAPI client
│   └── constants.ts              — Colors, spacing, breakpoints
│
├── api/                          — FastAPI backend
│   ├── main.py                   — App entry, routes
│   ├── agents/
│   │   ├── orchestrator.py       — LangGraph StateGraph
│   │   ├── learning_agent.py
│   │   ├── dsa_agent.py
│   │   ├── resume_agent.py
│   │   ├── job_agent.py
│   │   ├── idea_agent.py
│   │   └── news_agent.py
│   ├── tools/
│   │   ├── serper.py             — Web search tool
│   │   ├── supabase_tools.py     — DB read/write tools
│   │   └── gemini_tools.py       — LLM wrappers
│   ├── evals/
│   │   ├── mcq_eval.py
│   │   ├── resume_eval.py
│   │   └── job_eval.py
│   ├── cron/
│   │   ├── resume_cron.py        — Nightly resume agent
│   │   ├── job_cron.py           — Morning job search
│   │   └── news_cron.py          — Morning news brief
│   └── config.py                 — Settings from env vars
│
├── supabase/
│   ├── migrations/               — SQL migration files
│   └── seed.sql                  — Dev seed data
│
├── eas.json                      — EAS build profiles
├── app.json                      — Expo config
├── tailwind.config.js            — NativeWind config
├── Dockerfile                    — FastAPI container
└── README.md                     — This file
```

---

## What you learn by building this

Every phase teaches you something real and resume-worthy:

| Phase | What you learn |
|---|---|
| 1 | Expo Router, React Native layout, Supabase Auth, OAuth flow |
| 2 | FastAPI architecture, LangChain + Gemini, LangSmith tracing |
| 3 | LangGraph StateGraph, agent routing, multi-step reasoning |
| 4 | Background jobs, cron patterns, Supabase Storage, Serper API |
| 5 | LangSmith evals, dataset management, prompt improvement loops |
| All | Full-stack mobile app with real AI agents — portfolio centrepiece |

This is not a tutorial project. This is a production app you use every day. That is the difference on your resume.

---

*DevOS — built by Shashank, for Shashank.*