from datetime import datetime, timezone

def utcnow() -> datetime:
    return datetime.now(timezone.utc)

def truncate(text: str, max_len: int = 500) -> str:
    return text[:max_len] + '...' if len(text) > max_len else text

def parse_list(text: str, delimiter: str = '\n') -> list[str]:
    # Split LLM output into clean non-empty lines
    return [line.strip().lstrip('•-').strip() for line in text.split(delimiter) if line.strip()]
