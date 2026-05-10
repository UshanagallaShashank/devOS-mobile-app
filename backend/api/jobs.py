from fastapi import APIRouter, Query
from schemas import ok
from agents.tools.job_scraper import get_cached_jobs

router = APIRouter()

@router.get('/search')
def search_jobs(
    role:  str  = Query('software engineer', description='Job role to search'),
    force: bool = Query(False, description='Force refresh the Serper cache'),
):
    jobs = get_cached_jobs(role=role, force=force)
    return ok({'role': role, 'count': len(jobs), 'jobs': jobs})
