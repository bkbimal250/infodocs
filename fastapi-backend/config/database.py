"""
MySQL Database Configuration
Async SQLAlchemy Version
"""

import logging
from urllib.parse import quote_plus

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import declarative_base

from config.settings import settings

logger = logging.getLogger(__name__)

# =========================================================
# BASE
# =========================================================

Base = declarative_base()

# =========================================================
# DATABASE URL
# =========================================================

DATABASE_URL = (
    f"mysql+aiomysql://"
    f"{quote_plus(str(settings.DB_USER))}:"
    f"{quote_plus(str(settings.DB_PASSWORD))}@"
    f"{settings.DB_HOST}:{settings.DB_PORT}/"
    f"{quote_plus(str(settings.DB_NAME))}"
)

# =========================================================
# ENGINE
# =========================================================

engine = create_async_engine(
    DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_recycle=3600,
    pool_size=10,
    max_overflow=20,
    future=True,
)

# SQLAlchemy's PyMySQL ping detection does not recognize aiomysql's async
# adapter signature in some version combinations and calls ping() without
# the required reconnect argument. The adapter expects ping(False), while
# direct raw aiomysql connections still use ping(reconnect=True).
engine.sync_engine.dialect._send_false_to_ping = True

# =========================================================
# SESSION
# =========================================================

async_session_maker = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)


# Backward-compatible alias for modules that still import SessionLocal.
SessionLocal = async_session_maker
async_session = async_session_maker

# Backward-compatible annotation alias for older async-migration code.
Session = AsyncSession

# =========================================================
# DEPENDENCY
# =========================================================

async def get_db():
    async with async_session_maker() as db:
        try:
            yield db
        finally:
            await db.close()


async def connect_to_db() -> None:
    """Open and ping an async DB connection during startup."""
    async with engine.connect() as conn:
        raw_connection = await conn.get_raw_connection()
        driver_connection = raw_connection.driver_connection
        await driver_connection.ping(reconnect=True)


async def close_db_connection() -> None:
    """Dispose the async SQLAlchemy engine."""
    await engine.dispose()


# =========================================================
# INIT DB
# =========================================================

async def init_db():
    # Users
    from apps.users.models import User, OTP

    # Certificates
    from apps.certificates.models import (
        CertificateTemplate,
        GeneratedCertificate,
        SpaTherapistCertificate,
        ManagerSalaryCertificate,
        ExperienceLetterCertificate,
        AppointmentLetterCertificate,
        InvoiceSpaBillCertificate,
        IDCardCertificate,
        DailySheet,
        DailySheetCertificate,
        UndertakingSheet,
        JobformSheet,
    )

    # Forms
    from apps.forms_app.models import SPA, Hiring_Form

    # Tutorials
    from apps.tutorials.models import Tutorial

    # Staff
    from apps.StaffManagement.models import (
        Staff,
        StaffDocument,
        StaffEvent,
        WorkHistory,
        StaffVerificationLog,
    )

    # Queries
    from apps.Query.models import Query, QueryType

    # Integrations
    from apps.integrations.models import IntegrationApiKey

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    logger.info("Database initialized successfully")
