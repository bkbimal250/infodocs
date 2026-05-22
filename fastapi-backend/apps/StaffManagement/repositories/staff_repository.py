"""
Staff Repository
Provides data access layer for Staff models utilizing SQLAlchemy Session.
"""
from datetime import datetime
from typing import List, Optional, Tuple
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession as Session
from sqlalchemy.orm import selectinload

from apps.StaffManagement.models import Staff, VerificationStatusEnum, EmploymentStatusEnum
from apps.StaffManagement.schemas import StaffCreate


class StaffRepository:
    """Encapsulates database operations for the Staff table"""

    @staticmethod
    def relation_loaders():
        return (
            selectinload(Staff.documents),
            selectinload(Staff.events),
            selectinload(Staff.work_history),
            selectinload(Staff.verification_logs),
        )

    @staticmethod
    async def get_by_id(db: Session, staff_id: int, include_relations: bool = True) -> Optional[Staff]:
        """Fetches active (non-soft-deleted) staff by ID"""
        query = select(Staff).where(staff.id == staff_id, Staff.deleted_at.is_(None))
        if include_relations:
            query = query.options(*StaffRepository.relation_loaders())
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_uuid(db: Session, staff_uuid: str, include_relations: bool = True) -> Optional[Staff]:
        """Fetches active (non-soft-deleted) staff by UUID"""
        query = select(Staff).where(Staff.staff_uuid == staff_uuid, Staff.deleted_at.is_(None))
        if include_relations:
            query = query.options(*StaffRepository.relation_loaders())
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_uuid_any_status(
        db: Session,
        staff_uuid: str,
        include_relations: bool = True
    ) -> Optional[Staff]:
        """Fetches staff by UUID, including soft-deleted records."""
        query = select(Staff).where(Staff.staff_uuid == staff_uuid)
        if include_relations:
            query = query.options(*StaffRepository.relation_loaders())
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_id_for_response(db: Session, staff_id: int) -> Optional[Staff]:
        """Fetches staff by ID with response relationships, including just-mutated rows."""
        query = (
            select(Staff)
            .options(*StaffRepository.relation_loaders())
            .where(staff.id == staff_id)
        )
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def refresh_with_relations(
        db: Session,
        staff: Staff
    ) -> Staff:
        """
        Refresh staff object with all relationships eagerly loaded.
        Fixes async lazy-loading and MissingGreenlet issues.
        """

        # Save latest changes
        await db.commit()

        # Refresh current object
        await db.refresh(staff)

        # Reload with all relations
        stmt = (
            select(Staff)
            .where(
                Staff.staff_uuid == staff.staff_uuid
            )
            .options(
                *StaffRepository.relation_loaders()
            )
     )

        result = await db.execute(stmt)

        refreshed_staff = result.scalar_one_or_none()

        return refreshed_staff or staff

    @staticmethod
    async def get_by_phone(
        db: Session,
        phone: str,
        include_relations: bool = True
    ) -> Optional[Staff]:
        """Fetches active staff by unique phone number"""
        query = select(Staff).where(Staff.phone == phone, Staff.deleted_at.is_(None))
        if include_relations:
            query = query.options(*StaffRepository.relation_loaders())
        result = await db.execute(query)
        return result.scalar_one_or_none()


    @staticmethod
    async def create(
        db: Session,
        data: StaffCreate,
        creator_id: Optional[int] = None,
    ) -> Staff:
        """Persists a new Staff record into the database."""

        db_fields = data.model_dump()

        staff = Staff(
            **db_fields,
            created_by=creator_id,
            verification_status=VerificationStatusEnum.pending,
            employment_status=EmploymentStatusEnum.inactive,
            is_blacklisted=False,
        )

        db.add(staff)

        await db.flush()

        return staff
    
   
    @staticmethod
    async def update(db: Session, staff: Staff, update_fields: dict) -> Staff:
        """Applies dynamic updates to an existing Staff entity"""
        for key, value in update_fields.items():
            if hasattr(staff, key):
                setattr(staff, key, value)
        staff.updated_at = datetime.utcnow()
        await db.flush()
        return staff

    @staticmethod
    async def soft_delete(db: Session, staff: Staff) -> Staff:
        """Applies a soft delete timestamp instead of hard pruning from DB"""
        staff.deleted_at = datetime.utcnow()
        staff.employment_status = EmploymentStatusEnum.inactive
        await db.flush()
        return staff

    @staticmethod
    async def hard_delete(db: Session, staff: Staff) -> None:
        """Permanently deletes staff and ORM-managed child rows."""
        await db.delete(staff)
        await db.flush()

    @staticmethod
    async def query_paginated(
        db: Session,
        limit: int,
        offset: int,
        search: Optional[str] = None,
        phone: Optional[str] = None,
        verification_status: Optional[VerificationStatusEnum] = None,
        employment_status: Optional[EmploymentStatusEnum] = None,
        spa_id: Optional[int] = None,
        city: Optional[str] = None,
    ) -> Tuple[List[Staff], int]:
        """
        Executes a paginated lookup matching flexible search/filter options.
        Returns a tuple of (items, total_count).
        """
        # Base query to fetch records
        base_query = select(Staff).where(Staff.deleted_at.is_(None))

        # Filter applications
        if search:
            search_pattern = f"%{search}%"
            base_query = base_query.where(
                or_(
                    Staff.full_name.like(search_pattern),
                    Staff.city.like(search_pattern),
                )
            )

        if phone:
            base_query = base_query.where(Staff.phone == phone)

        if verification_status:
            base_query = base_query.where(Staff.verification_status == verification_status)

        if employment_status:
            base_query = base_query.where(Staff.employment_status == employment_status)

        if spa_id:
            base_query = base_query.where(Staff.current_spa_id == spa_id)

        if city:
            base_query = base_query.where(Staff.city == city)

        # Count query
        count_stmt = select(func.count()).select_from(base_query.subquery())
        count_result = await db.execute(count_stmt)
        total = count_result.scalar_one()

        # Limit and offset application
        query_stmt = (
            base_query.order_by(Staff.created_at.desc())
            .offset(offset)
            .limit(limit)
            .options(*StaffRepository.relation_loaders())
        )
        
        query_result = await db.execute(query_stmt)
        items = list(query_result.scalars().all())

        return items, total

    @staticmethod
    async def get_unique_cities(db: Session) -> List[str]:
        """Queries unique non-null cities from registered active staff"""
        query = select(Staff.city).where(Staff.city.isnot(None), Staff.deleted_at.is_(None)).distinct()
        result = await db.execute(query)
        return [row[0] for row in result.all() if row[0]]
