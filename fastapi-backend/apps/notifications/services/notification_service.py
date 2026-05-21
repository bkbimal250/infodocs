"""
Notification Service
Async SQLAlchemy Version
"""

from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
import logging

from sqlalchemy.ext.asyncio import AsyncSession as Session
from sqlalchemy import and_, func, or_, desc, select

from apps.users.models import Notification, User
from config.database import async_session_maker

logger = logging.getLogger(__name__)


async def create_notification(
    db: Session,
    user_id: Optional[int],
    title: str,
    message: str,
    notification_type: str,
    metadata: Optional[Dict[str, Any]] = None,
) -> Notification:
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type,
        meta_data=metadata or {},
    )

    db.add(notification)
    await db.commit()
    await db.refresh(notification)
    return notification


async def create_login_notification(
    db: Session,
    user_id: int,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    send_admin_email: bool = True,
) -> Notification:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    user_name = f"{user.first_name} {user.last_name}" if user else "User"

    return await create_notification(
        db=db,
        user_id=user_id,
        title="Login Successful",
        message=f"{user_name} logged in successfully",
        notification_type="login",
        metadata={
            "ip_address": ip_address,
            "user_agent": user_agent,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )


async def create_otp_notification(
    db: Session,
    user_id: int,
    purpose: str,
    status: str,
    ip_address: Optional[str] = None,
) -> Notification:
    user = await db.get(User, user_id)
    user_name = f"{user.first_name} {user.last_name}" if user else "User"
    purpose_map = {
        "login": "Login",
        "password_reset": "Password Reset",
        "email_verification": "Email Verification",
    }
    purpose_display = purpose_map.get(purpose, purpose.replace("_", " ").title())
    if status == "requested":
        title = f"{purpose_display} OTP Requested"
        message = f"{user_name} requested an OTP for {purpose_display.lower()}"
    elif status == "verified":
        title = f"{purpose_display} OTP Verified"
        message = f"{user_name} successfully verified OTP for {purpose_display.lower()}"
    else:
        title = f"{purpose_display} OTP Failed"
        message = f"{user_name} failed to verify OTP for {purpose_display.lower()}"

    return await create_notification(
        db=db,
        user_id=user_id,
        title=title,
        message=message,
        notification_type=f"otp_{purpose}",
        metadata={
            "purpose": purpose,
            "status": status,
            "ip_address": ip_address,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )


async def create_password_reset_notification(
    db: Session,
    user_id: int,
    status: str,
    ip_address: Optional[str] = None,
) -> Notification:
    user = await db.get(User, user_id)
    user_name = f"{user.first_name} {user.last_name}" if user else "User"
    if status == "requested":
        title = "Password Reset Requested"
        message = f"{user_name} requested a password reset"
    elif status == "completed":
        title = "Password Reset Completed"
        message = f"{user_name} successfully reset their password"
    else:
        title = "Password Reset Failed"
        message = f"{user_name} failed to reset password"

    return await create_notification(
        db=db,
        user_id=user_id,
        title=title,
        message=message,
        notification_type="password_reset",
        metadata={
            "status": status,
            "ip_address": ip_address,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )


async def create_certificate_notification(
    db: Session,
    user_id: int,
    certificate_id: int,
    certificate_type: str,
    candidate_name: str,
) -> Notification:
    user = await db.get(User, user_id)
    user_name = f"{user.first_name} {user.last_name}" if user else "User"

    return await create_notification(
        db=db,
        user_id=user_id,
        title="Certificate Created",
        message=f"{user_name} created a {certificate_type} certificate for {candidate_name}",
        notification_type="certificate_created",
        metadata={
            "certificate_id": certificate_id,
            "certificate_type": certificate_type,
            "candidate_name": candidate_name,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )


async def create_query_notification(
    db: Session,
    query_id: int,
    query_text: str,
    created_by: int,
    spa_name: Optional[str] = None,
    query_type_name: Optional[str] = None,
    contact_number: Optional[str] = None,
    send_admin_email: bool = True,
) -> List[Notification]:
    user = await db.get(User, created_by)
    user_name = f"{user.first_name} {user.last_name}" if user else "User"
    user_email = user.email if user else "Unknown"
    user_role = str(user.role) if user and hasattr(user, "role") else "Unknown"

    result = await db.execute(select(User).where(User.role.in_(["admin", "super_admin"])))
    admin_users = result.scalars().all()

    if not admin_users:
        logger.warning("No admin users found to notify about new query")
        return []

    notifications = []
    query_preview = query_text[:100] + "..." if len(query_text) > 100 else query_text

    for admin in admin_users:
        notification = await create_notification(
            db=db,
            user_id=admin.id,
            title="New Query Submitted",
            message=f"{user_name} ({user_role}) submitted a new query: {query_preview}",
            notification_type="query_submitted",
            metadata={
                "query_id": query_id,
                "created_by": created_by,
                "created_by_name": user_name,
                "created_by_email": user_email,
                "created_by_role": user_role,
                "spa_name": spa_name,
                "query_type_name": query_type_name,
                "contact_number": contact_number,
                "query_preview": query_preview,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
        )
        notifications.append(notification)

    if send_admin_email:
        try:
            from core.utils import send_email
            from config.settings import settings

            if not settings.SKIP_EMAIL:
                query_time = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
                subject = f"New Query Submitted - Query #{query_id}"
                body = (
                    "A new query has been submitted and requires your attention:\n\n"
                    f"Query ID: #{query_id}\n"
                    f"Submitted By: {user_name} ({user_email})\n"
                    f"User Role: {user_role}\n"
                    f"SPA: {spa_name or 'N/A'}\n"
                    f"Query Type: {query_type_name or 'N/A'}\n"
                    f"Contact Number: {contact_number or 'N/A'}\n"
                    f"Submitted At: {query_time}\n\n"
                    f"Query:\n{query_text}\n"
                )
                admin_emails = [admin.email for admin in admin_users if admin.email]
                if admin_emails:
                    await send_email(subject, body, admin_emails)
        except Exception as e:
            logger.error(f"Failed to send query notification email to admin: {e}", exc_info=True)

    return notifications


async def handle_login_tracking_task(
    user_id: int,
    user_email: str,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    status: str = "success",
    failure_reason: Optional[str] = None,
):
    async with async_session_maker() as db:
        try:
            from apps.notifications.services.activity_service import (
                log_login_activity,
                log_activity,
            )

            try:
                await log_login_activity(
                    db=db,
                    user_id=user_id,
                    ip_address=ip_address,
                    user_agent=user_agent,
                    status=status,
                    failure_reason=failure_reason,
                )
            except Exception as e:
                logger.warning(f"Error logging login activity: {e}")

            if status == "success":
                try:
                    await log_activity(
                        db=db,
                        user_id=user_id,
                        activity_type="password_login_success",
                        activity_description=f"Password login successful for {user_email}",
                        entity_type="login",
                        ip_address=ip_address,
                        user_agent=user_agent,
                    )
                except Exception as e:
                    logger.warning(f"Error logging activity: {e}")

                try:
                    await create_login_notification(
                        db=db,
                        user_id=user_id,
                        ip_address=ip_address,
                        user_agent=user_agent,
                        send_admin_email=True,
                    )
                except Exception as e:
                    logger.warning(f"Error creating notification: {e}")

        except Exception as e:
            logger.error(
                f"Critical error in login tracking task: {e}",
                exc_info=True,
            )


async def get_user_notifications(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 50,
    unread_only: bool = False,
    is_admin: bool = False,
) -> List[Notification]:
    stmt = select(Notification)

    if not is_admin:
        stmt = stmt.where(
            and_(
                or_(
                    Notification.user_id == user_id,
                    Notification.user_id.is_(None),
                ),
                Notification.is_deleted.is_(False),
            )
        )

    if unread_only:
        stmt = stmt.where(Notification.is_read.is_(False))

    result = await db.execute(
        stmt.order_by(desc(Notification.created_at)).offset(skip).limit(limit)
    )
    return list(result.scalars().all())


async def mark_notification_read(
    db: Session,
    notification_id: int,
    user_id: int,
) -> bool:
    result = await db.execute(
        select(Notification).where(Notification.id == notification_id)
    )
    notification = result.scalar_one_or_none()

    if not notification:
        return False

    if notification.user_id != user_id and notification.user_id is not None:
        return False

    notification.is_read = True
    await db.commit()
    return True


async def mark_all_notifications_read(
    db: Session,
    user_id: int,
) -> int:
    result = await db.execute(
        select(Notification).where(
            and_(
                or_(
                    Notification.user_id == user_id,
                    Notification.user_id.is_(None),
                ),
                Notification.is_read.is_(False),
            )
        )
    )
    notifications = list(result.scalars().all())

    for notification in notifications:
        notification.is_read = True

    await db.commit()
    return len(notifications)


async def get_unread_count(
    db: Session,
    user_id: int,
    is_admin: bool = False,
) -> int:
    stmt = select(func.count()).select_from(Notification).where(
        Notification.is_read.is_(False)
    )

    if not is_admin:
        stmt = stmt.where(
            and_(
                or_(
                    Notification.user_id == user_id,
                    Notification.user_id.is_(None),
                ),
                Notification.is_deleted.is_(False),
            )
        )

    result = await db.execute(stmt)
    return result.scalar_one()


async def delete_notification(
    db: Session,
    notification_id: int,
    user_id: int,
    is_admin: bool = False,
) -> bool:
    result = await db.execute(
        select(Notification).where(Notification.id == notification_id)
    )
    notification = result.scalar_one_or_none()

    if not notification:
        return False

    if not is_admin:
        if notification.user_id != user_id and notification.user_id is not None:
            return False

        notification.is_deleted = True
        notification.deleted_at = datetime.now(timezone.utc)
    else:
        await db.delete(notification)

    await db.commit()
    return True
