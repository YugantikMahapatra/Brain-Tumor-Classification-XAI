from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes import auth_routes, upload_routes, predict_routes, history_routes, admin_routes
from backend.database.database import engine, Base
from backend.models import user, history

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Brain Tumor Classification API", description="Backend for Brain Tumor Classification System")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

from fastapi.staticfiles import StaticFiles
import os

app.include_router(auth_routes.router)
app.include_router(upload_routes.router)
app.include_router(predict_routes.router)
app.include_router(history_routes.router)
app.include_router(admin_routes.router)

# Serve uploaded files statically so the frontend can preview historical MRI scans
os.makedirs("backend/uploads", exist_ok=True)
app.mount("/backend/uploads", StaticFiles(directory="backend/uploads"), name="uploads")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Brain Tumor Classification API"}
