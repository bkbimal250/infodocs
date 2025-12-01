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
    user_agent: Optional[str] = None
) -> Notification:
    """Create a login notification"""
    user = await db.get(User, user_id)
    # Get user name safely - don't use property that might trigger lazy loading
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
            "timestamp": datetime.now().isoformat()
        }
    )


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
            "candidate_name": candidate_name
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

