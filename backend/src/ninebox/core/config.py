"""Application configuration."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""

    # App
    app_name: str = "9-Box Performance Review"
    app_version: str = "0.1.0"
    debug: bool = False

    # Security
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    # CORS
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    # File Upload
    max_upload_size: int = 10 * 1024 * 1024  # 10MB

    class Config:
        """Pydantic config."""

        env_file = ".env"


settings = Settings()
