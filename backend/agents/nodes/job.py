from langchain_google_genai import ChatGoogleGenerativeAI
from config import settings
from agents.types import AgentState
from agents.tools.search import search_jobs

llm = ChatGoogleGenerativeAI(model='gemini-2.5-flash', google_api_key=settings.gemini_api_key)

PROMPT = """You are a career coach. Given this user profile and job listings, return the top 5 matches as JSON.
Each match: {{"role": "", "company": "", "match_percent": 0, "reason": ""}}.
Return ONLY valid JSON list.

Profile: {profile}
Jobs: {jobs}"""

def job_node(state: AgentState) -> AgentState:
    # Search for jobs then rank them with Gemini against the user profile
    profile = state['payload']
    raw_jobs = search_jobs(f"{' '.join(profile.get('target_roles', []))} junior engineer")
    response = llm.invoke(PROMPT.format(profile=profile, jobs=raw_jobs[:10]))

    import json
    try:
        matches = json.loads(response.content)
    except Exception:
        matches = []

    state['result'] = {'jobs': matches}
    return state
