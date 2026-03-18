from sqlalchemy import Column, Integer, String, DateTime, Float, Text, JSON
from sqlalchemy.sql import func
from .connection import Base

class AnalysisLog(Base):
    __tablename__ = "analysis_logs"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    image_path = Column(String)
    objects_detected = Column(JSON)
    ocr_text = Column(Text)
    scene_description = Column(Text)
    confidence_score = Column(Float)
    processing_time = Column(Float)
    created_at = Column(DateTime, default=func.now())