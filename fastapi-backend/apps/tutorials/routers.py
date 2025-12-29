"""
Tutorial Router
Handles HTTP requests for tutorials
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from pathlib import Path
import os

from config.database import get_db
from core.dependencies import require_role, get_current_active_user, get_optional_current_user
from apps.users.models import User
from apps.tutorials.schemas import (
    TutorialCreate, TutorialUpdate, TutorialResponse,
    TutorialListResponse, MessageResponse
)
from apps.tutorials.services.tutorial_service import (
    create_tutorial, get_tutorial_by_id, get_tutorials,
    update_tutorial, delete_tutorial, UPLOAD_DIR
)

tutorials_router = APIRouter(prefix="/tutorials", tags=["Tutorials"])


@tutorials_router.post("", response_model=TutorialResponse, status_code=status.HTTP_201_CREATED)
async def create_tutorial_endpoint(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    thumbnail_url: Optional[str] = Form(None),
    video_url: Optional[str] = Form(None),
    is_active: bool = Form(True),
    is_public: bool = Form(True),
    video_file: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "super_admin"))
):
    """
    Create a new tutorial (Admin only)
    Can upload video file or provide external video URL
    """
    tutorial_data = TutorialCreate(
        title=title,
        description=description,
        thumbnail_url=thumbnail_url,
        video_url=video_url,
        is_active=is_active,
        is_public=is_public
    )
    
    tutorial = await create_tutorial(
        db=db,
        tutorial_data=tutorial_data,
        created_by=current_user.id,
        video_file=video_file
    )
    
    return tutorial


@tutorials_router.get("", response_model=TutorialListResponse)
async def list_tutorials(
    skip: int = 0,
    limit: int = 100,
    is_active: Optional[bool] = None,
    is_public: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    List all tutorials (Public endpoint)
    Users can see public and active tutorials
    """
    # For public access, only show active and public tutorials
    if not current_user or (hasattr(current_user.role, 'value') and current_user.role.value not in ['admin', 'super_admin']):
        is_active = True
        is_public = True
    
    tutorials, total = await get_tutorials(
        db=db,
        skip=skip,
        limit=limit,
        is_active=is_active,
        is_public=is_public,
        include_deleted=False
    )
    
    return TutorialListResponse(tutorials=tutorials, total=total)


@tutorials_router.get("/{tutorial_id}", response_model=TutorialResponse)
async def get_tutorial(
    tutorial_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get tutorial by ID (Public endpoint)
    """
    tutorial = await get_tutorial_by_id(db, tutorial_id)
    if not tutorial:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tutorial not found"
        )
    
    # Check if tutorial is accessible
    if tutorial.is_deleted or (not tutorial.is_active) or (not tutorial.is_public):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tutorial not found"
        )
    
    return tutorial


@tutorials_router.put("/{tutorial_id}", response_model=TutorialResponse)
async def update_tutorial_endpoint(
    tutorial_id: int,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    thumbnail_url: Optional[str] = Form(None),
    video_url: Optional[str] = Form(None),
    is_active: Optional[bool] = Form(None),
    is_public: Optional[bool] = Form(None),
    video_file: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "super_admin"))
):
    """
    Update tutorial (Admin only)
    """
    tutorial_data = TutorialUpdate(
        title=title,
        description=description,
        thumbnail_url=thumbnail_url,
        video_url=video_url,
        is_active=is_active,
        is_public=is_public
    )
    
    tutorial = await update_tutorial(
        db=db,
        tutorial_id=tutorial_id,
        tutorial_data=tutorial_data,
        updated_by=current_user.id,
        video_file=video_file
    )
    
    return tutorial


@tutorials_router.delete("/{tutorial_id}", response_model=MessageResponse)
async def delete_tutorial_endpoint(
    tutorial_id: int,
    permanent: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "super_admin"))
):
    """
    Delete tutorial (Admin only)
    By default, soft delete. Set permanent=true for permanent deletion.
    """
    await delete_tutorial(
        db=db,
        tutorial_id=tutorial_id,
        deleted_by=current_user.id,
        permanent=permanent
    )
    
    return MessageResponse(message="Tutorial deleted successfully")


@tutorials_router.get("/{tutorial_id}/video")
async def download_tutorial_video(
    tutorial_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Download tutorial video file (Public endpoint)
    """
    tutorial = await get_tutorial_by_id(db, tutorial_id)
    if not tutorial:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tutorial not found"
        )
    
    # Check if tutorial is accessible
    if tutorial.is_deleted or (not tutorial.is_active) or (not tutorial.is_public):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tutorial not found"
        )
    
    if not tutorial.video_file_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video file not found"
        )
    
    # Construct full file path
    file_path = UPLOAD_DIR / tutorial.video_file_path
    
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video file not found on server"
        )
    
    # Determine media type
    import mimetypes
    media_type, _ = mimetypes.guess_type(str(file_path))
    if not media_type:
        media_type = "video/mp4"  # Default
    
    return FileResponse(
        path=str(file_path),
        media_type=media_type,
        filename=f"{tutorial.title}{Path(tutorial.video_file_path).suffix}",
        headers={
            "Content-Disposition": f'attachment; filename="{tutorial.title}{Path(tutorial.video_file_path).suffix}"'
        }
    )


@tutorials_router.get("/{tutorial_id}/video/stream")
async def stream_tutorial_video(
    tutorial_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Stream tutorial video (Public endpoint)
    Supports range requests for video streaming
    """
    tutorial = await get_tutorial_by_id(db, tutorial_id)
    if not tutorial:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tutorial not found"
        )
    
    # Check if tutorial is accessible
    if tutorial.is_deleted or (not tutorial.is_active) or (not tutorial.is_public):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tutorial not found"
        )
    
    if not tutorial.video_file_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video file not found"
        )
    
    # Construct full file path
    file_path = UPLOAD_DIR / tutorial.video_file_path
    
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video file not found on server"
        )
    
    # Determine media type
    import mimetypes
    media_type, _ = mimetypes.guess_type(str(file_path))
    if not media_type:
        media_type = "video/mp4"  # Default
    
    # Use FileResponse which handles range requests automatically
    return FileResponse(
        path=str(file_path),
        media_type=media_type,
        filename=f"{tutorial.title}{Path(tutorial.video_file_path).suffix}"
    )
