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
    """Hash a password"""
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
