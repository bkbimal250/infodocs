"""
SPA Service
Business logic for SPA operations
"""
from typing import Optional, List
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import load_only
from apps.forms_app.models import SPA
from apps.forms_app.schemas import SPACreate, SPAUpdate
from core.exceptions import NotFoundError, ValidationError
import asyncio

# Thread-safe in-memory cache for SPA lists
_SPA_CACHE = {}
_CACHE_LOCK = asyncio.Lock()

def _get_cache_key(active_only, minimal, search, city, state, status):
    return f"{active_only}:{minimal}:{search}:{city}:{state}:{status}"

async def clear_spa_cache():
    """Clear the SPA list cache"""
    async with _CACHE_LOCK:
        _SPA_CACHE.clear()


async def create_spa(db: AsyncSession, spa_data: SPACreate, created_by: Optional[int] = None) -> SPA:
    """Create a new SPA location"""

    # Check duplicate code (code must be unique, name can be duplicate)
    if spa_data.code:
        stmt = select(SPA).where(SPA.code == spa_data.code)
        result = await db.execute(stmt)
        if result.scalar_one_or_none():
            raise ValidationError(f"SPA code '{spa_data.code}' already exists")

    # Check duplicate email
    if spa_data.email:
        stmt = select(SPA).where(SPA.email == spa_data.email)
        result = await db.execute(stmt)
        if result.scalar_one_or_none():
            raise ValidationError(f"Email '{spa_data.email}' already exists")

    spa_dict = spa_data.model_dump()
    if created_by:
        spa_dict['created_by'] = created_by
    
    spa = SPA(**spa_dict)
    db.add(spa)
    await db.commit()
    await db.refresh(spa)

    # Invalidate cache
    await clear_spa_cache()

    return spa


async def get_spa_by_id(db: AsyncSession, spa_id: int) -> Optional[SPA]:
    stmt = select(SPA).where(SPA.id == spa_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_all_spas(
    db: AsyncSession,
    active_only: bool = True,
    minimal: bool = False,
    search: Optional[str] = None,
    city: Optional[str] = None,
    state: Optional[str] = None,
    status: Optional[str] = None,
) -> List[SPA]:
    """Get all SPAs with optional filtering and column-specific loading"""
    # 🚀 Performance Optimization: Cache Check
    cache_key = _get_cache_key(active_only, minimal, search, city, state, status)
    async with _CACHE_LOCK:
        if cache_key in _SPA_CACHE:
            return _SPA_CACHE[cache_key]

    stmt = select(SPA)

    if minimal:
        stmt = stmt.options(load_only(SPA.id, SPA.name, SPA.code, SPA.area, SPA.city))

    # status filter overrides active_only flag
    if status == "active":
        stmt = stmt.where(SPA.is_active == True)
    elif status == "inactive":
        stmt = stmt.where(SPA.is_active == False)
    elif active_only:
        stmt = stmt.where(SPA.is_active == True)

    if search:
        term = f"%{search}%"
        stmt = stmt.where(
            SPA.name.ilike(term)
            | SPA.code.cast(func.text()).ilike(term)  # cast int code to text for LIKE
            | SPA.address.ilike(term)
            | SPA.city.ilike(term)
            | SPA.state.ilike(term)
            | SPA.email.ilike(term)
            | SPA.phone_number.ilike(term)
        )

    if city:
        stmt = stmt.where(func.lower(SPA.city) == city.lower())

    if state:
        stmt = stmt.where(func.lower(SPA.state) == state.lower())

    stmt = stmt.order_by(SPA.name)
    result = await db.execute(stmt)
    spas = list(result.scalars().all())

    # Store in cache
    async with _CACHE_LOCK:
        _SPA_CACHE[cache_key] = spas

    return spas


async def update_spa(db: AsyncSession, spa_id: int, update_data: SPAUpdate) -> SPA:
    spa = await get_spa_by_id(db, spa_id)
    if not spa:
        raise NotFoundError("SPA not found")

    # Duplicate code check (code must be unique, name can be duplicate)
    if update_data.code and update_data.code != spa.code:
        stmt = select(SPA).where(SPA.code == update_data.code)
        result = await db.execute(stmt)
        if result.scalar_one_or_none():
            raise ValidationError(f"SPA code '{update_data.code}' already exists")

    # Duplicate email check
    if update_data.email and update_data.email != spa.email:
        stmt = select(SPA).where(SPA.email == update_data.email)
        result = await db.execute(stmt)
        if result.scalar_one_or_none():
            raise ValidationError(f"Email '{update_data.email}' already exists")

    # Apply updates
    for key, value in update_data.model_dump(exclude_unset=True).items():
        setattr(spa, key, value)

    await db.commit()
    await db.refresh(spa)

    # Invalidate cache
    await clear_spa_cache()

    return spa


async def delete_spa(db: AsyncSession, spa_id: int) -> bool:
    """
    Soft delete SPA by marking it as inactive.

    This is the default behaviour used for non super-admin roles so that
    historical data and relationships remain intact.
    """
    spa = await get_spa_by_id(db, spa_id)
    if not spa:
        raise NotFoundError("SPA not found")

    spa.is_active = False
    spa.updated_at = datetime.now(timezone.utc)

    await db.commit()

    # Invalidate cache
    await clear_spa_cache()

    return True


async def hard_delete_spa(db: AsyncSession, spa_id: int) -> bool:
    """
    Permanently delete SPA from the database.

    This should only be called from routes that enforce super_admin role,
    as it will remove the record entirely instead of performing a soft delete.
    """
    spa = await get_spa_by_id(db, spa_id)
    if not spa:
        raise NotFoundError("SPA not found")

    await db.delete(spa)
    await db.commit()
    # Invalidate cache
    await clear_spa_cache()
    return True
