"""
Forms App Models
SPA locations and candidate form submissions
"""
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Text, JSON,
    ForeignKey, false
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from config.database import Base


class SPA(Base):
    """SPA Location Model"""
    __tablename__ = "spas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False, index=True)
    code=Column(Integer, nullable=True, index=True, unique=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    area = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    country = Column(String(100), default="India", nullable=False)
    pincode = Column(String(20), nullable=True)
    phone_number = Column(String(20), nullable=True)
    alternate_number = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True, unique=True)
    website = Column(String(255), nullable=True)
    logo = Column(String(500), nullable=True)

    is_active = Column(Boolean, default=True, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        onupdate=func.now(),
        nullable=False
    )

    # Relationship with CandidateForm
    candidates = relationship("CandidateForm", back_populates="spa")
    
    # Relationship with Hiring_Form
    hiring_forms = relationship("Hiring_Form", back_populates="spa")

    # relation with certificate
    manager_salary_certificates = relationship("ManagerSalaryCertificate", back_populates="spa")
    experience_letter_certificates = relationship("ExperienceLetterCertificate", back_populates="spa")
    appointment_letter_certificates = relationship("AppointmentLetterCertificate", back_populates="spa")
    invoice_spa_bill_certificates = relationship("InvoiceSpaBillCertificate", back_populates="spa")

    

    


class CandidateForm(Base):
    """Candidate Form Submission Model"""
    __tablename__ = "candidate_forms"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # Foreign key to SPA (nullable to allow forms with spa_name_text only)
    spa_id = Column(Integer, ForeignKey('spas.id'), nullable=True, index=True)
    spa = relationship("SPA", back_populates="candidates")

    
    
    # Track who submitted the form
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    spa_name_text = Column(String(255), nullable=True)  # If SPA not found in DB

    # Candidate Personal Information
    first_name = Column(String(100), nullable=False)
    middle_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=False)
    current_address = Column(Text, nullable=False)
    aadhar_address = Column(Text, nullable=True)
    city = Column(String(100), nullable=False)
    zip_code = Column(String(20), nullable=False)
    state = Column(String(100), nullable=False)
    country = Column(String(100), default="India", nullable=False)
    phone_number = Column(String(20), nullable=False)
    work_experience = Column(String(255), nullable=False)
    Therapist_experience = Column(String(255), nullable=False)
    alternate_number = Column(String(20), nullable=True)
    age = Column(Integer, nullable=False)
    position_applied_for = Column(String(255), nullable=False)
    education_certificate_courses = Column(Text, nullable=True)




    # Uploaded Documents (store file paths)
    passport_size_photo = Column(String(500), nullable=True)
    age_proof_document = Column(String(500), nullable=True)
    aadhar_card_front = Column(String(500), nullable=True)
    aadhar_card_back = Column(String(500), nullable=True)
    pan_card = Column(String(500), nullable=True)
    signature = Column(String(500), nullable=True)
    documents = Column(JSON, nullable=True)  # Example: ["file1.png", "file2.pdf"]



    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )


# any one can send the hiring form to the spa

class Hiring_Form(Base):
    """Hiring Form Model"""
    __tablename__ = "hiring_forms"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # Foreign key to SPA
    spa_id = Column(Integer, ForeignKey('spas.id'), nullable=False, index=True)
    spa = relationship("SPA", back_populates="hiring_forms")
    
    # Track who submitted the form
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

# hiriing requirements posted by the spa
    for_role = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    required_experience = Column(String(255), nullable=False) 
    required_education = Column(String(255), nullable=False) 
    required_skills = Column(String(255), nullable=False) 
    
   
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )
