# API Reference

Base URL: `http://localhost:8000/api/v1`

All responses: `{ "success": bool, "data": any, "error": string | null }`

---

## Health

```
GET /health
→ { "status": "ok", "version": "1.0.0" }
```

---

## Users

### Upsert Profile
```
POST /users/profile
Body: {
  "user_id": "abc123",
  "skills": ["Python", "React"],
  "experience_years": 1,
  "target_roles": ["Junior AI Engineer"],
  "resume_text": "..."
}
→ { "success": true, "data": { "user_id": "abc123" } }
```

### Get Profile
```
GET /users/{user_id}/profile
→ { "success": true, "data": { ...profile } }
```

---

## Agents

### Trigger Agent
```
POST /agents/trigger
Body: {
  "user_id": "abc123",
  "agent": "resume" | "job" | "learn",
  "payload": { ...agent-specific data }
}
```

**Resume payload:** `{ "resume_text": "Full resume..." }`
**Response:** `{ "score": 74, "suggestions": ["..."] }`

**Job payload:** `{ "skills": ["Python"], "target_roles": ["AI Engineer"], "experience_years": 1 }`
**Response:** `{ "jobs": [{ "role": "", "company": "", "match_percent": 92 }] }`

**Learn payload:** `{ "skills": ["Python"], "track": "LLM Engineering" }`
**Response:** `{ "topic": "", "summary": "", "next_steps": ["..."] }`

### Agent Status
```
GET /agents/status/{user_id}
→ { "resume": { "last_run": null, "score": null }, "job": {...}, "learn": {...} }
```

---

## Error Codes

| Status | Meaning |
|---|---|
| 400 | Bad request / invalid payload |
| 404 | Resource not found |
| 500 | Internal server error |
