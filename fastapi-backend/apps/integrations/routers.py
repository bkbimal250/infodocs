from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from apps.integrations.schemas import (
    IntegrationApiKeyActionResponse,
    IntegrationApiKeyCreate,
    IntegrationApiKeyCreateResponse,
    IntegrationApiKeyRegenerateResponse,
    IntegrationApiKeyResponse,
)
from apps.integrations.services import IntegrationApiKeyService
from apps.users.models import User
from config.database import get_db
from core.dependencies import require_role


router = APIRouter(
    prefix="",
    tags=["Integrations"],
)


@router.get(
    "/keys",
    response_model=List[IntegrationApiKeyResponse],
    summary="[Super Admin] List integration API keys",
)
async def list_integration_api_keys(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin")),
):
    return await IntegrationApiKeyService.list_keys(db)


@router.post(
    "/keys",
    response_model=IntegrationApiKeyCreateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="[Super Admin] Create integration API key",
)
async def create_integration_api_key(
    payload: IntegrationApiKeyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin")),
):
    return await IntegrationApiKeyService.create_key(
        db=db,
        name=payload.name,
        description=payload.description,
        created_by=current_user.id,
    )


@router.patch(
    "/keys/{key_id}/disable",
    response_model=IntegrationApiKeyActionResponse,
    summary="[Super Admin] Disable integration API key",
)
async def disable_integration_api_key(
    key_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin")),
):
    return await IntegrationApiKeyService.disable_key(db, key_id)


@router.delete(
    "/keys/{key_id}",
    response_model=IntegrationApiKeyActionResponse,
    summary="[Super Admin] Delete integration API key",
)
async def delete_integration_api_key(
    key_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin")),
):
    return await IntegrationApiKeyService.delete_key(db, key_id)


@router.post(
    "/keys/{key_id}/regenerate",
    response_model=IntegrationApiKeyRegenerateResponse,
    summary="[Super Admin] Regenerate integration API key",
)
async def regenerate_integration_api_key(
    key_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin")),
):
    return await IntegrationApiKeyService.regenerate_key(db, key_id)
