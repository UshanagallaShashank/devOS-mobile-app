from sqlalchemy import Column, String, Integer, Text, DateTime, JSON
from sqlalchemy.orm import DeclarativeBase
from utils import utcnow

class Base(DeclarativeBase):
    pass

class UserProfile(Base):
    __tablename__ = 'user_profiles'

    user_id = Column(String, primary_key=True)
    full_name = Column(Text)
    bio = Column(Text)
    github_url = Column(Text)
    linkedin_url = Column(Text)
    leetcode_username = Column(Text)
    leetcode_solved = Column(Integer)
    resume_url = Column(Text)
    resume_analysis = Column(JSON)
    skills = Column(JSON, default=list)
    experience_years = Column(Integer, default=0)
    target_roles = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

class AgentResult(Base):
    __tablename__ = 'agent_results'

    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False, index=True)
    agent = Column(String, nullable=False)  # resume | job | learn
    result = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)

class JobListing(Base):
    __tablename__ = 'job_listings'

    id = Column(String, primary_key=True)
    source = Column(String, nullable=False)
    cache_key = Column(String, nullable=False, index=True)
    title = Column(String, nullable=False)
    company = Column(String, nullable=True)
    location = Column(String, nullable=True)
    summary = Column(Text, nullable=True)
    url = Column(String, nullable=False)
    fetched_at = Column(DateTime(timezone=True), default=utcnow, index=True)

class JobCache(Base):
    __tablename__ = 'job_cache'

    cache_key = Column(String, primary_key=True)
    last_fetched_at = Column(DateTime(timezone=True), default=utcnow)
