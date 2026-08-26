from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.database import get_db
from backend.utils.auth import get_current_user
from backend.models.user import User
from backend.models.history import PredictionHistory

router = APIRouter(prefix="/admin", tags=["admin"])

def check_admin(current_user: User):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to access this resource")
    return True

@router.get("/stats")
def get_global_stats(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_admin(current_user)
    
    total_users = db.query(User).count()
    total_scans = db.query(PredictionHistory).count()
    
    # Calculate anomaly detection rate
    critical_scans = db.query(PredictionHistory).filter(PredictionHistory.prediction != 'No Tumor').count()
    positive_rate = round((critical_scans / total_scans * 100), 1) if total_scans > 0 else 0
    
    return {
        "total_users": total_users,
        "total_scans": total_scans,
        "positive_rate": positive_rate
    }

@router.get("/users")
def get_all_users(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_admin(current_user)
    
    users = db.query(User).all()
    # Exclude passwords in API response for security
    return [{"id": u.id, "email": u.email, "is_admin": u.is_admin} for u in users]
