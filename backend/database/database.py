from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# You will use Neon Database. You can set the DATABASE_URL in Render's environment variables.
# For local fallback, we'll use a local SQLite just in case.
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./braintumor.db")

connect_args = {"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {}

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
