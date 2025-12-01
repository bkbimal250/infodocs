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
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# Candidate Form Schemas
class CandidateFormBase(BaseModel):
    """Base candidate form schema"""
    spa_id: Optional[int] = None
    spa_name_text: Optional[str] = None
    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    current_address: str
    aadhar_address: Optional[str] = None
    city: str
    zip_code: str
    state: str
    country: str = "India"
    phone_number: str
    work_experience: str
    Therapist_experience: str
    alternate_number: Optional[str] = None
    age: int
    position_applied_for: str
    education_certificate_courses: Optional[str] = None


class CandidateFormCreate(CandidateFormBase):
    """Candidate form creation schema"""
    pass


class CandidateFormUpdate(BaseModel):
    """Candidate form update schema"""
    spa_id: Optional[int] = None
    spa_name_text: Optional[str] = None
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    current_address: Optional[str] = None
    aadhar_address: Optional[str] = None
    city: Optional[str] = None
    zip_code: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    phone_number: Optional[str] = None
    work_experience: Optional[str] = None
    Therapist_experience: Optional[str] = None
    alternate_number: Optional[str] = None
    age: Optional[int] = None
    position_applied_for: Optional[str] = None
    education_certificate_courses: Optional[str] = None


class CandidateFormResponse(CandidateFormBase):
    """Candidate form response schema"""
    id: int
    spa: Optional[SPAResponse] = None
    passport_size_photo: Optional[str] = None
    age_proof_document: Optional[str] = None
    aadhar_card_front: Optional[str] = None
    aadhar_card_back: Optional[str] = None
    pan_card: Optional[str] = None
    signature: Optional[str] = None
    documents: Optional[List[str]] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}


# Hiring Form Schemas
class HiringFormBase(BaseModel):
    """Base hiring form schema"""
    spa_id: Optional[int] = None
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
    
    class Config:
        from_attributes = True
