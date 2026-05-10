from langchain_google_genai import ChatGoogleGenerativeAI
from config import settings
from agents.types import AgentState
from utils import parse_list

llm = ChatGoogleGenerativeAI(model='gemini-2.5-flash', google_api_key=settings.gemini_api_key)

PROMPT = """You are a senior technical recruiter reviewing a software engineer's resume.
Score it from 0-100 and give exactly 5 actionable improvement suggestions.
Format: SCORE: <number>\nSUGGESTIONS:\n- ...\n- ...

Resume:
{resume}"""

def resume_node(state: AgentState) -> AgentState:
    # Run resume review via Gemini and extract score + suggestions
    resume = state['payload'].get('resume_text', '')
    response = llm.invoke(PROMPT.format(resume=resume))
    text = response.content

    score_line = next((l for l in text.split('\n') if 'SCORE:' in l), 'SCORE: 70')
    score = int(''.join(filter(str.isdigit, score_line.split(':')[1])))
    suggestions = parse_list(text.split('SUGGESTIONS:')[-1])

    state['result'] = {'score': score, 'suggestions': suggestions[:5]}
    return state
