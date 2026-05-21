from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession as Session

from apps.StaffManagement.models import (
    StaffDocument,
    DocumentTypeEnum,
    VerificationStatusEnum,
)


class DocumentRepository:
    """Manages transactional file and metadata uploads for employee records"""

    @staticmethod
    async def get_by_id(
        db: Session,
        doc_id: int
    ) -> Optional[StaffDocument]:

        stmt = select(StaffDocument).where(
            StaffDocument.id == doc_id
        )

        result = await db.execute(stmt)

        return result.scalar_one_or_none()

    @staticmethod
    async def create(
        db: Session,
        staff_id: int,
        document_type: DocumentTypeEnum,
        file_url: Optional[str] = None,
        document_number: Optional[str] = None,
    ) -> StaffDocument:

        doc = StaffDocument(
            staff_id=staff_id,
            document_type=document_type,
            file_url=file_url,
            document_number=document_number,
            verification_status=VerificationStatusEnum.pending,
        )

        db.add(doc)

        await db.flush()
        await db.commit()
        await db.refresh(doc)

        return doc

    @staticmethod
    async def verify(
        db: Session,
        doc: StaffDocument,
        verifier_id: int
    ) -> StaffDocument:

        doc.verification_status = VerificationStatusEnum.verified

        await db.flush()
        await db.commit()
        await db.refresh(doc)

        return doc

    @staticmethod
    async def delete(
        db: Session,
        doc: StaffDocument
    ) -> None:

        await db.delete(doc)

        await db.flush()
        await db.commit()