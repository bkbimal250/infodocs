import hashlib
import logging
from datetime import datetime, timedelta
from dataclasses import dataclass

from fastapi import Depends, Header, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from apps.integrations.models import IntegrationApiKey
from config.database import get_db
from config.settings import settings


logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class InternalApiClient:
    key_fingerprint: str
    key_id: int
    key_prefix: str


def _hash_api_key(api_key: str) -> str:
    return hashlib.sha256(api_key.encode("utf-8")).hexdigest()


def _get_client_ip(request: Request) -> str:
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()

    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip.strip()

    if request.client:
        return request.client.host

    return "unknown"


async def verify_internal_api_key(
    request: Request,
    x_api_key: str = Header(default="", alias="X-API-KEY"),
    db: AsyncSession = Depends(get_db),
) -> InternalApiClient:
    incoming_hash = _hash_api_key(x_api_key) if x_api_key else ""
    key_fingerprint = incoming_hash[:12] if incoming_hash else "missing"

    if not x_api_key:
        logger.warning(
            "Invalid internal API key attempt from ip=%s key_hash_prefix=%s path=%s",
            _get_client_ip(request),
            key_fingerprint,
            request.url.path,
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid internal API key",
        )

    stmt = select(IntegrationApiKey).where(
        IntegrationApiKey.api_key_hash == incoming_hash,
        IntegrationApiKey.is_active.is_(True),
    )
    result = await db.execute(stmt)
    api_key = result.scalar_one_or_none()

    if not api_key:
        logger.warning(
            "Invalid internal API key attempt from ip=%s key_hash_prefix=%s path=%s",
            _get_client_ip(request),
            key_fingerprint,
            request.url.path,
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid internal API key",
        )

    now = datetime.utcnow()
    last_used_threshold = now - timedelta(
        seconds=settings.INTEGRATION_LAST_USED_UPDATE_SECONDS
    )
    if not api_key.last_used_at or api_key.last_used_at < last_used_threshold:
        api_key.last_used_at = now
        await db.commit()

    logger.info(
        "Internal API key accepted ip=%s key_id=%s key_prefix=%s key_hash_prefix=%s path=%s",
        _get_client_ip(request),
        api_key.id,
        api_key.key_prefix,
        key_fingerprint,
        request.url.path,
    )
    return InternalApiClient(
        key_fingerprint=key_fingerprint,
        key_id=api_key.id,
        key_prefix=api_key.key_prefix,
    )
