"""
Work History Repository
Provides data access layer for the WorkHistory model utilizing SQLAlchemy Session.
"""
from datetime import datetime
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession as Session

from apps.StaffManagement.models import WorkHistory


class WorkHistoryRepository:
    """Manages transactional active and past employee spa branch histories"""

    @staticmethod
    async def get_active_history(db: Session, staff_id: int) -> Optional[WorkHistory]:
        """Queries the current open-ended employment branch for a staff member"""
        stmt = select(WorkHistory).where(
            WorkHistory.staff_id == staff_id,
            WorkHistory.leave_date.is_(None)
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_all_by_staff(db: Session, staff_id: int) -> List[WorkHistory]:
        """Queries entire branch journey of a staff member"""
        stmt = select(WorkHistory).where(WorkHistory.staff_id == staff_id).order_by(WorkHistory.join_date.desc())
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def  create(
        db: Session,
        staff_id: int,
        spa_id: int,
        join_date: datetime,
        notes: Optional[str] = None
    ) -> WorkHistory:
        """Saves a new open work session when an employee joins a spa branch"""
        history = WorkHistory(
            staff_id=staff_id,
            spa_id=spa_id,
            join_date=join_date,
            is_transferred=False,
            notes=notes
        )
        db.add(history)
        await db.flush()
        return history

    @staticmethod
    async def close_history(
        db: Session,
        history: WorkHistory,
        leave_date: datetime,
        is_transferred: bool = False,
        notes: Optional[str] = None
    ) -> WorkHistory:
        """Closes an active spa branch timeline"""
        history.leave_date = leave_date
        history.is_transferred = is_transferred
        if notes:
            if history.notes:
                history.notes += f" | Exit action: {notes}"
            else:
                history.notes = notes
        history.updated_at = datetime.utcnow()
        await db.flush()
        return history
