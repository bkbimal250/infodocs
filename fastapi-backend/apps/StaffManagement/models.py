from sqlalchemy import Column, String, DateTime, Enum, ForeignKey, Boolean, Text, Index, Integer
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from config.database import Base


# ==============================
# 🔤 ENUMS
# ==============================

class StaffStatusEnum(str, enum.Enum):
    active = "active"
    inactive = "inactive"
    left = "left"


class StaffEventTypeEnum(str, enum.Enum):
    new_join = "new_join"
    re_join = "re_join"
    transfer_out = "transfer_out"
    leave = "leave"


class WorkStatusEnum(str, enum.Enum):
    active = "active"
    completed = "completed"


# ==============================
# 🧑 STAFF MASTER
# ==============================

class Staff(Base):
    __tablename__ = "staff"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    name = Column(String(255), nullable=True)

    # 🔥 IMPORTANT: Unique identity across system
    phone = Column(String(20), unique=True, nullable=False, index=True)

    # ==========================
    # 🧑 IDENTITY & DEMOGRAPHICS
    # ==========================
    gender = Column(String(20), nullable=True)  # male, female, other

    # ==========================
    # 📄 DOCUMENTS
    # ==========================
    adhar_card = Column(String(50), nullable=True)
    adhar_card_photo = Column(String(255), nullable=True)
    pan_card = Column(String(50), nullable=True)
    pan_card_photo = Column(String(255), nullable=True)
    passport_photo = Column(String(255), nullable=True)

    # ==========================
    # 📍 ADDRESS & CONTACT
    # ==========================
    address = Column(Text, nullable=True)
    city=Column(String(255), nullable=True, index=True)
    emergency_contact_name = Column(String(255), nullable=True)
    emergency_contact_number = Column(String(20), nullable=True)

    # ==========================
    # 🏢 EMPLOYMENT & BANKING
    # ==========================
    designation = Column(String(100), nullable=True)

    # ==========================
    # 📊 CURRENT STATE
    # ==========================
    current_status = Column(Enum(StaffStatusEnum, native_enum=False, length=20), default=StaffStatusEnum.inactive, index=True)
    
    # Linked to current SPA branch
    spa_id = Column(Integer, ForeignKey("spas.id", ondelete="SET NULL"), nullable=True, index=True)

    # ==========================
    # 📅 QUICK DATES (OPTIONAL)
    # ==========================
    joining_date = Column(DateTime, nullable=True, index=True)
    leave_date = Column(DateTime, nullable=True)
    transfer_date = Column(DateTime, nullable=True)

    # ==========================
    # 🧾 METADATA
    # ==========================
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # ==========================
    # 🔗 RELATIONS
    # ==========================
    events = relationship("StaffEvent", back_populates="staff", cascade="all, delete-orphan")
    work_history = relationship("WorkHistory", back_populates="staff", cascade="all, delete-orphan")
    spa = relationship("SPA", foreign_keys=[spa_id], backref="staff_members")


# ==============================
# 📜 STAFF EVENTS (CORE LOGIC)
# ==============================

class StaffEvent(Base):
    __tablename__ = "staff_events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    staff_id = Column(Integer, ForeignKey("staff.id", ondelete="CASCADE"), nullable=False, index=True)

    # 🔥 EVENT TYPE
    type = Column(Enum(StaffEventTypeEnum, native_enum=False, length=20), nullable=False, index=True)

    # ==========================
    # 🏢 SPA DETAILS
    # ==========================
    spa_id = Column(Integer, ForeignKey("spas.id", ondelete="SET NULL"), nullable=True, index=True)
    from_spa_id = Column(Integer, ForeignKey("spas.id", ondelete="SET NULL"), nullable=True)
    to_spa_id = Column(Integer, ForeignKey("spas.id", ondelete="SET NULL"), nullable=True)

    # ==========================
    # 📅 EVENT DATE
    # ==========================
    event_date = Column(DateTime, default=datetime.utcnow, index=True)

    # ==========================
    # 📝 EXTRA
    # ==========================
    notes = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # ==========================
    # 🔗 RELATION
    # ==========================
    staff = relationship("Staff", back_populates="events")

    # 🔥 INDEX FOR FAST ANALYTICS
    __table_args__ = (
        Index("idx_staff_event_type_date", "type", "event_date"),
    )


# ==============================
# 🏢 WORK HISTORY
# ==============================

class WorkHistory(Base):
    __tablename__ = "work_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    staff_id = Column(Integer, ForeignKey("staff.id", ondelete="CASCADE"), nullable=False, index=True)

    spa_id = Column(Integer, ForeignKey("spas.id", ondelete="CASCADE"), nullable=False, index=True)

    # ==========================
    # 📅 TIMELINE
    # ==========================
    join_date = Column(DateTime, default=datetime.utcnow)
    leave_date = Column(DateTime, nullable=True)

    # ==========================
    # 📊 STATUS
    # ==========================
    status = Column(Enum(WorkStatusEnum, native_enum=False, length=20), default=WorkStatusEnum.active)

    # ==========================
    # 🔁 TRANSFER FLAG
    # ==========================
    is_transferred = Column(Boolean, default=False)

    # ==========================
    # 🧾 METADATA
    # ==========================
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # ==========================
    # 🔗 RELATION
    # ==========================
    staff = relationship("Staff", back_populates="work_history")

    # 🔥 INDEX FOR QUICK LOOKUPS
    __table_args__ = (
        Index("idx_staff_spa_status", "staff_id", "spa_id", "status"),
    )
