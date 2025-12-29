from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class TutorialBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    video_url: Optional[str] = None  # External video URL
    is_active: bool = True
    is_public: bool = True


class TutorialCreate(TutorialBase):
    pass


class TutorialUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    video_url: Optional[str] = None
    is_active: Optional[bool] = None
    is_public: Optional[bool] = None


class TutorialResponse(TutorialBase):
    id: int
    video_file_path: Optional[str] = None
    video_file_size: Optional[int] = None
    video_duration: Optional[int] = None
    video_format: Optional[str] = None
    is_verified: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    
    class Config:
        from_attributes = True


class TutorialListResponse(BaseModel):
    tutorials: List[TutorialResponse]
    total: int


class MessageResponse(BaseModel):
    message: str
