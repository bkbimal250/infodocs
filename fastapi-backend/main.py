"""
FastAPI Main Application
Entry point for the FastAPI backend server
"""
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from fastapi.staticfiles import StaticFiles

from config.database import connect_to_db, close_db_connection, init_db
from config.settings import settings
from apps.users.routers import auth_router, users_router
from apps.certificates.routers import certificates_router
from apps.forms_app.routers import forms_router
from apps.analytics.routers import analytics_router
from apps.notifications.routers import notifications_router
from core.exceptions import CustomException
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
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add custom error handler middleware
app.add_middleware(ErrorHandlerMiddleware)

# Exception handlers
@app.exception_handler(CustomException)
async def custom_exception_handler(request, exc: CustomException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.message, "detail": exc.detail}
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

