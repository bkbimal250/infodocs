from sqlalchemy import (
    Column,
    String,
    DateTime,
    Enum,
    ForeignKey,
    Boolean,
    Text,
    Index,
    Integer,
    BigInteger,
)

from sqlalchemy.orm import relationship
from sqlalchemy.orm import synonym
from datetime import datetime
import enum
import uuid

from config.database import Base


# =========================================================
# ENUMS
# =========================================================

class VerificationStatusEnum(str, enum.Enum):
    pending = "pending"
    verified = "verified"
    rejected = "rejected"


class EmploymentStatusEnum(str, enum.Enum):
    active = "active"
    inactive = "inactive"
    left = "left"


class StaffEventTypeEnum(str, enum.Enum):
    joined = "joined"
    transferred = "transferred"
    resigned = "resigned"
    rejoined = "rejoined"


class DocumentTypeEnum(str, enum.Enum):
    aadhaar = "aadhaar"
    pan = "pan"
    passport_photo = "passport_photo"
    course_certificate = "course_certificate"


# =========================================================
# STAFF MASTER TABLE
# =========================================================

class Staff(Base):
    __tablename__ = "staff"

    # =====================================================
    # PRIMARY KEY
    # =====================================================

    id = Column(
        BigInteger,
        primary_key=True,
        index=True,
        autoincrement=True
    )

    # =====================================================
    # UNIQUE IDENTITY
    # =====================================================

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
        nullable=False,
        index=True
    )

    gender = Column(
        String(20),
        nullable=True
    )

    dob = Column(
        DateTime,
        nullable=True
    )

    profile_photo = Column(
        String(500),
        nullable=True
    )

    # =====================================================
    # CONTACT
    # =====================================================

    phone = Column(
        String(20),
        nullable=True,
        unique=True,
        index=True
    )

    alternate_phone = Column(
        String(20),
        nullable=True
    )

    emergency_contact_name = Column(
        String(255),
        nullable=True
    )

    emergency_contact_number = Column(
        String(20),
        nullable=True
    )

    # =====================================================
    # ADDRESS
    # =====================================================

    address = Column(
        Text,
        nullable=True
    )

    city = Column(
        String(100),
        nullable=True,
        index=True
    )

    state = Column(
        String(100),
        nullable=True
    )

    pincode = Column(
        String(20),
        nullable=True
    )

    # =====================================================
    # IDENTITY DETAILS
    # =====================================================

    # Legacy column names are kept for database compatibility.
    # Values are stored directly so managers can complete fast entry.

    aadhaar_hash = Column(
        String(255),
        unique=True,
        nullable=True
    )

    aadhaar_last4 = Column(
        String(4),
        nullable=True
    )

    pan_hash = Column(
        String(255),
        unique=True,
        nullable=True
    )

    pan_last4 = Column(
        String(4),
        nullable=True
    )

    # Backward-compatible Python aliases for the simplified entry flow.
    # The database column names are legacy, but values are now stored directly.
    aadhaar_number = synonym("aadhaar_hash")
    pan_number = synonym("pan_hash")

    # =====================================================
    # EMPLOYMENT
    # =====================================================

    designation = Column(
        String(100),
        nullable=True
    )

    current_spa_id = Column(
        Integer,
        ForeignKey("spas.id", ondelete="SET NULL"),
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

    # =====================================================
    # VERIFICATION
    # =====================================================

    verification_status = Column(
        Enum(
            VerificationStatusEnum,
            native_enum=False,
            length=30
        ),
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
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )

    verified_at = Column(
        DateTime,
        nullable=True
    )

    # =====================================================
    # EMPLOYMENT STATUS
    # =====================================================

    employment_status = Column(
        Enum(
            EmploymentStatusEnum,
            native_enum=False,
            length=20
        ),
        default=EmploymentStatusEnum.inactive,
        nullable=False,
        index=True
    )

    # =====================================================
    # BLACKLIST
    # =====================================================

    is_blacklisted = Column(
        Boolean,
        default=False
    )

    blacklist_reason = Column(
        Text,
        nullable=True
    )

    # =====================================================
    # SOFT DELETE
    # =====================================================

    deleted_at = Column(
        DateTime,
        nullable=True,
        index=True
    )

    # =====================================================
    # METADATA
    # =====================================================

    created_by = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        index=True
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    # =====================================================
    # RELATIONSHIPS
    # =====================================================

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

    spa = relationship(
        "SPA",
        foreign_keys=[current_spa_id],
        backref="staff_members"
    )

    # =====================================================
    # INDEXES
    # =====================================================

    __table_args__ = (
        Index("idx_staff_phone", "phone"),
        Index("idx_staff_verification", "verification_status"),
        Index("idx_staff_employment", "employment_status"),
        Index("idx_staff_blacklisted", "is_blacklisted"),
        Index("idx_staff_spa", "current_spa_id"),
    )


# =========================================================
# STAFF DOCUMENTS
# =========================================================

class StaffDocument(Base):
    __tablename__ = "staff_documents"

    id = Column(
        BigInteger,
        primary_key=True,
        autoincrement=True
    )

    staff_id = Column(
        BigInteger,
        ForeignKey("staff.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    document_type = Column(
        Enum(
            DocumentTypeEnum,
            native_enum=False,
            length=50
        ),
        nullable=False,
        index=True
    )

    file_url = Column(
        String(500),
        nullable=False
    )

    document_number_last4 = Column(
        String(4),
        nullable=True
    )

    is_verified = Column(
        Boolean,
        default=False
    )

    verified_by = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )

    verified_at = Column(
        DateTime,
        nullable=True
    )

    uploaded_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    # =====================================================
    # RELATIONSHIP
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
        BigInteger,
        primary_key=True,
        autoincrement=True
    )

    staff_id = Column(
        BigInteger,
        ForeignKey("staff.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    event_type = Column(
        Enum(
            StaffEventTypeEnum,
            native_enum=False,
            length=30
        ),
        nullable=False,
        index=True
    )

    # =====================================================
    # SPA MOVEMENT
    # =====================================================

    spa_id = Column(
        Integer,
        ForeignKey("spas.id", ondelete="SET NULL"),
        nullable=True
    )

    from_spa_id = Column(
        Integer,
        ForeignKey("spas.id", ondelete="SET NULL"),
        nullable=True
    )

    to_spa_id = Column(
        Integer,
        ForeignKey("spas.id", ondelete="SET NULL"),
        nullable=True
    )

    transfer_reason = Column(
        Text,
        nullable=True
    )

    # =====================================================
    # EXTRA
    # =====================================================

    notes = Column(
        Text,
        nullable=True
    )

    event_date = Column(
        DateTime,
        default=datetime.utcnow,
        index=True
    )

    created_by = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    # =====================================================
    # RELATIONSHIP
    # =====================================================

    staff = relationship(
        "Staff",
        back_populates="events",
        lazy="selectin"
    )

    __table_args__ = (
        Index(
            "idx_staff_event",
            "staff_id",
            "event_type"
        ),
    )


# =========================================================
# WORK HISTORY
# =========================================================

class WorkHistory(Base):
    __tablename__ = "work_history"

    id = Column(
        BigInteger,
        primary_key=True,
        autoincrement=True
    )

    staff_id = Column(
        BigInteger,
        ForeignKey("staff.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    spa_id = Column(
        Integer,
        ForeignKey("spas.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # =====================================================
    # TIMELINE
    # =====================================================

    join_date = Column(
        DateTime,
        default=datetime.utcnow,
        index=True
    )

    leave_date = Column(
        DateTime,
        nullable=True
    )

    # =====================================================
    # TRANSFER
    # =====================================================

    is_transferred = Column(
        Boolean,
        default=False
    )

    # =====================================================
    # EXTRA
    # =====================================================

    notes = Column(
        Text,
        nullable=True
    )

    # =====================================================
    # METADATA
    # =====================================================

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    # =====================================================
    # RELATIONSHIP
    # =====================================================

    staff = relationship(
        "Staff",
        back_populates="work_history",
        lazy="selectin"
    )

    __table_args__ = (
        Index(
            "idx_staff_spa_history",
            "staff_id",
            "spa_id"
        ),
    )


# =========================================================
# STAFF VERIFICATION LOGS
# =========================================================

class StaffVerificationLog(Base):
    __tablename__ = "staff_verification_logs"

    id = Column(
        BigInteger,
        primary_key=True,
        autoincrement=True
    )

    staff_id = Column(
        BigInteger,
        ForeignKey("staff.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    old_status = Column(
        String(30),
        nullable=True
    )

    new_status = Column(
        String(30),
        nullable=False
    )

    reason = Column(
        Text,
        nullable=True
    )

    changed_by = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        index=True
    )

    # =====================================================
    # RELATIONSHIP
    # =====================================================

    staff = relationship(
        "Staff",
        back_populates="verification_logs",
        lazy="selectin"
    )
