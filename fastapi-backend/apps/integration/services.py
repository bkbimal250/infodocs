import logging
from typing import Any, Dict

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from apps.StaffManagement.models import (
    EmploymentStatusEnum,
    Staff,
    VerificationStatusEnum,
)


logger = logging.getLogger(__name__)


def _mask_phone(phone: str) -> str:
    if len(phone) <= 4:
        return "****"
    return f"***{phone[-4:]}"


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
            "Internal staff verification requested phone=%s key=%s",
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
                "Internal staff verification not found phone=%s key=%s",
                masked_mobile,
                api_key_fingerprint,
            )
            return {
                "success": False,
                "staff_found": False,
                "message": "Staff not found",
            }

        if staff.is_blacklisted:
            logger.warning(
                "Blocked blacklisted staff verification phone=%s staff_uuid=%s key=%s",
                masked_mobile,
                staff.staff_uuid,
                api_key_fingerprint,
            )
            return {
                "success": True,
                "staff_found": True,
                "verified": False,
                "blocked": True,
                "message": "Staff is blacklisted",
            }

        if staff.verification_status != VerificationStatusEnum.verified:
            message = (
                "Verification pending"
                if staff.verification_status == VerificationStatusEnum.pending
                else "Verification rejected"
            )
            return {
                "success": True,
                "staff_found": True,
                "verified": False,
                "message": message,
            }

        if staff.employment_status != EmploymentStatusEnum.active:
            return {
                "success": True,
                "staff_found": True,
                "verified": False,
                "message": "Staff is not active",
            }

        if not staff.current_spa_id or not staff.current_spa:
            return {
                "success": True,
                "staff_found": True,
                "verified": False,
                "message": "Staff is not assigned to a spa",
            }

        current_spa = {
            "spa_id": staff.current_spa.id,
            "spa_name": staff.current_spa.name,
        }

        return {
            "success": True,
            "staff_found": True,
            "verified": True,
            "staff": {
                "staff_uuid": staff.staff_uuid,
                "full_name": staff.full_name,
                "phone": staff.phone,
                "designation": staff.designation,
                "employment_status": staff.employment_status.value,
                "verification_status": staff.verification_status.value,
                "is_blacklisted": staff.is_blacklisted,
                "current_spa": current_spa,
            },
        }
