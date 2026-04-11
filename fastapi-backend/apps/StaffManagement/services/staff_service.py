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

    # Add Event
    event = models.StaffEvent(
        staff_id=staff.id,
        type=staff_data.staff_type,
        spa_id=staff_data.spa_id,
        event_date=staff_data.joining_date or datetime.utcnow(),
        created_by=created_by,
        notes=f"Staff added/rejoined to branch"
    )
    db.add(event)

    # Add Work History
    work_history = models.WorkHistory(
        staff_id=staff.id,
        spa_id=staff_data.spa_id,
        join_date=staff_data.joining_date or datetime.utcnow(),
        status=models.WorkStatusEnum.active
    )
    db.add(work_history)

    await db.commit()
    await db.refresh(staff)
    return staff


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
async def get_all_staff(db: AsyncSession, spa_id: Optional[int] = None, status: Optional[schemas.StaffStatusEnum] = None):
    stmt = select(models.Staff).options(joinedload(models.Staff.spa))
    if spa_id:
        stmt = stmt.where(models.Staff.spa_id == spa_id)
    if status:
        stmt = stmt.where(models.Staff.current_status == status)
    result = await db.execute(stmt)
    return result.scalars().all()


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

    # Update active work history
    stmt = select(models.WorkHistory).where(
        models.WorkHistory.staff_id == staff_id,
        models.WorkHistory.spa_id == old_spa_id,
        models.WorkHistory.status == models.WorkStatusEnum.active
    )
    result = await db.execute(stmt)
    work_history = result.scalar_one_or_none()

    if work_history:
        work_history.leave_date = leave_data.leave_date
        work_history.status = models.WorkStatusEnum.completed

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

    # 1. Close current work history
    stmt = select(models.WorkHistory).where(
        models.WorkHistory.staff_id == staff_id,
        models.WorkHistory.spa_id == old_spa_id,
        models.WorkHistory.status == models.WorkStatusEnum.active
    )
    result = await db.execute(stmt)
    work_history = result.scalar_one_or_none()

    if work_history:
        work_history.leave_date = transfer_date
        work_history.status = models.WorkStatusEnum.completed
        work_history.is_transferred = True

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

    stmt = select(models.StaffEvent).where(
        func.date(models.StaffEvent.event_date) == today
    )
    
    if spa_id:
        stmt = stmt.where(models.StaffEvent.spa_id == spa_id)

    result = await db.execute(stmt)
    events = result.scalars().all()

    return {
        "today_new_join": len([e for e in events if e.type == models.StaffEventTypeEnum.new_join]),
        "today_re_join": len([e for e in events if e.type == models.StaffEventTypeEnum.re_join]),
        "today_transfer_out": len([e for e in events if e.type == models.StaffEventTypeEnum.transfer_out]),
        "today_leave": len([e for e in events if e.type == models.StaffEventTypeEnum.leave]),
    }


# -----------------------------
# GLOBAL ANALYTICS
# -----------------------------
async def overall_analytics(db: AsyncSession, spa_id: Optional[int] = None):
    # Total Active
    stmt_active = select(func.count(models.Staff.id)).where(models.Staff.current_status == models.StaffStatusEnum.active)
    if spa_id:
        stmt_active = stmt_active.where(models.Staff.spa_id == spa_id)
    
    # Total Left
    stmt_left = select(func.count(models.Staff.id)).where(models.Staff.current_status == models.StaffStatusEnum.left)
    if spa_id:
        # Complex join for specific SPA left count
        stmt_left = select(func.count(models.Staff.id)).join(models.WorkHistory).where(
            models.WorkHistory.spa_id == spa_id,
            models.WorkHistory.status == models.WorkStatusEnum.completed,
            models.WorkHistory.is_transferred == False
        )

    res_active = await db.execute(stmt_active)
    res_left = await db.execute(stmt_left)

    return {
        "total_active": res_active.scalar(),
        "total_left": res_left.scalar(),
    }

# -----------------------------
# DELETE STAFF (PERMANENT)
# -----------------------------
async def delete_staff(db: AsyncSession, staff_id: int):
    staff = await get_staff(db, staff_id)
    if not staff:
        return False
    
    await db.delete(staff)
    await db.commit()
    return True

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
