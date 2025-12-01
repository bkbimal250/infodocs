"""
User Pydantic Schemas for Request/Response
"""
from typing import Optional
from pydantic import BaseModel, EmailStr
from apps.users.models import UserRole


# Request Schemas
class UserRegistrationSchema(BaseModel):
    """User registration schema"""
    username: str
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    phone_number: Optional[str] = None
    role: UserRole = UserRole.USER


class UserLoginSchema(BaseModel):
    """User login schema"""
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: str


class EmailLoginSchema(BaseModel):
    """Email login schema"""
    email: EmailStr
    password: str


class OTPRequestSchema(BaseModel):
    """OTP request schema"""
    email: EmailStr


class OTPLoginSchema(BaseModel):
    """OTP login schema"""
    email: EmailStr
    otp: str


class PasswordResetRequestSchema(BaseModel):
    """Request password reset via email"""
    email: EmailStr


class PasswordResetConfirmSchema(BaseModel):
    """Confirm password reset with OTP and new password"""
    email: EmailStr
    otp: str
    new_password: str


class UserUpdateSchema(BaseModel):
    """User update schema"""
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    password: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None


# Response Schemas
class UserResponseSchema(BaseModel):
    """User response schema"""
    id: int
    username: str
    email: str
    first_name: str
    last_name: str
    role: UserRole
    phone_number: Optional[str] = None
    is_active: bool
    is_verified: bool
    created_at: str
    updated_at: str
    
    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"
    
    class Config:
        from_attributes = True


class TokenResponseSchema(BaseModel):
    """Token response schema"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponseSchema


class MessageResponseSchema(BaseModel):
    """Generic message response schema"""
    message: str

