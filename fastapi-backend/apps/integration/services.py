import logging
from typing import Any, Dict, List, Optional

from sqlalchemy import false, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from apps.StaffManagement.models import (
    EmploymentStatusEnum,
    Staff,
    VerificationStatusEnum,
)


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
    return {
        "full_name": staff.full_name,
        "phone": staff.phone,
        "spacode": _staff_spacode(staff),
        "spa_id": staff.current_spa.id if staff.current_spa else None,
        "spaname": staff.current_spa.name if staff.current_spa else None,
        "spa_city": staff.current_spa.city if staff.current_spa else None,
        "profiles": _staff_profiles(staff),
        "verification_status": _enum_value(staff.verification_status),
        "employment_status": _enum_value(staff.employment_status),
    }


def _serialize_document(document) -> Dict[str, Any]:
    return {
        "id": document.id,
        "document_type": _enum_value(document.document_type),
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


class IntegrationStaffVerificationService:
    """Read-only staff verification service for internal systems."""

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
