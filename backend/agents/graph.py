from langgraph.graph import StateGraph, END
from agents.types import AgentState
from agents.nodes.resume import resume_node
from agents.nodes.job import job_node
from agents.nodes.learn import learn_node

def _route(state: AgentState) -> str:
    # Route to the correct agent node based on agent name
    return state['agent']

def _build_graph() -> StateGraph:
    graph = StateGraph(AgentState)
    graph.add_node('resume', resume_node)
    graph.add_node('job', job_node)
    graph.add_node('learn', learn_node)
    graph.set_conditional_entry_point(_route, {'resume': 'resume', 'job': 'job', 'learn': 'learn'})
    graph.add_edge('resume', END)
    graph.add_edge('job', END)
    graph.add_edge('learn', END)
    return graph.compile()

_app = _build_graph()

async def run_agent(agent: str, user_id: str, payload: dict) -> dict:
    # Execute the LangGraph workflow and return result
    state: AgentState = {'user_id': user_id, 'agent': agent, 'payload': payload, 'result': {}, 'error': None}
    final = await _app.ainvoke(state)
    return final['result']
