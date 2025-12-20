"""
Rate Limiting Middleware
Prevents abuse and ensures fair resource usage for 500+ concurrent users
"""
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
import time
import logging
from collections import defaultdict
from typing import Dict, Tuple
from config.settings import settings

logger = logging.getLogger(__name__)


class RateLimiter:
    """Simple in-memory rate limiter (use Redis for distributed systems)"""
    
    def __init__(self):
        self.requests: Dict[str, list] = defaultdict(list)
        self.cleanup_interval = 300  # Clean up old entries every 5 minutes
        self.last_cleanup = time.time()
    
    def _cleanup_old_entries(self):
        """Remove old request timestamps to prevent memory leaks"""
        current_time = time.time()
        if current_time - self.last_cleanup < self.cleanup_interval:
            return
        
        cutoff_minute = current_time - 60
        cutoff_hour = current_time - 3600
        
        for ip in list(self.requests.keys()):
            # Keep only recent timestamps
            self.requests[ip] = [
                ts for ts in self.requests[ip]
                if ts > cutoff_hour
            ]
            # Remove empty entries
            if not self.requests[ip]:
                del self.requests[ip]
        
        self.last_cleanup = current_time
    
    def is_allowed(self, ip: str) -> Tuple[bool, str]:
        """
        Check if request is allowed based on rate limits
        Returns: (is_allowed, error_message)
        """
        if not settings.RATE_LIMIT_ENABLED:
            return True, ""
        
        self._cleanup_old_entries()
        
        current_time = time.time()
        minute_ago = current_time - 60
        hour_ago = current_time - 3600
        
        # Get request timestamps for this IP
        timestamps = self.requests[ip]
        
        # Count requests in last minute
        recent_minute = [ts for ts in timestamps if ts > minute_ago]
        if len(recent_minute) >= settings.RATE_LIMIT_PER_MINUTE:
            return False, f"Rate limit exceeded: {settings.RATE_LIMIT_PER_MINUTE} requests per minute"
        
        # Count requests in last hour
        recent_hour = [ts for ts in timestamps if ts > hour_ago]
        if len(recent_hour) >= settings.RATE_LIMIT_PER_HOUR:
            return False, f"Rate limit exceeded: {settings.RATE_LIMIT_PER_HOUR} requests per hour"
        
        # Add current request timestamp
        timestamps.append(current_time)
        
        return True, ""
    
    def get_client_ip(self, request: Request) -> str:
        """Extract client IP address from request"""
        # Check for forwarded IP (behind proxy/load balancer)
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            # Take first IP in chain
            return forwarded.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip.strip()
        
        # Fallback to direct client IP
        if request.client:
            return request.client.host
        
        return "unknown"


# Global rate limiter instance
rate_limiter = RateLimiter()


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware for FastAPI"""
    
    # Exclude these paths from rate limiting
    EXCLUDED_PATHS = [
        "/health",
        "/",
        "/docs",
        "/openapi.json",
        "/redoc",
    ]
    
    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for excluded paths
        if any(request.url.path.startswith(path) for path in self.EXCLUDED_PATHS):
            return await call_next(request)
        
        # Get client IP
        client_ip = rate_limiter.get_client_ip(request)
        
        # Check rate limit
        is_allowed, error_message = rate_limiter.is_allowed(client_ip)
        
        if not is_allowed:
            logger.warning(f"Rate limit exceeded for IP: {client_ip}, Path: {request.url.path}")
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "error": "Rate limit exceeded",
                    "detail": error_message,
                    "status_code": 429
                },
                headers={
                    "Retry-After": "60",  # Retry after 60 seconds
                    "X-RateLimit-Limit": str(settings.RATE_LIMIT_PER_MINUTE),
                    "X-RateLimit-Remaining": "0",
                }
            )
        
        # Process request
        response = await call_next(request)
        
        # Add rate limit headers
        response.headers["X-RateLimit-Limit"] = str(settings.RATE_LIMIT_PER_MINUTE)
        # Calculate remaining requests (simplified)
        response.headers["X-RateLimit-Remaining"] = str(
            max(0, settings.RATE_LIMIT_PER_MINUTE - len([
                ts for ts in rate_limiter.requests.get(client_ip, [])
                if ts > time.time() - 60
            ]))
        )
        
        return response
