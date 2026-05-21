"""
Staff Verification & Security Service
Implements the HR verification approval flow and security blacklisting safety checks.
"""
from datetime import datetime
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession as Session

from apps.StaffManagement.models import (
    Staff,
    VerificationStatusEnum,
    EmploymentStatusEnum,
    StaffEventTypeEnum,
)
from apps.StaffManagement.repositories.staff_repository import StaffRepository
from apps.StaffManagement.repositories.verification_repository import VerificationRepository
from apps.StaffManagement.repositories.work_history_repository import WorkHistoryRepository
from apps.StaffManagement.exceptions import StaffNotFoundError, StaffActionError


class VerificationService:
    """Manages secure workflow validations and HR auditing triggers"""

    @staticmethod
    async def verify_staff(
        db: Session,
        staff_uuid: str,
        status: VerificationStatusEnum,
        reason: Optional[str] = None,
        verifier_id: Optional[int] = None
    ) -> Staff:
        """
        Approves or rejects a staff member's verification documents.
        Logs an immutable audit log, updates status flags, and sets employment active/inactive accordingly.
        """
        # 1. Fetch staff
        staff = await StaffRepository.get_by_uuid(db, staff_uuid)
        if not staff:
            raise StaffNotFoundError(staff_uuid=staff_uuid)

        # 2. Check redundant updates
        if staff.verification_status == status:
            raise StaffActionError(f"Staff member is already marked as {status.value}.")

        old_status = staff.verification_status.value if staff.verification_status else None
        new_status = status.value

        # 3. Formulate update payload
        update_fields = {
            "verification_status": status,
            "verification_reason": reason,
            "verified_by": verifier_id,
            "verified_at": datetime.utcnow() if status in [VerificationStatusEnum.verified, VerificationStatusEnum.rejected] else None
        }

        # Automatically transition employment status based on verification outcome
        if status == VerificationStatusEnum.verified:
            update_fields["employment_status"] = EmploymentStatusEnum.active
        elif status == VerificationStatusEnum.rejected:
            update_fields["employment_status"] = EmploymentStatusEnum.inactive

        # 4. Save updates
        updated_staff = await StaffRepository.update(db, staff, update_fields)

        # 5. Append audit log
        await VerificationRepository.create_verification_log(
            db=db,
            staff_id=staff.id,
            old_status=old_status,
            new_status=new_status,
            reason=reason,
            changed_by=verifier_id
        )

        return await StaffRepository.refresh_with_relations(db, updated_staff)

    @staticmethod
    async def toggle_blacklist(
        db: Session,
        staff_uuid: str,
        is_blacklisted: bool,
        reason: Optional[str] = None,
        operator_id: Optional[int] = None
    ) -> Staff:
        """
        Flags or unflags a staff member from the system blacklist.
        If blacklisted, the employee's active work histories are closed and status is forced to inactive.
        """
        # 1. Fetch staff
        staff = await StaffRepository.get_by_uuid(db, staff_uuid)
        if not staff:
            raise StaffNotFoundError(staff_uuid=staff_uuid)

        if staff.is_blacklisted == is_blacklisted:
            state = "blacklisted" if is_blacklisted else "active"
            raise StaffActionError(f"Staff member is already in a {state} security state.")

        update_fields = {
            "is_blacklisted": is_blacklisted,
            "blacklist_reason": reason if is_blacklisted else None
        }

        if is_blacklisted:
            # Prevent working by setting inactive
            update_fields["employment_status"] = EmploymentStatusEnum.inactive
            
            # Close active work histories
            active_history = await WorkHistoryRepository.get_active_history(db, staff.id)
            if active_history:
                await WorkHistoryRepository.close_history(
                    db=db,
                    history=active_history,
                    leave_date=datetime.utcnow(),
                    is_transferred=False,
                    notes=f"Terminated due to security blacklisting: {reason}"
                )

            # Record event
            await VerificationRepository.create_event(
                db=db,
                staff_id=staff.id,
                event_type=StaffEventTypeEnum.resigned,
                spa_id=staff.current_spa_id,
                notes=f"Blacklisted by HR. Reason: {reason}",
                created_by=operator_id
            )
            
            update_fields["current_spa_id"] = None
        else:
            # Unblacklisted - allow rejoined event logging if desired
            await VerificationRepository.create_event(
                db=db,
                staff_id=staff.id,
                event_type=StaffEventTypeEnum.rejoined,
                notes="Removed from blacklist. Restored to eligible list.",
                created_by=operator_id
            )

        updated_staff = await StaffRepository.update(db, staff, update_fields)
        return await StaffRepository.refresh_with_relations(db, updated_staff)
