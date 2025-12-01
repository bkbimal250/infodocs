"""
Hiring Form Service
Business logic for hiring form submissions
"""
from typing import Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from apps.forms_app.models import Hiring_Form
from core.exceptions import NotFoundError


async def create_hiring_form(
    db: AsyncSession,
    spa_id: Optional[int],
    spa_name_text: Optional[str],
    for_role: str,
    description: str,
    required_experience: str,
    required_education: str,
    required_skills: str,
    created_by: Optional[int] = None
) -> Hiring_Form:
    """Create a new hiring form submission"""
    hiring_form = Hiring_Form(
        spa_id=spa_id,
        for_role=for_role,
        description=description,
        required_experience=required_experience,
        required_education=required_education,
        required_skills=required_skills,
        created_by=created_by,
    )
    
    db.add(hiring_form)
    await db.commit()
    await db.refresh(hiring_form)
    
    return hiring_form


async def get_hiring_form_by_id(db: AsyncSession, form_id: int) -> Optional[Hiring_Form]:
    """Get hiring form by ID with SPA relationship"""
    from sqlalchemy.orm import selectinload
    stmt = select(Hiring_Form).options(selectinload(Hiring_Form.spa)).where(Hiring_Form.id == form_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_all_hiring_forms(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100,
    created_by: Optional[int] = None,
    exclude_hr_admin: bool = False
) -> list[Hiring_Form]:
    """Get all hiring forms with pagination and SPA relationship, optionally filtered by created_by
    
    Args:
        created_by: Filter by specific user ID
        exclude_hr_admin: If True, exclude forms created by HR, admin, or super_admin users
    """
    from sqlalchemy.orm import selectinload
    from apps.users.models import User
    
    stmt = select(Hiring_Form).options(selectinload(Hiring_Form.spa))
    
    if created_by is not None:
        stmt = stmt.where(Hiring_Form.created_by == created_by)
    elif exclude_hr_admin:
        # Exclude forms created by HR, admin, or super_admin
        # Use left join to handle NULL created_by, then filter
        # Subquery approach: get user IDs that are HR/admin/super_admin
        hr_admin_user_ids_stmt = select(User.id).where(
            User.role.in_(["hr", "admin", "super_admin"])
        )
        hr_admin_user_ids_result = await db.execute(hr_admin_user_ids_stmt)
        hr_admin_user_ids = [row[0] for row in hr_admin_user_ids_result.all()]
        
        if hr_admin_user_ids:
            # Exclude forms where created_by is in the list of HR/admin/super_admin user IDs
            stmt = stmt.where(
                (Hiring_Form.created_by.is_(None)) | 
                (~Hiring_Form.created_by.in_(hr_admin_user_ids))
            )
        # If no HR/admin users exist, show all forms (no filtering needed)
    
    stmt = stmt.offset(skip).limit(limit).order_by(Hiring_Form.created_at.desc())
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def update_hiring_form(
    db: AsyncSession,
    form_id: int,
    spa_id: Optional[int] = None,
    for_role: Optional[str] = None,
    description: Optional[str] = None,
    required_experience: Optional[str] = None,
    required_education: Optional[str] = None,
    required_skills: Optional[str] = None
) -> Optional[Hiring_Form]:
    """Update a hiring form submission"""
    form = await get_hiring_form_by_id(db, form_id)
    if not form:
        return None
    
    if spa_id is not None:
        form.spa_id = spa_id
    if for_role is not None:
        form.for_role = for_role
    if description is not None:
        form.description = description
    if required_experience is not None:
        form.required_experience = required_experience
    if required_education is not None:
        form.required_education = required_education
    if required_skills is not None:
        form.required_skills = required_skills
    
    await db.commit()
    await db.refresh(form)
    return form


async def delete_hiring_form(db: AsyncSession, form_id: int) -> bool:
    """Delete a hiring form submission"""
    from sqlalchemy import delete
    
    form = await get_hiring_form_by_id(db, form_id)
    if not form:
        return False
    
    stmt = delete(Hiring_Form).where(Hiring_Form.id == form_id)
    await db.execute(stmt)
    await db.commit()
    return True


async def get_all_hiring_forms_with_users(db: AsyncSession, skip: int = 0, limit: int = 100):
    """Get all hiring forms with user and SPA information"""
    from apps.users.models import User
    from sqlalchemy.orm import selectinload
    
    stmt = select(Hiring_Form).options(selectinload(Hiring_Form.spa)).offset(skip).limit(limit).order_by(Hiring_Form.created_at.desc())
    result = await db.execute(stmt)
    forms = list(result.scalars().all())
    
    # Get user information
    user_ids = {form.created_by for form in forms if form.created_by}
    if user_ids:
        user_stmt = select(User).where(User.id.in_(user_ids))
        user_result = await db.execute(user_stmt)
        users = {user.id: user for user in user_result.scalars().all()}
        
        # Attach user info to forms
        for form in forms:
            if form.created_by and form.created_by in users:
                form.creator = users[form.created_by]
    
    return forms
