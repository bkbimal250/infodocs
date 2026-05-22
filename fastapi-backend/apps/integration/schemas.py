from typing import Optional

from pydantic import BaseModel, Field, field_validator


class StaffVerifyRequest(BaseModel):
    mobile_number: str = Field(..., min_length=6, max_length=20)

    @field_validator("mobile_number", mode="before")
    @classmethod
    def clean_mobile_number(cls, value):
        if isinstance(value, str):
            return value.strip()
        return value


class CurrentSpaResponse(BaseModel):
    spa_id: int
    spa_code: int
    spa_name: str
    spa_area:str
    spa_city:str
    spa_state:str


class IntegrationStaffResponse(BaseModel):
    staff_uuid: str
    full_name: str
    phone: Optional[str]
    designation: Optional[str]
    employment_status: str
    verification_status: str
    is_blacklisted: bool
    current_spa: Optional[CurrentSpaResponse] = None


class StaffVerifyResponse(BaseModel):
    success: bool
    staff_found: bool
    verified: Optional[bool] = None
    blocked: Optional[bool] = None
    message: Optional[str] = None
    staff: Optional[IntegrationStaffResponse] = None
