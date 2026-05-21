import hashlib
import hmac
import logging
import time
from collections import defaultdict, deque
from dataclasses import dataclass
from typing import Deque, Dict, List, Tuple

from fastapi import Header, HTTPException, Request, status

from config.settings import settings


logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class InternalApiClient:
    key_fingerprint: str


class IntegrationRateLimiter:
    """Small in-memory limiter for internal API calls."""

    def __init__(self) -> None:
        self.requests: Dict[str, Deque[float]] = defaultdict(deque)

    async def is_allowed(self, identity: str) -> Tuple[bool, int]:
        now = time.time()
        window_start = now - 60
        timestamps = self.requests[identity]

        while timestamps and timestamps[0] <= window_start:
            timestamps.popleft()

        remaining = settings.INTERNAL_RATE_LIMIT_PER_MINUTE - len(timestamps)
        if remaining <= 0:
            return False, 0

        timestamps.append(now)
        return True, remaining - 1


integration_rate_limiter = IntegrationRateLimiter()


def _fingerprint_api_key(api_key: str) -> str:
    return hashlib.sha256(api_key.encode("utf-8")).hexdigest()[:12]


def _configured_api_keys() -> List[str]:
    if isinstance(settings.INTERNAL_API_KEYS, str):
        return [
            key.strip()
            for key in settings.INTERNAL_API_KEYS.split(",")
            if key.strip()
        ]
    return list(settings.INTERNAL_API_KEYS or [])


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
) -> InternalApiClient:
    configured_keys = _configured_api_keys()
    key_fingerprint = _fingerprint_api_key(x_api_key) if x_api_key else "missing"

    key_is_valid = any(
        hmac.compare_digest(x_api_key, configured_key)
        for configured_key in configured_keys
    )

    if not x_api_key or not key_is_valid:
        logger.warning(
            "Invalid internal API key attempt from ip=%s key=%s path=%s",
            _get_client_ip(request),
            key_fingerprint,
            request.url.path,
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid internal API key",
        )

    client_ip = _get_client_ip(request)
    limiter_identity = f"{key_fingerprint}:{client_ip}"
    allowed, remaining = await integration_rate_limiter.is_allowed(limiter_identity)
    if not allowed:
        logger.warning(
            "Integration rate limit exceeded ip=%s key=%s path=%s",
            client_ip,
            key_fingerprint,
            request.url.path,
        )
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Integration API rate limit exceeded",
            headers={"Retry-After": "60"},
        )

    logger.info(
        "Internal API key accepted ip=%s key=%s path=%s remaining=%s",
        client_ip,
        key_fingerprint,
        request.url.path,
        remaining,
    )
    return InternalApiClient(key_fingerprint=key_fingerprint)
