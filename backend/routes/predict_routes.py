from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.database.database import get_db
from backend.utils.auth import get_current_user
from backend.predictions.prediction_service import predict_mri
from backend.models.history import PredictionHistory

router = APIRouter(prefix="/predict", tags=["predict"])

class PredictRequest(BaseModel):
    file_path: str

@router.post("/")
async def get_prediction(request: PredictRequest, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        # Always compute prediction to ensure GradCAM is generated (Base64 is too large for DB caching)
        result = predict_mri(request.file_path)
        
        # Idempotency Check: Prevent duplicate DB inserts if frontend double-fires
        existing_entry = db.query(PredictionHistory).filter(PredictionHistory.file_path == request.file_path).first()
        if existing_entry:
            return result
        
        # Save the result to the history database automatically
        history_entry = PredictionHistory(
            user_id=current_user.id,
            file_path=request.file_path,
            prediction=result['prediction'],
            confidence=result['confidence'],
            probabilities=result['probabilities']
        )
        db.add(history_entry)
        db.commit()
        db.refresh(history_entry)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error generating prediction: " + str(e))

@router.get("/history")
async def get_prediction_history(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        history = db.query(PredictionHistory).filter(PredictionHistory.user_id == current_user.id).order_by(PredictionHistory.created_at.desc()).all()
        return {"history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error fetching history: " + str(e))
