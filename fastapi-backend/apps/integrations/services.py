import hashlib
import logging
import re
import secrets
from datetime import datetime
from typing import List, Optional, Tuple

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from apps.integrations.models import IntegrationApiKey


logger = logging.getLogger(__name__)


def hash_api_key(api_key: str) -> str:
    return hashlib.sha256(api_key.encode("utf-8")).hexdigest()


def _slugify_name(name: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "_", name.strip().lower()).strip("_")
    return slug[:32] or "internal"


def _generate_api_key(name: str) -> Tuple[str, str, str]:
    key_prefix = f"{_slugify_name(name)}_live"
    token = secrets.token_urlsafe(24).replace("-", "").replace("_", "")
    api_key = f"{key_prefix}_{token}"
    return api_key, hash_api_key(api_key), key_prefix


def serialize_api_key(model: IntegrationApiKey) -> dict:
    return {
        "id": model.id,
        "name": model.name,
        "key_prefix": model.key_prefix,
        "key_preview": f"{model.key_prefix}_****",
        "is_active": model.is_active,
        "never_expires": True,
        "expires_at": None,
        "description": model.description,
        "created_by": model.created_by,
        "last_used_at": model.last_used_at,
        "created_at": model.created_at,
        "updated_at": model.updated_at,
    }


class IntegrationApiKeyService:
    @staticmethod
    async def list_keys(db: AsyncSession) -> List[dict]:
        stmt = select(IntegrationApiKey).order_by(IntegrationApiKey.created_at.desc())
        result = await db.execute(stmt)
        keys = result.scalars().all()
        return [serialize_api_key(key) for key in keys]

    @staticmethod
    async def create_key(
        db: AsyncSession,
        name: str,
        description: Optional[str],
        created_by: Optional[int],
    ) -> dict:
        api_key, api_key_hash, key_prefix = _generate_api_key(name)

        model = IntegrationApiKey(
            name=name,
            description=description,
            api_key_hash=api_key_hash,
            key_prefix=key_prefix,
            created_by=created_by,
            is_active=True,
        )
        db.add(model)
        await db.commit()
        await db.refresh(model)

        logger.info("Integration API key created id=%s prefix=%s by=%s", model.id, key_prefix, created_by)

        return {
            "success": True,
            "api_key": api_key,
            "key": serialize_api_key(model),
        }

    @staticmethod
    async def get_key_or_404(db: AsyncSession, key_id: int) -> IntegrationApiKey:
        stmt = select(IntegrationApiKey).where(IntegrationApiKey.id == key_id)
        result = await db.execute(stmt)
        model = result.scalar_one_or_none()

        if not model:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Integration API key not found",
            )

        return model

    @staticmethod
    async def disable_key(db: AsyncSession, key_id: int) -> dict:
        model = await IntegrationApiKeyService.get_key_or_404(db, key_id)
        model.is_active = False
        model.updated_at = datetime.utcnow()

        await db.commit()
        await db.refresh(model)

        logger.info("Integration API key disabled id=%s prefix=%s", model.id, model.key_prefix)

        return {
            "success": True,
            "message": "API key disabled",
            "key": serialize_api_key(model),
        }

    @staticmethod
    async def delete_key(db: AsyncSession, key_id: int) -> dict:
        model = await IntegrationApiKeyService.get_key_or_404(db, key_id)
        key_prefix = model.key_prefix

        await db.delete(model)
        await db.commit()

        logger.info("Integration API key deleted id=%s prefix=%s", key_id, key_prefix)

        return {
            "success": True,
            "message": "API key deleted",
        }

    @staticmethod
    async def regenerate_key(db: AsyncSession, key_id: int) -> dict:
        model = await IntegrationApiKeyService.get_key_or_404(db, key_id)
        api_key, api_key_hash, key_prefix = _generate_api_key(model.name)

        model.api_key_hash = api_key_hash
        model.key_prefix = key_prefix
        model.is_active = True
        model.updated_at = datetime.utcnow()

        await db.commit()
        await db.refresh(model)

        logger.info("Integration API key regenerated id=%s prefix=%s", model.id, key_prefix)

        return {
            "success": True,
            "api_key": api_key,
            "key": serialize_api_key(model),
        }
