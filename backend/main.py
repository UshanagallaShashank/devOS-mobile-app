from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import users, agents, resume, learn, tasks, chat, jobs, dsa

app = FastAPI(title='DevOS API', version='1.0.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(users.router,  prefix='/api/v1/users',  tags=['users'])
app.include_router(agents.router, prefix='/api/v1/agents', tags=['agents'])
app.include_router(resume.router, prefix='/api/v1/resume', tags=['resume'])
app.include_router(learn.router,  prefix='/api/v1/learn',  tags=['learn'])
app.include_router(tasks.router,  prefix='/api/v1/tasks',  tags=['tasks'])
app.include_router(chat.router,   prefix='/api/v1/chat',   tags=['chat'])
app.include_router(jobs.router,   prefix='/api/v1/jobs',   tags=['jobs'])
app.include_router(dsa.router,    prefix='/api/v1/dsa',    tags=['dsa'])

@app.get('/health')
def health() -> dict[str, str]:
    return {'status': 'ok', 'version': '1.0.0'}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run('main:app', host='0.0.0.0', port=8000, reload=True)
