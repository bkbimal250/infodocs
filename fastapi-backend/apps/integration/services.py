import base64
import binascii
import logging
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional

from sqlalchemy import false, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from apps.StaffManagement.models import (
    EmploymentStatusEnum,
    Staff,
    VerificationStatusEnum,
)
from apps.StaffManagement.repositories.document_repository import DocumentRepository
from apps.StaffManagement.schemas import StaffCreate
from apps.StaffManagement.services.staff_service import StaffService
from apps.forms_app.models import SPA
from core.exceptions import ValidationError
from config.settings import settings


logger = logging.getLogger(__name__)


def _mask_phone(phone: str) -> str:
    if not phone:
        return "missing"
    if len(phone) <= 4:
        return "****"
    return f"***{phone[-4:]}"


def _staff_spacode(staff: Staff) -> Optional[str]:
    staff_code = getattr(staff, "spacode", None)
    if staff_code is not None:
        return str(staff_code)
    if staff.current_spa and staff.current_spa.code is not None:
        return str(staff.current_spa.code)
    return None


def _staff_profiles(staff: Staff) -> List[str]:
    return [staff.designation] if staff.designation else []


def _enum_value(value) -> str:
    return value.value if hasattr(value, "value") else str(value)


def _serialize_staff(staff: Staff) -> Dict[str, Any]:
    spa_code = _staff_spacode(staff)
    return {
        "full_name": staff.full_name,
        "phone": staff.phone,
        "spacode": spa_code,
        "spa_code": spa_code,
        "spa_id": staff.current_spa.id if staff.current_spa else None,
        "spaname": staff.current_spa.name if staff.current_spa else None,
        "spa_city": staff.current_spa.city if staff.current_spa else None,
        "profiles": _staff_profiles(staff),
        "verification_status": _enum_value(staff.verification_status),
        "employment_status": _enum_value(staff.employment_status),
    }


def _serialize_spa(spa: SPA) -> Dict[str, Any]:
    return {
        "id": spa.id,
        "name": spa.name,
        "code": spa.code,
        "area": spa.area,
        "city": spa.city,
        "state": spa.state,
        "address": spa.address,
        "is_active": spa.is_active,
    }


def _serialize_document(document) -> Dict[str, Any]:
    return {
        "id": document.id,
        "document_type": _enum_value(document.document_type),
        "document_number": document.document_number,
        "file_url": document.file_url,
        "verification_status": _enum_value(document.verification_status),
        "created_at": document.created_at,
    }


def _serialize_staff_documents_response(staff: Staff, message: str) -> Dict[str, Any]:
    documents = sorted(
        staff.documents,
        key=lambda document: document.created_at,
        reverse=True,
    )

    return {
        "success": True,
        "staff_found": True,
        "total": len(documents),
        "message": message,
        "staff": _serialize_staff(staff),
        "documents": [_serialize_document(document) for document in documents],
    }


def _status_code_for_staff(staff: Staff) -> str:
    if staff.is_blacklisted:
        return "STAFF_BLACKLISTED"
    if staff.verification_status == VerificationStatusEnum.pending:
        return "STAFF_PENDING"
    if staff.verification_status == VerificationStatusEnum.rejected:
        return "STAFF_REJECTED"
    if staff.employment_status != EmploymentStatusEnum.active:
        return "STAFF_INACTIVE"
    if not staff.current_spa:
        return "STAFF_NO_SPA"
    return "STAFF_VERIFIED"


def _staff_not_found_response() -> Dict[str, Any]:
    return {
        "success": False,
        "staff_found": False,
        "status_code": "STAFF_NOT_FOUND",
        "message": "Staff not found",
    }


def _staff_found_response(staff: Staff) -> Dict[str, Any]:
    return {
        "success": True,
        "staff_found": True,
        "status_code": _status_code_for_staff(staff),
        "message": "Staff found",
        "staff": _serialize_staff(staff),
    }


def _apply_spacode_filter(stmt, spacode: str):
    staff_spacode_column = getattr(Staff, "spacode", None)
    if staff_spacode_column is not None:
        return stmt.where(staff_spacode_column == spacode)
    if spacode.isdigit():
        return stmt.where(Staff.current_spa.has(code=int(spacode)))
    return stmt.where(false())


def _extension_from_content_type(content_type: str) -> str:
    content_type = content_type.lower().strip()
    extension_map = {
        "image/jpeg": ".jpg",
        "image/jpg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "application/pdf": ".pdf",
    }
    return extension_map.get(content_type, "")


def _save_base64_document(document) -> Optional[str]:
    if not document.file_base64:
        return document.file_url

    raw_value = document.file_base64.strip()
    content_type = ""
    if raw_value.startswith("data:") and "," in raw_value:
        meta, raw_value = raw_value.split(",", 1)
        content_type = meta[5:].split(";", 1)[0]

    try:
        file_bytes = base64.b64decode(raw_value, validate=True)
    except (binascii.Error, ValueError) as exc:
        raise ValidationError("Invalid base64 document content.") from exc

    if len(file_bytes) > settings.MAX_UPLOAD_SIZE:
        raise ValidationError(
            f"Document too large. Maximum size is {settings.MAX_UPLOAD_SIZE / (1024 * 1024)} MB."
        )

    file_name = Path(document.file_name or "").name
    extension = Path(file_name).suffix.lower()
    if not extension:
        extension = _extension_from_content_type(content_type) or ".bin"

    upload_dir = Path("uploads") / "staff"
    upload_dir.mkdir(parents=True, exist_ok=True)
    file_path = upload_dir / f"{uuid.uuid4()}{extension}"
    file_path.write_bytes(file_bytes)

    return f"/uploads/staff/{file_path.name}"


async def _resolve_spa_id(
    db: AsyncSession,
    spa_id: Optional[int] = None,
    spacode: Optional[str] = None,
    spa_name: Optional[str] = None,
) -> Optional[int]:
    if spa_id:
        result = await db.execute(
            select(SPA).where(SPA.id == spa_id, SPA.is_active.is_(True))
        )
        spa = result.scalar_one_or_none()
        if not spa:
            raise ValidationError(f"SPA with ID '{spa_id}' was not found or is inactive.")
        return spa.id

    if spacode:
        if not str(spacode).isdigit():
            raise ValidationError("SPA code must be numeric.")
        result = await db.execute(
            select(SPA).where(
                SPA.code == int(spacode),
                SPA.is_active.is_(True),
            )
        )
        spa = result.scalar_one_or_none()
        if not spa:
            raise ValidationError(f"SPA code '{spacode}' was not found or is inactive.")
        return spa.id

    if spa_name:
        clean_name = spa_name.strip()
        exact_result = await db.execute(
            select(SPA)
            .where(
                func.lower(SPA.name) == clean_name.lower(),
                SPA.is_active.is_(True),
            )
            .order_by(SPA.name)
            .limit(1)
        )
        exact_spa = exact_result.scalars().first()
        if exact_spa:
            return exact_spa.id

        search_result = await db.execute(
            select(SPA)
            .where(
                SPA.name.ilike(f"%{clean_name}%"),
                SPA.is_active.is_(True),
            )
            .order_by(SPA.name)
            .limit(2)
        )
        matches = list(search_result.scalars().all())
        if len(matches) == 1:
            return matches[0].id
        if len(matches) > 1:
            raise ValidationError(
                "Multiple SPAs match this name. Send spa_id or spacode from /api/integration/spas."
            )
        raise ValidationError(f"SPA name '{spa_name}' was not found or is inactive.")

    return None


class IntegrationStaffVerificationService:
    """Staff verification and entry service for trusted API-key integrations."""

    @staticmethod
    async def list_spas(
        db: AsyncSession,
        api_key_fingerprint: str,
        limit: int,
        offset: int,
        search: Optional[str] = None,
        code: Optional[str] = None,
        city: Optional[str] = None,
        active_only: bool = True,
    ) -> Dict[str, Any]:

        logger.info(
            "Integration SPA list access key=%s limit=%s offset=%s search=%s code=%s",
            api_key_fingerprint,
            limit,
            offset,
            search,
            code,
        )

        base_stmt = select(SPA)
        if active_only:
            base_stmt = base_stmt.where(SPA.is_active.is_(True))

        if search:
            pattern = f"%{search}%"
            conditions = [
                SPA.name.ilike(pattern),
                SPA.area.ilike(pattern),
                SPA.city.ilike(pattern),
                SPA.state.ilike(pattern),
                SPA.address.ilike(pattern),
            ]
            if search.isdigit():
                conditions.append(SPA.code == int(search))
            base_stmt = base_stmt.where(or_(*conditions))

        if code:
            if not code.isdigit():
                raise ValidationError("SPA code must be numeric.")
            base_stmt = base_stmt.where(SPA.code == int(code))

        if city:
            base_stmt = base_stmt.where(SPA.city.ilike(f"%{city}%"))

        count_stmt = select(func.count()).select_from(base_stmt.order_by(None).subquery())
        count_result = await db.execute(count_stmt)
        total = count_result.scalar_one()

        stmt = base_stmt.order_by(SPA.name).offset(offset).limit(limit)
        result = await db.execute(stmt)
        spas = list(result.scalars().all())

        return {
            "success": True,
            "total": total,
            "limit": limit,
            "offset": offset,
            "items": [_serialize_spa(spa) for spa in spas],
        }

    @staticmethod
    async def create_staff_entry(
        db: AsyncSession,
        payload,
        api_key_fingerprint: str,
    ) -> Dict[str, Any]:

        logger.info(
            "Integration staff entry create key=%s phone=%s spa_id=%s spacode=%s",
            api_key_fingerprint,
            _mask_phone(payload.phone),
            payload.spa_id,
            payload.spacode,
        )

        resolved_spa_id = await _resolve_spa_id(
            db=db,
            spa_id=payload.spa_id,
            spacode=payload.spacode,
            spa_name=payload.spa_name,
        )

        staff_payload = StaffCreate(
            full_name=payload.full_name,
            gender=payload.gender,
            profile_photo=payload.profile_photo,
            phone=payload.phone,
            address=payload.address,
            city=payload.city,
            state=payload.state,
            pincode=payload.pincode,
            designation=payload.designation,
            current_spa_id=resolved_spa_id,
            joining_date=payload.joining_date,
        )

        staff = await StaffService.create_staff(
            db=db,
            data=staff_payload,
            creator_id=None,
        )

        documents_added = 0
        for document in payload.documents:
            file_url = _save_base64_document(document)
            await DocumentRepository.create(
                db=db,
                staff_id=staff.id,
                document_type=document.document_type,
                file_url=file_url,
                document_number=document.document_number,
            )
            documents_added += 1

        refreshed = await db.execute(
            select(Staff)
            .options(
                selectinload(Staff.current_spa),
                selectinload(Staff.documents),
            )
            .where(Staff.id == staff.id)
        )
        staff = refreshed.scalar_one()

        return {
            "success": True,
            "message": "Staff entry created",
            "staff": _serialize_staff(staff),
            "staff_id": staff.id,
            "staff_uuid": staff.staff_uuid,
            "documents_added": documents_added,
        }

    @staticmethod
    async def verify_staff_by_mobile(
        db: AsyncSession,
        mobile_number: str,
        api_key_fingerprint: str,
    ) -> Dict[str, Any]:

        masked_mobile = _mask_phone(mobile_number)

        logger.info(
            "Staff verification request phone=%s key=%s",
            masked_mobile,
            api_key_fingerprint,
        )

        stmt = (
            select(Staff)
            .options(selectinload(Staff.current_spa))
            .where(
                Staff.phone == mobile_number,
                Staff.deleted_at.is_(None),
            )
        )

        result = await db.execute(stmt)
        staff = result.scalar_one_or_none()

        if not staff:
            logger.info(
                "Staff verification not found phone=%s key=%s",
                masked_mobile,
                api_key_fingerprint,
            )
            return {
                "success": False,
                "staff_found": False,
                "status_code": "STAFF_NOT_FOUND",
                "message": "Staff not found",
            }

        if staff.is_blacklisted:
            logger.warning(
                "Blocked blacklisted staff verification phone=%s key=%s",
                masked_mobile,
                api_key_fingerprint,
            )
            return {
                "success": True,
                "staff_found": True,
                "verified": False,
                "blocked": True,
                "is_verified": False,
                "is_active_employee": False,
                "is_blacklisted": True,
                "status_code": "STAFF_BLACKLISTED",
                "message": "Staff is blacklisted",
            }

        if staff.verification_status != VerificationStatusEnum.verified:

            status_code = (
                "STAFF_PENDING"
                if staff.verification_status == VerificationStatusEnum.pending
                else "STAFF_REJECTED"
            )

            return {
                "success": True,
                "staff_found": True,
                "verified": False,
                "is_verified": False,
                "status_code": status_code,
                "message": "Verification incomplete",
            }

        if staff.employment_status != EmploymentStatusEnum.active:
            return {
                "success": True,
                "staff_found": True,
                "verified": False,
                "is_verified": False,
                "is_active_employee": False,
                "status_code": "STAFF_INACTIVE",
                "message": "Staff is inactive",
            }

        if not staff.current_spa:
            return {
                "success": True,
                "staff_found": True,
                "verified": False,
                "is_verified": False,
                "status_code": "STAFF_NO_SPA",
                "message": "No spa assigned",
            }

        return {
            "success": True,
            "staff_found": True,

            "verified": True,
            "blocked": False,
            "is_verified": True,
            "is_active_employee": True,
            "is_blacklisted": False,

            "status_code": "STAFF_VERIFIED",
            "message": "Verification successful",

            "staff": _serialize_staff(staff),
        }

    @staticmethod
    async def list_staff(
        db: AsyncSession,
        api_key_fingerprint: str,
        limit: int,
        offset: int,
        search: Optional[str] = None,
        phone: Optional[str] = None,
        spacode: Optional[str] = None,
        verification_status: Optional[VerificationStatusEnum] = None,
        employment_status: Optional[EmploymentStatusEnum] = None,
        spa_id: Optional[int] = None,
        city: Optional[str] = None,
    ) -> Dict[str, Any]:

        logger.info(
            "Integration staff list access key=%s limit=%s offset=%s",
            api_key_fingerprint,
            limit,
            offset,
        )

        if search:
            logger.info(
                "Integration staff search key=%s search=%s phone=%s spacode=%s",
                api_key_fingerprint,
                search,
                _mask_phone(phone or ""),
                spacode,
            )

        base_stmt = select(Staff).where(Staff.deleted_at.is_(None))

        if search:
            search_pattern = f"%{search}%"
            base_stmt = base_stmt.where(
                or_(
                    Staff.full_name.ilike(search_pattern),
                    Staff.phone.ilike(search_pattern),
                    Staff.city.ilike(search_pattern),
                )
            )

        if phone:
            logger.info(
                "Integration staff phone filter key=%s phone=%s",
                api_key_fingerprint,
                _mask_phone(phone),
            )
            base_stmt = base_stmt.where(Staff.phone == phone)

        if spacode:
            logger.info(
                "Integration staff spacode filter key=%s spacode=%s",
                api_key_fingerprint,
                spacode,
            )
            base_stmt = _apply_spacode_filter(base_stmt, spacode)

        if verification_status:
            base_stmt = base_stmt.where(Staff.verification_status == verification_status)

        if employment_status:
            base_stmt = base_stmt.where(Staff.employment_status == employment_status)

        if spa_id:
            base_stmt = base_stmt.where(Staff.current_spa_id == spa_id)

        if city:
            base_stmt = base_stmt.where(Staff.city.ilike(city))

        count_stmt = select(func.count()).select_from(base_stmt.order_by(None).subquery())
        count_result = await db.execute(count_stmt)
        total = count_result.scalar_one()

        stmt = (
            base_stmt.options(selectinload(Staff.current_spa))
            .order_by(Staff.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await db.execute(stmt)
        items = list(result.scalars().all())

        return {
            "success": True,
            "total": total,
            "limit": limit,
            "offset": offset,
            "items": [_serialize_staff(staff) for staff in items],
        }

    @staticmethod
    async def get_staff(
        db: AsyncSession,
        spacode: str,
        api_key_fingerprint: str,
    ) -> Dict[str, Any]:

        logger.info(
            "Integration staff spacode lookup key=%s spacode=%s",
            api_key_fingerprint,
            spacode,
        )

        stmt = (
            select(Staff)
            .options(selectinload(Staff.current_spa))
            .where(Staff.deleted_at.is_(None))
        )
        stmt = _apply_spacode_filter(stmt, spacode)

        result = await db.execute(stmt)
        staff_rows = list(result.scalars().all())

        staff = staff_rows[0] if staff_rows else None

        if not staff:
            return _staff_not_found_response()

        return _staff_found_response(staff)

    @staticmethod
    async def get_staff_by_phone(
        db: AsyncSession,
        phone: str,
        api_key_fingerprint: str,
    ) -> Dict[str, Any]:

        logger.info(
            "Integration staff phone lookup key=%s phone=%s",
            api_key_fingerprint,
            _mask_phone(phone),
        )

        stmt = (
            select(Staff)
            .options(selectinload(Staff.current_spa))
            .where(
                Staff.phone == phone,
                Staff.deleted_at.is_(None),
            )
        )

        result = await db.execute(stmt)
        staff = result.scalar_one_or_none()

        if not staff:
            return _staff_not_found_response()

        return _staff_found_response(staff)

    @staticmethod
    async def get_staff_by_id(
        db: AsyncSession,
        staff_id: int,
        api_key_fingerprint: str,
    ) -> Dict[str, Any]:

        logger.info(
            "Integration staff ID lookup key=%s staff_id=%s",
            api_key_fingerprint,
            staff_id,
        )

        stmt = (
            select(Staff)
            .options(selectinload(Staff.current_spa))
            .where(
                Staff.id == staff_id,
                Staff.deleted_at.is_(None),
            )
        )

        result = await db.execute(stmt)
        staff = result.scalar_one_or_none()

        if not staff:
            return _staff_not_found_response()

        return _staff_found_response(staff)

    @staticmethod
    async def get_staff_by_identifier(
        db: AsyncSession,
        identifier: str,
        api_key_fingerprint: str,
    ) -> Dict[str, Any]:

        logger.info(
            "Integration staff identifier lookup key=%s identifier=%s",
            api_key_fingerprint,
            _mask_phone(identifier) if len(identifier) >= 6 else identifier,
        )

        if len(identifier) >= 6:
            phone_response = await IntegrationStaffVerificationService.get_staff_by_phone(
                db=db,
                phone=identifier,
                api_key_fingerprint=api_key_fingerprint,
            )
            if phone_response["staff_found"]:
                return phone_response

        if identifier.isdigit():
            id_response = await IntegrationStaffVerificationService.get_staff_by_id(
                db=db,
                staff_id=int(identifier),
                api_key_fingerprint=api_key_fingerprint,
            )
            if id_response["staff_found"]:
                return id_response

        return await IntegrationStaffVerificationService.get_staff(
            db=db,
            spacode=identifier,
            api_key_fingerprint=api_key_fingerprint,
        )

    @staticmethod
    async def get_staff_status(
        db: AsyncSession,
        spacode: str,
        api_key_fingerprint: str,
    ) -> Dict[str, Any]:

        logger.info(
            "Integration staff status lookup key=%s spacode=%s",
            api_key_fingerprint,
            spacode,
        )

        response = await IntegrationStaffVerificationService.get_staff(
            db=db,
            spacode=spacode,
            api_key_fingerprint=api_key_fingerprint,
        )

        staff = response.get("staff")
        if not staff:
            return response

        is_verified = staff["verification_status"] == VerificationStatusEnum.verified.value
        is_active_employee = staff["employment_status"] == EmploymentStatusEnum.active.value

        return {
            "success": True,
            "staff_found": True,
            "is_verified": is_verified,
            "is_active_employee": is_active_employee,
            "status_code": response["status_code"],
            "message": response["message"],
            "staff": staff,
        }

    @staticmethod
    async def get_staff_documents(
        db: AsyncSession,
        spacode: str,
        api_key_fingerprint: str,
    ) -> Dict[str, Any]:

        logger.info(
            "Integration staff documents lookup key=%s spacode=%s",
            api_key_fingerprint,
            spacode,
        )

        stmt = (
            select(Staff)
            .options(
                selectinload(Staff.current_spa),
                selectinload(Staff.documents),
            )
            .where(Staff.deleted_at.is_(None))
        )
        stmt = _apply_spacode_filter(stmt, spacode)

        result = await db.execute(stmt)
        staff_rows = list(result.scalars().all())
        staff = staff_rows[0] if staff_rows else None

        if not staff:
            return {
                "success": False,
                "staff_found": False,
                "total": 0,
                "message": "Staff not found",
                "documents": [],
            }

        return _serialize_staff_documents_response(
            staff=staff,
            message="Staff documents fetched",
        )

    @staticmethod
    async def get_staff_documents_by_id(
        db: AsyncSession,
        staff_id: int,
        api_key_fingerprint: str,
    ) -> Dict[str, Any]:

        logger.info(
            "Integration staff documents lookup key=%s staff_id=%s",
            api_key_fingerprint,
            staff_id,
        )

        stmt = (
            select(Staff)
            .options(
                selectinload(Staff.current_spa),
                selectinload(Staff.documents),
            )
            .where(
                Staff.id == staff_id,
                Staff.deleted_at.is_(None),
            )
        )

        result = await db.execute(stmt)
        staff = result.scalar_one_or_none()

        if not staff:
            return {
                "success": False,
                "staff_found": False,
                "total": 0,
                "message": "Staff not found",
                "documents": [],
            }

        return _serialize_staff_documents_response(
            staff=staff,
            message="Staff documents fetched",
        )
