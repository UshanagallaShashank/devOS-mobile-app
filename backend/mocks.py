from schemas import ApiResponse, ok

# Mock responses for local dev without LLM calls
MOCK_RESUME_RESULT = ok({
    "score": 74,
    "suggestions": [
        "Add quantified impact to bullet points",
        "Move Skills section above Projects for ATS",
        "Replace weak verbs with action verbs",
    ],
})

MOCK_JOB_RESULT = ok({
    "jobs": [
        {"role": "Junior AI Engineer", "company": "Runway ML", "match": 92, "url": "#"},
        {"role": "Software Engineer I", "company": "Vercel", "match": 85, "url": "#"},
    ],
})

MOCK_LEARN_RESULT = ok({
    "topic": "RAG Architecture",
    "summary": "RAG combines retrieval with generation — your model fetches relevant docs before responding.",
    "next_steps": ["Build a basic RAG pipeline", "Try pgvector for retrieval", "Evaluate with RAGAS"],
})
