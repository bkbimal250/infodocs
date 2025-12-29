"""
Tutorial Service
Handles business logic for tutorials
"""
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status, UploadFile
from pathlib import Path
import uuid
import os
from datetime import datetime

from apps.tutorials.models import Tutorial
from apps.tutorials.schemas import TutorialCreate, TutorialUpdate
from core.exceptions import NotFoundError


# Video upload directory
UPLOAD_DIR = Path("uploads")
TUTORIAL_VIDEOS_DIR = UPLOAD_DIR / "tutorials"
TUTORIAL_VIDEOS_DIR.mkdir(parents=True, exist_ok=True)

# Allowed video formats
ALLOWED_VIDEO_FORMATS = {'.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'}
MAX_VIDEO_SIZE = 1024 * 1024 * 1024  # 1 GB


def save_video_file(file: UploadFile) -> dict:
    """
    Save uploaded video file and return file information
    Returns: dict with 'file_path', 'file_size', 'format'
    """
    # Validate file extension
    file_ext = Path(file.filename).suffix.lower() if file.filename else ""
    if file_ext not in ALLOWED_VIDEO_FORMATS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid video format. Allowed formats: {', '.join(ALLOWED_VIDEO_FORMATS)}"
        )
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = TUTORIAL_VIDEOS_DIR / unique_filename
    
    # Read and save file
    content = file.file.read()
    file_size = len(content)
    
    # Check file size
    if file_size > MAX_VIDEO_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Video file too large. Maximum size: {MAX_VIDEO_SIZE / (1024 * 1024 * 1024)} GB"
        )
    
    # Write file
    with open(file_path, "wb") as buffer:
        buffer.write(content)
    
    # Return relative path from uploads directory
    relative_path = file_path.relative_to(UPLOAD_DIR)
    relative_path_str = str(relative_path).replace('\\', '/')
    
    return {
        'file_path': relative_path_str,
        'file_size': file_size,
        'format': file_ext[1:] if file_ext else None  # Remove the dot
    }


def delete_video_file(file_path: str) -> bool:
    """
    Delete video file from filesystem
    Returns True if deleted, False if not found
    """
    if not file_path:
        return False
    
    try:
        full_path = UPLOAD_DIR / file_path
        if full_path.exists():
            full_path.unlink()
            return True
    except Exception as e:
        print(f"Error deleting video file {file_path}: {str(e)}")
    
    return False


async def create_tutorial(
    db: AsyncSession,
    tutorial_data: TutorialCreate,
    created_by: int,
    video_file: Optional[UploadFile] = None
) -> Tutorial:
    """Create a new tutorial"""
    # Prepare tutorial data
    tutorial_dict = tutorial_data.model_dump(exclude_unset=True)
    
    # Handle video file upload
    if video_file:
        video_info = save_video_file(video_file)
        tutorial_dict['video_file_path'] = video_info['file_path']
        tutorial_dict['video_file_size'] = video_info['file_size']
        tutorial_dict['video_format'] = video_info['format']
        # Note: video_duration would need to be extracted using a video processing library
        # For now, we'll leave it as None
    
    tutorial_dict['created_by'] = created_by
    tutorial_dict['is_deleted'] = False
    tutorial_dict['is_verified'] = False
    
    tutorial = Tutorial(**tutorial_dict)
    db.add(tutorial)
    await db.commit()
    await db.refresh(tutorial)
    return tutorial


async def get_tutorial_by_id(
    db: AsyncSession,
    tutorial_id: int,
    include_deleted: bool = False
) -> Optional[Tutorial]:
    """Get tutorial by ID"""
    query = select(Tutorial).where(Tutorial.id == tutorial_id)
    
    if not include_deleted:
        query = query.where(Tutorial.is_deleted == False)
    
    result = await db.execute(query)
    return result.scalar_one_or_none()


async def get_tutorials(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100,
    is_active: Optional[bool] = None,
    is_public: Optional[bool] = None,
    include_deleted: bool = False
) -> tuple[List[Tutorial], int]:
    """Get list of tutorials with pagination"""
    # Build query
    conditions = []
    if not include_deleted:
        conditions.append(Tutorial.is_deleted == False)
    if is_active is not None:
        conditions.append(Tutorial.is_active == is_active)
    if is_public is not None:
        conditions.append(Tutorial.is_public == is_public)
    
    # Count query
    count_query = select(func.count()).select_from(Tutorial)
    if conditions:
        count_query = count_query.where(and_(*conditions))
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Data query
    query = select(Tutorial)
    if conditions:
        query = query.where(and_(*conditions))
    query = query.order_by(Tutorial.created_at.desc()).offset(skip).limit(limit)
    
    result = await db.execute(query)
    tutorials = result.scalars().all()
    
    return tutorials, total


async def update_tutorial(
    db: AsyncSession,
    tutorial_id: int,
    tutorial_data: TutorialUpdate,
    updated_by: int,
    video_file: Optional[UploadFile] = None
) -> Tutorial:
    """Update tutorial"""
    tutorial = await get_tutorial_by_id(db, tutorial_id)
    if not tutorial:
        raise NotFoundError(f"Tutorial with ID {tutorial_id} not found")
    
    # Get update data
    update_data = tutorial_data.model_dump(exclude_unset=True)
    
    # Handle video file upload
    if video_file:
        # Delete old video file if exists
        if tutorial.video_file_path:
            delete_video_file(tutorial.video_file_path)
        
        # Save new video file
        video_info = save_video_file(video_file)
        update_data['video_file_path'] = video_info['file_path']
        update_data['video_file_size'] = video_info['file_size']
        update_data['video_format'] = video_info['format']
    
    # Update fields
    for field, value in update_data.items():
        setattr(tutorial, field, value)
    
    tutorial.updated_by = updated_by
    tutorial.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(tutorial)
    return tutorial


async def delete_tutorial(
    db: AsyncSession,
    tutorial_id: int,
    deleted_by: int,
    permanent: bool = False
) -> bool:
    """Delete tutorial (soft delete by default, permanent if specified)"""
    tutorial = await get_tutorial_by_id(db, tutorial_id, include_deleted=True)
    if not tutorial:
        raise NotFoundError(f"Tutorial with ID {tutorial_id} not found")
    
    if permanent:
        # Permanent delete - remove video file and database record
        if tutorial.video_file_path:
            delete_video_file(tutorial.video_file_path)
        await db.delete(tutorial)
        await db.commit()
        return True
    else:
        # Soft delete
        tutorial.is_deleted = True
        tutorial.deleted_by = deleted_by
        tutorial.deleted_at = datetime.utcnow()
        await db.commit()
        return True
