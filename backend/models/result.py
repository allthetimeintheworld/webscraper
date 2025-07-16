from sqlalchemy import Column, Integer, String, DateTime, Float, Text, JSON, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from config.database import Base

class Result(Base):
    __tablename__ = "results"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False, index=True)
    target_id = Column(Integer, ForeignKey("targets.id"), nullable=False, index=True)
    url = Column(String(2048), nullable=False, index=True)
    
    # Extracted data
    title = Column(String(1024), nullable=True)
    content = Column(JSON, nullable=False)  # Main extracted data
    metadata = Column(JSON, nullable=True)  # Additional metadata
    
    # Data quality metrics
    data_quality_score = Column(Float, nullable=True)
    extraction_success = Column(Boolean, default=True)
    validation_errors = Column(JSON, nullable=True)
    
    # Technical details
    response_time = Column(Float, nullable=True)
    status_code = Column(Integer, nullable=True)
    content_type = Column(String(100), nullable=True)
    content_length = Column(Integer, nullable=True)
    
    # JavaScript rendering info
    javascript_rendered = Column(Boolean, default=False)
    rendering_time = Column(Float, nullable=True)
    
    # Detection avoidance metrics
    user_agent_used = Column(String(512), nullable=True)
    proxy_used = Column(String(255), nullable=True)
    delay_used = Column(Float, nullable=True)
    
    # Duplicate detection
    content_hash = Column(String(64), nullable=True, index=True)
    is_duplicate = Column(Boolean, default=False)
    duplicate_of = Column(Integer, ForeignKey("results.id"), nullable=True)
    
    # Timestamps
    scraped_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Raw data storage (for debugging)
    raw_html = Column(Text, nullable=True)
    screenshot_path = Column(String(512), nullable=True)
    
    # Error handling
    error_message = Column(Text, nullable=True)
    error_type = Column(String(100), nullable=True)
    
    # Relationships
    # job = relationship("Job", back_populates="results")
    # target = relationship("Target", back_populates="results")
