from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
import os
from uuid import uuid4

router = APIRouter(prefix="/upload", tags=["upload"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

UPLOAD_DIR = "backend/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@router.post("/")
async def upload_image(file: UploadFile = File(...), token: str = Depends(oauth2_scheme)):
    if not allowed_file(file.filename):
        raise HTTPException(status_code=400, detail="File format not supported. Please upload PNG, JPG, or JPEG.")
    
    ext = file.filename.rsplit(".", 1)[1].lower()
    unique_filename = f"{uuid4().hex}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not save file")
    
    return {"message": "File uploaded successfully", "file_path": file_path, "filename": file.filename}
