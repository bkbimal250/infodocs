from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload, joinedload
from datetime import datetime, date
from typing import Optional, List
from config.settings import settings
import os
import uuid
from pathlib import Path
from fastapi import UploadFile
import aiofiles

from apps.StaffManagement import models, schemas


# -----------------------------
# CREATE STAFF (NEW / REJOIN / TRANSFER)
# -----------------------------
async def create_staff(db: AsyncSession, staff_data: schemas.StaffCreate, created_by: Optional[int] = None):
    # Check if staff with this phone already exists
    stmt = select(models.Staff).where(models.Staff.phone == staff_data.phone)
    result = await db.execute(stmt)
    existing_staff = result.scalar_one_or_none()

    if existing_staff:
        # If exists, we might want to update or handle as RE_JOIN
        staff = existing_staff
        staff.spa_id = staff_data.spa_id
        staff.current_status = models.StaffStatusEnum.active
        staff.joining_date = staff_data.joining_date
    else:
        staff = models.Staff(
            name=staff_data.name,
            phone=staff_data.phone,
            gender=staff_data.gender,
            address=staff_data.address,
            city=staff_data.city,
            emergency_contact_name=staff_data.emergency_contact_name,
            emergency_contact_number=staff_data.emergency_contact_number,
            designation=staff_data.designation,
            spa_id=staff_data.spa_id,
            joining_date=staff_data.joining_date,
            adhar_card=staff_data.adhar_card,
            adhar_card_photo=staff_data.adhar_card_photo,
            pan_card=staff_data.pan_card,
            pan_card_photo=staff_data.pan_card_photo,
            passport_photo=staff_data.passport_photo,
            current_status=models.StaffStatusEnum.active
        )
        db.add(staff)
        await db.flush() # Get ID

    # 1. Close any existing active work history records to prevent duplicates - Optimized with bulk update
    from sqlalchemy import update
    stmt_close = update(models.WorkHistory).where(
        models.WorkHistory.staff_id == staff.id,
        models.WorkHistory.status == models.WorkStatusEnum.active
    ).values(
        status=models.WorkStatusEnum.completed,
        leave_date=staff_data.joining_date or datetime.utcnow()
    )
    await db.execute(stmt_close)

    # 2. Add Event
    event = models.StaffEvent(
        staff_id=staff.id,
        type=staff_data.staff_type,
        spa_id=staff_data.spa_id,
        event_date=staff_data.joining_date or datetime.utcnow(),
        created_by=created_by,
        notes=f"Staff added/rejoined to branch"
    )
    db.add(event)

    # 3. Add Work History
    work_history = models.WorkHistory(
        staff_id=staff.id,
        spa_id=staff_data.spa_id,
        join_date=staff_data.joining_date or datetime.utcnow(),
        status=models.WorkStatusEnum.active
    )
    db.add(work_history)

    await db.commit()
    
    # Re-fetch with relationship loaded for proper serialization
    stmt = select(models.Staff).options(joinedload(models.Staff.spa)).where(models.Staff.id == staff.id)
    result = await db.execute(stmt)
    return result.scalar_one()


# -----------------------------
# GET STAFF BY ID
# -----------------------------
async def get_staff(db: AsyncSession, staff_id: int):
    stmt = select(models.Staff).options(joinedload(models.Staff.spa)).where(models.Staff.id == staff_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


# -----------------------------
# GET STAFF BY PHONE
# -----------------------------
async def get_staff_by_phone(db: AsyncSession, phone: str):
    stmt = select(models.Staff).where(models.Staff.phone == phone)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


# -----------------------------
# GET ALL STAFF (WITH OPTIONAL SPA FILTER)
# -----------------------------
async def get_all_staff(
    db: AsyncSession,
    spa_id: Optional[int] = None,
    status: Optional[schemas.StaffStatusEnum] = None,
    city: Optional[str] = None,
    search: Optional[str] = None,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    skip: int = 0,
    limit: int = 100
):
    from sqlalchemy.orm import load_only
    from sqlalchemy import or_

    # Base query for items
    stmt = select(models.Staff).options(
        joinedload(models.Staff.spa)
    )

    # Base query for count
    count_stmt = select(func.count(models.Staff.id))

    # Apply filters to both
    filters = []
    if spa_id:
        filters.append(models.Staff.spa_id == spa_id)
    if status:
        filters.append(models.Staff.current_status == status)
    if city:
        filters.append(models.Staff.city.ilike(city))
    if search:
        term = f"%{search}%"
        filters.append(
            or_(
                models.Staff.name.ilike(term),
                models.Staff.phone.ilike(term)
            )
        )
    
    # 📅 Date Filtering
    if from_date:
        from_dt = datetime.combine(from_date, datetime.min.time())
        filters.append(models.Staff.joining_date >= from_dt)
    if to_date:
        to_dt = datetime.combine(to_date, datetime.max.time())
        filters.append(models.Staff.joining_date <= to_dt)

    for f in filters:
        stmt = stmt.where(f)
        count_stmt = count_stmt.where(f)

    # Total count
    total_result = await db.execute(count_stmt)
    total_count = total_result.scalar()

    # Pagination & Ordering
    stmt = stmt.order_by(models.Staff.id.desc()).offset(skip).limit(limit)

    # Execute search
    result = await db.execute(stmt)
    items = result.scalars().all()

    return {
        "items": items,
        "total": total_count,
        "skip": skip,
        "limit": limit
    }


# -----------------------------
# UPDATE STAFF (BASIC DETAILS)
# -----------------------------
async def update_staff(db: AsyncSession, staff_id: int, update_data: schemas.StaffUpdate):
    staff = await get_staff(db, staff_id)

    if not staff:
        return None

    for key, value in update_data.model_dump(exclude_unset=True).items():
        setattr(staff, key, value)

    await db.commit()
    await db.refresh(staff)

    return staff


# -----------------------------
# MARK STAFF AS LEFT
# -----------------------------
async def mark_staff_left(db: AsyncSession, staff_id: int, leave_data: schemas.StaffLeave, created_by: Optional[int] = None):
    staff = await get_staff(db, staff_id)

    if not staff:
        return None

    old_spa_id = staff.spa_id
    staff.current_status = models.StaffStatusEnum.left
    staff.leave_date = leave_data.leave_date
    staff.spa_id = None # No longer at any branch

    # Update active work history - Optimized with bulk update
    from sqlalchemy import update
    stmt_upd = update(models.WorkHistory).where(
        models.WorkHistory.staff_id == staff_id,
        models.WorkHistory.spa_id == old_spa_id,
        models.WorkHistory.status == models.WorkStatusEnum.active
    ).values(
        leave_date=leave_data.leave_date,
        status=models.WorkStatusEnum.completed
    )
    await db.execute(stmt_upd)

    # Add Event
    event = models.StaffEvent(
        staff_id=staff.id,
        type=models.StaffEventTypeEnum.leave,
        spa_id=old_spa_id,
        event_date=leave_data.leave_date,
        created_by=created_by,
        notes=leave_data.notes or "Staff left the branch"
    )
    db.add(event)

    await db.commit()
    await db.refresh(staff)
    return staff


# -----------------------------
# TRANSFER STAFF
# -----------------------------
async def transfer_staff(
    db: AsyncSession,
    staff_id: int,
    transfer_data: schemas.StaffTransfer,
    created_by: Optional[int] = None
):
    staff = await get_staff(db, staff_id)
    if not staff:
        return None

    old_spa_id = staff.spa_id
    to_spa_id = transfer_data.to_spa_id
    transfer_date = transfer_data.transfer_date

    # 1. Close current work history - Optimized with bulk update
    from sqlalchemy import update
    stmt_upd = update(models.WorkHistory).where(
        models.WorkHistory.staff_id == staff_id,
        models.WorkHistory.spa_id == old_spa_id,
        models.WorkHistory.status == models.WorkStatusEnum.active
    ).values(
        leave_date=transfer_date,
        status=models.WorkStatusEnum.completed,
        is_transferred=True
    )
    await db.execute(stmt_upd)

    # 2. Update staff branch and status
    staff.spa_id = to_spa_id
    staff.transfer_date = transfer_date
    staff.current_status = models.StaffStatusEnum.active

    # 3. Create Transfer Out Event
    event_out = models.StaffEvent(
        staff_id=staff.id,
        type=models.StaffEventTypeEnum.transfer_out,
        spa_id=old_spa_id,
        to_spa_id=to_spa_id,
        event_date=transfer_date,
        created_by=created_by,
        notes=f"Transferred to branch {to_spa_id}. {transfer_data.notes or ''}"
    )
    db.add(event_out)

    # 4. Open new work history
    new_work = models.WorkHistory(
        staff_id=staff.id,
        spa_id=to_spa_id,
        join_date=transfer_date,
        status=models.WorkStatusEnum.active
    )
    db.add(new_work)

    await db.commit()
    await db.refresh(staff)
    return staff


# -----------------------------
# GET FULL STAFF HISTORY
# -----------------------------
async def get_staff_history(db: AsyncSession, staff_id: int):
    stmt = select(models.StaffEvent).where(models.StaffEvent.staff_id == staff_id).order_by(models.StaffEvent.event_date.desc())
    result = await db.execute(stmt)
    return result.scalars().all()


# -----------------------------
# ANALYTICS (TODAY)
# -----------------------------
async def today_analytics(db: AsyncSession, spa_id: Optional[int] = None):
    today = date.today()

    # Optimized with SQL grouping and counting
    stmt = select(models.StaffEvent.type, func.count(models.StaffEvent.id)).where(
        func.date(models.StaffEvent.event_date) == today
    )
    
    if spa_id:
        stmt = stmt.where(models.StaffEvent.spa_id == spa_id)
    
    stmt = stmt.group_by(models.StaffEvent.type)

    result = await db.execute(stmt)
    counts = dict(result.all())

    return {
        "today_new_join": counts.get(models.StaffEventTypeEnum.new_join, 0),
        "today_re_join": counts.get(models.StaffEventTypeEnum.re_join, 0),
        "today_transfer_out": counts.get(models.StaffEventTypeEnum.transfer_out, 0),
        "today_leave": counts.get(models.StaffEventTypeEnum.leave, 0),
    }


# -----------------------------
# GLOBAL ANALYTICS
# -----------------------------
async def overall_analytics(db: AsyncSession, spa_id: Optional[int] = None):
    import asyncio
    
    # Total Active
    stmt_active = select(func.count(models.Staff.id)).where(models.Staff.current_status == models.StaffStatusEnum.active)
    if spa_id:
        stmt_active = stmt_active.where(models.Staff.spa_id == spa_id)
    
    # Total Left
    if spa_id:
        # Complex join for specific SPA left count
        stmt_left = select(func.count(models.Staff.id)).join(models.WorkHistory).where(
            models.WorkHistory.spa_id == spa_id,
            models.WorkHistory.status == models.WorkStatusEnum.completed,
            models.WorkHistory.is_transferred == False
        )
    else:
        stmt_left = select(func.count(models.Staff.id)).where(models.Staff.current_status == models.StaffStatusEnum.left)

    # Execute sequentially for session stability
    res_active = await db.execute(stmt_active)
    active_count = res_active.scalar()
    
    res_left = await db.execute(stmt_left)
    left_count = res_left.scalar()

    return {
        "total_active": active_count,
        "total_left": left_count,
    }

# -----------------------------
# DELETE STAFF (PERMANENT)
# -----------------------------
async def delete_staff(db: AsyncSession, staff_id: int):
    from sqlalchemy import delete
    
    # 1. Bulk delete children
    await db.execute(delete(models.StaffEvent).where(models.StaffEvent.staff_id == staff_id))
    await db.execute(delete(models.WorkHistory).where(models.WorkHistory.staff_id == staff_id))

    # 2. Delete staff
    stmt_del = delete(models.Staff).where(models.Staff.id == staff_id)
    result = await db.execute(stmt_del)
    
    await db.commit()
    return result.rowcount > 0

async def save_staff_file(file: UploadFile) -> str:
    """
    Saves a staff document/photo to the filesystem.
    Returns the relative path to be stored in the DB.
    """
    # Ensure directory exists
    upload_dir = Path(settings.UPLOAD_DIR) / "staff"
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filename
    extension = Path(file.filename).suffix
    unique_filename = f"staff_{uuid.uuid4()}{extension}"
    file_path = upload_dir / unique_filename
    
    # Write file asynchronously
    async with aiofiles.open(file_path, "wb") as buffer:
        await buffer.write(await file.read())
    
    # Return relative path for URL building
    return f"staff/{unique_filename}"


# -----------------------------
# GET UNIQUE CITIES
# -----------------------------
async def get_unique_cities(db: AsyncSession):
    stmt = select(models.Staff.city).distinct().where(models.Staff.city != None, models.Staff.city != "")
    result = await db.execute(stmt)
    return [c for (c,) in result.all()]

