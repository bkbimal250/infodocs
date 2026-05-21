"""
Staff Document Service
Orchestrates employee file attachments and file verification.
"""
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession as Session

from apps.StaffManagement.models import StaffDocument, DocumentTypeEnum
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
        Attaches a pending document (Aadhaar/PAN/etc.) to an employee profile.
        Keeps entry lightweight; HR/Admin verification happens later.
        """
        # 1. Fetch employee
        staff = await StaffRepository.get_by_uuid(db, staff_uuid)
        if not staff:
            raise StaffNotFoundError(staff_uuid=staff_uuid)

        # 2. Keep document number exactly as cleaned by the schema.
        # Legacy staff identity columns are retained without hashing for this targeted fix.
        doc_number = data.document_number

        # 3. Prevent duplicate Aadhaar/PAN values if a document number was supplied.
        if doc_number and data.document_type in [DocumentTypeEnum.aadhaar, DocumentTypeEnum.pan]:
            aadhaar_param = doc_number if data.document_type == DocumentTypeEnum.aadhaar else None
            pan_param = doc_number if data.document_type == DocumentTypeEnum.pan else None
            
            duplicate = await StaffRepository.check_identity_duplicates(
                db, aadhaar_number=aadhaar_param, pan_number=pan_param
            )
            if duplicate and duplicate.id != staff.id:
                raise DocumentError(
                    f"The provided {data.document_type.value} document is already registered to another staff member."
                )

            # Sync primary staff columns if they were not set during registration
            update_fields = {}
            if data.document_type == DocumentTypeEnum.aadhaar and not staff.aadhaar_number:
                update_fields["aadhaar_number"] = doc_number
                update_fields["aadhaar_last4"] = None
            elif data.document_type == DocumentTypeEnum.pan and not staff.pan_number:
                update_fields["pan_number"] = doc_number
                update_fields["pan_last4"] = None
            
            if update_fields:
                await StaffRepository.update(db, staff, update_fields)

        # 4. Save document record
        doc = await DocumentRepository.create(
            db=db,
            staff_id=staff.id,
            document_type=data.document_type,
            file_url=data.file_url,
            document_number_last4=None
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

        if doc.is_verified:
            raise DocumentError("Document is already verified.")

        # Update document verification
        verified_doc = await DocumentRepository.verify(db, doc, verifier_id)
        return verified_doc

    @staticmethod
    async def delete_document(db: Session, doc_id: int) -> None:
        """Deletes document metadata from tracking table"""
        doc = await DocumentRepository.get_by_id(db, doc_id)
        if not doc:
            raise DocumentError(f"Document with ID {doc_id} was not found.")

        # Check if this document identifier is synced on the main staff table.
        # If it is, we should not necessarily delete it from staff (to preserve verification history),
        # but we do remove the document record.
        await DocumentRepository.delete(db, doc)
