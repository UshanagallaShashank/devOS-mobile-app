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
