"""
Query / Support Ticket Models
"""

from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    Text,
    Enum,
    ForeignKey,
    Index
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from config.database import Base
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from apps.users.models import User
    from apps.forms_app.models import SPA
else:
    # Import at runtime to avoid circular imports
    from apps.forms_app.models import SPA


# =====================================================
# Query Type Master (Admin managed)
# =====================================================

class QueryType(Base):
    __tablename__ = "query_types"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)

    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Index for faster lookup
    __table_args__ = (
        Index("idx_query_types_name", "name"),
    )

    def __repr__(self):
        return f"<QueryType(id={self.id}, name='{self.name}')>"


# =====================================================
# Query / Ticket Model
# =====================================================

class Query(Base):
    __tablename__ = "queries"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # -----------------------------
    # Relations
    # -----------------------------
    spa_id = Column(
        Integer,
        ForeignKey("spas.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    query_type_id = Column(
        Integer,
        ForeignKey("query_types.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    # -----------------------------
    # User Inputs
    # -----------------------------
    query = Column(Text, nullable=False)
    contact_number = Column(Text, nullable=False)

    # -----------------------------
    # Status (Fixed workflow)
    # -----------------------------
    status = Column(
        Enum(
            "pending",
            "processing",
            "resolved",
            "closed",
            name="query_status"
        ),
        nullable=False,
        default="pending",
        index=True
    )

    # -----------------------------
    # Admin Handling
    # -----------------------------
    admin_remark = Column(Text, nullable=True)

    # -----------------------------
    # Audit Fields
    # -----------------------------
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    created_by = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    updated_by = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    # -----------------------------
    # Soft Delete & Flags
    # -----------------------------
    is_active = Column(Boolean, default=True, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)

    deleted_at = Column(DateTime(timezone=True), nullable=True)
    deleted_by = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )

    # -----------------------------
    # Relationships (defined after all columns)
    # -----------------------------
    spa = relationship("SPA", backref="queries", lazy="select")
    query_type = relationship("QueryType", lazy="select")
    
    # Note: User relationships are not defined here as we manually enrich
    # user data in the service layer via enrich_query_with_relations()

    # -----------------------------
    # Indexes
    # -----------------------------
    __table_args__ = (
        Index("idx_queries_status", "status"),
        Index("idx_queries_spa_status", "spa_id", "status"),
    )

    def __repr__(self):
        return f"<Query(id={self.id}, status='{self.status}')>"
