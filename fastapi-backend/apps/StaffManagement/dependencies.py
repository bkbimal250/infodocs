"""
Staff Management Dependencies
Provides database session injection and role-based route access controls.
"""
from fastapi import Depends, HTTPException, Path, status
from sqlalchemy.ext.asyncio import AsyncSession as Session
from config.database import get_db
from core.dependencies import get_current_active_user, require_role
from apps.StaffManagement.repositories.staff_repository import StaffRepository
from apps.users.models import User


# Re-export get_db for cleaner internal imports
db_dependency = Depends(get_db)

# Authentication guards
current_user_dependency = Depends(get_current_active_user)

# Role guards
admin_only = Depends(require_role("admin", "super_admin"))
super_admin_only = Depends(require_role("super_admin"))


async def verify_staff_permission(
    staff_uuid: str = Path(..., description="Unique staff UUID identifier"),
    db: Session = db_dependency,
    current_user: User = current_user_dependency,
) -> User:
    role = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)

    if role in {"admin", "super_admin"}:
        return current_user

    if role == "spa_manager":
        staff = await StaffRepository.get_by_uuid(db, staff_uuid, include_relations=False)
        if staff and staff.created_by == current_user.id:
            return current_user

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Only admins, super admins, or the manager who created this staff can verify staff.",
    )


verify_staff_permission_dependency = Depends(verify_staff_permission)
