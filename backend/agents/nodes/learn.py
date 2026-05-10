from langchain_google_genai import ChatGoogleGenerativeAI
from config import settings
from agents.types import AgentState
from utils import parse_list

llm = ChatGoogleGenerativeAI(model='gemini-2.5-flash', google_api_key=settings.gemini_api_key)

PROMPT = """You are a senior engineer mentoring a junior engineer.
Given their skills and current learning track, suggest today's topic.
Format:
TOPIC: <topic name>
SUMMARY: <2 sentence explanation>
NEXT STEPS:
- step 1
- step 2
- step 3

Skills: {skills}
Track: {track}"""

def learn_node(state: AgentState) -> AgentState:
    # Generate personalized learning topic for today
    payload = state['payload']
    response = llm.invoke(PROMPT.format(
        skills=', '.join(payload.get('skills', [])),
        track=payload.get('track', 'LLM Engineering'),
    ))
    text = response.content

    topic = text.split('TOPIC:')[1].split('\n')[0].strip() if 'TOPIC:' in text else 'AI Fundamentals'
    summary = text.split('SUMMARY:')[1].split('\n')[0].strip() if 'SUMMARY:' in text else ''
    next_steps = parse_list(text.split('NEXT STEPS:')[-1])

    state['result'] = {'topic': topic, 'summary': summary, 'next_steps': next_steps[:3]}
    return state
