"""
Custom Middleware
"""
from fastapi import Request, status, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import logging
import traceback

logger = logging.getLogger(__name__)


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """Global error handler middleware"""
    
    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except (HTTPException, RequestValidationError):
            # Let FastAPI handle HTTPException and RequestValidationError (they have their own handlers)
            raise
        except Exception as e:
            logger.error(f"Unhandled error: {str(e)}")
            logger.error(traceback.format_exc())
            
            # Create response with CORS headers
            response = JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "error": "Internal server error",
                    "detail": str(e) if getattr(request.app.state, 'debug', False) else None
                }
            )
            
            # Add CORS headers if origin is present
            origin = request.headers.get("origin")
            if origin:
                # Get CORS origins from app settings
                from config.settings import settings
                cors_origins = settings.CORS_ORIGINS
                if isinstance(cors_origins, str):
                    cors_origins = [origin.strip() for origin in cors_origins.split(",") if origin.strip()]
                
                # Add default localhost origins
                default_origins = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"]
                for default_origin in default_origins:
                    if default_origin not in cors_origins:
                        cors_origins.append(default_origin)
                
                if origin in cors_origins or "*" in cors_origins:
                    response.headers["Access-Control-Allow-Origin"] = origin
                    response.headers["Access-Control-Allow-Credentials"] = "true"
                    response.headers["Access-Control-Allow-Methods"] = "*"
                    response.headers["Access-Control-Allow-Headers"] = "*"
            
            return response

