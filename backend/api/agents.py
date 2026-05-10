from fastapi import APIRouter
from schemas import TriggerAgentRequest, ok, err
from agents.graph import run_agent

router = APIRouter()

VALID_AGENTS = {'resume', 'job', 'learn'}

@router.post('/trigger')
async def trigger_agent(req: TriggerAgentRequest):
    # Validate agent name then run the LangGraph workflow
    if req.agent not in VALID_AGENTS:
        return err(f'Unknown agent: {req.agent}. Valid: {VALID_AGENTS}')

    result = await run_agent(
        agent=req.agent,
        user_id=req.user_id,
        payload=req.payload,
    )
    return ok(result)

@router.get('/status/{user_id}')
def agent_status(user_id: str):
    # Returns last run timestamps and results for all agents
    return ok({
        'user_id': user_id,
        'resume': {'last_run': None, 'score': None},
        'job': {'last_run': None, 'matches': 0},
        'learn': {'last_run': None, 'topic': None},
    })
