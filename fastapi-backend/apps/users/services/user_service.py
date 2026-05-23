"""
User Service
Business logic for user operations using SQLAlchemy
"""
from typing import Optional, List
from datetime import datetime, timezone
import secrets
import string
from sqlalchemy.ext.asyncio import AsyncSession as Session
from sqlalchemy import select, or_, func
from sqlalchemy.orm import selectinload
from passlib.context import CryptContext
from apps.users.models import User, UserRole
from core.exceptions import NotFoundError, ValidationError

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def generate_secure_password(length: int = 12) -> str:
    """Generate a one-time password for admin-created accounts."""
    alphabet = string.ascii_letters + string.digits
    password = [
        secrets.choice(string.ascii_uppercase),
        secrets.choice(string.ascii_lowercase),
        secrets.choice(string.digits),
        secrets.choice("@#$%&*!"),
    ]
    password.extend(secrets.choice(alphabet) for _ in range(max(length - len(password), 0)))
    secrets.SystemRandom().shuffle(password)
    return "".join(password)


async def hash_password(password: str) -> str:
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


async def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password"""
    return pwd_context.verify(plain_password, hashed_password)


async def  create_user(
    db: Session,
    username: str,
    email: str,
    password: str,
    first_name: str,
    last_name: str,
    role: UserRole = UserRole.USER,
    phone_number: Optional[str] = None,
    spa_id: Optional[int] = None
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

    normalized_phone = await ensure_phone_number_unique(db, phone_number)
    
    # Create user
    user = User(
        username=username,
        email=email,
        password_hash=await hash_password(password),
        first_name=first_name,
        last_name=last_name,
        role=role,
        phone_number=normalized_phone,
        spa_id=spa_id,
        is_active=True,
        is_verified=False,
    )
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    # Record current spa in history if provided
    if spa_id:
        from apps.users.models import user_spa_history
        from sqlalchemy import insert
        try:
            await db.execute(
                insert(user_spa_history).values(user_id=user.id, spa_id=spa_id)
            )
            await db.commit()
        except Exception:
            pass  # Ignore duplicates or errors in history recording
    
    return user


async def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """Get user by ID"""
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """Get user by username"""
    stmt = select(User).where(User.username == username)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get user by email"""
    stmt = select(User).where(User.email == email)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


def normalize_phone_number(phone_number: str) -> str:
    """Normalize phone input for lookup without changing stored values."""
    return "".join(ch for ch in str(phone_number or "").strip() if ch.isdigit() or ch == "+")


def normalize_phone_number_for_storage(phone_number: Optional[str]) -> Optional[str]:
    """Store a stable phone value so uniqueness works predictably."""
    clean_phone = normalize_phone_number(phone_number or "")
    if not clean_phone:
        return None

    digits_only = "".join(ch for ch in clean_phone if ch.isdigit())
    if len(digits_only) == 12 and digits_only.startswith("91"):
        return digits_only[-10:]
    if len(digits_only) == 10:
        return digits_only
    return clean_phone


async def get_user_by_phone_number(db: Session, phone_number: str) -> Optional[User]:
    """Get one user by phone number, matching common formatted variants."""
    clean_phone = normalize_phone_number(phone_number)
    if not clean_phone:
        return None

    digits_only = "".join(ch for ch in clean_phone if ch.isdigit())
    candidates = {clean_phone, digits_only}
    if len(digits_only) == 10:
        candidates.add(f"+91{digits_only}")
        candidates.add(f"91{digits_only}")
    if len(digits_only) == 12 and digits_only.startswith("91"):
        last_ten = digits_only[-10:]
        candidates.add(last_ten)
        candidates.add(f"+91{last_ten}")

    normalized_column = func.replace(
        func.replace(func.replace(func.replace(User.phone_number, " ", ""), "-", ""), "(", ""),
        ")",
        "",
    )
    stmt = select(User).where(
        or_(
            User.phone_number.in_(list(candidates)),
            normalized_column.in_(list(candidates)),
        )
    )
    result = await db.execute(stmt)
    users = list(result.scalars().all())

    if len(users) > 1:
        raise ValidationError("Multiple users found with this phone number. Please contact admin.")

    return users[0] if users else None


async def ensure_phone_number_unique(
    db: Session,
    phone_number: Optional[str],
    exclude_user_id: Optional[int] = None,
) -> Optional[str]:
    """Normalize and verify a phone number is not already linked to another user."""
    normalized_phone = normalize_phone_number_for_storage(phone_number)
    if not normalized_phone:
        return None

    existing_user = await get_user_by_phone_number(db, normalized_phone)
    if existing_user and existing_user.id != exclude_user_id:
        raise ValidationError("Phone number already exists")

    return normalized_phone


async def authenticate_user(db: Session, username_or_email: str, password: str) -> Optional[User]:
    """Authenticate user with username/email and password (Optimized to single query)"""
    stmt = select(User).where(
        or_(User.username == username_or_email, User.email == username_or_email)
    )
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        return None
    
    if not await verify_password(password, user.password_hash):
        return None
    
    return user


async def update_user(db: Session, user_id: int, update_data: dict) -> User:
    """Update user"""
    user = await get_user_by_id(db, user_id)
    if not user:
        raise NotFoundError("User not found")
    
    # Handle password separately - hash it if provided
    if 'password' in update_data and update_data['password']:
        update_data['password_hash'] = await hash_password(update_data.pop('password'))
    
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

    if 'phone_number' in update_data:
        update_data['phone_number'] = await ensure_phone_number_unique(
            db,
            update_data.get('phone_number'),
            exclude_user_id=user_id,
        )
    
    # Update user fields
    for key, value in update_data.items():
        if hasattr(user, key) and key != 'password':  # password is already handled above
            setattr(user, key, value)
            
            # If spa_id is updated to a non-null value, record in history
            if key == 'spa_id' and value:
                from apps.users.models import user_spa_history
                from sqlalchemy import insert
                try:
                    # Explicitly insert into association table to track history
                    await db.execute(
                        insert(user_spa_history).values(user_id=user.id, spa_id=value)
                    )
                except Exception:
                    # Ignore if already in history or other errors
                    pass
    
    user.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(user)
    
    return user


async def get_all_users(db: Session, skip: int = 0, limit: int = 1000) -> List[User]:
    """Get all users with pagination"""
    stmt = select(User).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return list(result.scalars().all())

