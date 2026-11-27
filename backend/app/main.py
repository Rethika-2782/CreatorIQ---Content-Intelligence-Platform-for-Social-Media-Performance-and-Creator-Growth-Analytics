import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError, ProgrammingError

from .config import FRONTEND_ORIGIN, SEED_DEMO_USERS
from .database import SessionLocal
from .routers import account, admin, agencies, analytics, auth, creators, youtube, revenue, reports, ai_pro
from .seed import seed_demo_users

log = logging.getLogger("creatoriq")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Tables come from Alembic: run `alembic upgrade head` once before starting.
    if SEED_DEMO_USERS:
        try:
            with SessionLocal() as db:
                seed_demo_users(db)
        except (OperationalError, ProgrammingError):
            log.error("Database tables not found. Run: alembic upgrade head")
    yield


app = FastAPI(title="CreatorIQ API", version="0.2.0", lifespan=lifespan)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    error_msg = f"{type(exc).__name__}: {str(exc)}"
    log.error("Unhandled Exception: %s\n%s", error_msg, traceback.format_exc())
    return JSONResponse(status_code=500, content={"detail": error_msg})

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for r in (auth, account, creators, agencies, admin, analytics, youtube, revenue, reports, ai_pro):
    app.include_router(r.router)


@app.get("/api/health", tags=["Health"])
def health():
    return {"status": "ok"}
