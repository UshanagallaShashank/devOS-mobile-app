from agents.tools.job_scraper import get_cached_jobs


def search_jobs(query: str, num: int = 10, source: str | None = None, force: bool = False) -> list[dict]:
    # Use cached LinkedIn and Naukri jobs; refresh daily or when forced
    jobs = get_cached_jobs(query, source=source, force=force)
    return jobs[:num]
