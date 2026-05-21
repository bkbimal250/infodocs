from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from apps.integration.dependencies import (
    InternalApiClient,
    verify_internal_api_key,
)
from apps.integration.schemas import StaffVerifyRequest, StaffVerifyResponse
from apps.integration.services import IntegrationStaffVerificationService
from config.database import get_db


router = APIRouter(
    prefix="",
    tags=["Internal Integration"],
)


@router.post(
    "/staff/verify",
    response_model=StaffVerifyResponse,
    response_model_exclude_none=True,
    status_code=status.HTTP_200_OK,
    summary="Verify staff operational status by mobile number",
)
async def verify_staff_endpoint(
    payload: StaffVerifyRequest,
    db: AsyncSession = Depends(get_db),
    internal_client: InternalApiClient = Depends(verify_internal_api_key),
):
    return await IntegrationStaffVerificationService.verify_staff_by_mobile(
        db=db,
        mobile_number=payload.mobile_number,
        api_key_fingerprint=internal_client.key_fingerprint,
    )
