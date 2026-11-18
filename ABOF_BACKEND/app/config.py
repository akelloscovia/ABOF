import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()


class Settings:
    environment = os.getenv("ABOF_ENV", "development")
    database_url = os.getenv("ABOF_DATABASE_URL", "sqlite:///./abof.db")
    secret_key = os.getenv(
        "ABOF_SECRET_KEY", "local-development-key-change-before-deployment"
    )
    cors_origins = [
        origin.strip()
        for origin in os.getenv(
            "ABOF_CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173",
        ).split(",")
        if origin.strip()
    ]
    upload_dir = Path(os.getenv("ABOF_UPLOAD_DIR", "uploads"))


settings = Settings()

if settings.environment == "production" and len(settings.secret_key) < 32:
    raise RuntimeError("ABOF_SECRET_KEY must contain at least 32 characters in production.")
