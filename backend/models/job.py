from sqlalchemy import Column, Integer, String, DateTime, Float, Text, JSON, Boolean
from sqlalchemy.sql import func
from config.database import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    status = Column(String(50), default="created", index=True)
    target_urls = Column(JSON, nullable=False)
    scraping_rules = Column(JSON, nullable=False)
    schedule = Column(String(100), nullable=True)
    priority = Column(Integer, default=1)
    progress = Column(Float, default=0.0)
    pages_scraped = Column(Integer, default=0)
    pages_total = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    error_message = Column(Text, nullable=True)
    config = Column(JSON, nullable=True)  # Job-specific configuration
    
    # Robots.txt handling settings
    respect_robots_txt = Column(Boolean, default=True)
    robots_txt_override = Column(Boolean, default=False)
    
    # Rate limiting settings
    rate_limit_enabled = Column(Boolean, default=True)
    min_delay = Column(Float, default=1.0)
    max_delay = Column(Float, default=5.0)
    
    # Anti-detection settings
    use_proxy_rotation = Column(Boolean, default=False)
    use_user_agent_rotation = Column(Boolean, default=True)
    use_javascript_rendering = Column(Boolean, default=False)
