"""
Certificate Service
Business logic for certificate operations
"""
import os
from pathlib import Path
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
import logging

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, delete

from apps.certificates.models import (
    CertificateTemplate,
    GeneratedCertificate,  # Legacy
    CertificateCategory,
    TemplateType,
    SpaTherapistCertificate,
    ManagerSalaryCertificate,
    ExperienceLetterCertificate,
    AppointmentLetterCertificate,
    InvoiceSpaBillCertificate,
)
from apps.certificates.services.pdf_generator import (
    render_html_template,
    html_to_pdf,
    save_certificate_file,
    save_base64_image
)
from core.exceptions import NotFoundError, ValidationError

logger = logging.getLogger(__name__)

# Template directory
TEMPLATE_DIR = Path(__file__).parent.parent / "templates"

SPA_REQUIRED_CATEGORIES = {
    CertificateCategory.MANAGER_SALARY,
    CertificateCategory.EXPERIENCE_LETTER,
    CertificateCategory.APPOINTMENT_LETTER,
    CertificateCategory.INVOICE_SPA_BILL,
    # Note: SPA_THERAPIST does NOT require spa_id
}

# -------------------------
# Template CRUD Operations
# -------------------------

async def get_public_templates(db: AsyncSession) -> List[CertificateTemplate]:
    """Get all public and active certificate templates"""
    stmt = select(CertificateTemplate).where(
        and_(
            CertificateTemplate.is_active.is_(True),
            CertificateTemplate.is_public.is_(True)
        )
    ).order_by(CertificateTemplate.name)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_template_by_id(db: AsyncSession, template_id: int) -> Optional[CertificateTemplate]:
    """Get certificate template by ID"""
    stmt = select(CertificateTemplate).where(CertificateTemplate.id == template_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_all_templates(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[CertificateTemplate]:
    """Get all certificate templates (admin only)"""
    stmt = select(CertificateTemplate).order_by(CertificateTemplate.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def create_template(
    db: AsyncSession,
    name: str,
    category: CertificateCategory,
    created_by: int,
    template_image: Optional[str] = None,
    template_html: Optional[str] = None,
    template_type: TemplateType = TemplateType.IMAGE,
    is_active: bool = True,
    is_public: bool = True,
    template_config: Optional[Dict[str, Any]] = None
) -> CertificateTemplate:
    """Create a new certificate template"""
    try:
        template = CertificateTemplate(
            name=name,
            category=category,
            template_image=template_image,
            template_html=template_html,
            template_type=template_type,
            created_by=created_by,
            is_active=is_active,
            is_public=is_public,
            template_config=template_config or {}
        )
        db.add(template)
        await db.commit()
        await db.refresh(template)
        return template
    except Exception as e:
        logger.error(f"Error creating template in database: {str(e)}", exc_info=True)
        await db.rollback()
        raise


async def update_template(
    db: AsyncSession,
    template_id: int,
    name: Optional[str] = None,
    category: Optional[CertificateCategory] = None,
    template_image: Optional[str] = None,
    template_html: Optional[str] = None,
    template_type: Optional[TemplateType] = None,
    is_active: Optional[bool] = None,
    is_public: Optional[bool] = None,
    template_config: Optional[Dict[str, Any]] = None
) -> Optional[CertificateTemplate]:
    """Update a certificate template"""
    template = await get_template_by_id(db, template_id)
    if not template:
        return None

    for field, value in {
        "name": name,
        "category": category,
        "template_image": template_image,
        "template_html": template_html,
        "template_type": template_type,
        "is_active": is_active,
        "is_public": is_public,
        "template_config": template_config,
    }.items():
        if value is not None:
            setattr(template, field, value)

    await db.commit()
    await db.refresh(template)
    return template


async def delete_template(db: AsyncSession, template_id: int) -> bool:
    """Delete a certificate template"""
    template = await get_template_by_id(db, template_id)
    if not template:
        return False

    stmt = delete(CertificateTemplate).where(CertificateTemplate.id == template_id)
    await db.execute(stmt)
    await db.commit()
    return True

# -------------------------
# Template File Handling
# -------------------------

def load_template_file(template_name: str) -> str:
    """Load HTML template file"""
    template_path = TEMPLATE_DIR / f"{template_name}.html"
    if not template_path.exists():
        raise NotFoundError(f"Template file not found: {template_name}")

    with open(template_path, 'r', encoding='utf-8') as f:
        return f.read()


def get_template_name_by_category(category: CertificateCategory) -> str:
    """Map certificate category to template file name"""
    mapping = {
        CertificateCategory.MANAGER_SALARY: "salary_certificate",
        CertificateCategory.APPOINTMENT_LETTER: "appointment_letter",
        CertificateCategory.EXPERIENCE_LETTER: "letter_of_experience",
        CertificateCategory.INVOICE_SPA_BILL: "invoice",
        CertificateCategory.SPA_THERAPIST: "completion_certificate",
    }
    return mapping.get(category, "salary_certificate")


def prepare_certificate_data(template: CertificateTemplate, certificate_data: Dict[str, Any], candidate_name: str, use_http_urls: bool = False) -> Dict[str, Any]:
    """Prepare data for rendering certificate templates
    
    Args:
        template: Certificate template
        certificate_data: Certificate data dictionary
        candidate_name: Name of the candidate
        use_http_urls: If True, use HTTP URLs for images (for browser preview). If False, use file:// URLs (for PDF generation)
    """
    spa = certificate_data.get("spa", {})

    # Get static file base path
    static_base_path = Path(__file__).resolve().parents[3] / "Static"
    static_base_path_str = str(static_base_path).replace("\\", "/")
    
    # Determine image URLs based on context
    if use_http_urls:
        # For browser preview - use HTTP URLs
        base_url = certificate_data.get("base_url", "http://localhost:8009")
        background_image = certificate_data.get("certificate_background_image") or f"{base_url}/static/images/spacertificate.png"
        stamp_image = certificate_data.get("certificate_stamp_image") or f"{base_url}/static/images/Spa Certificate Stamp.png"
        signatory_image = certificate_data.get("certificate_signatory_image") or f"{base_url}/static/images/Spa Certificate Signatory.png"
    else:
        # For PDF generation - use file:// URLs
        background_image = certificate_data.get("certificate_background_image") or f"file:///{static_base_path_str}/images/spacertificate.png"
        stamp_image = certificate_data.get("certificate_stamp_image") or f"file:///{static_base_path_str}/images/Spa Certificate Stamp.png"
        signatory_image = certificate_data.get("certificate_signatory_image") or f"file:///{static_base_path_str}/images/Spa Certificate Signatory.png"
    
    data = {
        "date": certificate_data.get("date", datetime.now().strftime("%d/%m/%Y")),
        "candidate_name": candidate_name,

        # SPA info
        "spa_name": spa.get("name", ""),
        "spa_address": spa.get("address", ""),
        "spa_city": spa.get("city", ""),
        "spa_state": spa.get("state", ""),
        "spa_country": spa.get("country", ""),
        "spa_pincode": spa.get("pincode", ""),
        "spa_phone": spa.get("phone_number", ""),
        "spa_phone1": spa.get("alternate_number", ""),
        "spa_email": spa.get("email", ""),
        "spa_website": spa.get("website", ""),
        
        # Static image paths
        "certificate_background_image": background_image,
        "certificate_stamp_image": stamp_image,
        "certificate_signatory_image": signatory_image,
    }

    # Merge additional certificate_data without overwriting existing keys
    # For SPA_THERAPIST, exclude signatory_name, signatory_title, and spa_id
    excluded_fields = set()
    if template.category == CertificateCategory.SPA_THERAPIST:
        excluded_fields = {"signatory_name", "signatory_title", "spa_id"}
    
    for k, v in certificate_data.items():
        if k not in data and k not in excluded_fields:
            data[k] = v
    
    # For SPA_THERAPIST, handle image paths/URLs
    if template.category == CertificateCategory.SPA_THERAPIST:
        from config.settings import settings
        base_url = certificate_data.get("base_url", "http://localhost:8009")
        media_base_path = Path(settings.UPLOAD_DIR).resolve()
        media_base_path_str = str(media_base_path).replace("\\", "/")
        
        # Handle passport_size_photo
        if data.get("passport_size_photo"):
            photo = data["passport_size_photo"]
            # If it's a relative file path (certificates/filename.jpg), convert to appropriate URL
            if photo.startswith("certificates/"):
                if use_http_urls:
                    # For preview: use HTTP URL
                    data["passport_size_photo"] = f"{base_url}/media/{photo}"
                else:
                    # For PDF: use file:// path
                    data["passport_size_photo"] = f"file:///{media_base_path_str}/{photo}"
            # If it's base64 (for preview), keep it as is - it works in HTML
        
        # Handle candidate_signature
        if data.get("candidate_signature"):
            sig = data["candidate_signature"]
            # If it's a relative file path (certificates/filename.jpg), convert to appropriate URL
            if sig.startswith("certificates/"):
                if use_http_urls:
                    # For preview: use HTTP URL
                    data["candidate_signature"] = f"{base_url}/media/{sig}"
                else:
                    # For PDF: use file:// path
                    data["candidate_signature"] = f"file:///{media_base_path_str}/{sig}"
            # If it's base64 (for preview), keep it as is - it works in HTML

    # Category-specific defaults (only set if not already in data)
    category_defaults = {
        CertificateCategory.MANAGER_SALARY: {
            "position": "Manager",
            "joining_date": "",
            "monthly_salary": "",
            "salary_in_words": "",
            "salary_breakdown": "".join(
                f"<tr><td>{m['month']}</td><td>{m['salary']}</td></tr>"
                for m in certificate_data.get("salary_breakdown", [])
            ) or "<tr><td>-</td><td>-</td></tr>"
        },
        CertificateCategory.INVOICE_SPA_BILL: {
            "items_rows": "".join(
                f"<tr><td>{i}.</td><td>{item.get('description','-')}</td><td>{item.get('hsn_code','-')}</td>"
                f"<td>{item.get('quantity','-')}</td><td>{item.get('rate','-')}</td><td>{item.get('amount','0.00')}</td></tr>"
                for i, item in enumerate(certificate_data.get("items", []), start=1)
            ) or "<tr><td colspan='6' style='text-align:center;'>No services added</td></tr>",
            "bill_number": certificate_data.get("bill_number", ""),
            "payment_mode": certificate_data.get("payment_mode", ""),
            "customer_name": certificate_data.get("customer_name", candidate_name)
        },
        CertificateCategory.EXPERIENCE_LETTER: {
            "position": "",
            "start_date": "",
            "end_date": "",
            "duration": "",
            "salary": "",
            "performance_description": ""
        },
        CertificateCategory.APPOINTMENT_LETTER: {
            "position": "",
            "start_date": "",
            "salary": ""
        },
        CertificateCategory.SPA_THERAPIST: {
            "course_name": "",
            "start_date": "",
            "end_date": "",
            "passport_size_photo": "",
            "candidate_signature": ""
        }
    }

    # Only set defaults if key doesn't exist or is empty
    defaults = category_defaults.get(template.category, {})
    for key, default_value in defaults.items():
        if key not in data or not data.get(key):
            data[key] = default_value
    
    return data


def get_certificate_model(category: CertificateCategory):
    """Get the appropriate certificate model based on category"""
    model_map = {
        CertificateCategory.SPA_THERAPIST: SpaTherapistCertificate,
        CertificateCategory.MANAGER_SALARY: ManagerSalaryCertificate,
        CertificateCategory.EXPERIENCE_LETTER: ExperienceLetterCertificate,
        CertificateCategory.APPOINTMENT_LETTER: AppointmentLetterCertificate,
        CertificateCategory.INVOICE_SPA_BILL: InvoiceSpaBillCertificate,
    }
    return model_map.get(category, GeneratedCertificate)

# -------------------------
# Certificate Generation
# -------------------------

async def create_generated_certificate(
    db: AsyncSession,
    template_id: int,
    name: str,
    certificate_data: Optional[Dict[str, Any]] = None,
    created_by: Optional[int] = None,
    is_public: bool = True,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None
):
    """Create a generated certificate with tracking"""
    template = await get_template_by_id(db, template_id)
    if not template:
        raise NotFoundError("Certificate template not found")
    if not template.is_public or not template.is_active:
        raise ValidationError("Certificate template is not available for public use")

    CertificateModel = get_certificate_model(template.category)
    certificate_payload = certificate_data or {}

    spa_payload = certificate_payload.get("spa", {})
    spa_id = certificate_payload.get("spa_id") or spa_payload.get("id")

    if template.category in SPA_REQUIRED_CATEGORIES and not spa_id:
        raise ValidationError("SPA selection is required for this certificate")

    base_data = {
        "template_id": template_id,
        "certificate_data": certificate_payload,
        "is_public": is_public,
        "created_by": created_by,  # Track who created the certificate
    }
    
    # Only add spa_id for categories that require it (not SPA_THERAPIST)
    if spa_id and template.category != CertificateCategory.SPA_THERAPIST:
        base_data["spa_id"] = spa_id

    # Category-specific fields mapping
    category_fields = {
        CertificateCategory.SPA_THERAPIST: {
            "candidate_name": certificate_payload.get("candidate_name") or certificate_payload.get("therapist_name") or name,
            "course_name": certificate_payload.get("course_name"),
            "start_date": certificate_payload.get("start_date"),
            "end_date": certificate_payload.get("end_date"),
            # Save base64 images as files and store file paths
            "passport_size_photo": None,  # Will be set after certificate is created
            "candidate_signature": None,  # Will be set after certificate is created
        },
        CertificateCategory.MANAGER_SALARY: {
            "manager_name": certificate_payload.get("manager_name") or name,
            "position": certificate_payload.get("position") or "Manager",
            "joining_date": certificate_payload.get("joining_date"),
            "monthly_salary": certificate_payload.get("monthly_salary"),
            "monthly_salary_in_words": certificate_payload.get("monthly_salary_in_words"),
            "month_year_list": certificate_payload.get("month_year_list") or [],
            "month_salary_list": certificate_payload.get("month_salary_list") or [],
        },
        CertificateCategory.EXPERIENCE_LETTER: {
            "candidate_name": certificate_payload.get("candidate_name") or certificate_payload.get("employee_name") or name,
            "position": certificate_payload.get("position"),
            "joining_date": certificate_payload.get("start_date") or certificate_payload.get("joining_date"),
            "end_date": certificate_payload.get("end_date"),
            "duration": certificate_payload.get("duration"),
            "salary": certificate_payload.get("salary"),
        },
        CertificateCategory.APPOINTMENT_LETTER: {
            "employee_name": certificate_payload.get("employee_name") or name,
            "position": certificate_payload.get("position"),
            "start_date": certificate_payload.get("start_date"),
            "salary": certificate_payload.get("salary"),
            "manager_signature": certificate_payload.get("manager_signature"),
        },
        CertificateCategory.INVOICE_SPA_BILL: {
            "bill_number": certificate_payload.get("bill_number"),
            "bill_date": certificate_payload.get("bill_date") or certificate_payload.get("invoice_date") or certificate_payload.get("date") or datetime.now().strftime("%d/%m/%Y"),
            "card_number": certificate_payload.get("card_number") or certificate_payload.get("payment_reference") or "",
            "payment_mode": certificate_payload.get("payment_mode"),
            "customer_name": certificate_payload.get("customer_name") or name,
            "customer_address": certificate_payload.get("customer_address"),
            "subtotal": certificate_payload.get("subtotal"),
            "amount_in_words": certificate_payload.get("amount_in_words"),
        },
    }

    base_data.update(category_fields.get(template.category, {}))

    # Create certificate record (without images first)
    certificate = CertificateModel(**base_data)
    db.add(certificate)
    await db.flush()  # Flush to get certificate.id without committing
    
    # Save base64 images as files for SPA_THERAPIST category
    if template.category == CertificateCategory.SPA_THERAPIST:
        passport_photo = certificate_payload.get("passport_size_photo")
        signature = certificate_payload.get("candidate_signature")
        
        if passport_photo:
            photo_path = save_base64_image(passport_photo, certificate.id, "photo")
            if photo_path:
                certificate.passport_size_photo = photo_path
        
        if signature:
            signature_path = save_base64_image(signature, certificate.id, "signature")
            if signature_path:
                certificate.candidate_signature = signature_path
    
    await db.commit()
    await db.refresh(certificate)

    # Determine display name
    display_name_field = {
        CertificateCategory.SPA_THERAPIST: "candidate_name",
        CertificateCategory.EXPERIENCE_LETTER: "candidate_name",
        CertificateCategory.APPOINTMENT_LETTER: "employee_name",
    }.get(template.category, None)
    display_name = getattr(certificate, display_name_field, name) if display_name_field else name

    # Prepare template data (use file:// URLs for PDF generation)
    # Update certificate_payload with saved image paths from certificate
    if template.category == CertificateCategory.SPA_THERAPIST:
        if certificate.passport_size_photo:
            certificate_payload["passport_size_photo"] = certificate.passport_size_photo
        if certificate.candidate_signature:
            certificate_payload["candidate_signature"] = certificate.candidate_signature
    
    data = prepare_certificate_data(template, certificate_payload, display_name, use_http_urls=False)

    # Render PDF if HTML template
    if template.template_type == TemplateType.HTML:
        if not template.template_html:
            raise ValidationError("HTML template requires template_html content. Please provide HTML in the template.")
        html_content = template.template_html
        rendered_html = render_html_template(html_content, data)
        try:
            pdf_bytes = html_to_pdf(rendered_html)
            certificate.certificate_pdf = save_certificate_file(certificate.id, pdf_bytes, "pdf")
            await db.commit()
            await db.refresh(certificate)
        except Exception as e:
            logger.error(f"Error generating PDF: {e}", exc_info=True)

    # Track activity and create notification if user is authenticated
    if created_by:
        try:
            from apps.notifications.services.activity_service import log_activity
            from apps.notifications.services.notification_service import create_certificate_notification
            
            # Get certificate type name
            cert_type = template.category.value.replace("_", " ").title()
            candidate_name = display_name
            
            # Log activity
            await log_activity(
                db=db,
                user_id=created_by,
                activity_type="certificate_created",
                activity_description=f"Created {cert_type} certificate for {candidate_name}",
                entity_type="certificate",
                entity_id=certificate.id,
                metadata={
                    "template_id": template_id,
                    "template_name": template.name,
                    "certificate_type": cert_type,
                    "candidate_name": candidate_name
                },
                ip_address=ip_address,
                user_agent=user_agent
            )
            
            # Create notification
            await create_certificate_notification(
                db=db,
                user_id=created_by,
                certificate_id=certificate.id,
                certificate_type=cert_type,
                candidate_name=candidate_name
            )
        except Exception as e:
            logger.error(f"Error tracking certificate activity: {e}", exc_info=True)

    return certificate

# -------------------------
# Generated Certificate Queries
# -------------------------

async def get_generated_certificate_by_id(db: AsyncSession, certificate_id: int) -> Optional[GeneratedCertificate]:
    stmt = select(GeneratedCertificate).where(GeneratedCertificate.id == certificate_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_public_certificates(db: AsyncSession, skip: int = 0, limit: int = 100):
    """Get all public generated certificates from all certificate tables"""
    models = [
        SpaTherapistCertificate,
        ManagerSalaryCertificate,
        ExperienceLetterCertificate,
        AppointmentLetterCertificate,
        InvoiceSpaBillCertificate,
        GeneratedCertificate,
    ]
    all_certificates = []
    for model in models:
        stmt = select(model).where(model.is_public.is_(True))
        result = await db.execute(stmt)
        all_certificates.extend(list(result.scalars().all()))

    all_certificates.sort(key=lambda x: x.generated_at, reverse=True)
    return all_certificates[skip:skip + limit]


async def get_user_certificates(db: AsyncSession, user_id: int, skip: int = 0, limit: int = 100):
    """Get certificates created by a specific user"""
    models = [
        SpaTherapistCertificate,
        ManagerSalaryCertificate,
        ExperienceLetterCertificate,
        AppointmentLetterCertificate,
        InvoiceSpaBillCertificate,
        GeneratedCertificate,
    ]
    all_certificates = []
    for model in models:
        stmt = select(model).where(model.created_by == user_id)
        result = await db.execute(stmt)
        all_certificates.extend(list(result.scalars().all()))

    all_certificates.sort(key=lambda x: x.generated_at if hasattr(x, 'generated_at') else x.created_at, reverse=True)
    return all_certificates[skip:skip + limit]


async def get_all_certificates_with_users(db: AsyncSession, skip: int = 0, limit: int = 100):
    """Get all certificates with user information"""
    from apps.users.models import User
    from sqlalchemy.orm import selectinload
    
    models = [
        SpaTherapistCertificate,
        ManagerSalaryCertificate,
        ExperienceLetterCertificate,
        AppointmentLetterCertificate,
        InvoiceSpaBillCertificate,
        GeneratedCertificate,
    ]
    
    all_certificates = []
    for model in models:
        stmt = select(model).offset(skip).limit(limit)
        result = await db.execute(stmt)
        certs = list(result.scalars().all())
        all_certificates.extend(certs)
    
    # Sort by generated_at
    all_certificates.sort(key=lambda x: x.generated_at if hasattr(x, 'generated_at') else getattr(x, 'created_at', None), reverse=True)
    
    # Get user information for each certificate
    user_ids = {cert.created_by for cert in all_certificates if cert.created_by}
    if user_ids:
        user_stmt = select(User).where(User.id.in_(user_ids))
        user_result = await db.execute(user_stmt)
        users = {user.id: user for user in user_result.scalars().all()}
        
        # Attach user info to certificates
        for cert in all_certificates:
            if cert.created_by and cert.created_by in users:
                cert.creator = users[cert.created_by]
    
    return all_certificates


async def get_certificate_statistics(db: AsyncSession):
    """Get certificate statistics: total, by user, by category"""
    from sqlalchemy import func
    from apps.users.models import User
    
    models = [
        (SpaTherapistCertificate, CertificateCategory.SPA_THERAPIST),
        (ManagerSalaryCertificate, CertificateCategory.MANAGER_SALARY),
        (ExperienceLetterCertificate, CertificateCategory.EXPERIENCE_LETTER),
        (AppointmentLetterCertificate, CertificateCategory.APPOINTMENT_LETTER),
        (InvoiceSpaBillCertificate, CertificateCategory.INVOICE_SPA_BILL),
        (GeneratedCertificate, None),
    ]
    
    # Total count
    total_count = 0
    category_counts = {}
    user_counts = {}
    
    for model, category in models:
        stmt = select(func.count(model.id))
        result = await db.execute(stmt)
        count = result.scalar() or 0
        total_count += count
        
        if category:
            category_counts[category.value] = count
        
        # Count by user
        user_stmt = select(model.created_by, func.count(model.id)).group_by(model.created_by)
        user_result = await db.execute(user_stmt)
        for user_id, cert_count in user_result.all():
            if user_id:
                user_counts[user_id] = user_counts.get(user_id, 0) + cert_count
    
    # Get user details
    user_ids = list(user_counts.keys())
    user_details = {}
    if user_ids:
        user_stmt = select(User).where(User.id.in_(user_ids))
        user_result = await db.execute(user_stmt)
        for user in user_result.scalars().all():
            user_details[user.id] = {
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "count": user_counts[user.id]
            }
    
    return {
        "total_certificates": total_count,
        "by_category": category_counts,
        "by_user": list(user_details.values())
    }
