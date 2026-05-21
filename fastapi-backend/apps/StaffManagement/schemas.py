"""
Staff Management Schemas
Defines input/output Pydantic models for the staff registry.
"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from apps.StaffManagement.models import (
    VerificationStatusEnum,
    EmploymentStatusEnum,
    StaffEventTypeEnum,
    DocumentTypeEnum,
)

# =========================================================
# STAFF DOCUMENT SCHEMAS
# =========================================================

class StaffDocumentBase(BaseModel):
    document_type: DocumentTypeEnum
    file_url: str


class StaffDocumentCreate(StaffDocumentBase):
    document_number: Optional[str] = Field(None, description="Document identifier entered by staff manager/HR")

    @field_validator("document_number")
    @classmethod
    def clean_doc_number(cls, v: Optional[str]) -> Optional[str]:
        return v.strip() if isinstance(v, str) and v.strip() else None


class StaffDocumentResponse(StaffDocumentBase):
    id: int
    staff_id: int
    document_number_last4: Optional[str]
    is_verified: bool
    verified_by: Optional[int]
    verified_at: Optional[datetime]
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =========================================================
# STAFF EVENT SCHEMAS
# =========================================================

class StaffEventResponse(BaseModel):
    id: int
    staff_id: int
    event_type: StaffEventTypeEnum
    spa_id: Optional[int]
    from_spa_id: Optional[int]
    to_spa_id: Optional[int]
    transfer_reason: Optional[str]
    notes: Optional[str]
    event_date: datetime
    created_by: Optional[int]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =========================================================
# WORK HISTORY SCHEMAS
# =========================================================

class WorkHistoryResponse(BaseModel):
    id: int
    staff_id: int
    spa_id: int
    join_date: datetime
    leave_date: Optional[datetime]
    is_transferred: bool
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =========================================================
# VERIFICATION LOG SCHEMAS
# =========================================================

class StaffVerificationLogResponse(BaseModel):
    id: int
    staff_id: int
    old_status: Optional[str]
    new_status: str
    reason: Optional[str]
    changed_by: Optional[int]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =========================================================
# STAFF CORE SCHEMAS
# =========================================================

class StaffBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    gender: Optional[str] = Field(None, max_length=20)
    dob: Optional[datetime] = None
    profile_photo: Optional[str] = Field(None, max_length=500)
    phone: Optional[str] = None
    alternate_phone: Optional[str] = None
    emergency_contact_name: Optional[str] = Field(None, max_length=255)
    emergency_contact_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    pincode: Optional[str] = None
    designation: Optional[str] = Field(None, max_length=100)
    current_spa_id: Optional[int] = None
    joining_date: Optional[datetime] = None

    @field_validator(
        "full_name",
        "gender",
        "profile_photo",
        "phone",
        "alternate_phone",
        "emergency_contact_name",
        "emergency_contact_number",
        "address",
        "city",
        "state",
        "pincode",
        "designation",
        mode="before",
    )
    @classmethod
    def clean_text_fields(cls, v):
        return v.strip() if isinstance(v, str) else v


class StaffCreate(StaffBase):
    aadhaar_number: Optional[str] = Field(None, description="Aadhaar entered during staff registration")
    pan_number: Optional[str] = Field(None, description="PAN entered during staff registration")

    @field_validator("aadhaar_number", mode="before")
    @classmethod
    def clean_staff_aadhaar(cls, v: Optional[str]) -> Optional[str]:
        return v.strip() if isinstance(v, str) and v.strip() else None

    @field_validator("pan_number", mode="before")
    @classmethod
    def clean_staff_pan(cls, v: Optional[str]) -> Optional[str]:
        return v.strip().upper() if isinstance(v, str) and v.strip() else None


class StaffUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    gender: Optional[str] = Field(None, max_length=20)
    dob: Optional[datetime] = None
    profile_photo: Optional[str] = Field(None, max_length=500)
    phone: Optional[str] = None
    alternate_phone: Optional[str] = None
    emergency_contact_name: Optional[str] = Field(None, max_length=255)
    emergency_contact_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    pincode: Optional[str] = None
    designation: Optional[str] = Field(None, max_length=100)
    current_spa_id: Optional[int] = None
    joining_date: Optional[datetime] = None
    employment_status: Optional[EmploymentStatusEnum] = None
    aadhaar_number: Optional[str] = None
    pan_number: Optional[str] = None

    @field_validator(
        "full_name",
        "gender",
        "profile_photo",
        "phone",
        "alternate_phone",
        "emergency_contact_name",
        "emergency_contact_number",
        "address",
        "city",
        "state",
        "pincode",
        "designation",
        "aadhaar_number",
        mode="before",
    )
    @classmethod
    def clean_update_text_fields(cls, v):
        return v.strip() if isinstance(v, str) and v.strip() else v

    @field_validator("pan_number", mode="before")
    @classmethod
    def clean_update_pan(cls, v: Optional[str]) -> Optional[str]:
        return v.strip().upper() if isinstance(v, str) and v.strip() else None


class StaffResponse(StaffBase):
    id: int
    staff_uuid: str
    aadhaar_last4: Optional[str]
    pan_last4: Optional[str]
    verification_status: VerificationStatusEnum
    verification_reason: Optional[str]
    verified_by: Optional[int]
    verified_at: Optional[datetime]
    employment_status: EmploymentStatusEnum
    is_blacklisted: bool
    blacklist_reason: Optional[str]
    deleted_at: Optional[datetime]
    created_by: Optional[int]
    created_at: datetime
    updated_at: datetime

    documents: List[StaffDocumentResponse] = []
    events: List[StaffEventResponse] = []
    work_history: List[WorkHistoryResponse] = []
    verification_logs: List[StaffVerificationLogResponse] = []

    model_config = ConfigDict(from_attributes=True)


# =========================================================
# SYSTEM WORKFLOW SCHEMAS
# =========================================================

class StaffVerificationRequest(BaseModel):
    status: VerificationStatusEnum
    reason: Optional[str] = Field(None, description="Reason for verification status change")


class StaffTransferRequest(BaseModel):
    target_spa_id: Optional[int] = Field(None, description="Backend target SPA branch ID")
    to_spa_id: Optional[int] = Field(None, description="Frontend style SPA target ID")
    transfer_reason: Optional[str] = Field(None, description="Reason for transferring the employee")
    notes: Optional[str] = Field(None, description="Additional notes/history log")

    @model_validator(mode="after")
    def resolve_spa_id(self) -> "StaffTransferRequest":
        if self.target_spa_id is None and self.to_spa_id is None:
            raise ValueError("Either target_spa_id or to_spa_id must be provided")
        if self.target_spa_id is None:
            self.target_spa_id = self.to_spa_id
        elif self.to_spa_id is None:
            self.to_spa_id = self.target_spa_id
        return self


class StaffLeaveRequest(BaseModel):
    leave_date: Optional[datetime] = Field(default=None, description="Resignation/Termination date")
    reason: Optional[str] = Field(None, description="Reason for exit/termination/resignation")
    notes: Optional[str] = Field(None, description="Additional notes/history log")


class StaffBlacklistRequest(BaseModel):
    is_blacklisted: bool
    blacklist_reason: Optional[str] = Field(None, description="Detailed reason for blacklisting the employee")
