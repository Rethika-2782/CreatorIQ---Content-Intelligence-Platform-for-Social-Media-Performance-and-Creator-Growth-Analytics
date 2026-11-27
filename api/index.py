import sys
import os
from pathlib import Path

# Add backend directory to sys.path so 'app' imports resolve cleanly
backend_dir = Path(__file__).resolve().parent.parent / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.database import Base, engine, SessionLocal
from app.seed import seed_demo_users
from app.main import app

# Ensure all SQLite tables exist on function initialization
try:
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_demo_users(db)
except Exception as e:
    print(f"Startup initialization warning: {e}")
