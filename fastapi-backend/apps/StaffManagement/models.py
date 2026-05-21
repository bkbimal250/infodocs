from datetime import datetime
import enum
import uuid
from apps.forms_app.models import SPA

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
)

from sqlalchemy.orm import relationship

from config.database import Base


# =========================================================
# ENUMS
# =========================================================

class GenderEnum(str, enum.Enum):
    male = "male"
    female = "female"
    other = "other"


class VerificationStatusEnum(str, enum.Enum):
    pending = "pending"
    verified = "verified"
    rejected = "rejected"


class EmploymentStatusEnum(str, enum.Enum):
    active = "active"
    inactive = "inactive"
    resigned = "resigned"
    terminated = "terminated"


class StaffEventTypeEnum(str, enum.Enum):
    joined = "joined"
    transferred = "transferred"
    verified = "verified"
    rejected = "rejected"
    blacklisted = "blacklisted"
    resigned = "resigned"
    terminated = "terminated"


class DocumentTypeEnum(str, enum.Enum):
    aadhaar_photo = "aadhaar_photo"
    course_certificate = "course_certificate"
    pancard = "pancard"
    passport_size_photo = "passport_size_photo"
    other = "other"


# =========================================================
# STAFF
# =========================================================

class Staff(Base):
    __tablename__ = "staff"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    staff_uuid = Column(
        String(36),
        unique=True,
        nullable=False,
        default=lambda: str(uuid.uuid4()),
        index=True
    )

    # =====================================================
    # BASIC DETAILS
    # =====================================================

    full_name = Column(
        String(255),
        nullable=False
    )

    gender = Column(
        Enum(GenderEnum),
        nullable=True
    )

    profile_photo = Column(
        String(500),
        nullable=True
    )

    # =====================================================
    # CONTACT DETAILS
    # =====================================================

    phone = Column(
        String(20),
        unique=True,
        nullable=False,
        index=True
    )

    # =====================================================
    # ADDRESS DETAILS
    # =====================================================

    address = Column(
        Text,
        nullable=True
    )

    city = Column(
        String(255),
        nullable=True
    )

    state = Column(
        String(255),
        nullable=True
    )

    pincode = Column(
        String(20),
        nullable=True
    )

    # =====================================================
    # EMPLOYMENT DETAILS
    # =====================================================

    designation = Column(
        String(255),
        nullable=True
    )

    current_spa_id = Column(
        Integer,
        ForeignKey("spas.id"),
        nullable=True,
        index=True
    )

    joining_date = Column(
        DateTime,
        nullable=True
    )

    leave_date = Column(
        DateTime,
        nullable=True
    )

    employment_status = Column(
        Enum(EmploymentStatusEnum),
        default=EmploymentStatusEnum.active,
        nullable=False,
        index=True
    )

    # =====================================================
    # VERIFICATION
    # =====================================================

    verification_status = Column(
        Enum(VerificationStatusEnum),
        default=VerificationStatusEnum.pending,
        nullable=False,
        index=True
    )

    verification_reason = Column(
        Text,
        nullable=True
    )

    verified_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    verified_at = Column(
        DateTime,
        nullable=True
    )

    # =====================================================
    # SECURITY
    # =====================================================

    is_blacklisted = Column(
        Boolean,
        default=False,
        nullable=False,
        index=True
    )

    blacklist_reason = Column(
        Text,
        nullable=True
    )

    # =====================================================
    # SYSTEM
    # =====================================================

    created_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    deleted_at = Column(
        DateTime,
        nullable=True
    )

    # =====================================================
    # RELATIONSHIPS
    # =====================================================

    current_spa = relationship(
        "SPA",
        foreign_keys=[current_spa_id],
        lazy="selectin"
    )

    documents = relationship(
        "StaffDocument",
        back_populates="staff",
        cascade="all, delete-orphan",
        lazy="selectin"
    )

    events = relationship(
        "StaffEvent",
        back_populates="staff",
        cascade="all, delete-orphan",
        lazy="selectin"
    )

    work_history = relationship(
        "WorkHistory",
        back_populates="staff",
        cascade="all, delete-orphan",
        lazy="selectin"
    )

    verification_logs = relationship(
        "StaffVerificationLog",
        back_populates="staff",
        cascade="all, delete-orphan",
        lazy="selectin"
    )


# =========================================================
# STAFF DOCUMENTS
# =========================================================

class StaffDocument(Base):
    __tablename__ = "staff_documents"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    staff_id = Column(
        Integer,
        ForeignKey("staff.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    document_type = Column(
        Enum(DocumentTypeEnum),
        nullable=False
    )

    document_number = Column(
        String(255),
        nullable=True
    )

    file_url = Column(
        String(1000),
        nullable=True
    )

    verification_status = Column(
        Enum(VerificationStatusEnum),
        default=VerificationStatusEnum.pending,
        nullable=False
    )

    uploaded_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    # =====================================================
    # RELATIONSHIPS
    # =====================================================

    staff = relationship(
        "Staff",
        back_populates="documents",
        lazy="selectin"
    )


# =========================================================
# STAFF EVENTS
# =========================================================

class StaffEvent(Base):
    __tablename__ = "staff_events"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    staff_id = Column(
        Integer,
        ForeignKey("staff.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    event_type = Column(
        Enum(StaffEventTypeEnum),
        nullable=False
    )

    spa_id = Column(
        Integer,
        ForeignKey("spas.id"),
        nullable=True
    )

    from_spa_id = Column(
        Integer,
        ForeignKey("spas.id"),
        nullable=True
    )

    to_spa_id = Column(
        Integer,
        ForeignKey("spas.id"),
        nullable=True
    )

    transfer_reason = Column(
        Text,
        nullable=True
    )

    notes = Column(
        Text,
        nullable=True
    )

    event_date = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    created_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    # =====================================================
    # RELATIONSHIPS
    # =====================================================

    staff = relationship(
        "Staff",
        back_populates="events",
        lazy="selectin"
    )


# =========================================================
# WORK HISTORY
# =========================================================

class WorkHistory(Base):
    __tablename__ = "work_history"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    staff_id = Column(
        Integer,
        ForeignKey("staff.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    spa_id = Column(
        Integer,
        ForeignKey("spas.id"),
        nullable=False
    )

    join_date = Column(
        DateTime,
        nullable=False
    )

    leave_date = Column(
        DateTime,
        nullable=True
    )

    is_transferred = Column(
        Boolean,
        default=False,
        nullable=False
    )

    notes = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    # =====================================================
    # RELATIONSHIPS
    # =====================================================

    staff = relationship(
        "Staff",
        back_populates="work_history",
        lazy="selectin"
    )


# =========================================================
# VERIFICATION LOGS
# =========================================================

class StaffVerificationLog(Base):
    __tablename__ = "staff_verification_logs"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    staff_id = Column(
        Integer,
        ForeignKey("staff.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    old_status = Column(
        Enum(VerificationStatusEnum),
        nullable=True
    )

    new_status = Column(
        Enum(VerificationStatusEnum),
        nullable=False
    )

    reason = Column(
        Text,
        nullable=True
    )

    changed_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    # =====================================================
    # RELATIONSHIPS
    # =====================================================

    staff = relationship(
        "Staff",
        back_populates="verification_logs",
        lazy="selectin"
    )