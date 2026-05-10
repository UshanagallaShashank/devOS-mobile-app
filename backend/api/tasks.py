import json, re
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from langchain_google_genai import ChatGoogleGenerativeAI
from config import settings

router = APIRouter()

VALID_TAGS = {'DSA', 'Learn', 'Jobs', 'Resume', 'Other'}

class TaskGenRequest(BaseModel):
    stack: list[str] = []
    goal: str = ""
    experience: str = ""
    existing_tasks: list[dict[str, object]] = []

PROMPT = """Generate exactly 4 specific, actionable daily learning tasks for a software developer.

Developer profile:
- Tech stack: {stack}
- Career goal: {goal}
- Experience: {experience}
{existing_section}

Rules:
- Each task must be expressed in a simple short sentence (label field)
- Assign a realistic start_time and end_time in 12-hour format like "6:00 PM" and "6:30 PM"
- Schedule tasks across the day — morning, afternoon, and evening slots
- Include a short why/reason phrase in the label, e.g. "to improve speed"
- Mix task types: one DSA practice, one Learn task, one Jobs action, one Other task
- Do not repeat any existing task from the current list
- Treat completed tasks as already done and do not modify them
- Tags must be exactly one of: DSA, Learn, Jobs, Resume, Other

Respond ONLY with a valid JSON array, no markdown:
[
  {{"label": "specific task description", "tag": "DSA", "start_time": "7:00 AM", "end_time": "7:30 AM"}},
  {{"label": "specific task description", "tag": "Learn", "start_time": "12:00 PM", "end_time": "12:45 PM"}},
  {{"label": "specific task description", "tag": "Jobs", "start_time": "5:00 PM", "end_time": "5:30 PM"}},
  {{"label": "specific task description", "tag": "Other", "start_time": "8:00 PM", "end_time": "8:30 PM"}}
]"""

@router.post("/generate")
async def generate_tasks(req: TaskGenRequest):
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=settings.gemini_api_key,
        temperature=0.85,
    )
    stack_str = ', '.join(req.stack) if req.stack else 'General programming'
    existing_section = ''
    if req.existing_tasks:
        existing_lines = '\n'.join(
            f"- [{t.get('tag', 'Other')}] {t.get('label', '')} ({'done' if t.get('done') else 'open'})"
            for t in req.existing_tasks
        )
        existing_section = f"\nExisting tasks:\n{existing_lines}"

    response = llm.invoke(PROMPT.format(
        stack=stack_str,
        goal=req.goal or 'Grow as a developer',
        experience=req.experience or 'Junior developer',
        existing_section=existing_section,
    ))
    raw = response.content.strip()
    raw = re.sub(r"^```(?:json)?\n?", "", raw)
    raw = re.sub(r"\n?```$", "", raw)
    try:
        tasks = json.loads(raw)
        for t in tasks:
            if t.get('tag') not in VALID_TAGS:
                t['tag'] = 'Other'
            # ensure time fields exist (may be absent if model skipped them)
            t.setdefault('start_time', None)
            t.setdefault('end_time', None)
        return {"tasks": tasks}
    except json.JSONDecodeError:
        raise HTTPException(500, "AI returned invalid response. Please try again.")
