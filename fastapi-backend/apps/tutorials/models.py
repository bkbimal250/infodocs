from sqlalchemy import (
    Column, Integer, String, Text, DateTime,
    Boolean, ForeignKey, BigInteger
)
from sqlalchemy.sql import func

from config.database import Base


class Tutorial(Base):
    __tablename__ = "tutorials"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # -----------------------------
    # Basic Info
    # -----------------------------
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    # Thumbnail for tutorial listing
    thumbnail_url = Column(String(500), nullable=True)
    
    # -----------------------------
    # Video Information
    # -----------------------------
    video_file_path = Column(String(500), nullable=True)  # Path to uploaded video file
    video_url = Column(String(500), nullable=True)  # External video URL (YouTube, Vimeo, etc.)
    video_file_size = Column(BigInteger, nullable=True)  # File size in bytes
    video_duration = Column(Integer, nullable=True)  # Duration in seconds
    video_format = Column(String(50), nullable=True)  # mp4, webm, etc.

    # -----------------------------
    # Visibility & Status
    # -----------------------------
    is_active = Column(Boolean, default=True, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)
    is_public = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)

    # -----------------------------
    # Audit Fields
    # -----------------------------
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    created_by = Column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True, index=True
    )
    updated_by = Column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True, index=True
    )

    deleted_at = Column(DateTime(timezone=True), nullable=True)
    deleted_by = Column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True, index=True
    )

    verified_at = Column(DateTime(timezone=True), nullable=True)
    verified_by = Column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True, index=True
    )

    def __repr__(self):
        return f"<Tutorial(id={self.id}, title='{self.title}')>"
