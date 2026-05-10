# Backend Utilities and Helpers

## Logger Configuration

```python
# Use logging for agent traces
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
```

## Error Handling

```python
# Always use specific exceptions
class AgentError(Exception):
    pass

# Example usage
try:
    result = await agent.ainvoke(state)
except AgentError as e:
    logger.error(f"Agent failed: {e}")
```

## Async Patterns

```python
# Always use async for I/O
async def fetch_data(url):
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        return response.json()
```

## Testing

```bash
# Run tests
pytest -v

# With coverage
pytest --cov=backend
```
