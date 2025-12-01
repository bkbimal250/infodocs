"""
User Models for MySQL (SQLAlchemy ORM)
"""
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime,
    Enum as SQLEnum, ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum as PyEnum
from config.database import Base


class UserRole(str, PyEnum):
    """User role enumeration"""
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    SPA_MANAGER = "spa_manager"
    HR = "hr"
    USER = "user"   # <-- use this instead of wrong 'CANDIDATE'


class User(Base):
    """User SQLAlchemy model"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)

    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)

    password_hash = Column(String(255), nullable=False)

    # Fixed default role (previous incorrect: UserRole.CANDIDATE)
    # Use native_enum=False to store as VARCHAR and handle enum values properly
    role = Column(SQLEnum(UserRole, native_enum=False, length=20), default=UserRole.USER, nullable=False)

    phone_number = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)

    last_login_at = Column(DateTime(timezone=True), nullable=True)  # Track last login

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(),
                        onupdate=func.now(), nullable=False)

    # Relationship to OTP table
    otps = relationship(
        "OTP",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    
    # Relationships for tracking
    login_history = relationship("LoginHistory", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    activities = relationship("UserActivity", back_populates="user", cascade="all, delete-orphan")

    @property
    def full_name(self) -> str:
        """Return full name of the user."""
        return f"{self.first_name} {self.last_name}".strip()


class OTP(Base):
    """OTP SQLAlchemy model for email/phone/login verification"""
    __tablename__ = "otps"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    code = Column(String(10), nullable=False)
    purpose = Column(String(50), nullable=False)  
    # examples: "email_verification", "password_reset", "login"

    is_used = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)

    # Relationship to User
    user = relationship("User", back_populates="otps")


class LoginHistory(Base):
    """Login History Model - Track user login activities"""
    __tablename__ = "login_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)  # Nullable for failed logins
    
    ip_address = Column(String(45), nullable=True)  # IPv6 can be up to 45 chars
    user_agent = Column(String(500), nullable=True)
    login_status = Column(String(20), default="success", nullable=False)  # success, failed
    failure_reason = Column(String(255), nullable=True)  # If login failed
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationship to User
    user = relationship("User", back_populates="login_history")


class Notification(Base):
    """Notification Model - System notifications for users"""
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    # user_id can be NULL for system-wide notifications
    
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), nullable=False)  # login, certificate_created, form_submitted, etc.
    is_read = Column(Boolean, default=False, nullable=False)
    meta_data = Column(JSON, nullable=True)  # Additional data (certificate_id, form_id, etc.) - renamed from 'metadata' to avoid SQLAlchemy conflict
    
    # Soft delete fields
    is_deleted = Column(Boolean, default=False, nullable=False, index=True)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationship to User
    user = relationship("User", back_populates="notifications")


class UserActivity(Base):
    """User Activity Model - Track all user activities"""
    __tablename__ = "user_activities"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    activity_type = Column(String(50), nullable=False)  # certificate_created, form_submitted, hiring_submitted, etc.
    activity_description = Column(Text, nullable=False)
    entity_type = Column(String(50), nullable=True)  # certificate, form, hiring, etc.
    entity_id = Column(Integer, nullable=True)  # ID of the related entity
    meta_data = Column(JSON, nullable=True)  # Additional activity data - renamed from 'metadata' to avoid SQLAlchemy conflict
    
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    
    # Soft delete fields
    is_deleted = Column(Boolean, default=False, nullable=False, index=True)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationship to User
    user = relationship("User", back_populates="activities")
