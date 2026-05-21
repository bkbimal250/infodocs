"""
Staff Core Service
Handles core registration, updates, soft deletion, and query routing for Staff members.
"""
from datetime import datetime
from typing import List, Optional, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession as Session

from apps.StaffManagement.models import Staff, EmploymentStatusEnum, StaffEventTypeEnum
from apps.StaffManagement.schemas import StaffCreate, StaffUpdate
from apps.StaffManagement.repositories.staff_repository import StaffRepository
from apps.StaffManagement.repositories.work_history_repository import WorkHistoryRepository
from apps.StaffManagement.repositories.verification_repository import VerificationRepository
from apps.StaffManagement.exceptions import StaffNotFoundError, DuplicateStaffError, SpaNotFoundError
from apps.forms_app.models import SPA


class StaffService:
    """Orchestrates async business logic for basic Staff management"""

    @staticmethod
    async def create_staff(
        db: Session,
        data: StaffCreate,
        creator_id: Optional[int] = None
    ) -> Staff:
        """
        Creates a new staff member and records joining events.
        Keeps staff entry lightweight and opens work history.
        """
        # 1. Check duplicate phone
        if data.phone:
            existing_phone = await StaffRepository.get_by_phone(db, data.phone, include_relations=False)
            if existing_phone:
                raise DuplicateStaffError("phone", data.phone)

        # 2. Keep raw identity values as entered after lightweight schema cleanup.
        # Legacy columns are retained to avoid a DB migration in this targeted fix.
        aadhaar_value = data.aadhaar_number
        pan_value = data.pan_number

        # 3. Check duplicate identities only against the stored direct values.
        if aadhaar_value or pan_value:
            duplicate_identity = await StaffRepository.check_identity_duplicates(
                db, aadhaar_number=aadhaar_value, pan_number=pan_value
            )
            if duplicate_identity:
                conflict_val = "Aadhaar" if duplicate_identity.aadhaar_number == aadhaar_value else "PAN"
                raise DuplicateStaffError(
                    f"identity ({conflict_val})",
                    "provided document is already registered"
                )

        # 4. Validate SPA ID if provided
        if data.current_spa_id:
            spa_stmt = select(SPA).where(SPA.id == data.current_spa_id)
            spa_res = await db.execute(spa_stmt)
            if not spa_res.scalar_one_or_none():
                raise SpaNotFoundError(data.current_spa_id)

        # 5. Save staff record
        staff = await StaffRepository.create(
            db=db,
            data=data,
            aadhaar_number=aadhaar_value,
            aadhaar_last4=None,
            pan_number=pan_value,
            pan_last4=None,
            creator_id=creator_id
        )

        # 7. Add staff joining event
        await VerificationRepository.create_event(
            db=db,
            staff_id=staff.id,
            event_type=StaffEventTypeEnum.joined,
            spa_id=staff.current_spa_id,
            notes="Staff registered in system.",
            created_by=creator_id
        )

        # 8. Open initial work history if a current SPA is assigned
        if staff.current_spa_id:
            await WorkHistoryRepository.create(
                db=db,
                staff_id=staff.id,
                spa_id=staff.current_spa_id,
                join_date=staff.joining_date or datetime.utcnow(),
                notes="Initial assignment during registration."
            )

        # 9. Commit transaction and refresh with all relations loaded
        return await StaffRepository.refresh_with_relations(db, staff)

    @staticmethod
    async def update_staff(
        db: Session,
        staff_uuid: str,
        data: StaffUpdate,
        updater_id: Optional[int] = None
    ) -> Staff:
        """
        Updates basic properties. Keeps manager entry lightweight and avoids strict document validation.
        Does NOT directly transfer branches (should go through dedicated transfer endpoint for full audit integrity).
        """
        staff = await StaffRepository.get_by_uuid(db, staff_uuid)
        if not staff:
            raise StaffNotFoundError(staff_uuid=staff_uuid)

        update_dict = data.model_dump(exclude_unset=True)

        # Handle telephone change constraints
        new_phone = update_dict.get("phone")
        if new_phone and new_phone != staff.phone:
            existing_phone = await StaffRepository.get_by_phone(db, new_phone, include_relations=False)
            if existing_phone:
                raise DuplicateStaffError("phone", new_phone)

        # Store identity values directly in legacy identity columns without hashing/last4 helpers.
        raw_aadhaar = update_dict.pop("aadhaar_number", None)
        if raw_aadhaar:
            if raw_aadhaar != staff.aadhaar_number:
                dup = await StaffRepository.check_identity_duplicates(db, aadhaar_number=raw_aadhaar)
                if dup:
                    raise DuplicateStaffError("Aadhaar", "provided Aadhaar is already registered")
                update_dict["aadhaar_number"] = raw_aadhaar
                update_dict["aadhaar_last4"] = None

        raw_pan = update_dict.pop("pan_number", None)
        if raw_pan:
            if raw_pan != staff.pan_number:
                dup = await StaffRepository.check_identity_duplicates(db, pan_number=raw_pan)
                if dup:
                    raise DuplicateStaffError("PAN", "provided PAN is already registered")
                update_dict["pan_number"] = raw_pan
                update_dict["pan_last4"] = None

        # Handle current_spa_id checking (if someone tries to change it via update, warn or block)
        new_spa_id = update_dict.get("current_spa_id")
        if new_spa_id and new_spa_id != staff.current_spa_id:
            # Enforce validation of the branch
            spa_stmt = select(SPA).where(SPA.id == new_spa_id)
            spa_res = await db.execute(spa_stmt)
            if not spa_res.scalar_one_or_none():
                raise SpaNotFoundError(new_spa_id)
            # Standard updates shouldn't trigger transfers. Let's block or handle
            # to prevent breaking the workflow rule. We will raise error and direct them to transfer endpoint.
            # However, if it's the same, let's keep going.
            # To be flexible but safe: we raise a validation error directing them to use /transfer.
            # Unless they are registering it for the first time (e.g. current_spa_id is None).
            if staff.current_spa_id is not None:
                raise DuplicateStaffError(
                    "current_spa_id",
                    "Direct SPA ID modification is not allowed. Use the dedicated /transfer endpoint."
                )
            else:
                # First time assigning a branch to an floating employee: open history log
                await WorkHistoryRepository.create(
                    db=db,
                    staff_id=staff.id,
                    spa_id=new_spa_id,
                    join_date=datetime.utcnow(),
                    notes="Assigned branch first-time via update."
                )

        updated_staff = await StaffRepository.update(db, staff, update_dict)
        return await StaffRepository.refresh_with_relations(db, updated_staff)

    @staticmethod
    async def get_staff_by_uuid(db: Session, staff_uuid: str) -> Staff:
        """Helper to retrieve detailed staff record"""
        staff = await StaffRepository.get_by_uuid(db, staff_uuid, include_relations=True)
        if not staff:
            raise StaffNotFoundError(staff_uuid=staff_uuid)
        return staff

    @staticmethod
    async def get_staff_by_phone(db: Session, phone: str) -> Optional[Staff]:
        """Loads staff by phone contact number"""
        return await StaffRepository.get_by_phone(db, phone)

    @staticmethod
    async def list_staff_paginated(
        db: Session,
        limit: int,
        offset: int,
        search: Optional[str] = None,
        phone: Optional[str] = None,
        verification_status: Optional[str] = None,
        employment_status: Optional[str] = None,
        spa_id: Optional[int] = None,
        city: Optional[str] = None,
    ) -> Tuple[List[Staff], int]:
        """Queries multiple staff records applying active filters"""
        return await StaffRepository.query_paginated(
            db=db,
            limit=limit,
            offset=offset,
            search=search,
            phone=phone,
            verification_status=verification_status,
            employment_status=employment_status,
            spa_id=spa_id,
            city=city
        )

    @staticmethod
    async def mark_left(
        db: Session,
        staff_uuid: str,
        leave_date: Optional[datetime] = None,
        reason: Optional[str] = None,
        notes: Optional[str] = None,
        operator_id: Optional[int] = None
    ) -> Staff:
        """
        Marks an employee as left. Closes the active work history and transitions employment status to 'left'.
        """
        staff = await StaffRepository.get_by_uuid(db, staff_uuid)
        if not staff:
            raise StaffNotFoundError(staff_uuid=staff_uuid)

        # 1. Close open work history sessions
        active_hist = await WorkHistoryRepository.get_active_history(db, staff.id)
        if active_hist:
            await WorkHistoryRepository.close_history(
                db=db,
                history=active_hist,
                leave_date=leave_date or datetime.utcnow(),
                is_transferred=False,
                notes=notes or f"Staff marked as left. Reason: {reason or 'Not Specified'}"
            )

        # 2. Record resignation/left event
        from apps.StaffManagement.models import StaffEventTypeEnum
        await VerificationRepository.create_event(
            db=db,
            staff_id=staff.id,
            event_type=StaffEventTypeEnum.resigned,
            spa_id=staff.current_spa_id,
            notes=notes or f"Exit recorded. Reason: {reason or 'Not Specified'}",
            created_by=operator_id
        )

        # 3. Update staff details
        staff.employment_status = EmploymentStatusEnum.left
        staff.current_spa_id = None
        
        await db.flush()
        return await StaffRepository.refresh_with_relations(db, staff)

    @staticmethod
    async def soft_delete_staff(db: Session, staff_uuid: str, deleter_id: Optional[int] = None) -> Staff:
        """
        Soft deletes the employee. Sets employment status to inactive, closes any open branch history,
        and logs a resigned audit event.
        """
        staff = await StaffRepository.get_by_uuid(db, staff_uuid)
        if not staff:
            raise StaffNotFoundError(staff_uuid=staff_uuid)

        # 1. Close open work history sessions
        active_hist = await WorkHistoryRepository.get_active_history(db, staff.id)
        if active_hist:
            await WorkHistoryRepository.close_history(
                db=db,
                history=active_hist,
                leave_date=datetime.utcnow(),
                is_transferred=False,
                notes="Terminated due to staff soft deletion."
            )

        # 2. Record resignation event
        await VerificationRepository.create_event(
            db=db,
            staff_id=staff.id,
            event_type=StaffEventTypeEnum.resigned,
            spa_id=staff.current_spa_id,
            notes="Soft deleted from management index.",
            created_by=deleter_id
        )

        # 3. Soft delete staff
        staff.current_spa_id = None
        updated_staff = await StaffRepository.soft_delete(db, staff)
        return await StaffRepository.refresh_with_relations(db, updated_staff)

    @staticmethod
    async def mark_staff_left(
        db: Session,
        staff_uuid: str,
        leave_date: datetime,
        reason: Optional[str] = None,
        operator_id: Optional[int] = None
    ) -> Staff:
        """
        Marks an employee as left.
        Sets employment status to left, registers leave date, sets current_spa_id to None,
        terminates any active work history session, and logs a resigned audit event.
        """
        staff = await StaffRepository.get_by_uuid(db, staff_uuid)
        if not staff:
            raise StaffNotFoundError(staff_uuid=staff_uuid)

        # 1. Close open work history sessions
        active_hist = await WorkHistoryRepository.get_active_history(db, staff.id)
        if active_hist:
            await WorkHistoryRepository.close_history(
                db=db,
                history=active_hist,
                leave_date=leave_date,
                is_transferred=False,
                notes=f"Terminated due to resignation. Reason: {reason}" if reason else "Terminated due to resignation."
            )

        # 2. Record resignation event
        await VerificationRepository.create_event(
            db=db,
            staff_id=staff.id,
            event_type=StaffEventTypeEnum.resigned,
            spa_id=staff.current_spa_id,
            notes=f"Staff marked as left. Reason: {reason}" if reason else "Staff marked as left.",
            created_by=operator_id
        )

        # 3. Update staff properties
        update_dict = {
            "employment_status": EmploymentStatusEnum.left,
            "leave_date": leave_date,
            "current_spa_id": None
        }
        updated_staff = await StaffRepository.update(db, staff, update_dict)
        return await StaffRepository.refresh_with_relations(db, updated_staff)

    @staticmethod
    async def get_unique_cities(db: Session) -> List[str]:
        """Exposes list of distinct cities where active staff are located"""
        return await StaffRepository.get_unique_cities(db)

    @staticmethod
    async def get_staff_by_phone(db: Session, phone: str) -> Staff:
        """Fetches active staff details by phone, raises StaffNotFoundError if missing"""
        staff = await StaffRepository.get_by_phone(db, phone)
        if not staff:
            raise StaffNotFoundError(staff_id=phone)
        return staff
