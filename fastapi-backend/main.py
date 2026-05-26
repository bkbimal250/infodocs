"""
FastAPI Main Application
Production Ready - Async SQLAlchemy Version
"""

import logging
from pathlib import Path

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi import HTTPException as FastAPIHTTPException
from fastapi.staticfiles import StaticFiles

from contextlib import asynccontextmanager
import asyncio

from config.database import close_db_connection, connect_to_db, init_db, engine
from config.settings import settings

# =========================================================
# ROUTERS
# =========================================================

from apps.users.routers import auth_router, users_router
from apps.certificates.routers import certificates_router
from apps.forms_app.routers import forms_router
from apps.analytics.routers import analytics_router
from apps.notifications.routers import notifications_router
from apps.Query.routers import query_router
from apps.tutorials.routers import tutorials_router
from apps.StaffManagement.routers import router as staff_router
from apps.integration.routers import router as integration_router
from apps.integrations.routers import router as integrations_router

# =========================================================
# CORE
# =========================================================

from core.exceptions import (
    CustomException,
    ValidationError,
    NotFoundError,
    AuthenticationError,
    AuthorizationError,
)

from core.middleware import (
    ErrorHandlerMiddleware,
    PerformanceMiddleware,
)
from core.utils import close_sms_client


# =========================================================
# LOGGER
# =========================================================

logger = logging.getLogger(__name__)

# =========================================================
# LIFESPAN
# =========================================================


@asynccontextmanager
async def lifespan(app: FastAPI):

    try:

        await connect_to_db()

        await init_db()

        logger.info(
            "Database initialized successfully"
        )
        logger.info(
            "SMTP startup configuration: host=%s port=%s ssl=%s tls=%s sender=%s skip_email=%s",
            settings.SMTP_HOST,
            settings.SMTP_PORT,
            settings.SMTP_USE_SSL,
            settings.SMTP_USE_TLS,
            settings.SMTP_FROM_EMAIL or settings.SERVER_EMAIL,
            settings.SKIP_EMAIL,
        )
        logger.info(
            "SMS startup configuration: provider=%s method=%s verify_ssl=%s timeout=%ss connect_timeout=%ss retries=%s skip_sms=%s",
            settings.SMS_API_URL,
            settings.SMS_HTTP_METHOD,
            settings.SMS_VERIFY_SSL,
            settings.SMS_TIMEOUT_SECONDS,
            settings.SMS_CONNECT_TIMEOUT_SECONDS,
            settings.SMS_MAX_RETRIES,
            settings.SKIP_SMS,
        )

        yield

    except asyncio.CancelledError:

        logger.warning(
            "Application reload/shutdown detected"
        )

    except Exception as e:

        logger.error(
            f"Lifespan startup error: {e}",
            exc_info=True
        )

        raise

    finally:

        try:

            await close_db_connection()
            await close_sms_client()

            logger.info(
                "Database connection closed"
            )

        except Exception as e:

            logger.warning(
                f"Shutdown cleanup warning: {e}"
            )



# =========================================================
# FASTAPI APP
# =========================================================
app = FastAPI(
    title="infodocs API",
    description="FastAPI backend for certificate and document management",
    version="1.0.0",
    lifespan=lifespan,
)



# =========================================================
# STATIC FILES
# =========================================================

BASE_DIR = Path(__file__).parent

# Static
static_dir = BASE_DIR / "Static"

if static_dir.exists():
    app.mount(
        "/static",
        StaticFiles(directory=str(static_dir)),
        name="static"
    )

# Media
media_dir = Path(settings.UPLOAD_DIR)

if media_dir.exists():
    app.mount(
        "/media",
        StaticFiles(directory=str(media_dir)),
        name="media"
    )

# Uploads
uploads_dir = BASE_DIR / "uploads"

if uploads_dir.exists():
    app.mount(
        "/uploads",
        StaticFiles(directory=str(uploads_dir)),
        name="uploads"
    )


# =========================================================
# CORS
# =========================================================

cors_origins = settings.CORS_ORIGINS

if isinstance(cors_origins, str):
    cors_origins = [
        origin.strip()
        for origin in cors_origins.split(",")
        if origin.strip()
    ]

default_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "https://docs.dishaonlinesolution.in",
]

production_origins = [
    "https://docs.dishaonlinesolution.in",
    "https://www.docs.dishaonlinesolution.in",
]

all_origins = default_origins + production_origins

for origin in all_origins:
    if origin not in cors_origins:
        cors_origins.append(origin)

logger.info(f"CORS Allowed Origins: {cors_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)


# =========================================================
# MIDDLEWARES
# =========================================================

app.add_middleware(PerformanceMiddleware)

app.add_middleware(ErrorHandlerMiddleware)


# =========================================================
# EXCEPTION HANDLERS
# =========================================================

@app.exception_handler(CustomException)
async def custom_exception_handler(
    request: Request,
    exc: CustomException
):

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.message,
            "detail": exc.detail or exc.message,
            "status_code": exc.status_code,
        },
    )


@app.exception_handler(ValidationError)
async def validation_exception_handler(
    request: Request,
    exc: ValidationError
):

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": exc.message,
            "detail": exc.detail or exc.message,
            "status_code": 422,
        },
    )


@app.exception_handler(NotFoundError)
async def not_found_exception_handler(
    request: Request,
    exc: NotFoundError
):

    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={
            "error": exc.message,
            "detail": exc.detail or exc.message,
            "status_code": 404,
        },
    )


@app.exception_handler(AuthenticationError)
async def authentication_exception_handler(
    request: Request,
    exc: AuthenticationError
):

    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={
            "error": exc.message,
            "detail": exc.detail or exc.message,
            "status_code": 401,
        },
    )


@app.exception_handler(AuthorizationError)
async def authorization_exception_handler(
    request: Request,
    exc: AuthorizationError
):

    return JSONResponse(
        status_code=status.HTTP_403_FORBIDDEN,
        content={
            "error": exc.message,
            "detail": exc.detail or exc.message,
            "status_code": 403,
        },
    )


@app.exception_handler(FastAPIHTTPException)
async def http_exception_handler(
    request: Request,
    exc: FastAPIHTTPException
):

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": (
                exc.detail
                if isinstance(exc.detail, str)
                else "An error occurred"
            ),
            "detail": (
                exc.detail
                if isinstance(exc.detail, str)
                else str(exc.detail)
            ),
            "status_code": exc.status_code,
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_error_handler(
    request: Request,
    exc: RequestValidationError
):

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation error",
            "detail": "Invalid request data",
            "errors": exc.errors(),
            "status_code": 422,
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(
    request: Request,
    exc: Exception
):

    logger.error(
        f"Unhandled exception: {str(exc)}",
        exc_info=True
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal server error",
            "detail": (
                str(exc)
                if settings.DEBUG
                else "An unexpected error occurred"
            ),
            "status_code": 500,
        },
    )


# =========================================================
# ROUTERS
# =========================================================

app.include_router(
    auth_router,
    prefix="/api/users/auth",
    tags=["Authentication"]
)

app.include_router(
    users_router,
    prefix="/api/users",
    tags=["Users"]
)

app.include_router(
    certificates_router,
    prefix="/api/certificates",
    tags=["Certificates"]
)

app.include_router(
    forms_router,
    prefix="/api/forms",
    tags=["Forms"]
)

app.include_router(
    analytics_router,
    prefix="/api/analytics",
    tags=["Analytics"]
)

app.include_router(
    notifications_router,
    prefix="/api/notifications",
    tags=["Notifications"]
)

app.include_router(
    query_router,
    prefix="/api/queries",
    tags=["Queries"]
)

app.include_router(
    tutorials_router,
    prefix="/api",
    tags=["Tutorials"]
)

app.include_router(
    staff_router,
    prefix="/api/staff",
    tags=["Staff Management"]
)

app.include_router(
    integration_router,
    prefix="/api/integration",
    tags=["Internal Integration"]
)

app.include_router(
    integrations_router,
    prefix="/api/integrations",
    tags=["Integrations"]
)


# =========================================================
# ROOT
# =========================================================

@app.get("/")
async def root():

    return {
        "message": "infodocs API",
        "version": "1.0.0",
        "status": "running",
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
async def health_check():

    return {
        "status": "healthy"
    }


# =========================================================
# METRICS
# =========================================================

@app.get("/metrics")
async def metrics():

    metrics_data = {
        "status": "healthy",
        "database": {
            "connected": engine is not None,
        },
    }

    try:

        if engine and hasattr(engine, "pool"):

            pool = engine.pool

            metrics_data["database"]["pool"] = {
                "size": (
                    pool.size()
                    if hasattr(pool, "size")
                    else None
                ),

                "checked_in": (
                    pool.checkedin()
                    if hasattr(pool, "checkedin")
                    else None
                ),

                "checked_out": (
                    pool.checkedout()
                    if hasattr(pool, "checkedout")
                    else None
                ),

                "overflow": (
                    pool.overflow()
                    if hasattr(pool, "overflow")
                    else None
                ),
            }

    except Exception as e:

        logger.warning(
            f"Could not get pool metrics: {e}"
        )

    return metrics_data


# =========================================================
# MAIN
# =========================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
