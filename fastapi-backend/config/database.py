"""
MySQL Database Configuration
Handles database connection and sessions using SQLAlchemy Async
"""

import asyncio
import logging
from urllib.parse import quote_plus
from sqlalchemy import text, event
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import declarative_base
from sqlalchemy.ext.asyncio import (
    create_async_engine,
    AsyncSession,
    async_sessionmaker,
)
from fastapi import HTTPException

from config.settings import settings

logger = logging.getLogger(__name__)

# ----------------------------------------------------
# SQLAlchemy Base
# ----------------------------------------------------
Base = declarative_base()

# ----------------------------------------------------
# Import all models so Base.metadata.create_all works
# ----------------------------------------------------
# Users
from apps.users.models import User, OTP  # noqa

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
)  # noqa

# Forms App
from apps.forms_app.models import SPA, CandidateForm, Hiring_Form  # noqa

# Tutorials
from apps.tutorials.models import Tutorial  # noqa

# ----------------------------------------------------
# Engine + Session Factory
# ----------------------------------------------------
engine = None
async_session_maker = None


# ----------------------------------------------------
# Build MySQL URL
# ----------------------------------------------------
def get_db_url() -> str:
    """Return encoded MySQL async URL."""
    return (
        f"mysql+aiomysql://"
        f"{quote_plus(str(settings.DB_USER))}:"
        f"{quote_plus(str(settings.DB_PASSWORD))}@"
        f"{settings.DB_HOST}:{settings.DB_PORT}/"
        f"{quote_plus(str(settings.DB_NAME))}"
    )


# ----------------------------------------------------
# Connect to Database
# ----------------------------------------------------
async def connect_to_db():
    """Initialize async engine + sessionmaker, test connection."""
    global engine, async_session_maker

    try:
        database_url = get_db_url()

        # Optimized connection pool for 500+ concurrent users
        # pool_size: Base connections always available
        # max_overflow: Additional connections when pool is exhausted
        # Total max connections = pool_size + max_overflow = 50 + 100 = 150
        # This allows handling 500+ concurrent users with connection pooling
        engine = create_async_engine(
            database_url,
            echo=settings.DEBUG,
            future=True,
            pool_pre_ping=True,  # Verify connections before using
            pool_recycle=3600,  # Recycle connections after 1 hour
            pool_timeout=30,  # Wait up to 30s for connection from pool
            pool_size=10,  # Increased from 5 to 50 base connections
            max_overflow=20,  # Increased from 10 to 100 overflow connections
            connect_args={
                "connect_timeout": 10,
            },
        )
        
        # Set MySQL timezone to UTC on connection for async engine
        # This ensures all datetime operations use UTC
        @event.listens_for(engine.sync_engine, "connect")
        def set_timezone(dbapi_conn, connection_record):
            cursor = dbapi_conn.cursor()
            try:
                cursor.execute("SET time_zone = '+00:00'")
            except Exception:
                pass  # Ignore if timezone setting fails
            finally:
                cursor.close()

        async_session_maker = async_sessionmaker(
            engine,
            class_=AsyncSession,
            expire_on_commit=False,
        )

        # Test connection with timeout
        await asyncio.wait_for(_test_connection(), timeout=10.0)

        logger.info(f"Connected to MySQL database: {settings.DB_NAME}")

    except asyncio.TimeoutError:
        logger.error("MySQL connection test timed out (10s).")
        raise RuntimeError("Database connection timeout. Please check your database server is running.")
    except Exception as e:
        logger.error(f"MySQL connection failed: {e}", exc_info=True)
        raise RuntimeError(f"Database connection failed: {str(e)}. Please check your database credentials and server status.")


async def _test_connection():
    """Simple SELECT 1 to test MySQL availability."""
    async with engine.begin() as conn:
        await conn.execute(text("SELECT 1"))


# ----------------------------------------------------
# Close DB on Shutdown
# ----------------------------------------------------
async def close_db_connection():
    """Dispose all database connections."""
    if engine:
        await engine.dispose()
        logger.info("Disconnected from MySQL")


# ----------------------------------------------------
# Provide DB Session
# ----------------------------------------------------
async def get_db() -> AsyncSession:
    """FastAPI dependency to get DB session."""
    global async_session_maker

    if async_session_maker is None:
        logger.warning("DB not connected; attempting reconnect...")
        try:
            await asyncio.wait_for(connect_to_db(), timeout=15.0)
        except asyncio.TimeoutError:
            logger.error("Database reconnection timed out")
            raise RuntimeError("Database connection timeout. Please check your network connection.")

        if async_session_maker is None:
            raise RuntimeError("Database unavailable.")

    try:
        async with async_session_maker() as session:
            try:
                yield session
            except SQLAlchemyError as e:
                logger.error(f"Database SQL error: {e}", exc_info=True)
                await session.rollback()
                raise
            except HTTPException:
                # Re-raise HTTPExceptions as-is (don't wrap them)
                raise
            except Exception as e:
                logger.error(f"Database operation error: {e}", exc_info=True)
                await session.rollback()
                raise
    except HTTPException:
        # Re-raise HTTPExceptions as-is
        raise
    except Exception as e:
        # If session creation itself fails, log and provide better error
        logger.error(f"Failed to create database session: {e}", exc_info=True)
        
        # Check if it's a connection error
        error_str = str(e).lower()
        if "connection" in error_str or "connect" in error_str:
            raise RuntimeError("Database connection failed. Please check your database server is running and credentials are correct.")
        elif "timeout" in error_str:
            raise RuntimeError("Database connection timeout. Please check your network connection.")
        else:
            # For other errors, provide the original error but in a cleaner format
            raise RuntimeError(f"Database error: {str(e)}")


# ----------------------------------------------------
# Create Tables Automatically
# ----------------------------------------------------
async def init_db():
    """Auto create all tables defined in models."""
    # Import Query models here to avoid circular import
    from apps.Query.models import Query, QueryType  # noqa
    # Tutorial models are already imported at the top
    
    if not engine:
        raise RuntimeError("Engine not initialized before init_db()")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created successfully")
