from contextlib import contextmanager
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from db.models import Base

_DB_PATH = Path(__file__).parent.parent / 'job_cache.sqlite'
_engine = create_engine(
    f'sqlite:///{_DB_PATH}',
    connect_args={'check_same_thread': False},
)
Base.metadata.create_all(bind=_engine)
_SessionLocal = sessionmaker(bind=_engine, autocommit=False, autoflush=False)

@contextmanager
def get_job_session():
    session: Session = _SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
