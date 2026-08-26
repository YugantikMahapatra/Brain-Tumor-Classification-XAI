from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database.database import Base

class PredictionHistory(Base):
    __tablename__ = "prediction_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    file_path = Column(String)
    prediction = Column(String)
    confidence = Column(Float)
    probabilities = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User")
