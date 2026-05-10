from pydantic import BaseModel
from typing import Any

class ApiResponse(BaseModel):
    success: bool
    data: Any
    error: str | None = None

class TriggerAgentRequest(BaseModel):
    user_id: str
    agent: str  # "resume" | "job" | "learn"
    payload: dict[str, Any] = {}

class UserProfileRequest(BaseModel):
    user_id: str
    skills: list[str]
    experience_years: int
    target_roles: list[str]
    resume_text: str = ''

def ok(data: Any) -> ApiResponse:
    return ApiResponse(success=True, data=data)

def err(message: str) -> ApiResponse:
    return ApiResponse(success=False, data=None, error=message)
