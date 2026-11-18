from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import Base, engine
from app import models
from app.routes import admin, auth, public


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="ABOF Foundation API",
    description="Content and administration API for the Acam Betty Okello Foundation website.",
    version="1.0.0",
    lifespan=lifespan,
)
settings.upload_dir.mkdir(parents=True, exist_ok=True)
app.mount("/media", StaticFiles(directory=settings.upload_dir), name="media")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth.router)
app.include_router(public.router)
app.include_router(admin.router)


@app.get("/api/health", tags=["operations"])
def health():
    return {"status": "ok", "service": "abof-api"}
