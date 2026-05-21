from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class IntegrationApiKeyCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    description: Optional[str] = None

    @field_validator("name", "description", mode="before")
    @classmethod
    def clean_text(cls, value):
        if isinstance(value, str):
            value = value.strip()
            return value or None
        return value


class IntegrationApiKeyResponse(BaseModel):
    id: int
    name: str
    key_prefix: str
    key_preview: str
    is_active: bool
    description: Optional[str]
    created_by: Optional[int]
    last_used_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class IntegrationApiKeyCreateResponse(BaseModel):
    success: bool
    api_key: str
    key: IntegrationApiKeyResponse


class IntegrationApiKeyActionResponse(BaseModel):
    success: bool
    message: str
    key: Optional[IntegrationApiKeyResponse] = None


class IntegrationApiKeyRegenerateResponse(BaseModel):
    success: bool
    api_key: str
    key: IntegrationApiKeyResponse
