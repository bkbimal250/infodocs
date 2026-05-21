"""
Staff Document Repository
Provides data access layer for StaffDocument models utilizing SQLAlchemy Session.
"""
from datetime import datetime
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession as Session

from apps.StaffManagement.models import StaffDocument, DocumentTypeEnum


class DocumentRepository:
    """Manages transactional file and metadata uploads for employee records"""

    @staticmethod
    async def get_by_id(db: Session, doc_id: int) -> Optional[StaffDocument]:
        """Queries a single document metadata row by primary key ID"""
        stmt = select(StaffDocument).where(StaffDocument.id == doc_id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def  create(
        db: Session,
        staff_id: int,
        document_type: DocumentTypeEnum,
        file_url: str,
        document_number_last4: Optional[str] = None
    ) -> StaffDocument:
        """Stores a new verified/unverified identity file link for staff"""
        doc = StaffDocument(
            staff_id=staff_id,
            document_type=document_type,
            file_url=file_url,
            document_number_last4=document_number_last4,
            is_verified=False
        )
        db.add(doc)
        await db.flush()
        await db.commit()
        await db.refresh(doc)
        return doc

    @staticmethod
    async def verify(db: Session, doc: StaffDocument, verifier_id: int) -> StaffDocument:
        """Flags document as verified and locks auditing timestamps"""
        doc.is_verified = True
        doc.verified_by = verifier_id
        doc.verified_at = datetime.utcnow()
        await db.flush()
        await db.commit()
        await db.refresh(doc)
        return doc

    @staticmethod
    async def delete(db: Session, doc: StaffDocument) -> None:
        """Permanently deletes the document meta row (cascade files manually if S3 is active)"""
        await db.delete(doc)
        await db.flush()
        await db.commit()
