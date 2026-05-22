from typing import Optional

from fastapi import APIRouter, Depends, Path, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from apps.StaffManagement.models import EmploymentStatusEnum, VerificationStatusEnum
from apps.integration.dependencies import (
    InternalApiClient,
    verify_internal_api_key,
)
from apps.integration.schemas import (
    IntegrationStaffDocumentListResponse,
    IntegrationStaffListResponse,
    StaffVerifyRequest,
    StaffVerifyResponse,
)
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


@router.get(
    "/staff/list",
    response_model=IntegrationStaffListResponse,
    response_model_exclude_none=True,
    status_code=status.HTTP_200_OK,
    summary="Fetch paginated staff list for trusted integrations",
)
async def list_staff_endpoint(
    search: Optional[str] = Query(None, description="Search by name, phone, or city"),
    phone: Optional[str] = Query(None, description="Filter by phone number"),
    spacode: Optional[str] = Query(None, description="Filter by staff/SPA code"),
    verification_status: Optional[VerificationStatusEnum] = Query(None),
    employment_status: Optional[EmploymentStatusEnum] = Query(None),
    spa_id: Optional[int] = Query(None, description="Filter by assigned SPA ID"),
    city: Optional[str] = Query(None, description="Filter by staff city"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    internal_client: InternalApiClient = Depends(verify_internal_api_key),
):
    return await IntegrationStaffVerificationService.list_staff(
        db=db,
        api_key_fingerprint=internal_client.key_fingerprint,
        search=search.strip() if search else None,
        phone=phone.strip() if phone else None,
        spacode=spacode.strip() if spacode else None,
        verification_status=verification_status,
        employment_status=employment_status,
        spa_id=spa_id,
        city=city.strip() if city else None,
        limit=limit,
        offset=offset,
    )


@router.get(
    "/staff/status/{spacode}",
    response_model=StaffVerifyResponse,
    response_model_exclude_none=True,
    status_code=status.HTTP_200_OK,
    summary="Fetch lightweight staff status by code",
)
async def get_staff_status_endpoint(
    spacode: str = Path(..., min_length=1),
    db: AsyncSession = Depends(get_db),
    internal_client: InternalApiClient = Depends(verify_internal_api_key),
):
    return await IntegrationStaffVerificationService.get_staff_status(
        db=db,
        spacode=spacode.strip(),
        api_key_fingerprint=internal_client.key_fingerprint,
    )


@router.get(
    "/staff/phone/{phone}",
    response_model=StaffVerifyResponse,
    response_model_exclude_none=True,
    status_code=status.HTTP_200_OK,
    summary="Fetch staff details by phone",
)
async def get_staff_by_phone_endpoint(
    phone: str = Path(..., min_length=6, max_length=20),
    db: AsyncSession = Depends(get_db),
    internal_client: InternalApiClient = Depends(verify_internal_api_key),
):
    return await IntegrationStaffVerificationService.get_staff_by_phone(
        db=db,
        phone=phone.strip(),
        api_key_fingerprint=internal_client.key_fingerprint,
    )


@router.get(
    "/staff/id/{staff_id}",
    response_model=StaffVerifyResponse,
    response_model_exclude_none=True,
    status_code=status.HTTP_200_OK,
    summary="Fetch staff details by staff ID",
)
async def get_staff_by_id_endpoint(
    staff_id: int = Path(..., ge=1),
    db: AsyncSession = Depends(get_db),
    internal_client: InternalApiClient = Depends(verify_internal_api_key),
):
    return await IntegrationStaffVerificationService.get_staff_by_id(
        db=db,
        staff_id=staff_id,
        api_key_fingerprint=internal_client.key_fingerprint,
    )


@router.get(
    "/staff/id/{staff_id}/documents",
    response_model=IntegrationStaffDocumentListResponse,
    response_model_exclude_none=True,
    status_code=status.HTTP_200_OK,
    summary="Fetch staff documents by staff ID for trusted integrations",
)
async def get_staff_documents_by_id_endpoint(
    staff_id: int = Path(..., ge=1),
    db: AsyncSession = Depends(get_db),
    internal_client: InternalApiClient = Depends(verify_internal_api_key),
):
    return await IntegrationStaffVerificationService.get_staff_documents_by_id(
        db=db,
        staff_id=staff_id,
        api_key_fingerprint=internal_client.key_fingerprint,
    )


@router.get(
    "/staff/{spacode}/documents",
    response_model=IntegrationStaffDocumentListResponse,
    response_model_exclude_none=True,
    status_code=status.HTTP_200_OK,
    summary="Fetch staff documents by code for trusted integrations",
)
async def get_staff_documents_endpoint(
    spacode: str = Path(..., min_length=1),
    db: AsyncSession = Depends(get_db),
    internal_client: InternalApiClient = Depends(verify_internal_api_key),
):
    return await IntegrationStaffVerificationService.get_staff_documents(
        db=db,
        spacode=spacode.strip(),
        api_key_fingerprint=internal_client.key_fingerprint,
    )


@router.get(
    "/staff/{identifier}",
    response_model=StaffVerifyResponse,
    response_model_exclude_none=True,
    status_code=status.HTTP_200_OK,
    summary="Fetch staff details by phone, staff ID, or code",
)
async def get_staff_endpoint(
    identifier: str = Path(..., min_length=1),
    db: AsyncSession = Depends(get_db),
    internal_client: InternalApiClient = Depends(verify_internal_api_key),
):
    return await IntegrationStaffVerificationService.get_staff_by_identifier(
        db=db,
        identifier=identifier.strip(),
        api_key_fingerprint=internal_client.key_fingerprint,
    )
