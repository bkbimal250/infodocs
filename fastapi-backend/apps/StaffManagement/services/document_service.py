"""
Staff Document Service
Orchestrates employee file attachments and file verification.
"""
from sqlalchemy.ext.asyncio import AsyncSession as Session

from apps.StaffManagement.models import StaffDocument
from apps.StaffManagement.schemas import StaffDocumentCreate
from apps.StaffManagement.repositories.document_repository import DocumentRepository
from apps.StaffManagement.repositories.staff_repository import StaffRepository
from apps.StaffManagement.exceptions import StaffNotFoundError, DocumentError


class DocumentService:
    """Manages transactional logic for staff identity document profiles"""

    @staticmethod
    async def add_document(
        db: Session,
        staff_uuid: str,
        data: StaffDocumentCreate
    ) -> StaffDocument:
        """
        Attaches a document to an employee profile.
        File upload is optional.
        """

        # 1. Fetch employee
        staff = await StaffRepository.get_by_uuid(db, staff_uuid)
        if not staff:
            raise StaffNotFoundError(staff_uuid=staff_uuid)

        # 2. Save document record
        doc = await DocumentRepository.create(
            db=db,
            staff_id=staff.id,
            document_type=data.document_type,
            file_url=data.file_url,
            document_number=data.document_number,
        )

        return doc

    @staticmethod
    async def verify_document(
        db: Session,
        doc_id: int,
        verifier_id: int
    ) -> StaffDocument:
        """Flags a single document metadata record as verified by an authorized HR user"""

        doc = await DocumentRepository.get_by_id(db, doc_id)

        if not doc:
            raise DocumentError(f"Document with ID {doc_id} was not found.")

        verified_doc = await DocumentRepository.verify(
            db,
            doc,
            verifier_id
        )

        return verified_doc

    @staticmethod
    async def delete_document(
        db: Session,
        doc_id: int
    ) -> None:
        """Deletes document metadata from tracking table"""

        doc = await DocumentRepository.get_by_id(db, doc_id)

        if not doc:
            raise DocumentError(f"Document with ID {doc_id} was not found.")

        await DocumentRepository.delete(db, doc)
