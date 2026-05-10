import json, re
from fastapi import APIRouter
from pydantic import BaseModel
from langchain_google_genai import ChatGoogleGenerativeAI
from config import settings

router = APIRouter()

MENTOR_SYSTEM = """You are a senior engineer teaching Ushanagalla Shashank — Junior AI + Full Stack Developer at RealPage Inc, Hyderabad.
He knows: Python, TypeScript, JavaScript, SQL, React, FastAPI, LangChain, LangGraph, OpenAI/Anthropic/Gemini APIs, GCP, PostgreSQL, Redis, Docker.
He has built: Lumina AI (WebRTC + OpenAI Realtime), RAGForge (multi-tenant RAG SaaS), Project Orbit (voice-first AI OS), ShopOS (e-commerce SaaS).
DSA: 350+ problems, Top 9.5% LeetCode, Backtracking active, goal = FAANG-level in 4 months.

RULES you must always follow:
1. Open with a real-world analogy FIRST — never start with a definition.
2. Layer: Simple → Medium → Deep. Never dump everything at once.
3. If he asks about X, he already studied it — go one level deeper.
4. Explain the WHY, not the WHAT. Intuition over memorization.
5. Simple English first. Introduce proper terms only after the concept is clear.
6. Diagrams / ASCII flows are welcome for processes and architectures.
7. Concept first, hands-on separate.
8. Be direct and sharp — no padding, no filler."""

NOTES_PROMPT = """Give me sharp mentor-style notes for the LeetCode problem "{problem}" (category: {category}).

Return ONLY valid JSON (no markdown, no code fences) with this exact shape:
{{
  "analogy": "one sentence real-world analogy that clicks immediately",
  "description": "what the problem is actually asking (2-3 sentences, plain English)",
  "intuition": "the key insight that unlocks the solution (the AHA moment)",
  "approach": "step-by-step solution approach (numbered, concise)",
  "complexity": "Time: O(...) | Space: O(...) and why",
  "patterns": ["pattern1", "pattern2"],
  "gotchas": ["common mistake or edge case to watch for"]
}}"""

class NotesRequest(BaseModel):
    problem: str
    category: str

def _strip_fences(text: str) -> str:
    text = text.strip()
    text = re.sub(r'^```(?:json)?\s*', '', text)
    text = re.sub(r'\s*```$', '', text)
    return text.strip()

@router.post('/notes')
def get_notes(req: NotesRequest):
    llm = ChatGoogleGenerativeAI(
        model='gemini-2.5-flash',
        google_api_key=settings.gemini_api_key,
        temperature=0.4,
    )
    from langchain_core.messages import SystemMessage, HumanMessage
    resp = llm.invoke([
        SystemMessage(content=MENTOR_SYSTEM),
        HumanMessage(content=NOTES_PROMPT.format(problem=req.problem, category=req.category)),
    ])
    try:
        notes = json.loads(_strip_fences(resp.content))
    except Exception:
        notes = {'description': resp.content, 'approach': '', 'complexity': '', 'analogy': '', 'intuition': '', 'patterns': [], 'gotchas': []}
    return {'problem': req.problem, 'category': req.category, **notes}
