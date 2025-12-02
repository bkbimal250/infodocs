"""
Notification Service
Handles notification creation and management
"""
from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc
from datetime import datetime, timezone

from apps.users.models import Notification, LoginHistory, UserActivity, User
import logging

logger = logging.getLogger(__name__)


async def create_notification(
    db: AsyncSession,
    user_id: Optional[int],
    title: str,
    message: str,
    notification_type: str,
    metadata: Optional[Dict[str, Any]] = None
) -> Notification:
    """Create a notification"""
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type,
        meta_data=metadata or {}
    )
    db.add(notification)
    await db.commit()
    await db.refresh(notification)
    return notification


async def create_login_notification(
    db: AsyncSession,
    user_id: int,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    send_admin_email: bool = True
) -> Notification:
    """Create a login notification and optionally send email to admin"""
    user = await db.get(User, user_id)
    # Get user name safely - don't use property that might trigger lazy loading
    user_name = f"{user.first_name} {user.last_name}" if user else "User"
    user_email = user.email if user else "Unknown"
    user_role = user.role if user else "Unknown"
    
    # Create notification for the user
    notification = await create_notification(
        db=db,
        user_id=user_id,
        title="Login Successful",
        message=f"{user_name} logged in successfully",
        notification_type="login",
        metadata={
            "ip_address": ip_address,
            "user_agent": user_agent,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    )
    
    # Send email to admin if enabled
    if send_admin_email:
        try:
            # Find all admin users
            from sqlalchemy import select
            stmt = select(User).where(User.role.in_(["admin", "super_admin"]))
            result = await db.execute(stmt)
            admin_users = result.scalars().all()
            
            if admin_users:
                from core.utils import send_email
                from config.settings import settings
                
                # Don't send email if SKIP_EMAIL is enabled
                if not settings.SKIP_EMAIL:
                    login_time = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
                    subject = f"User Login Alert: {user_name}"
                    body = f"""
A user has logged into the system:

User Details:
- Name: {user_name}
- Email: {user_email}
- Role: {user_role}
- Login Time: {login_time}
- IP Address: {ip_address or 'Unknown'}
- User Agent: {user_agent or 'Unknown'}

This is an automated notification from SPADocs system.
"""
                    html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }}
        .content {{ background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }}
        .info-row {{ margin: 10px 0; padding: 10px; background: white; border-radius: 4px; }}
        .label {{ font-weight: bold; color: #667eea; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>User Login Alert</h2>
        </div>
        <div class="content">
            <p>A user has logged into the SPADocs system:</p>
            <div class="info-row">
                <span class="label">Name:</span> {user_name}
            </div>
            <div class="info-row">
                <span class="label">Email:</span> {user_email}
            </div>
            <div class="info-row">
                <span class="label">Role:</span> {user_role}
            </div>
            <div class="info-row">
                <span class="label">Login Time:</span> {login_time}
            </div>
            <div class="info-row">
                <span class="label">IP Address:</span> {ip_address or 'Unknown'}
            </div>
            <div class="info-row">
                <span class="label">User Agent:</span> {user_agent or 'Unknown'}
            </div>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">
                This is an automated notification from SPADocs system.
            </p>
        </div>
    </div>
</body>
</html>
"""
                    # Send email to all admins
                    admin_emails = [admin.email for admin in admin_users if admin.email]
                    if admin_emails:
                        await send_email(subject, body, admin_emails, html_body=html_body)
                        logger.info(f"Login notification email sent to {len(admin_emails)} admin(s)")
        except Exception as e:
            logger.error(f"Failed to send login notification email to admin: {e}", exc_info=True)
            # Don't fail the login if email fails
    
    return notification


async def create_certificate_notification(
    db: AsyncSession,
    user_id: int,
    certificate_id: int,
    certificate_type: str,
    candidate_name: str
) -> Notification:
    """Create a certificate creation notification"""
    user = await db.get(User, user_id)
    # Get user name safely - don't use property that might trigger lazy loading
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
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    )


async def create_otp_notification(
    db: AsyncSession,
    user_id: int,
    purpose: str,
    status: str = "requested",  # requested, verified, failed
    ip_address: Optional[str] = None
) -> Notification:
    """Create an OTP-related notification"""
    user = await db.get(User, user_id)
    user_name = f"{user.first_name} {user.last_name}" if user else "User"
    
    purpose_map = {
        "login": "Login",
        "password_reset": "Password Reset",
        "email_verification": "Email Verification"
    }
    purpose_display = purpose_map.get(purpose, purpose.replace("_", " ").title())
    
    if status == "requested":
        title = f"{purpose_display} OTP Requested"
        message = f"{user_name} requested an OTP for {purpose_display.lower()}"
    elif status == "verified":
        title = f"{purpose_display} OTP Verified"
        message = f"{user_name} successfully verified OTP for {purpose_display.lower()}"
    else:  # failed
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
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    )


async def create_password_reset_notification(
    db: AsyncSession,
    user_id: int,
    status: str = "requested",  # requested, completed, failed
    ip_address: Optional[str] = None
) -> Notification:
    """Create a password reset notification"""
    user = await db.get(User, user_id)
    user_name = f"{user.first_name} {user.last_name}" if user else "User"
    
    if status == "requested":
        title = "Password Reset Requested"
        message = f"{user_name} requested a password reset"
    elif status == "completed":
        title = "Password Reset Completed"
        message = f"{user_name} successfully reset their password"
    else:  # failed
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
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    )


async def get_user_notifications(
    db: AsyncSession,
    user_id: int,
    skip: int = 0,
    limit: int = 50,
    unread_only: bool = False,
    is_admin: bool = False
) -> List[Notification]:
    """Get notifications for a user
    
    Args:
        db: Database session
        user_id: User ID (for non-admin, filters by user_id; for admin, shows all)
        skip: Skip records
        limit: Limit records
        unread_only: Only return unread notifications
        is_admin: If True, show all notifications including deleted ones
    """
    stmt = select(Notification)
    
    if is_admin:
        # Admin can see all notifications (including deleted ones)
        pass
    else:
        # Non-admin users only see their own non-deleted notifications
        stmt = stmt.where(
            and_(
                or_(
                    Notification.user_id == user_id,
                    Notification.user_id.is_(None)  # System-wide notifications
                ),
                Notification.is_deleted.is_(False)  # Exclude soft-deleted
            )
        )
    
    if unread_only:
        stmt = stmt.where(Notification.is_read.is_(False))
    
    stmt = stmt.order_by(desc(Notification.created_at)).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def mark_notification_read(
    db: AsyncSession,
    notification_id: int,
    user_id: int
) -> bool:
    """Mark a notification as read"""
    notification = await db.get(Notification, notification_id)
    if not notification:
        return False
    
    # Only allow user to mark their own notifications as read
    if notification.user_id != user_id and notification.user_id is not None:
        return False
    
    notification.is_read = True
    await db.commit()
    return True


async def mark_all_notifications_read(
    db: AsyncSession,
    user_id: int
) -> int:
    """Mark all notifications as read for a user"""
    stmt = select(Notification).where(
        and_(
            or_(
                Notification.user_id == user_id,
                Notification.user_id.is_(None)
            ),
            Notification.is_read.is_(False)
        )
    )
    result = await db.execute(stmt)
    notifications = list(result.scalars().all())
    
    for notification in notifications:
        notification.is_read = True
    
    await db.commit()
    return len(notifications)


async def get_unread_count(db: AsyncSession, user_id: int, is_admin: bool = False) -> int:
    """Get count of unread notifications for a user"""
    stmt = select(Notification).where(Notification.is_read.is_(False))
    
    if not is_admin:
        # Non-admin users only count their own non-deleted notifications
        stmt = stmt.where(
            and_(
                or_(
                    Notification.user_id == user_id,
                    Notification.user_id.is_(None)
                ),
                Notification.is_deleted.is_(False)
            )
        )
    
    result = await db.execute(stmt)
    return len(list(result.scalars().all()))


async def delete_notification(
    db: AsyncSession,
    notification_id: int,
    user_id: int,
    is_admin: bool = False
) -> bool:
    """Delete a notification
    
    Args:
        db: Database session
        notification_id: Notification ID to delete
        user_id: User ID requesting deletion
        is_admin: If True, permanently delete; if False, soft delete
    
    Returns:
        True if deleted successfully, False otherwise
    """
    notification = await db.get(Notification, notification_id)
    if not notification:
        return False
    
    # Non-admin can only delete their own notifications
    if not is_admin:
        if notification.user_id != user_id and notification.user_id is not None:
            return False
        # Soft delete for non-admin
        notification.is_deleted = True
        notification.deleted_at = datetime.now(timezone.utc)
    else:
        # Hard delete for admin
        await db.delete(notification)
    
    await db.commit()
    return True

