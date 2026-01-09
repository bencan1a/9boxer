"""Application configuration."""

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Look for .env file in the backend directory, regardless of where the process is run from
# This allows the backend to find .env whether run from backend/, root/, or as a packaged executable
BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent.parent
ENV_FILE_PATH = BACKEND_ROOT / ".env"


class Settings(BaseSettings):
    """Application settings."""

    # App
    app_name: str = "9Boxer"
    app_version: str = "1.0.0"
    debug: bool = False

    # CORS
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    # File Upload
    max_upload_size: int = 10 * 1024 * 1024  # 10MB

    # LLM Configuration (optional - for AI-powered calibration summaries)
    anthropic_api_key: str | None = None
    llm_model: str = "claude-sonnet-4-5-20250929"
    llm_max_tokens: int = 2048

    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE_PATH) if ENV_FILE_PATH.exists() else None,
        env_file_encoding="utf-8",
    )


settings = Settings()
