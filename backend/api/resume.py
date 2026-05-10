import io, json, re
from fastapi import APIRouter, UploadFile, File, HTTPException
from langchain_google_genai import ChatGoogleGenerativeAI
from config import settings

router = APIRouter()

ANALYSIS_PROMPT = """Analyze this resume for a software engineer. Respond ONLY with valid JSON, no markdown, no extra text.

{{
  "score": <overall 0-100>,
  "ats_score": <ATS friendliness 0-100>,
  "impact_score": <quantified impact 0-100>,
  "clarity_score": <clarity 0-100>,
  "name": "<candidate name or Unknown>",
  "current_role": "<most recent role>",
  "years_exp": <estimated years as integer>,
  "top_skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "suggestions": [
    {{"severity": "high",   "text": "<specific improvement>"}},
    {{"severity": "medium", "text": "<specific improvement>"}},
    {{"severity": "low",    "text": "<specific improvement>"}}
  ],
  "summary": "<2-sentence professional summary of this candidate>"
}}

Resume text:
{text}"""

@router.post("/analyze")
async def analyze_resume(file: UploadFile = File(...)):
    if not (file.filename or "").endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are supported")

    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(400, "File too large (max 5MB)")

    try:
        import pypdf
        reader = pypdf.PdfReader(io.BytesIO(content))
        text = "\n".join(p.extract_text() or "" for p in reader.pages)
    except Exception as e:
        raise HTTPException(500, f"PDF parse error: {e}")

    text = text.strip()
    if len(text) < 100:
        raise HTTPException(400, "Could not extract text. Use a text-based (non-scanned) PDF.")

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=settings.gemini_api_key,
        temperature=0.2,
    )
    response = llm.invoke(ANALYSIS_PROMPT.format(text=text[:4000]))
    raw = response.content.strip()

    # Strip markdown code fences if present
    raw = re.sub(r"^```(?:json)?\n?", "", raw)
    raw = re.sub(r"\n?```$", "", raw)

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(500, "AI returned invalid JSON. Please try again.")
