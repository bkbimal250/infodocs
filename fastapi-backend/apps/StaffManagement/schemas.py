from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime, date
import enum
# from apps.forms_app.schemas import SPAResponse (Removed to avoid circular import hangs)


# ==============================
# 🔤 ENUMS (MATCH MODELS)
# ==============================

class StaffStatusEnum(str, enum.Enum):
    active = "active"
    inactive = "inactive"
    left = "left"


class StaffEventTypeEnum(str, enum.Enum):
    new_join = "new_join"
    re_join = "re_join"
    transfer_out = "transfer_out"
    leave = "leave"


# ==============================
# 🧑 BASE STAFF SCHEMA
# ==============================

class StaffBase(BaseModel):
    name: Optional[str] = None
    phone: str = Field(..., min_length=10, max_length=15)

    # Documents
    adhar_card: Optional[str] = None
    adhar_card_photo: Optional[str] = None
    pan_card: Optional[str] = None
    pan_card_photo: Optional[str] = None
    passport_photo: Optional[str] = None

    address: Optional[str] = None
    gender: Optional[str] = None

    # Emergency Contact
    emergency_contact_name: Optional[str] = None
    emergency_contact_number: Optional[str] = None

    # Employment & Banking
    designation: Optional[str] = None


# ==============================
# ➕ CREATE / UPDATE SCHEMA
# ==============================

class StaffCreate(StaffBase):
    spa_id: Optional[int] = None
    joining_date: Optional[datetime] = Field(default_factory=datetime.utcnow)
    staff_type: StaffEventTypeEnum = StaffEventTypeEnum.new_join

class StaffUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_number: Optional[str] = None
    designation: Optional[str] = None
    passport_photo: Optional[str] = None
    current_status: Optional[StaffStatusEnum] = None
    spa_id: Optional[int] = None
    joining_date: Optional[datetime] = None

class StaffLeave(BaseModel):
    leave_date: date = Field(default_factory=date.today)
    notes: Optional[str] = None

class StaffTransfer(BaseModel):
    to_spa_id: int
    transfer_date: date = Field(default_factory=date.today)
    notes: Optional[str] = None


# ==============================
# ➕ ACTION SCHEMA (COMPATIBILITY)
# ==============================

class StaffActionSchema(StaffBase):
    type: StaffEventTypeEnum

    spa_id: Optional[int] = None
    to_spa_id: Optional[int] = None  # used in transfer_out

    joining_date: Optional[datetime] = None
    leave_date: Optional[datetime] = None
    transfer_date: Optional[datetime] = None

    notes: Optional[str] = None

    @validator("phone")
    def validate_phone(cls, v):
        if v and not v.isdigit():
            raise ValueError("Phone must be numeric")
        return v


# ==============================
# 🏢 MINIMAL SPA SCHEMA (For Staff Dashboard)
# ==============================

class StaffSPAResponse(BaseModel):
    id: int
    name: str
    city: Optional[str] = None
    area: Optional[str] = None

    model_config = {"from_attributes": True}


# ==============================
# 📤 RESPONSE SCHEMA
# ==============================

class StaffResponse(StaffBase):
    id: int
    current_status: StaffStatusEnum
    spa_id: Optional[int]
    spa: Optional[StaffSPAResponse] = None

    # Quick Dates
    joining_date: Optional[datetime] = None
    leave_date: Optional[datetime] = None
    transfer_date: Optional[datetime] = None

    created_at: datetime

    model_config = {"from_attributes": True}


# ==============================
# 📜 EVENT RESPONSE
# ==============================

class StaffEventResponse(BaseModel):
    id: int
    staff_id: int
    type: StaffEventTypeEnum

    spa_id: Optional[int]
    from_spa_id: Optional[int]
    to_spa_id: Optional[int]

    event_date: datetime
    notes: Optional[str]

    model_config = {"from_attributes": True}

# Alias for compatibility if needed
StaffHistoryResponse = StaffEventResponse


# ==============================
# 🏢 WORK HISTORY RESPONSE
# ==============================

class WorkHistoryResponse(BaseModel):
    id: int
    staff_id: int
    spa_id: int

    join_date: datetime
    leave_date: Optional[datetime]

    status: str

    model_config = {"from_attributes": True}


# ==============================
# 🔍 SEARCH BY PHONE
# ==============================

class StaffSearchSchema(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)

    @validator("phone")
    def validate_phone(cls, v):
        if not v.isdigit():
            raise ValueError("Phone must be numeric")
        return v


# ==============================
# 📊 ANALYTICS RESPONSE
# ==============================

class StaffAnalyticsResponse(BaseModel):
    today_new_join: int
    today_re_join: int
    today_transfer_out: int
    today_leave: int