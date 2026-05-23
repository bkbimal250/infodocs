from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator, model_validator

from apps.StaffManagement.models import DocumentTypeEnum


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
    spa_code: Optional[str] = None
    spa_id: Optional[int] = None
    spaname: Optional[str] = None
    spa_city: Optional[str] = None
    profiles: List[str] = Field(default_factory=list)
    verification_status: str
    employment_status: str


class IntegrationSpaResponse(BaseModel):
    id: int
    name: str
    code: Optional[int] = None
    area: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    address: Optional[str] = None
    is_active: bool


class IntegrationSpaListResponse(BaseModel):
    success: bool
    total: int
    limit: int
    offset: int
    items: List[IntegrationSpaResponse]


class IntegrationStaffListResponse(BaseModel):
    success: bool
    total: int
    limit: int
    offset: int
    items: List[IntegrationStaffResponse]


class IntegrationStaffDocumentResponse(BaseModel):
    id: int
    document_type: str
    document_number: Optional[str] = None
    file_url: Optional[str] = None
    verification_status: str
    created_at: datetime


class IntegrationStaffEntryDocument(BaseModel):
    document_type: DocumentTypeEnum = Field(default=DocumentTypeEnum.other)
    document_number: Optional[str] = None
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    file_base64: Optional[str] = Field(
        None,
        description="Optional base64 document content, with or without data URL prefix",
    )

    @field_validator("document_number", "file_url", "file_name", "file_base64", mode="before")
    @classmethod
    def clean_document_text(cls, value):
        if isinstance(value, str):
            value = value.strip()
            return value or None
        return value


class IntegrationStaffEntryRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    phone: str = Field(..., min_length=6, max_length=20)
    gender: Optional[str] = Field(None, max_length=20)
    profile_photo: Optional[str] = Field(None, max_length=500)
    address: Optional[str] = None
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    pincode: Optional[str] = None
    designation: Optional[str] = Field(None, max_length=100)
    joining_date: Optional[datetime] = None

    spa_id: Optional[int] = Field(None, description="Preferred exact SPA ID from /integration/spas")
    spa_code: Optional[str] = Field(None, description="Unique SPA code when ID is not available")
    spacode: Optional[str] = Field(None, description="Alias for spa_code")
    spa_name: Optional[str] = Field(None, description="SPA name fallback when ID/code is not available")

    documents: List[IntegrationStaffEntryDocument] = Field(default_factory=list)

    @field_validator(
        "full_name",
        "phone",
        "gender",
        "profile_photo",
        "address",
        "city",
        "state",
        "pincode",
        "designation",
        "spacode",
        "spa_code",
        "spa_name",
        mode="before",
    )
    @classmethod
    def clean_staff_text(cls, value):
        if isinstance(value, str):
            value = value.strip()
            return value or None
        return value

    @model_validator(mode="after")
    def normalize_spa_code_alias(self) -> "IntegrationStaffEntryRequest":
        if self.spacode is None and self.spa_code is not None:
            self.spacode = self.spa_code
        return self


class IntegrationStaffEntryResponse(BaseModel):
    success: bool
    message: str
    staff: IntegrationStaffResponse
    staff_id: int
    staff_uuid: str
    documents_added: int


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
