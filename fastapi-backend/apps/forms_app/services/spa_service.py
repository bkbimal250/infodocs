"""
SPA Service
Business logic for SPA operations
"""
from typing import Optional, List
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from apps.forms_app.models import SPA
from apps.forms_app.schemas import SPACreate, SPAUpdate
from core.exceptions import NotFoundError, ValidationError


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

    return spa


async def get_spa_by_id(db: AsyncSession, spa_id: int) -> Optional[SPA]:
    stmt = select(SPA).where(SPA.id == spa_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_all_spas(db: AsyncSession, active_only: bool = True) -> List[SPA]:
    stmt = select(SPA)
    if active_only:
        stmt = stmt.where(SPA.is_active == True)
    stmt = stmt.order_by(SPA.name)
    result = await db.execute(stmt)
    return list(result.scalars().all())


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
    return True
