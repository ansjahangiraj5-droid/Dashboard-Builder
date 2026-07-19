from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from routers import analysis, insights, chat, kpi
from config import settings

logging.basicConfig(
    level=logging.INFO,
    format='{"time":"%(asctime)s","level":"%(levelname)s","message":"%(message)s"}',
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("InsightForge AI Engine starting")
    yield
    logger.info("InsightForge AI Engine shutting down")


app = FastAPI(
    title="InsightForge AI Engine",
    version="1.0.0",
    description="AI-powered analysis engine for InsightForge",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.backend_url],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)

app.include_router(analysis.router, prefix="/analysis", tags=["analysis"])
app.include_router(insights.router, prefix="/insights", tags=["insights"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(kpi.router, prefix="/kpi", tags=["kpi"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "ai-engine"}
