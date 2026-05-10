from typing import Any
from typing_extensions import TypedDict

class AgentState(TypedDict):
    user_id: str
    agent: str
    payload: dict[str, Any]
    result: dict[str, Any]
    error: str | None
