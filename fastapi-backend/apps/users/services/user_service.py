"""
User Service
Business logic for user operations using SQLAlchemy
"""
from typing import Optional, List
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from passlib.context import CryptContext
from apps.users.models import User, UserRole
from core.exceptions import NotFoundError, ValidationError

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.
    
    Note: bcrypt has a strict 72-byte limit. Passwords longer than 72 bytes
    will be truncated to prevent errors.
    """
    if not password:
        raise ValueError("Password cannot be empty")
    
    # Ensure password is a string
    if isinstance(password, bytes):
        password = password.decode('utf-8', errors='ignore')
    
    # Bcrypt has a strict 72-byte limit, truncate if necessary
    # Convert to bytes to check actual byte length (not character length)
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        # Truncate to exactly 72 bytes
        # Remove any incomplete UTF-8 sequences at the end to avoid decode errors
        truncated_bytes = password_bytes[:72]
        # Remove trailing bytes that are part of incomplete UTF-8 sequences
        while truncated_bytes and (truncated_bytes[-1] & 0x80) and not (truncated_bytes[-1] & 0x40):
            truncated_bytes = truncated_bytes[:-1]
        password = truncated_bytes.decode('utf-8', errors='ignore')
    
    # Final safety check - ensure byte length is exactly <= 72
    final_bytes = password.encode('utf-8')
    if len(final_bytes) > 72:
        # Last resort: truncate and decode
        password = final_bytes[:72].decode('utf-8', errors='ignore')
    
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password"""
    return pwd_context.verify(plain_password, hashed_password)


async def create_user(
    db: AsyncSession,
    username: str,
    email: str,
    password: str,
    first_name: str,
    last_name: str,
    role: UserRole = UserRole.USER,
    phone_number: Optional[str] = None
) -> User:
    """Create a new user"""
    # Check if user already exists
    stmt = select(User).where(
        or_(User.username == username, User.email == email)
    )
    result = await db.execute(stmt)
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise ValidationError("Username or email already exists")
    
    # Create user
    user = User(
        username=username,
        email=email,
        password_hash=hash_password(password),
        first_name=first_name,
        last_name=last_name,
        role=role,
        phone_number=phone_number,
        is_active=True,
        is_verified=False,
    )
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return user


async def get_user_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
    """Get user by ID"""
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_user_by_username(db: AsyncSession, username: str) -> Optional[User]:
    """Get user by username"""
    stmt = select(User).where(User.username == username)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """Get user by email"""
    stmt = select(User).where(User.email == email)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def authenticate_user(db: AsyncSession, username_or_email: str, password: str) -> Optional[User]:
    """Authenticate user with username/email and password"""
    # Try username first
    user = await get_user_by_username(db, username_or_email)
    if not user:
        # Try email
        user = await get_user_by_email(db, username_or_email)
    
    if not user:
        return None
    
    if not verify_password(password, user.password_hash):
        return None
    
    return user


async def update_user(db: AsyncSession, user_id: int, update_data: dict) -> User:
    """Update user"""
    user = await get_user_by_id(db, user_id)
    if not user:
        raise NotFoundError("User not found")
    
    # Handle password separately - hash it if provided
    if 'password' in update_data and update_data['password']:
        update_data['password_hash'] = hash_password(update_data.pop('password'))
    
    # Check for username/email conflicts if being updated
    if 'username' in update_data or 'email' in update_data:
        stmt = select(User).where(
            or_(
                User.username == update_data.get('username', user.username),
                User.email == update_data.get('email', user.email)
            )
        ).where(User.id != user_id)
        result = await db.execute(stmt)
        existing_user = result.scalar_one_or_none()
        if existing_user:
            raise ValidationError("Username or email already exists")
    
    # Update user fields
    for key, value in update_data.items():
        if hasattr(user, key) and key != 'password':  # password is already handled above
            setattr(user, key, value)
    
    user.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(user)
    
    return user


async def get_all_users(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[User]:
    """Get all users with pagination"""
    stmt = select(User).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return list(result.scalars().all())
