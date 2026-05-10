from fastapi import APIRouter, HTTPException
from schemas import UserProfileRequest, ok, err
from db import session as db_session
from db.models import UserProfile

router = APIRouter()

@router.post('/profile')
def upsert_profile(req: UserProfileRequest):
    # Create or update user profile in DB
    with db_session.get_session() as session:
        profile = session.get(UserProfile, req.user_id)
        if profile:
            profile.skills = req.skills
            profile.experience_years = req.experience_years
            profile.target_roles = req.target_roles
            profile.resume_text = req.resume_text
        else:
            profile = UserProfile(**req.model_dump())
            session.add(profile)
        session.commit()
    return ok({'user_id': req.user_id})

@router.get('/{user_id}/profile')
def get_profile(user_id: str):
    # Fetch user profile
    with db_session.get_session() as session:
        profile = session.get(UserProfile, user_id)
        if not profile:
            raise HTTPException(status_code=404, detail='User not found')
        return ok(profile.__dict__)
