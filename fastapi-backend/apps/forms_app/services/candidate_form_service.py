"""
Candidate Form Service
Business logic for candidate form submissions
"""
from typing import Optional, List
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from apps.forms_app.models import CandidateForm
from apps.forms_app.schemas import CandidateFormCreate
from core.exceptions import NotFoundError


async def create_candidate_form(
    db: AsyncSession, 
    form_data: CandidateFormCreate, 
    file_paths: Optional[dict] = None,
    created_by: Optional[int] = None
) -> CandidateForm:
    """Create a new candidate form submission"""
    form_dict = form_data.model_dump()
    
    # Add file paths if provided
    if file_paths:
        for key in [
            'passport_size_photo',
            'age_proof_document',
            'aadhar_card_front',
            'aadhar_card_back',
            'pan_card',
            'signature',
            'documents',
        ]:
            if key in file_paths:
                form_dict[key] = file_paths[key]
    
    # Add creator tracking
    if created_by:
        form_dict['created_by'] = created_by
    
    candidate_form = CandidateForm(**form_dict)
    db.add(candidate_form)
    await db.commit()
    await db.refresh(candidate_form)
    
    return candidate_form


async def get_candidate_form_by_id(db: AsyncSession, form_id: int) -> Optional[CandidateForm]:
    """Get candidate form by ID"""
    from sqlalchemy.orm import selectinload
    
    stmt = select(CandidateForm).options(selectinload(CandidateForm.spa)).where(CandidateForm.id == form_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_all_candidate_forms(
    db: AsyncSession, 
    skip: int = 0, 
    limit: int = 100,
    created_by: Optional[int] = None
) -> List[CandidateForm]:
    """Get all candidate forms with pagination, optionally filtered by created_by"""
    from sqlalchemy.orm import selectinload
    
    stmt = select(CandidateForm).options(selectinload(CandidateForm.spa))
    if created_by is not None:
        stmt = stmt.where(CandidateForm.created_by == created_by)
    stmt = stmt.order_by(CandidateForm.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def update_candidate_form(
    db: AsyncSession,
    form_id: int,
    form_data: dict,
    file_paths: Optional[dict] = None
) -> Optional[CandidateForm]:
    """Update a candidate form submission"""
    form = await get_candidate_form_by_id(db, form_id)
    if not form:
        return None
    
    # Update fields
    for key, value in form_data.items():
        if hasattr(form, key) and value is not None:
            setattr(form, key, value)
    
    # Update file paths if provided
    if file_paths:
        for key in [
            'passport_size_photo',
            'age_proof_document',
            'aadhar_card_front',
            'aadhar_card_back',
            'pan_card',
            'signature',
            'documents',
        ]:
            if key in file_paths:
                setattr(form, key, file_paths[key])
    
    await db.commit()
    await db.refresh(form)
    return form


async def delete_candidate_form(db: AsyncSession, form_id: int) -> bool:
    """Delete a candidate form submission"""
    from sqlalchemy import delete
    
    form = await get_candidate_form_by_id(db, form_id)
    if not form:
        return False
    
    stmt = delete(CandidateForm).where(CandidateForm.id == form_id)
    await db.execute(stmt)
    await db.commit()
    return True


async def get_all_candidate_forms_with_users(db: AsyncSession, skip: int = 0, limit: int = 100):
    """Get all candidate forms with user and SPA information"""
    from apps.users.models import User
    from sqlalchemy.orm import selectinload
    
    stmt = select(CandidateForm).options(selectinload(CandidateForm.spa)).offset(skip).limit(limit).order_by(CandidateForm.created_at.desc())
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


async def get_forms_statistics(db: AsyncSession):
    """Get forms statistics: total, by SPA, by user, by type"""
    from sqlalchemy import func
    from apps.users.models import User
    from apps.forms_app.models import SPA, Hiring_Form
    
    # Candidate forms statistics
    candidate_total_stmt = select(func.count(CandidateForm.id))
    candidate_result = await db.execute(candidate_total_stmt)
    candidate_total = candidate_result.scalar() or 0
    
    # Hiring forms statistics
    hiring_total_stmt = select(func.count(Hiring_Form.id))
    hiring_result = await db.execute(hiring_total_stmt)
    hiring_total = hiring_result.scalar() or 0
    
    # By SPA - Candidate forms
    spa_candidate_stmt = select(CandidateForm.spa_id, func.count(CandidateForm.id)).group_by(CandidateForm.spa_id)
    spa_candidate_result = await db.execute(spa_candidate_stmt)
    spa_candidate_counts = {spa_id: count for spa_id, count in spa_candidate_result.all() if spa_id}
    
    # By SPA - Hiring forms
    spa_hiring_stmt = select(Hiring_Form.spa_id, func.count(Hiring_Form.id)).group_by(Hiring_Form.spa_id)
    spa_hiring_result = await db.execute(spa_hiring_stmt)
    spa_hiring_counts = {spa_id: count for spa_id, count in spa_hiring_result.all() if spa_id}
    
    # Get SPA details
    spa_ids = set(list(spa_candidate_counts.keys()) + list(spa_hiring_counts.keys()))
    spa_details = {}
    if spa_ids:
        spa_stmt = select(SPA).where(SPA.id.in_(spa_ids))
        spa_result = await db.execute(spa_stmt)
        for spa in spa_result.scalars().all():
            spa_details[spa.id] = {
                "id": spa.id,
                "name": spa.name,
                "city": spa.city,
                "candidate_count": spa_candidate_counts.get(spa.id, 0),
                "hiring_count": spa_hiring_counts.get(spa.id, 0),
                "total_count": spa_candidate_counts.get(spa.id, 0) + spa_hiring_counts.get(spa.id, 0)
            }
    
    # By User - Candidate forms
    user_candidate_stmt = select(CandidateForm.created_by, func.count(CandidateForm.id)).group_by(CandidateForm.created_by)
    user_candidate_result = await db.execute(user_candidate_stmt)
    user_candidate_counts = {user_id: count for user_id, count in user_candidate_result.all() if user_id}
    
    # By User - Hiring forms
    user_hiring_stmt = select(Hiring_Form.created_by, func.count(Hiring_Form.id)).group_by(Hiring_Form.created_by)
    user_hiring_result = await db.execute(user_hiring_stmt)
    user_hiring_counts = {user_id: count for user_id, count in user_hiring_result.all() if user_id}
    
    # Get user details
    user_ids = set(list(user_candidate_counts.keys()) + list(user_hiring_counts.keys()))
    user_details = {}
    if user_ids:
        user_stmt = select(User).where(User.id.in_(user_ids))
        user_result = await db.execute(user_stmt)
        for user in user_result.scalars().all():
            user_details[user.id] = {
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "candidate_count": user_candidate_counts.get(user.id, 0),
                "hiring_count": user_hiring_counts.get(user.id, 0),
                "total_count": user_candidate_counts.get(user.id, 0) + user_hiring_counts.get(user.id, 0)
            }
    
    return {
        "total_candidate_forms": candidate_total,
        "total_hiring_forms": hiring_total,
        "total_forms": candidate_total + hiring_total,
        "by_spa": list(spa_details.values()),
        "by_user": list(user_details.values())
    }