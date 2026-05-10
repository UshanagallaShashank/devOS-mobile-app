import json, re
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from langchain_google_genai import ChatGoogleGenerativeAI
from config import settings

router = APIRouter()

class LessonRequest(BaseModel):
    title: str
    track: str = "Software Engineering"

PROMPT = """You are a friendly coding teacher who can explain anything to anyone, any age, any skill level.
Explain the concept "{title}" from the course "{track}".

Respond ONLY with valid JSON, no markdown, no extra text:
{{
  "intro": "A clear 2-sentence explanation that anyone can understand",
  "key_points": ["concrete point 1", "concrete point 2", "concrete point 3", "concrete point 4"],
  "example": "A concrete short code snippet or real-world analogy (under 10 lines)",
  "example_is_code": true,
  "summary": "One key takeaway in plain English"
}}"""

@router.post("/lesson")
async def get_lesson(req: LessonRequest):
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=settings.gemini_api_key,
        temperature=0.3,
    )
    response = llm.invoke(PROMPT.format(title=req.title, track=req.track))
    raw = response.content.strip()
    raw = re.sub(r"^```(?:json)?\n?", "", raw)
    raw = re.sub(r"\n?```$", "", raw)
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(500, "AI returned invalid JSON. Please try again.")


class ExplainRequest(BaseModel):
    concept: str
    category: str

EXPLAIN_PROMPT = """You are an expert developer mentor who makes complex concepts instantly clear.
Explain "{concept}" (category: {category}) to a junior developer aiming for FAANG.

Rules:
- Lead with an analogy that makes it click immediately
- Layer the explanation: simple → detailed
- Give concrete, real-world developer examples
- Focus on WHY it matters, not just WHAT it is
- Keep each section tight — no padding

Respond ONLY with valid JSON, no markdown:
{{
  "analogy": "One vivid sentence analogy that makes it instantly click",
  "what_it_is": "2-sentence plain-English explanation",
  "how_it_works": ["step or aspect 1", "step or aspect 2", "step or aspect 3", "step or aspect 4"],
  "real_world": "Where developers actually encounter this (specific company/product example)",
  "code_hint": "A tiny code snippet or pseudo-code showing the core idea (3-5 lines, or null if not applicable)",
  "dev_insight": "The non-obvious thing senior devs know about this that juniors miss",
  "remember_this": "One sentence — the key thing to never forget"
}}"""

@router.post("/explain")
async def explain_concept(req: ExplainRequest):
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=settings.gemini_api_key,
        temperature=0.4,
    )
    response = llm.invoke(EXPLAIN_PROMPT.format(concept=req.concept, category=req.category))
    raw = response.content.strip()
    raw = re.sub(r"^```(?:json)?\n?", "", raw)
    raw = re.sub(r"\n?```$", "", raw)
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(500, "AI returned invalid JSON. Please try again.")
