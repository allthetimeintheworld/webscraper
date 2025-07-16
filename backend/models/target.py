from sqlalchemy import Column, Integer, String, DateTime, Float, Text, JSON, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from config.database import Base

class Target(Base):
    __tablename__ = "targets"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False, index=True)
    url = Column(String(2048), nullable=False, index=True)
    domain = Column(String(255), nullable=False, index=True)
    status = Column(String(50), default="pending", index=True)  # pending, processing, completed, failed
    
    # Extraction rules specific to this target
    extraction_rules = Column(JSON, nullable=True)
    
    # Performance metrics
    response_time = Column(Float, nullable=True)
    status_code = Column(Integer, nullable=True)
    content_length = Column(Integer, nullable=True)
    
    # Rate limiting data
    last_accessed = Column(DateTime(timezone=True), nullable=True)
    access_count = Column(Integer, default=0)
    
    # Robots.txt compliance
    robots_txt_allowed = Column(Boolean, nullable=True)
    robots_txt_checked_at = Column(DateTime(timezone=True), nullable=True)
    
    # Error handling
    retry_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)
    error_message = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    scraped_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    # job = relationship("Job", back_populates="targets")
