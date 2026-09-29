from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database.database import get_db
from backend.utils.auth import get_current_user
from backend.models.history import PredictionHistory

router = APIRouter(prefix="/history", tags=["history"])

@router.get("/")
def get_user_history(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Fetch all past predictions for the currently logged in user, newest first
    history = db.query(PredictionHistory).filter(PredictionHistory.user_id == current_user.id).order_by(PredictionHistory.created_at.desc()).all()
    return history
