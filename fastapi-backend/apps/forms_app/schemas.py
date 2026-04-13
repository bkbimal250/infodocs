"""
Forms App Schemas
Pydantic schemas for SPA and candidate form submissions
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, HttpUrl

# SPA Base Schema
class SPABase(BaseModel):
    name: str
    address: Optional[str] = None
    area: Optional[str] = None
    code: Optional[int] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = "India"
    pincode: Optional[str] = None
    phone_number: Optional[str] = None
    alternate_number: Optional[str] = None

    email: Optional[str] = None
    website: Optional[str] = None  # Accept local file paths or URLs
    logo: Optional[str] = None  # Accept local file paths or URLs


# Create Schema (no is_active)
class SPACreate(SPABase):
    pass


# Update Schema
class SPAUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    area: Optional[str] = None
    code: Optional[int] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    pincode: Optional[str] = None
    phone_number: Optional[str] = None
    alternate_number: Optional[str] = None

    email: Optional[str] = None
    website: Optional[str] = None
    logo: Optional[str] = None

    is_active: Optional[bool] = None


# Response Schema
class SPAResponse(SPABase):
    id: int
    is_active: bool
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# Minimal SPA response for dropdowns/searches
class SPASelectionResponse(BaseModel):
    id: int
    name: str
    code: Optional[int] = None
    area: Optional[str] = None
    city: Optional[str] = None

    model_config = {"from_attributes": True}





# Hiring Form Schemas
class HiringFormBase(BaseModel):
    """Base hiring form schema"""
    spa_id: Optional[int] = None
    staff_required: int
    for_role: str
    description: str
    required_experience: str
    required_education: str
    required_skills: str


class HiringFormCreate(HiringFormBase):
    """Hiring form creation schema"""
    pass


class HiringFormUpdate(BaseModel):
    """Hiring form update schema"""
    spa_id: Optional[int] = None
    staff_required: Optional[int] = None
    for_role: Optional[str] = None
    description: Optional[str] = None
    required_experience: Optional[str] = None
    required_education: Optional[str] = None
    required_skills: Optional[str] = None


class HiringFormResponse(HiringFormBase):
    """Hiring form response schema"""
    id: int
    spa: Optional[SPAResponse] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}
