"""
Notifications Routers
API endpoints for notifications
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from config.database import get_db
from apps.users.models import User
from core.dependencies import get_current_active_user
from apps.notifications.services.notification_service import (
    get_user_notifications,
    mark_notification_read,
    mark_all_notifications_read,
    get_unread_count,
    delete_notification
)
from apps.notifications.services.activity_service import (
    get_user_activities,
    get_login_history,
    delete_activity
)

notifications_router = APIRouter()


@notifications_router.get("")
async def list_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    unread_only: bool = Query(False),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List user notifications (admin sees all, others see only their own non-deleted)"""
    is_admin = current_user.role in ["admin", "super_admin"]
    notifications = await get_user_notifications(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        unread_only=unread_only,
        is_admin=is_admin
    )
    
    # Convert to dict format for JSON response
    return [
        {
            "id": n.id,
            "user_id": n.user_id,
            "title": n.title,
            "message": n.message,
            "notification_type": n.notification_type,
            "is_read": n.is_read,
            "is_deleted": n.is_deleted,
            "deleted_at": n.deleted_at.isoformat() if n.deleted_at else None,
            "meta_data": n.meta_data or {},
            "created_at": n.created_at.isoformat() if n.created_at else None,
        }
        for n in notifications
    ]


@notifications_router.get("/unread-count")
async def get_unread_notifications_count(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get count of unread notifications"""
    is_admin = current_user.role in ["admin", "super_admin"]
    count = await get_unread_count(db=db, user_id=current_user.id, is_admin=is_admin)
    return {"unread_count": count}


@notifications_router.patch("/{notification_id}/read")
async def mark_notification_as_read(
    notification_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Mark a notification as read"""
    success = await mark_notification_read(
        db=db,
        notification_id=notification_id,
        user_id=current_user.id
    )
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found or access denied")
    return {"message": "Notification marked as read"}


@notifications_router.patch("/read-all")
async def mark_all_notifications_as_read(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Mark all notifications as read"""
    count = await mark_all_notifications_read(db=db, user_id=current_user.id)
    return {"message": f"{count} notifications marked as read", "count": count}


@notifications_router.delete("/{notification_id}")
async def delete_notification_endpoint(
    notification_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a notification (soft delete for non-admin, hard delete for admin)"""
    is_admin = current_user.role in ["admin", "super_admin"]
    success = await delete_notification(
        db=db,
        notification_id=notification_id,
        user_id=current_user.id,
        is_admin=is_admin
    )
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found or access denied")
    return {"message": "Notification deleted successfully"}


@notifications_router.get("/activities")
async def list_user_activities(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List user activities (admin sees all, others see only their own non-deleted)"""
    is_admin = current_user.role in ["admin", "super_admin"]
    activities = await get_user_activities(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        is_admin=is_admin
    )
    
    # Convert to dict format for JSON response
    return [
        {
            "id": a.id,
            "user_id": a.user_id,
            "activity_type": a.activity_type,
            "activity_description": a.activity_description,
            "entity_type": a.entity_type,
            "entity_id": a.entity_id,
            "is_deleted": a.is_deleted,
            "deleted_at": a.deleted_at.isoformat() if a.deleted_at else None,
            "meta_data": a.meta_data or {},
            "ip_address": a.ip_address,
            "user_agent": a.user_agent,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        }
        for a in activities
    ]


@notifications_router.get("/login-history")
async def list_login_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List user login history"""
    history = await get_login_history(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit
    )
    
    # Convert to dict format for JSON response
    return [
        {
            "id": h.id,
            "user_id": h.user_id,
            "ip_address": h.ip_address,
            "user_agent": h.user_agent,
            "login_status": h.login_status,
            "failure_reason": h.failure_reason,
            "created_at": h.created_at.isoformat() if h.created_at else None,
        }
        for h in history
    ]


@notifications_router.delete("/activities/{activity_id}")
async def delete_activity_endpoint(
    activity_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete an activity (soft delete for non-admin, hard delete for admin)"""
    is_admin = current_user.role in ["admin", "super_admin"]
    success = await delete_activity(
        db=db,
        activity_id=activity_id,
        user_id=current_user.id,
        is_admin=is_admin
    )
    if not success:
        raise HTTPException(status_code=404, detail="Activity not found or access denied")
    return {"message": "Activity deleted successfully"}
