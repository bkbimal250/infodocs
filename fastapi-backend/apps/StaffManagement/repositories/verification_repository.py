"""
Verification and Audit Repository
Manages database operations for StaffVerificationLog and StaffEvent tracking.
"""
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession as Session

from apps.StaffManagement.models import (
    StaffVerificationLog,
    StaffEvent,
    StaffEventTypeEnum,
    VerificationStatusEnum,
)


class VerificationRepository:
    """Manages transactional audit logs for verification cycles and employee lifecycle events"""

    @staticmethod
    async def  create_verification_log(
        db: Session,
        staff_id: int,
        old_status: Optional[str],
        new_status: str,
        reason: Optional[str] = None,
        changed_by: Optional[int] = None,
    ) -> StaffVerificationLog:
        """Appends an immutable audit row recording verification status changes"""
        log = StaffVerificationLog(
            staff_id=staff_id,
            old_status=old_status,
            new_status=new_status,
            reason=reason,
            changed_by=changed_by,
        )
        db.add(log)
        await db.flush()
        return log

    @staticmethod
    async def  create_event(
        db: Session,
        staff_id: int,
        event_type: StaffEventTypeEnum,
        spa_id: Optional[int] = None,
        from_spa_id: Optional[int] = None,
        to_spa_id: Optional[int] = None,
        transfer_reason: Optional[str] = None,
        notes: Optional[str] = None,
        created_by: Optional[int] = None,
    ) -> StaffEvent:
        """Appends a row into the staff_events timeline for system alerts or auditing"""
        event = StaffEvent(
            staff_id=staff_id,
            event_type=event_type,
            spa_id=spa_id,
            from_spa_id=from_spa_id,
            to_spa_id=to_spa_id,
            transfer_reason=transfer_reason,
            notes=notes,
            created_by=created_by,
        )
        db.add(event)
        await db.flush()
        return event
