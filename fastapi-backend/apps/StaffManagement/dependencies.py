"""
Staff Management Dependencies
Provides database session injection and role-based route access controls.
"""
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession as Session
from config.database import get_db
from core.dependencies import get_current_active_user, require_role
from apps.users.models import User


# Re-export get_db for cleaner internal imports
db_dependency = Depends(get_db)

# Authentication guards
current_user_dependency = Depends(get_current_active_user)

# Role guards
admin_only = Depends(require_role("admin", "super_admin"))
super_admin_only = Depends(require_role("super_admin"))
