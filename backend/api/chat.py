from fastapi import APIRouter
from pydantic import BaseModel
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from config import settings

router = APIRouter()

SYSTEM = """You are DevOS AI — a friendly, knowledgeable career mentor and coding teacher.
You help software developers of ALL skill levels and ages:
- Explain programming concepts in simple, clear language
- Help prepare for technical interviews
- Suggest career paths and daily learning plans
- Debug code and explain errors
- Answer questions about AI, machine learning, modern dev tools

Keep answers concise but thorough. Use analogies and real examples.
Be encouraging — every question is a good question. Adapt your language to the user's level."""

class ChatMsg(BaseModel):
    role: str   # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: list[ChatMsg]

@router.post("/")
async def chat(req: ChatRequest):
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=settings.gemini_api_key,
        temperature=0.7,
    )
    history = [SystemMessage(content=SYSTEM)]
    for m in req.messages:
        if m.role == "user":
            history.append(HumanMessage(content=m.content))
        else:
            history.append(AIMessage(content=m.content))
    response = llm.invoke(history)
    return {"reply": response.content}
