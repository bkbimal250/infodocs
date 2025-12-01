"""
Authentication Service
Handles JWT tokens and authentication
"""
from typing import Optional
from datetime import datetime, timedelta, timezone
from jose import jwt
from config.settings import settings
from apps.users.models import User
from apps.users.schemas import TokenResponseSchema, UserResponseSchema


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def create_token_response(user: User) -> TokenResponseSchema:
    """Create token response with user data"""
    user_id = str(user.id)
    access_token = create_access_token(data={"sub": user_id})
    
    # Safely get datetime strings - handle if they're None or not loaded
    created_at_str = user.created_at.isoformat() if user.created_at else datetime.now(timezone.utc).isoformat()
    updated_at_str = user.updated_at.isoformat() if user.updated_at else datetime.now(timezone.utc).isoformat()
    
    return TokenResponseSchema(
        access_token=access_token,
        user=UserResponseSchema(
            id=user.id,
            username=user.username,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            role=user.role,
            phone_number=user.phone_number,
            is_active=user.is_active,
            is_verified=user.is_verified,
            created_at=created_at_str,
            updated_at=updated_at_str,
        )
    )

