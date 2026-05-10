import html as html_mod
import re
import uuid
from datetime import timedelta

import httpx
from sqlalchemy import delete

from db.models import JobListing, JobCache
from db.job_cache_db import get_job_session
from utils import utcnow

HN_USER_URL  = 'https://hacker-news.firebaseio.com/v0/user/whoishiring/submitted.json'
HN_ITEM_URL  = 'https://hacker-news.firebaseio.com/v0/item/{}.json'
ALGOLIA_URL  = 'https://hn.algolia.com/api/v1/search'
REMOTIVE_URL = 'https://remotive.com/api/remote-jobs'

REMOTIVE_CAT = {
    'ai engineer':             'software-dev',
    'full stack developer':    'software-dev',
    'backend developer':       'software-dev',
    'frontend developer':      'software-dev',
    'data scientist':          'data',
    'devops sre':              'devops',
    'machine learning engineer': 'data',
    'mobile developer':        'software-dev',
}


# ── HN Who's Hiring ──────────────────────────────────────────────────────────

def _get_hn_thread() -> int | None:
    try:
        ids = httpx.get(HN_USER_URL, timeout=10).json()
        for tid in ids[:8]:
            item = httpx.get(HN_ITEM_URL.format(tid), timeout=10).json()
            title = (item.get('title') or '').lower()
            if 'who is hiring' in title and 'who wants to be hired' not in title:
                return tid
        return None
    except Exception:
        return None


def _clean_html(text: str) -> str:
    text = re.sub(r'<[^>]+>', ' ', text)
    text = html_mod.unescape(text)
    return re.sub(r'\s+', ' ', text).strip()


def _extract_url(raw_html: str) -> str:
    m = re.search(r'href=["\']([^"\']+)["\']', raw_html)
    if m:
        return html_mod.unescape(m.group(1))
    m = re.search(r'(https?://\S+)', _clean_html(raw_html))
    return m.group(1) if m else ''


def _parse_hn_hit(hit: dict, role: str) -> dict:
    raw     = hit.get('comment_text', '')
    url     = _extract_url(raw)
    text    = _clean_html(raw)
    parts   = [p.strip() for p in text.split('|')]
    company  = parts[0] if parts else 'Unknown'
    title    = parts[1].strip() if len(parts) > 1 else role
    location = parts[2].strip() if len(parts) > 2 else 'Remote'
    summary  = text[:350]
    hn_link  = f'https://news.ycombinator.com/item?id={hit.get("objectID","")}'
    return {
        'title':    title,
        'company':  company,
        'location': location,
        'summary':  summary,
        'url':      url or hn_link,
        'source':   "HN Who's Hiring",
    }


def _search_hn(role: str, thread_id: int, num: int = 15) -> list[dict]:
    try:
        resp = httpx.get(
            ALGOLIA_URL,
            params={'query': role, 'tags': f'comment,story_{thread_id}', 'hitsPerPage': num},
            timeout=15,
        )
        if resp.status_code != 200:
            return []
        return [_parse_hn_hit(h, role) for h in resp.json().get('hits', [])]
    except Exception:
        return []


# ── Remotive ─────────────────────────────────────────────────────────────────

def _search_remotive(role: str, num: int = 15) -> list[dict]:
    category = REMOTIVE_CAT.get(role.lower(), 'software-dev')
    keywords = [w for w in role.lower().split() if len(w) > 2]
    try:
        resp = httpx.get(
            REMOTIVE_URL,
            params={'category': category, 'limit': 50},
            timeout=15,
        )
        if resp.status_code != 200:
            return []
        jobs = []
        for j in resp.json().get('jobs', []):
            title_lower = (j.get('title') or '').lower()
            # Only include if at least one keyword matches the job title
            if not any(kw in title_lower for kw in keywords):
                continue
            desc = re.sub(r'<[^>]+>', ' ', j.get('description', ''))
            jobs.append({
                'title':    j.get('title', ''),
                'company':  j.get('company_name', ''),
                'location': j.get('candidate_required_location') or 'Remote',
                'summary':  re.sub(r'\s+', ' ', desc).strip()[:350],
                'url':      j.get('url', ''),
                'source':   'Remotive',
            })
            if len(jobs) >= num:
                break
        return jobs
    except Exception:
        return []


# ── Cache helpers ─────────────────────────────────────────────────────────────

def _cache_key(role: str) -> str:
    return f'hn:{role.strip().lower()}'


def _is_stale(role: str) -> bool:
    key = _cache_key(role)
    with get_job_session() as session:
        cache = session.get(JobCache, key)
        if cache is None:
            return True
        # SQLite returns naive datetimes; strip tz from utcnow() before comparing
        now = utcnow().replace(tzinfo=None)
        return now - cache.last_fetched_at > timedelta(hours=12)


def _store(role: str, jobs: list[dict]) -> None:
    key = _cache_key(role)
    with get_job_session() as session:
        session.execute(delete(JobListing).where(JobListing.cache_key == key))
        for j in jobs:
            session.add(JobListing(
                id=uuid.uuid4().hex, cache_key=key, source=j.get('source', ''),
                title=j.get('title', ''), company=j.get('company', ''),
                location=j.get('location', ''), summary=j.get('summary', ''),
                url=j.get('url', ''), fetched_at=utcnow(),
            ))
        cache = session.get(JobCache, key)
        if cache is None:
            session.add(JobCache(cache_key=key, last_fetched_at=utcnow()))
        else:
            cache.last_fetched_at = utcnow()


def _read_cache(role: str) -> list[dict]:
    key = _cache_key(role)
    with get_job_session() as session:
        rows = (
            session.query(JobListing)
            .filter(JobListing.cache_key == key)
            .order_by(JobListing.fetched_at.desc())
            .all()
        )
        return [{
            'title': r.title, 'company': r.company, 'location': r.location,
            'summary': r.summary, 'url': r.url, 'source': r.source,
        } for r in rows]


# ── Public entry point ────────────────────────────────────────────────────────

def get_cached_jobs(role: str = 'software engineer', force: bool = False) -> list[dict]:
    role = role.strip() or 'software engineer'
    if force or _is_stale(role):
        thread_id = _get_hn_thread()
        hn_jobs   = _search_hn(role, thread_id, num=15) if thread_id else []
        rem_jobs  = _search_remotive(role, num=10)
        # Deduplicate by URL
        seen, all_jobs = set(), []
        for j in hn_jobs + rem_jobs:
            if j['url'] and j['url'] not in seen:
                seen.add(j['url']); all_jobs.append(j)
        if all_jobs:
            _store(role, all_jobs)
    cached = _read_cache(role)
    if not cached:
        thread_id = _get_hn_thread()
        return _search_hn(role, thread_id, num=15) if thread_id else []
    return cached
