from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator


class StaffVerifyRequest(BaseModel):
    mobile_number: str = Field(..., min_length=6, max_length=20)

    @field_validator("mobile_number", mode="before")
    @classmethod
    def clean_mobile_number(cls, value):
        if isinstance(value, str):
            return value.strip()
        return value


class IntegrationStaffResponse(BaseModel):
    full_name: str
    phone: Optional[str]
    spacode: Optional[str] = None
    spa_id: Optional[int] = None
    spaname: Optional[str] = None
    spa_city: Optional[str] = None
    profiles: List[str] = Field(default_factory=list)
    verification_status: str
    employment_status: str


class IntegrationStaffListResponse(BaseModel):
    success: bool
    total: int
    limit: int
    offset: int
    items: List[IntegrationStaffResponse]


class IntegrationStaffDocumentResponse(BaseModel):
    id: int
    document_type: str
    file_url: Optional[str] = None
    verification_status: str
    created_at: datetime


class IntegrationStaffDocumentListResponse(BaseModel):
    success: bool
    staff_found: bool
    total: int
    message: Optional[str] = None
    staff: Optional[IntegrationStaffResponse] = None
    documents: List[IntegrationStaffDocumentResponse] = Field(default_factory=list)


class StaffVerifyResponse(BaseModel):
    success: bool
    staff_found: bool
    verified: Optional[bool] = None
    blocked: Optional[bool] = None
    is_verified: Optional[bool] = None
    is_active_employee: Optional[bool] = None
    is_blacklisted: Optional[bool] = None
    status_code: Optional[str] = None
    message: Optional[str] = None
    staff: Optional[IntegrationStaffResponse] = None
