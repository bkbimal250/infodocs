"""
Certificate Pydantic Schemas
Centralised request/response models shared across routers/services.
"""
from typing import Optional, Dict, Any

from pydantic import BaseModel, EmailStr, ConfigDict, model_validator

from apps.certificates.models import CertificateCategory, TemplateType


# --------------------------------------------
# Public / Frontend Certificate Creation
# --------------------------------------------

class PublicCertificateCreate(BaseModel):
    """
    Schema for public certificate generation and preview.
    Frontend calls this when generating PDF or preview.
    """

    template_id: int
    spa_id: Optional[int] = None         # NEW: For spa details
    name: str
    email: Optional[EmailStr] = None
    certificate_data: Dict[str, Any] = {}  # For dynamic fields (dates, duration, salary etc.)


# --------------------------------------------
# Certificate Template Responses
# --------------------------------------------

class CertificateTemplateResponse(BaseModel):
    """Response schema for certificate templates."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    category: CertificateCategory
    template_image: Optional[str] = None
    template_html: Optional[str] = None
    template_type: TemplateType
    is_public: bool


# --------------------------------------------
# Generated Certificate Response
# --------------------------------------------

class GeneratedCertificateResponse(BaseModel):
    """Response schema for generated certificates."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    template_id: int
    candidate_name: Optional[str] = None
    candidate_email: Optional[str] = None
    spa_id: Optional[int] = None  # NEW
    certificate_pdf: Optional[str] = None
    is_public: bool
    generated_at: str
    category: Optional[CertificateCategory] = None  # Certificate category


# --------------------------------------------
# Generic Message Response
# --------------------------------------------

class MessageResponse(BaseModel):
    """Generic message response schema."""

    message: str
    certificate_id: Optional[int] = None


# --------------------------------------------
# Create Template Schema
# --------------------------------------------

class TemplateCreate(BaseModel):
    """Schema for creating certificate templates."""

    model_config = ConfigDict(extra="forbid")

    name: str
    category: CertificateCategory
    template_type: TemplateType = TemplateType.IMAGE
    is_active: bool = True
    is_public: bool = True
    template_image: Optional[str] = None
    template_html: Optional[str] = None
    template_config: Optional[Dict[str, Any]] = {}

    @model_validator(mode='after')
    def validate_html_required(self):
        """Validate that HTML templates have template_html"""
        if self.template_type == TemplateType.HTML and not self.template_html:
            raise ValueError("template_html is required when template_type is 'html'. Please paste your HTML code.")
        return self


# --------------------------------------------
# Update Template Schema
# --------------------------------------------

class TemplateUpdate(BaseModel):
    """Schema for updating certificate templates."""

    model_config = ConfigDict(extra="forbid")

    name: Optional[str] = None
    category: Optional[CertificateCategory] = None
    template_type: Optional[TemplateType] = None
    is_active: Optional[bool] = None
    is_public: Optional[bool] = None
    template_image: Optional[str] = None
    template_html: Optional[str] = None
    template_config: Optional[Dict[str, Any]] = None


__all__ = [
    "PublicCertificateCreate",
    "CertificateTemplateResponse",
    "GeneratedCertificateResponse",
    "MessageResponse",
    "TemplateCreate",
    "TemplateUpdate",
]
