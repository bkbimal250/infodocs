"""
Activity Service
Handles user activity tracking
"""
from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, and_
from datetime import datetime, timezone

from apps.users.models import UserActivity, LoginHistory
import logging

logger = logging.getLogger(__name__)


async def log_activity(
    db: AsyncSession,
    user_id: int,
    activity_type: str,
    activity_description: str,
    entity_type: Optional[str] = None,
    entity_id: Optional[int] = None,
    metadata: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None
) -> UserActivity:
    """Log a user activity"""
    activity = UserActivity(
        user_id=user_id,
        activity_type=activity_type,
        activity_description=activity_description,
        entity_type=entity_type,
        entity_id=entity_id,
        meta_data=metadata or {},
        ip_address=ip_address,
        user_agent=user_agent
    )
    db.add(activity)
    await db.commit()
    await db.refresh(activity)
    return activity


async def log_login_activity(
    db: AsyncSession,
    user_id: int,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    status: str = "success",
    failure_reason: Optional[str] = None
) -> LoginHistory:
    """Log a login activity"""
    login_history = LoginHistory(
        user_id=user_id,
        ip_address=ip_address,
        user_agent=user_agent,
        login_status=status,
        failure_reason=failure_reason
    )
    db.add(login_history)
    await db.commit()
    await db.refresh(login_history)
    return login_history


async def get_user_activities(
    db: AsyncSession,
    user_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    is_admin: bool = False
) -> List[UserActivity]:
    """Get user activities
    
    Args:
        db: Database session
        user_id: User ID (for non-admin, filters by user_id; for admin, can be None to show all)
        skip: Skip records
        limit: Limit records
        is_admin: If True, show all activities including deleted ones
    """
    stmt = select(UserActivity)
    
    if is_admin:
        # Admin can see all activities (including deleted ones)
        if user_id:
            stmt = stmt.where(UserActivity.user_id == user_id)
    else:
        # Non-admin users only see their own non-deleted activities
        if user_id:
            stmt = stmt.where(
                and_(
                    UserActivity.user_id == user_id,
                    UserActivity.is_deleted.is_(False)  # Exclude soft-deleted
                )
            )
        else:
            # Non-admin without user_id should not see anything
            stmt = stmt.where(UserActivity.id == -1)  # Return empty result
    
    stmt = stmt.order_by(desc(UserActivity.created_at)).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def delete_activity(
    db: AsyncSession,
    activity_id: int,
    user_id: int,
    is_admin: bool = False
) -> bool:
    """Delete an activity
    
    Args:
        db: Database session
        activity_id: Activity ID to delete
        user_id: User ID requesting deletion
        is_admin: If True, permanently delete; if False, soft delete
    
    Returns:
        True if deleted successfully, False otherwise
    """
    activity = await db.get(UserActivity, activity_id)
    if not activity:
        return False
    
    # Non-admin can only delete their own activities
    if not is_admin:
        if activity.user_id != user_id:
            return False
        # Soft delete for non-admin
        activity.is_deleted = True
        activity.deleted_at = datetime.now(timezone.utc)
    else:
        # Hard delete for admin
        await db.delete(activity)
    
    await db.commit()
    return True


async def get_login_history(
    db: AsyncSession,
    user_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100
) -> List[LoginHistory]:
    """Get login history (all users if user_id is None - admin only)"""
    stmt = select(LoginHistory)
    
    if user_id:
        stmt = stmt.where(LoginHistory.user_id == user_id)
    
    stmt = stmt.order_by(desc(LoginHistory.created_at)).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return list(result.scalars().all())

