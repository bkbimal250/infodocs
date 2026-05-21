"""
Staff Transfer Service
Handles the transactional mechanics of transferring staff between spa branches.
"""
from datetime import datetime
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession as Session

from apps.StaffManagement.models import Staff, StaffEventTypeEnum
from apps.StaffManagement.repositories.staff_repository import StaffRepository
from apps.StaffManagement.repositories.work_history_repository import WorkHistoryRepository
from apps.StaffManagement.repositories.verification_repository import VerificationRepository
from apps.StaffManagement.exceptions import StaffNotFoundError, SpaNotFoundError, StaffActionError
from apps.forms_app.models import SPA


class TransferService:
    """Manages transactional safety and history tracking when moving employees across locations"""

    @staticmethod
    async def transfer_staff(
        db: Session,
        staff_uuid: str,
        target_spa_id: int,
        reason: Optional[str] = None,
        notes: Optional[str] = None,
        operator_id: Optional[int] = None
    ) -> Staff:
        """
        Relocates a staff member to another branch safely.
        Ensures active history logs are closed, new logs are initialized, and audit events are generated.
        """
        # 1. Fetch employee
        staff = await StaffRepository.get_by_uuid(db, staff_uuid)
        if not staff:
            raise StaffNotFoundError(staff_uuid=staff_uuid)

        # 2. Validate destination SPA branch exists
        spa_stmt = select(SPA).where(SPA.id == target_spa_id)
        spa_res = await db.execute(spa_stmt)
        target_spa = spa_res.scalar_one_or_none()
        if not target_spa:
            raise SpaNotFoundError(target_spa_id)

        # 3. Check for redundant routing
        if staff.current_spa_id == target_spa_id:
            raise StaffActionError(
                f"Staff is already actively assigned to the target branch '{target_spa.name}'."
            )

        from_spa_id = staff.current_spa_id
        now = datetime.utcnow()

        # 4. Close the active WorkHistory session
        active_history = await WorkHistoryRepository.get_active_history(db, staff.id)
        if active_history:
            await WorkHistoryRepository.close_history(
                db=db,
                history=active_history,
                leave_date=now,
                is_transferred=True,
                notes=reason or f"Transferred to branch: {target_spa.name}"
            )

        # 5. Open new WorkHistory session
        await WorkHistoryRepository.create(
            db=db,
            staff_id=staff.id,
            spa_id=target_spa_id,
            join_date=now,
            notes=notes or f"Transferred in from previous branch."
        )

        # 6. Append audit event tracking
        await VerificationRepository.create_event(
            db=db,
            staff_id=staff.id,
            event_type=StaffEventTypeEnum.transferred,
            spa_id=target_spa_id,
            from_spa_id=from_spa_id,
            to_spa_id=target_spa_id,
            transfer_reason=reason,
            notes=notes,
            created_by=operator_id
        )

        # 7. Update staff current branch identifier
        update_fields = {"current_spa_id": target_spa_id}
        updated_staff = await StaffRepository.update(db, staff, update_fields)

        return await StaffRepository.refresh_with_relations(db, updated_staff)
