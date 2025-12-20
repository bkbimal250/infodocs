"""
apps.certificates.models
Production-ready SQLAlchemy ORM models for certificate management.
Author: Bimal Developer (refactor)
"""

from datetime import datetime
from enum import Enum as PyEnum
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime,
    Enum as SQLEnum, Text, JSON, ForeignKey
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from config.database import Base
from apps.forms_app.models import SPA


# ---------------------------
# Enums
# ---------------------------
class CertificateCategory(str, PyEnum):
    SPA_THERAPIST = "spa_therapist"
    MANAGER_SALARY = "manager_salary"
    OFFER_LETTER = "offer_letter"
    EXPERIENCE_LETTER = "experience_letter"
    APPOINTMENT_LETTER = "appointment_letter"
    INVOICE_SPA_BILL = "invoice_spa_bill"
    ID_CARD = "id_card"
    DAILY_SHEET = "daily_sheet"


class TemplateType(str, PyEnum):
    IMAGE = "image"
    HTML = "html"


# ---------------------------
# Certificate Template
# ---------------------------
class CertificateTemplate(Base):
    __tablename__ = "certificate_templates"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    banner_image = Column(String(500), nullable=True)
    # Use native_enum=False to store enum values (e.g., 'id_card') instead of enum names (e.g., 'ID_CARD')
    # create_constraint=False prevents SQLAlchemy from creating a CHECK constraint
    category = Column(SQLEnum(CertificateCategory, native_enum=False, length=50, create_constraint=False), nullable=False)

    template_type = Column(SQLEnum(TemplateType, native_enum=False, length=20, create_constraint=False), default=TemplateType.IMAGE, nullable=False)
    template_variant = Column(String(100), nullable=True, default=None, index=True)  # UI template variant/type (e.g., "modern", "classic", "minimal", "v1", "v2")
    template_image = Column(String(500), nullable=True)
    template_html = Column(Text, nullable=True)
    template_config = Column(JSON, default=dict, nullable=False)

    created_by = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_public = Column(Boolean, default=False, nullable=False)  # Certificates are private by default

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Reverse relations
    spa_therapist_certificates = relationship(
        "SpaTherapistCertificate", back_populates="template", cascade="all, delete-orphan"
    )
    manager_salary_certificates = relationship(
        "ManagerSalaryCertificate", back_populates="template", cascade="all, delete-orphan"
    )
    experience_letter_certificates = relationship(
        "ExperienceLetterCertificate", back_populates="template", cascade="all, delete-orphan"
    )
    appointment_letter_certificates = relationship(
        "AppointmentLetterCertificate", back_populates="template", cascade="all, delete-orphan"
    )
    invoice_spa_bill_certificates = relationship(
        "InvoiceSpaBillCertificate", back_populates="template", cascade="all, delete-orphan"
    )
    id_card_certificates = relationship(
        "IDCardCertificate", back_populates="template", cascade="all, delete-orphan"
    )
    daily_sheet_certificates = relationship(
        "DailySheetCertificate", back_populates="template", cascade="all, delete-orphan"
    )
    generated_certificates = relationship(
        "GeneratedCertificate", back_populates="template", cascade="all, delete-orphan"
    )


# ---------------------------
# Base Certificate (abstract)
# ---------------------------
class CertificateBase(Base):
    __abstract__ = True

    id = Column(Integer, primary_key=True, autoincrement=True)

    template_id = Column(Integer, ForeignKey("certificate_templates.id", ondelete="SET NULL"), nullable=True)
    
    # Track who created this certificate
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    certificate_pdf = Column(Text, nullable=True)
    certificate_data = Column(JSON, default=dict, nullable=False)

    is_public = Column(Boolean, default=False, nullable=False)  # Certificates are private by default
    generated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


# ---------------------------
# Spa Therapist Certificate
# ---------------------------
class SpaTherapistCertificate(CertificateBase):
    __tablename__ = "spa_therapist_certificates"

    category = Column(SQLEnum(CertificateCategory, native_enum=False, length=50, create_constraint=False), default=CertificateCategory.SPA_THERAPIST, nullable=False)

    candidate_name = Column(String(255), nullable=True)
    course_name = Column(String(255), nullable=True)
    start_date = Column(String(100), nullable=True)
    end_date = Column(String(100), nullable=True)

    passport_size_photo = Column(Text, nullable=True)
    candidate_signature = Column(Text, nullable=True)

    template = relationship("CertificateTemplate", back_populates="spa_therapist_certificates")


# ---------------------------
# Manager Salary Certificate
# ---------------------------
class ManagerSalaryCertificate(CertificateBase):
    __tablename__ = "manager_salary_certificates"

    category = Column(SQLEnum(CertificateCategory, native_enum=False, length=50, create_constraint=False), default=CertificateCategory.MANAGER_SALARY, nullable=False)

    spa_id = Column(Integer, ForeignKey("spas.id"), nullable=True)
    spa = relationship("SPA", back_populates="manager_salary_certificates")

    manager_name = Column(String(255), nullable=True)
    position = Column(String(255), default="Manager")
    joining_date = Column(String(50), nullable=True)
    monthly_salary = Column(String(100), nullable=True)
    monthly_salary_in_words = Column(String(255), nullable=True)

    month_year_list = Column(JSON, default=list, nullable=False)
    month_salary_list = Column(JSON, default=list, nullable=False)

    template = relationship("CertificateTemplate", back_populates="manager_salary_certificates")


# ---------------------------
# Experience Letter Certificate
# ---------------------------
class ExperienceLetterCertificate(CertificateBase):
    __tablename__ = "experience_letter_certificates"

    category = Column(SQLEnum(CertificateCategory, native_enum=False, length=50, create_constraint=False), default=CertificateCategory.EXPERIENCE_LETTER, nullable=False)

    spa_id = Column(Integer, ForeignKey("spas.id"))
    spa = relationship("SPA", back_populates="experience_letter_certificates")

    candidate_name = Column(String(255))
    position = Column(String(255))
    joining_date = Column(String(50))
    end_date = Column(String(50))
    duration = Column(String(100))
    salary = Column(String(100))

    template = relationship("CertificateTemplate", back_populates="experience_letter_certificates")


# ---------------------------
# Appointment Letter Certificate
# ---------------------------
class AppointmentLetterCertificate(CertificateBase):
    __tablename__ = "appointment_letter_certificates"

    category = Column(SQLEnum(CertificateCategory, native_enum=False, length=50, create_constraint=False), default=CertificateCategory.APPOINTMENT_LETTER)

    employee_name = Column(String(255))
    spa_id = Column(Integer, ForeignKey("spas.id"))
    spa = relationship("SPA", back_populates="appointment_letter_certificates")

    position = Column(String(255))
    start_date = Column(String(50))
    salary = Column(String(100))
    manager_signature = Column(Text)

    template = relationship("CertificateTemplate", back_populates="appointment_letter_certificates")


# ---------------------------
# Invoice Spa Bill
# ---------------------------
class InvoiceSpaBillCertificate(CertificateBase):
    __tablename__ = "invoice_spa_bill_certificates"

    category = Column(SQLEnum(CertificateCategory, native_enum=False, length=50, create_constraint=False), default=CertificateCategory.INVOICE_SPA_BILL)

    spa_id = Column(Integer, ForeignKey("spas.id"))
    spa = relationship("SPA", back_populates="invoice_spa_bill_certificates")

    bill_number = Column(String(100))
    card_number = Column(String(100))
    bill_date = Column(String(50))
    payment_mode = Column(String(50))

    customer_name = Column(String(255))
    customer_address = Column(Text)

    subtotal = Column(String(100))
    amount_in_words = Column(String(255))

    service_names = Column(JSON, default=list, nullable=False)
    hsn_codes = Column(JSON, default=list, nullable=False)
    quantities = Column(JSON, default=list, nullable=False)
    price_rates = Column(JSON, default=list, nullable=False)
    amounts = Column(JSON, default=list, nullable=False)

    template = relationship("CertificateTemplate", back_populates="invoice_spa_bill_certificates")



class IDCardCertificate(CertificateBase):
    __tablename__ = "id_card_certificates"

    # Note: older databases may not have a 'category' column for this table,
    # so we rely on template.category instead of a per-row category field.

    spa_id = Column(Integer, ForeignKey("spas.id"))
    spa = relationship("SPA", back_populates="id_card_certificates")

    candidate_name = Column(String(255))
    candidate_photo = Column(Text, nullable=True)
    designation = Column(String(255))
    date_of_joining = Column(String(50))
    contact_number = Column(String(20))
    issue_date = Column(String(50))

    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    generated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    template = relationship("CertificateTemplate", back_populates="id_card_certificates")

class DailySheet(Base):
    __tablename__ = "daily_sheets"
    id = Column(Integer, primary_key=True, autoincrement=True)
    spa_id = Column(Integer, ForeignKey("spas.id"))  # from this spa we need spa_name,spa_code,spa_address,spa_city,spa_state,spa_country,spa_pincode,spa_phone_number,spa_alternate_number,spa_email,spa_website,spa_logo
    spa = relationship("SPA", back_populates="daily_sheets")
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


# ---------------------------
# Daily Sheet Certificate
# ---------------------------
class DailySheetCertificate(CertificateBase):
    __tablename__ = "daily_sheet_certificates"

    category = Column(SQLEnum(CertificateCategory, native_enum=False, length=50, create_constraint=False), default=CertificateCategory.DAILY_SHEET, nullable=False)

    spa_id = Column(Integer, ForeignKey("spas.id"), nullable=True)
    spa = relationship("SPA", back_populates="daily_sheet_certificates")

    template = relationship("CertificateTemplate", back_populates="daily_sheet_certificates")



# ---------------------------
# Generic / Legacy
# ---------------------------
class GeneratedCertificate(CertificateBase):
    __tablename__ = "generated_certificates"

    category = Column(SQLEnum(CertificateCategory, native_enum=False, length=50, create_constraint=False))

    template = relationship("CertificateTemplate", back_populates="generated_certificates")


