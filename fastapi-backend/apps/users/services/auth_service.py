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
    """Create token response with success message (token set via cookie)"""
    return TokenResponseSchema(message="Login successful")

