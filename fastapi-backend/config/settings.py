"""
Application Settings (FastAPI)
Loads configuration from environment variables.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator, Field
from typing import List, Union, Optional
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings"""

    # ------------------------------------------------------------------
    # Application
    # ------------------------------------------------------------------
    APP_NAME: str = "infodocs API"
    DEBUG: bool = False  # Set to False in production
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # ------------------------------------------------------------------
    # Security & JWT
    # ------------------------------------------------------------------
    SECRET_KEY: str = Field(default="", description="REQUIRED: Set in .env file. Generate with: python -c 'import secrets; print(secrets.token_urlsafe(32))'")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30 * 24 * 60  # 30 days

    def DATABASE_URL(self) -> str:
        """Return SQLAlchemy MySQL connection string."""
        return (
            f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )

    # ------------------------------------------------------------------
    # MySQL Database Settings
    # ------------------------------------------------------------------
    DB_NAME: str = Field(default="", description="REQUIRED: Set in .env file")
    DB_USER: str = Field(default="", description="REQUIRED: Set in .env file")
    DB_PASSWORD: str = Field(default="", description="REQUIRED: Set in .env file")
    DB_HOST: str = Field(default="localhost", description="REQUIRED: Set in .env file")
    DB_PORT: int = 3306

    # ------------------------------------------------------------------
    # CORS
    # ------------------------------------------------------------------
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:5173,https://infodocs.api.d0s369.co.in,https://docs.dishaonlinesolution.in"  # Comma-separated list in production

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, value):
        """
        Parse CORS origins as comma-separated string OR list.
        Example:
            "http://localhost:5173,http://localhost:8009"
            ["http://localhost:3000", "http://localhost:8009"]
        """
        if isinstance(value, list):
            return value
        if isinstance(value, str):
            if not value:
                return []
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        raise ValueError("CORS_ORIGINS must be list or comma-separated string")

    # ------------------------------------------------------------------
    # API Base URL Settings
    # ------------------------------------------------------------------
    API_BASE_URL: str = Field(
        default="https://infodocs.api.d0s369.co.in/api",
        description="Default backend API base URL for static paths and images"
    )

    # ------------------------------------------------------------------
    # File Upload Settings
    # ------------------------------------------------------------------
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10 MB
    UPLOAD_DIR: str = "media"

    # ------------------------------------------------------------------
    # Email Settings
    # ------------------------------------------------------------------
    EMAIL_BACKEND: str = "smtp"
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USE_TLS: Union[bool, str] = True
    SMTP_USER: str = Field(default="info.dishaonlinesoution@gmail.com", description="REQUIRED: Set in .env file")
    SMTP_PASSWORD: str = Field(default="uxtk jguy lzob vkoq", description="REQUIRED: Set in .env file (use Gmail App Password)")
    SMTP_FROM_EMAIL: str = Field(default="info.dishaonlinesoution@gmail.com", description="REQUIRED: Set in .env file")
    SERVER_EMAIL: str = Field(default="info.dishaonlinesoution@gmail.com", description="REQUIRED: Set in .env file")
    SKIP_EMAIL: bool = False  # Set to False in production to enable email sending

    @field_validator("SMTP_USE_TLS", mode="before")
    @classmethod
    def parse_tls(cls, value):
        """Convert string to boolean for TLS."""
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            return value.lower() in ("true", "1", "yes", "on")
        return True

    # ------------------------------------------------------------------
    # Redis Cache (Optional)
    # ------------------------------------------------------------------
    REDIS_URL: str = "redis://localhost:6379/0"

    # ------------------------------------------------------------------
    # Background Removal API (remove.bg)
    # ------------------------------------------------------------------
    REMOVE_BG_API_KEY: str = Field(
        default="",
        description="API key for remove.bg background removal service"
    )
    REMOVE_BG_API_URL: str = "https://api.remove.bg/v1.0/removebg"

    # ------------------------------------------------------------------
    # ENV Settings
    # ------------------------------------------------------------------
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True,
        env_nested_delimiter="__",
    )


# ----------------------------------------------------------
# Cached Settings Instance
# ----------------------------------------------------------
@lru_cache()
def get_settings() -> Settings:
    """Return cached settings instance"""
    return Settings()


settings = get_settings()
