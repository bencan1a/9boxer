"""Application configuration."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""

    # App
    app_name: str = "9Boxer"
    app_version: str = "0.1.0"
    debug: bool = False

    # CORS
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    # File Upload
    max_upload_size: int = 10 * 1024 * 1024  # 10MB

    # LLM Configuration (optional - for AI-powered calibration summaries)
    anthropic_api_key: str | None = None
    llm_model: str = "claude-sonnet-4-5-20250929"
    llm_max_tokens: int = 2048

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
