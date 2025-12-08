"""
FastAPI Main Application
Entry point for the FastAPI backend server
"""
from pathlib import Path
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi import HTTPException as FastAPIHTTPException
from contextlib import asynccontextmanager
from fastapi.staticfiles import StaticFiles

from config.database import connect_to_db, close_db_connection, init_db
from config.settings import settings
from apps.users.routers import auth_router, users_router
from apps.certificates.routers import certificates_router
from apps.forms_app.routers import forms_router
from apps.analytics.routers import analytics_router
from apps.notifications.routers import notifications_router
from core.exceptions import CustomException, ValidationError, NotFoundError, AuthenticationError, AuthorizationError
from core.middleware import ErrorHandlerMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events"""
    # Startup
    try:
        await connect_to_db()
        # Only initialize tables if connection succeeded
        from config.database import engine
        if engine is not None:
            await init_db()
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(f"Database initialization failed: {e}. Server will continue but database operations may fail.")
    
    yield
    
    # Shutdown
    await close_db_connection()


# Create FastAPI app
app = FastAPI(
    title="infodocs API",
    description="FastAPI backend for certificate and document management",
    version="1.0.0",
    lifespan=lifespan,
)

# Mount Static directory for serving images
static_dir = Path(__file__).parent / "Static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

# Mount media directory for serving uploaded files (certificates, images, etc.)
from config.settings import settings
media_dir = Path(settings.UPLOAD_DIR)
if media_dir.exists():
    app.mount("/media", StaticFiles(directory=str(media_dir)), name="media")

# CORS Middleware
# Ensure CORS_ORIGINS is a list (validator handles string to list conversion)
cors_origins = settings.CORS_ORIGINS
if isinstance(cors_origins, str):
    cors_origins = [origin.strip() for origin in cors_origins.split(",") if origin.strip()]

# Add default localhost origins for development if not present
default_origins = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"]
for origin in default_origins:
    if origin not in cors_origins:
        cors_origins.append(origin)

# Log CORS origins for debugging
import logging
logger = logging.getLogger(__name__)
logger.info(f"CORS allowed origins: {cors_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Add custom error handler middleware
app.add_middleware(ErrorHandlerMiddleware)

# Exception handlers - Ensure all errors return proper JSON responses
@app.exception_handler(CustomException)
async def custom_exception_handler(request: Request, exc: CustomException):
    """Handle custom exceptions (ValidationError, NotFoundError, etc.)"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.message,
            "detail": exc.detail or exc.message,
            "status_code": exc.status_code
        }
    )


@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    """Handle ValidationError exceptions"""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": exc.message,
            "detail": exc.detail or exc.message,
            "status_code": 422
        }
    )


@app.exception_handler(NotFoundError)
async def not_found_exception_handler(request: Request, exc: NotFoundError):
    """Handle NotFoundError exceptions"""
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={
            "error": exc.message,
            "detail": exc.detail or exc.message,
            "status_code": 404
        }
    )


@app.exception_handler(AuthenticationError)
async def authentication_exception_handler(request: Request, exc: AuthenticationError):
    """Handle AuthenticationError exceptions"""
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={
            "error": exc.message,
            "detail": exc.detail or exc.message,
            "status_code": 401
        }
    )


@app.exception_handler(AuthorizationError)
async def authorization_exception_handler(request: Request, exc: AuthorizationError):
    """Handle AuthorizationError exceptions"""
    return JSONResponse(
        status_code=status.HTTP_403_FORBIDDEN,
        content={
            "error": exc.message,
            "detail": exc.detail or exc.message,
            "status_code": 403
        }
    )


@app.exception_handler(FastAPIHTTPException)
async def http_exception_handler(request: Request, exc: FastAPIHTTPException):
    """Handle FastAPI HTTPException - ensure it returns JSON"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail if isinstance(exc.detail, str) else "An error occurred",
            "detail": exc.detail if isinstance(exc.detail, str) else str(exc.detail),
            "status_code": exc.status_code
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    """Handle request validation errors - ensure it returns JSON"""
    errors = exc.errors()
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation error",
            "detail": "Invalid request data",
            "errors": errors,
            "status_code": 422
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle all other exceptions - ensure it returns JSON with CORS headers"""
    import logging
    logger = logging.getLogger(__name__)
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    
    # Create response - CORS middleware will add headers automatically
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal server error",
            "detail": str(exc) if settings.DEBUG else "An unexpected error occurred",
            "status_code": 500
        }
    )


# Include routers
app.include_router(auth_router, prefix="/api/users/auth", tags=["Authentication"])
app.include_router(users_router, prefix="/api/users", tags=["Users"])
app.include_router(certificates_router, prefix="/api/certificates", tags=["Certificates"])
app.include_router(forms_router, prefix="/api/forms", tags=["Forms"])
app.include_router(analytics_router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(notifications_router, prefix="/api/notifications", tags=["Notifications"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "infodocs API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )

