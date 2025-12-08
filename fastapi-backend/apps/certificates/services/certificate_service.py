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
    IDCardCertificate,
)
from apps.certificates.services.pdf_generator import (
    render_html_template,
    html_to_pdf,
    save_certificate_file,
    save_base64_image
)
from core.exceptions import NotFoundError, ValidationError
from config.settings import settings

logger = logging.getLogger(__name__)

# Template directory
TEMPLATE_DIR = Path(__file__).parent.parent / "templates"

# Cache static paths to avoid recalculating on every call
_STATIC_PATH_CACHE = None
_MEDIA_PATH_CACHE = None

# Template caching (in-memory cache)
_template_cache = {}
_template_list_cache = None
_cache_lock = None

def _get_cache_lock():
    """Get or create cache lock for thread-safe operations"""
    global _cache_lock
    if _cache_lock is None:
        import asyncio
        _cache_lock = asyncio.Lock()
    return _cache_lock

def _invalidate_template_cache(template_id: Optional[int] = None):
    """Invalidate template cache
    
    Args:
        template_id: If provided, only invalidate this template. If None, invalidate all caches.
    """
    global _template_cache, _template_list_cache
    
    if template_id is not None:
        # Invalidate specific template
        if template_id in _template_cache:
            del _template_cache[template_id]
            logger.debug(f"Invalidated cache for template {template_id}")
    else:
        # Invalidate all caches
        _template_cache.clear()
        _template_list_cache = None
        logger.debug("Invalidated all template caches")

def _get_static_path():
    """Get static file base path (cached)"""
    global _STATIC_PATH_CACHE
    if _STATIC_PATH_CACHE is None:
        _STATIC_PATH_CACHE = Path(__file__).resolve().parents[3] / "Static"
    return _STATIC_PATH_CACHE

def _get_media_path():
    """Get media upload path (cached)"""
    global _MEDIA_PATH_CACHE
    if _MEDIA_PATH_CACHE is None:
        from config.settings import settings
        _MEDIA_PATH_CACHE = Path(settings.UPLOAD_DIR).resolve()
    return _MEDIA_PATH_CACHE

SPA_REQUIRED_CATEGORIES = {
    CertificateCategory.MANAGER_SALARY,
    CertificateCategory.EXPERIENCE_LETTER,
    CertificateCategory.APPOINTMENT_LETTER,
    CertificateCategory.INVOICE_SPA_BILL,
    CertificateCategory.ID_CARD,
    # Note: SPA_THERAPIST does NOT require spa_id
}

# -------------------------
# Template CRUD Operations
# -------------------------

async def get_public_templates(db: AsyncSession, use_cache: bool = True) -> List[CertificateTemplate]:
    """Get all public and active certificate templates (with caching)
    
    Args:
        db: Database session
        use_cache: If True, use cached results (default: True)
    """
    global _template_list_cache
    
    # Return cached result if available and cache is enabled
    if use_cache and _template_list_cache is not None:
        logger.debug("Returning cached public templates list")
        return _template_list_cache
    
    # Fetch from database
    stmt = select(CertificateTemplate).where(
        and_(
            CertificateTemplate.is_active.is_(True),
            CertificateTemplate.is_public.is_(True)
        )
    ).order_by(CertificateTemplate.name)
    result = await db.execute(stmt)
    templates = list(result.scalars().all())
    
    # Cache the result
    if use_cache:
        _template_list_cache = templates
        logger.debug(f"Cached {len(templates)} public templates")
    
    return templates


async def get_template_by_id(db: AsyncSession, template_id: int, use_cache: bool = True) -> Optional[CertificateTemplate]:
    """Get certificate template by ID (with caching)
    
    Args:
        db: Database session
        template_id: Template ID
        use_cache: If True, use cached result (default: True)
    """
    # Check cache first
    if use_cache and template_id in _template_cache:
        logger.debug(f"Returning cached template {template_id}")
        return _template_cache[template_id]
    
    # Fetch from database
    stmt = select(CertificateTemplate).where(CertificateTemplate.id == template_id)
    result = await db.execute(stmt)
    template = result.scalar_one_or_none()
    
    # Cache the result if found
    if use_cache and template:
        async with _get_cache_lock():
            _template_cache[template_id] = template
            logger.debug(f"Cached template {template_id}")
    
    return template


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
        
        # Invalidate cache for new template
        _invalidate_template_cache()
        
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
    # Bypass cache to get a fresh template from the current session
    # This ensures the template is attached to the current session for updates
    template = await get_template_by_id(db, template_id, use_cache=False)
    if not template:
        return None

    # Update fields that are provided
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

    try:
        await db.commit()
        await db.refresh(template)
        
        # Invalidate cache for updated template
        _invalidate_template_cache(template_id)
        
        return template
    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating template {template_id}: {e}", exc_info=True)
        raise


async def delete_template(db: AsyncSession, template_id: int) -> bool:
    """Delete a certificate template and invalidate cache"""
    # Check if template exists (bypass cache to ensure we check database)
    template = await get_template_by_id(db, template_id, use_cache=False)
    if not template:
        return False

    stmt = delete(CertificateTemplate).where(CertificateTemplate.id == template_id)
    await db.execute(stmt)
    await db.commit()
    
    # Invalidate cache for deleted template and list cache
    _invalidate_template_cache(template_id)
    _invalidate_template_cache()  # Also clear list cache
    
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
        CertificateCategory.ID_CARD: "id_card",
    }
    return mapping.get(category, "salary_certificate")


async def prepare_certificate_data(template: CertificateTemplate, certificate_data: Dict[str, Any], candidate_name: str, use_http_urls: bool = False) -> Dict[str, Any]:
    """Prepare data for rendering certificate templates
    
    Args:
        template: Certificate template
        certificate_data: Certificate data dictionary
        candidate_name: Name of the candidate
        use_http_urls: If True, use HTTP URLs for images (for browser preview). If False, use file:// URLs (for PDF generation)
    """
    spa = certificate_data.get("spa", {})

    # Get static file base path (using cached path)
    static_base_path = _get_static_path()
    # Remove leading slash for file:// URLs to avoid double slashes
    static_base_path_str = str(static_base_path).replace("\\", "/").lstrip("/")
    
    # Get base URL once
    base_url = certificate_data.get("base_url", settings.API_BASE_URL)
    
    # Determine image URLs based on context
    if use_http_urls:
        # For browser preview - use HTTP URLs
        background_image = certificate_data.get("certificate_background_image") or f"{base_url}/static/images/info docs.png"
        stamp_image = certificate_data.get("certificate_stamp_image") or f"{base_url}/static/images/Spa Certificate Stamp.png"
        signatory_image = certificate_data.get("certificate_signatory_image") or f"{base_url}/static/images/Spa Certificate Signatory.png"
    else:
        # For PDF generation - use file:// URLs
        background_image = certificate_data.get("certificate_background_image") or f"file:///{static_base_path_str}/images/info docs.png"
        stamp_image = certificate_data.get("certificate_stamp_image") or f"file:///{static_base_path_str}/images/Spa Certificate Stamp.png"
        signatory_image = certificate_data.get("certificate_signatory_image") or f"file:///{static_base_path_str}/images/Spa Certificate Signatory.png"
    
    # Handle SPA logo path conversion
    # Note: Files are saved to uploads/ but settings.UPLOAD_DIR might be "media"
    # Check both locations to handle the mismatch
    media_base_path = _get_media_path()
    # Remove leading slash for file:// URLs to avoid double slashes
    media_base_path_str = str(media_base_path).replace("\\", "/").lstrip("/")
    
    # Also check uploads directory (where files are actually saved)
    # Get backend root: certificate_service.py is at apps/certificates/services/
    # So we need to go up 4 levels: services -> certificates -> apps -> backend_root
    base_dir = Path(__file__).parent.parent.parent.parent
    uploads_base_path = base_dir / "uploads"
    # Remove leading slash for file:// URLs to avoid double slashes
    uploads_base_path_str = str(uploads_base_path.resolve()).replace("\\", "/").lstrip("/")
    
    spa_logo = spa.get("logo", "")
    logger.debug(f"SPA logo from data: {spa_logo[:100] if spa_logo else 'None'}")
    
    if spa_logo and spa_logo.strip():
        # If logo is a relative path (spa_logos/filename.jpg), convert to appropriate URL
        if not spa_logo.startswith("http") and not spa_logo.startswith("file://") and not spa_logo.startswith("/"):
            # For PDF generation, use file:// path
            if use_http_urls:
                # For preview: use HTTP URL - try uploads first, then media
                # Check if file exists in uploads
                uploads_logo_path = uploads_base_path / spa_logo
                if uploads_logo_path.exists():
                    spa_logo = f"{base_url}/uploads/{spa_logo}"
                    logger.debug(f"Preview: Using uploads logo URL: {spa_logo}")
                else:
                    # Fallback to media
                    spa_logo = f"{base_url}/media/{spa_logo}"
                    logger.debug(f"Preview: Using media logo URL: {spa_logo}")
            else:
                # For PDF: use file:// path (absolute path)
                # Try uploads first (where files are actually saved)
                uploads_logo_path = uploads_base_path / spa_logo
                if uploads_logo_path.exists():
                    # Ensure proper file:// URL format (file:///absolute/path)
                    spa_logo = f"file:///{uploads_base_path_str}/{spa_logo}"
                    logger.info(f"PDF: Found logo in uploads: {spa_logo}")
                else:
                    # Fallback to media directory
                    media_logo_path = Path(media_base_path) / spa_logo
                    media_base_path_str_clean = media_base_path_str.lstrip("/")
                    if media_logo_path.exists():
                        spa_logo = f"file:///{media_base_path_str_clean}/{spa_logo}"
                        logger.info(f"PDF: Found logo in media: {spa_logo}")
                    else:
                        # Try uploads anyway (might work if path is correct)
                        spa_logo = f"file:///{uploads_base_path_str}/{spa_logo}"
                        logger.warning(f"PDF: Logo not found in uploads or media, using uploads path anyway: {spa_logo}")
        # If it's already a full URL or file:// path, keep it as is
        else:
            logger.debug(f"Logo is already a full URL/path: {spa_logo[:100]}")
    else:
        spa_logo = ""  # Empty string if no logo
        logger.warning(f"No SPA logo found in spa data. SPA object: {spa.get('name', 'Unknown')}")
    
    # Use address field directly from model (already contains full address)
    spa_address = spa.get("address", "").strip() if spa.get("address") else ""
    
    data = {
        "date": certificate_data.get("date", datetime.now().strftime("%d/%m/%Y")),
        "candidate_name": candidate_name,

        # SPA info
        "spa_name": spa.get("name", ""),
        "spa_address": spa_address,  # Use address field directly
        "spa_area": spa.get("area", ""),
        "spa_city": spa.get("city", ""),
        "spa_state": spa.get("state", ""),
        "spa_country": spa.get("country", ""),
        "spa_pincode": spa.get("pincode", ""),
        "spa_phone": spa.get("phone_number", ""),
        "spa_phone1": spa.get("alternate_number", ""),
        "spa_email": spa.get("email", ""),
        "spa_website": spa.get("website", ""),
        "spa_logo": spa_logo,  # Logo with proper path conversion
        
        # Static image paths
        "certificate_background_image": background_image,
        "certificate_stamp_image": stamp_image,
        "certificate_signatory_image": signatory_image,
        # Default signature image path
        # Note: File name is "Bhim Sir Signature.png" (capital S in Signature)
        "default_signature_image": f"{base_url}/static/images/Bhim Sir Signature.png" if use_http_urls else f"file:///{static_base_path_str}/images/Bhim Sir Signature.png",
        # Also provide static_base_url for templates that use it directly
        "static_base_url": base_url if use_http_urls else f"file:///{static_base_path_str}",
    }

    # Merge additional certificate_data without overwriting existing keys
    # For SPA_THERAPIST, exclude signatory_name, signatory_title, and spa_id
    # Always exclude spa_address to prevent frontend from overwriting database address
    excluded_fields = {"spa_address"}  # Always use address from database, not from certificate_data
    if template.category == CertificateCategory.SPA_THERAPIST:
        excluded_fields.update({"signatory_name", "signatory_title", "spa_id"})
    
    for k, v in certificate_data.items():
        if k not in excluded_fields:
            # Special handling for salary_breakdown - if it's a list, convert to HTML
            if k == "salary_breakdown" and isinstance(v, list) and v:
                rows = []
                for row in v:
                    if isinstance(row, dict):
                        month = row.get("month", "")
                        salary = row.get("salary", "")
                        if month or salary:
                            rows.append(f"<tr><td>{month}</td><td>{salary}</td></tr>")
                data[k] = "".join(rows) if rows else "<tr><td>-</td><td>-</td></tr>"
            elif k not in data:
                data[k] = v
    
    # For SPA_THERAPIST, handle image paths/URLs (using cached paths)
    if template.category == CertificateCategory.SPA_THERAPIST:
        base_url = certificate_data.get("base_url", settings.API_BASE_URL)
        media_base_path = _get_media_path()
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
    
    # For ID_CARD, handle candidate_photo image paths/URLs
    if template.category == CertificateCategory.ID_CARD:
        base_url = certificate_data.get("base_url", settings.API_BASE_URL)
        media_base_path = _get_media_path()
        # Remove leading slash for file:// URLs to avoid double slashes
        media_base_path_str = str(media_base_path).replace("\\", "/").lstrip("/")
        
        # Also check uploads directory (where files are actually saved)
        # Get backend root: certificate_service.py is at apps/certificates/services/
        # So we need to go up 4 levels: services -> certificates -> apps -> backend_root
        base_dir = Path(__file__).parent.parent.parent.parent
        uploads_base_path = base_dir / "uploads"
        # Remove leading slash for file:// URLs to avoid double slashes
        uploads_base_path_str = str(uploads_base_path.resolve()).replace("\\", "/").lstrip("/")
        
        # Handle candidate_photo
        if data.get("candidate_photo"):
            photo = data["candidate_photo"]
            logger.debug(f"ID_CARD candidate_photo processing: photo={photo[:50] if len(photo) > 50 else photo}, use_http_urls={use_http_urls}")
            
            # If it's base64 data URL
            if photo.startswith("data:image"):
                if use_http_urls:
                    # For preview: keep base64 as is - it works in HTML
                    data["candidate_photo"] = photo
                    logger.debug("Keeping base64 image for preview")
                else:
                    # For PDF: WeasyPrint can't handle base64 directly, need to convert to file
                    # Try to save to a temporary file if we have certificate_id
                    # Otherwise, try to use a temp file with a unique name
                    import uuid
                    temp_id = certificate_data.get("certificate_id") or int(uuid.uuid4().int % 1000000)
                    temp_path = await save_base64_image(photo, temp_id, "id_card_photo_temp")
                    if temp_path:
                        # Check both uploads and media directories
                        # save_base64_image saves to media/certificates/, so check there first
                        media_photo_path = Path(media_base_path) / temp_path
                        uploads_photo_path = uploads_base_path / temp_path
                        media_base_path_str_clean = media_base_path_str.lstrip("/")
                        
                        if media_photo_path.exists():
                            data["candidate_photo"] = f"file:///{media_base_path_str_clean}/{temp_path}"
                            logger.info(f"PDF: Converted base64 to file path (media): {data['candidate_photo']}")
                        elif uploads_photo_path.exists():
                            data["candidate_photo"] = f"file:///{uploads_base_path_str}/{temp_path}"
                            logger.info(f"PDF: Converted base64 to file path (uploads): {data['candidate_photo']}")
                        else:
                            # File was just saved, use media path (where save_base64_image saves)
                            data["candidate_photo"] = f"file:///{media_base_path_str_clean}/{temp_path}"
                            logger.warning(f"PDF: Using saved file path (may not exist yet): {data['candidate_photo']}")
                    else:
                        logger.error("Failed to save base64 image to file for PDF generation")
                        data["candidate_photo"] = ""  # Empty to avoid broken image
            # If it's a relative file path (certificates/filename.jpg), convert to appropriate URL
            elif photo.startswith("certificates/"):
                if use_http_urls:
                    # For preview: use HTTP URL - try uploads first, then media
                    uploads_photo_path = uploads_base_path / photo
                    if uploads_photo_path.exists():
                        data["candidate_photo"] = f"{base_url}/uploads/{photo}"
                        logger.debug(f"Preview: Found in uploads: {data['candidate_photo']}")
                    else:
                        data["candidate_photo"] = f"{base_url}/media/{photo}"
                        logger.debug(f"Preview: Using media URL: {data['candidate_photo']}")
                else:
                    # For PDF: use file:// path (absolute path)
                    # save_base64_image saves to media/certificates/, so check media first
                    media_photo_path = Path(media_base_path) / photo
                    uploads_photo_path = uploads_base_path / photo
                    
                    media_base_path_str_clean = media_base_path_str.lstrip("/")
                    
                    # Check media first (where save_base64_image saves files)
                    if media_photo_path.exists():
                        file_url = f"file:///{media_base_path_str_clean}/{photo}"
                        data["candidate_photo"] = file_url
                        logger.info(f"PDF: Found file in media: {file_url}")
                    elif uploads_photo_path.exists():
                        file_url = f"file:///{uploads_base_path_str}/{photo}"
                        data["candidate_photo"] = file_url
                        logger.info(f"PDF: Found file in uploads: {file_url}")
                    else:
                        # File should exist in media (where save_base64_image saves)
                        # Use media path even if file check fails (might be a timing issue)
                        file_url = f"file:///{media_base_path_str_clean}/{photo}"
                        data["candidate_photo"] = file_url
                        logger.warning(f"PDF: File not found in uploads or media, using media path: {file_url}")
                        logger.warning(f"PDF: Expected file at: {media_photo_path}")
                        logger.warning(f"PDF: Also checked: {uploads_photo_path}")
            # Handle blob URLs (browser-specific, can't be used for PDF)
            elif photo.startswith("blob:"):
                if use_http_urls:
                    # For preview: blob URLs work in browsers
                    data["candidate_photo"] = photo
                    logger.debug(f"Keeping blob URL for preview: {photo[:50]}")
                else:
                    # For PDF: blob URLs don't work, need to convert or use file path
                    logger.error(f"Blob URL cannot be used for PDF generation: {photo[:50]}. Frontend should send base64 data URL or file path instead.")
                    data["candidate_photo"] = ""  # Empty to avoid broken image
            # If it's already a full HTTP/HTTPS URL or file:// path, keep it as is
            elif photo.startswith("http://") or photo.startswith("https://") or photo.startswith("file://"):
                if use_http_urls:
                    # For preview: HTTP URLs work
                    data["candidate_photo"] = photo
                    logger.debug(f"Keeping existing HTTP URL: {photo[:50]}")
                else:
                    # For PDF: HTTP URLs might work if accessible, but file:// is better
                    # Try to convert HTTP URL to file path if it's a local server file
                    if base_url and photo.startswith(base_url):
                        # It's a local server file, try to extract path
                        relative_path = photo.replace(f"{base_url}/uploads/", "").replace(f"{base_url}/media/", "")
                        if relative_path:
                            uploads_photo_path = uploads_base_path / relative_path
                            if uploads_photo_path.exists():
                                data["candidate_photo"] = f"file:///{uploads_base_path_str}/{relative_path}"
                                logger.info(f"PDF: Converted HTTP URL to file path: {data['candidate_photo']}")
                            else:
                                data["candidate_photo"] = photo  # Keep HTTP URL as fallback
                                logger.warning(f"PDF: Could not convert HTTP URL to file path, using HTTP URL: {photo[:50]}")
                        else:
                            data["candidate_photo"] = photo
                    else:
                        data["candidate_photo"] = photo
                        logger.warning(f"PDF: Using HTTP URL (may not work): {photo[:50]}")
            else:
                # Unknown format, try to use as is
                data["candidate_photo"] = photo
                logger.warning(f"Unknown photo format, using as is: {photo[:50]}")
        else:
            # If no photo, set empty string to avoid broken image
            data["candidate_photo"] = ""
            logger.debug("No candidate_photo provided")

    # Category-specific defaults (only set if not already in data)

    # Build salary breakdown HTML for Manager Salary certificates
    salary_breakdown_html = ""
    raw_breakdown = certificate_data.get("salary_breakdown")

    # Case 1: salary_breakdown already provided as list of dicts
    if isinstance(raw_breakdown, list) and raw_breakdown:
        rows = []
        for row in raw_breakdown:
            month = row.get("month", "") if isinstance(row, dict) else ""
            salary = row.get("salary", "") if isinstance(row, dict) else ""
            if month or salary:
                rows.append(f"<tr><td>{month}</td><td>{salary}</td></tr>")
        salary_breakdown_html = "".join(rows)
    else:
        # Case 2: Build from month_year_list + month_salary_list
        # Check both certificate_data and data (in case it was already merged)
        month_year_list = certificate_data.get("month_year_list") or data.get("month_year_list") or []
        month_salary_list = certificate_data.get("month_salary_list") or data.get("month_salary_list") or []

        # Support JSON strings from frontend (if any)
        try:
            import json
            if isinstance(month_year_list, str):
                month_year_list = json.loads(month_year_list)
            if isinstance(month_salary_list, str):
                month_salary_list = json.loads(month_salary_list)
        except Exception:
            # If parsing fails, keep original values
            pass

        if isinstance(month_year_list, list) and isinstance(month_salary_list, list):
            rows = []
            # Use the longer list to ensure we process all entries
            max_len = max(len(month_year_list), len(month_salary_list))
            for i in range(max_len):
                month = month_year_list[i] if i < len(month_year_list) else ""
                salary = month_salary_list[i] if i < len(month_salary_list) else ""
                month_str = str(month).strip() if month else ""
                salary_str = str(salary).strip() if salary else ""
                # Only add row if at least one field has a value
                if month_str or salary_str:
                    rows.append(f"<tr><td>{month_str}</td><td>{salary_str}</td></tr>")
            salary_breakdown_html = "".join(rows) if rows else ""

    category_defaults = {
        CertificateCategory.MANAGER_SALARY: {
            "position": "Manager",
            "joining_date": "",
            "monthly_salary": "",
            "salary_in_words": "",
            "salary_breakdown": salary_breakdown_html or "<tr><td>-</td><td>-</td></tr>"
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
        },
        CertificateCategory.ID_CARD: {
            "candidate_name": candidate_name,
            "candidate_photo": "",
            "designation": "",
            "date_of_joining": "",
            "contact_number": "",
            "issue_date": datetime.now().strftime("%d/%m/%Y")
        }
    }

    # Only set defaults if key doesn't exist or is empty
    defaults = category_defaults.get(template.category, {})
    for key, default_value in defaults.items():
        if key not in data or not data.get(key):
            data[key] = default_value
    
    # Final check: Ensure salary_breakdown is HTML string, not a list
    if template.category == CertificateCategory.MANAGER_SALARY:
        if "salary_breakdown" in data and isinstance(data["salary_breakdown"], list):
            rows = []
            for row in data["salary_breakdown"]:
                if isinstance(row, dict):
                    month = row.get("month", "")
                    salary = row.get("salary", "")
                    if month or salary:
                        rows.append(f"<tr><td>{month}</td><td>{salary}</td></tr>")
            data["salary_breakdown"] = "".join(rows) if rows else "<tr><td>-</td><td>-</td></tr>"
        elif "salary_breakdown" not in data or not data.get("salary_breakdown"):
            # If no salary_breakdown at all, try to build from month_year_list and month_salary_list
            month_year_list = data.get("month_year_list") or certificate_data.get("month_year_list") or []
            month_salary_list = data.get("month_salary_list") or certificate_data.get("month_salary_list") or []
            if isinstance(month_year_list, list) and isinstance(month_salary_list, list):
                rows = []
                # Use the longer list to ensure we process all entries
                max_len = max(len(month_year_list), len(month_salary_list))
                for i in range(max_len):
                    month = month_year_list[i] if i < len(month_year_list) else ""
                    salary = month_salary_list[i] if i < len(month_salary_list) else ""
                    month_str = str(month).strip() if month else ""
                    salary_str = str(salary).strip() if salary else ""
                    # Only add row if at least one field has a value
                    if month_str or salary_str:
                        rows.append(f"<tr><td>{month_str}</td><td>{salary_str}</td></tr>")
                data["salary_breakdown"] = "".join(rows) if rows else "<tr><td>-</td><td>-</td></tr>"
    
    return data


def get_certificate_model(category: CertificateCategory):
    """Get the appropriate certificate model based on category"""
    model_map = {
        CertificateCategory.SPA_THERAPIST: SpaTherapistCertificate,
        CertificateCategory.MANAGER_SALARY: ManagerSalaryCertificate,
        CertificateCategory.EXPERIENCE_LETTER: ExperienceLetterCertificate,
        CertificateCategory.APPOINTMENT_LETTER: AppointmentLetterCertificate,
        CertificateCategory.INVOICE_SPA_BILL: InvoiceSpaBillCertificate,
        CertificateCategory.ID_CARD: IDCardCertificate,
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

        CertificateCategory.ID_CARD: {
            "candidate_name": certificate_payload.get("candidate_name") or name,
            "candidate_photo": None,  # Will be set after certificate is created
            "designation": certificate_payload.get("designation"),
            "date_of_joining": certificate_payload.get("date_of_joining"),
            "contact_number": certificate_payload.get("contact_number"),
            "issue_date": certificate_payload.get("issue_date") or datetime.now().strftime("%d/%m/%Y"),
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
            photo_path = await save_base64_image(passport_photo, certificate.id, "photo")
            if photo_path:
                certificate.passport_size_photo = photo_path
        
        if signature:
            signature_path = await save_base64_image(signature, certificate.id, "signature")
            if signature_path:
                certificate.candidate_signature = signature_path
    
    # Save base64 images as files for ID_CARD category
    if template.category == CertificateCategory.ID_CARD:
        candidate_photo = certificate_payload.get("candidate_photo")
        
        if candidate_photo:
            photo_path = await save_base64_image(candidate_photo, certificate.id, "id_card_photo")
            if photo_path:
                certificate.candidate_photo = photo_path
    
    await db.commit()
    await db.refresh(certificate)

    # Determine display name
    display_name_field = {
        CertificateCategory.SPA_THERAPIST: "candidate_name",
        CertificateCategory.EXPERIENCE_LETTER: "candidate_name",
        CertificateCategory.APPOINTMENT_LETTER: "employee_name",
        CertificateCategory.ID_CARD: "candidate_name",
    }.get(template.category, None)
    display_name = getattr(certificate, display_name_field, name) if display_name_field else name

    # Prepare template data (use file:// URLs for PDF generation)
    # Update certificate_payload with saved image paths from certificate
    if template.category == CertificateCategory.SPA_THERAPIST:
        if certificate.passport_size_photo:
            certificate_payload["passport_size_photo"] = certificate.passport_size_photo
        if certificate.candidate_signature:
            certificate_payload["candidate_signature"] = certificate.candidate_signature
    
    if template.category == CertificateCategory.ID_CARD:
        # Use saved photo path from database if available
        if certificate.candidate_photo:
            certificate_payload["candidate_photo"] = certificate.candidate_photo
            logger.info(f"Using saved candidate_photo from database: {certificate.candidate_photo}")
        # If still base64 in payload (shouldn't happen after save, but handle it)
        elif certificate_payload.get("candidate_photo") and certificate_payload["candidate_photo"].startswith("data:image"):
            # Convert base64 to file path if not already saved
            logger.warning("Base64 candidate_photo found in payload during PDF generation, converting to file...")
            photo_path = await save_base64_image(certificate_payload["candidate_photo"], certificate.id, "id_card_photo")
            if photo_path:
                certificate.candidate_photo = photo_path
                certificate_payload["candidate_photo"] = photo_path
                await db.commit()
                await db.refresh(certificate)
                logger.info(f"Converted base64 to file path: {photo_path}")
            else:
                logger.error("Failed to save base64 candidate_photo to file")
    
    data = await prepare_certificate_data(template, certificate_payload, display_name, use_http_urls=False)

    # Render PDF if HTML template
    if template.template_type == TemplateType.HTML:
        if not template.template_html:
            raise ValidationError("HTML template requires template_html content. Please provide HTML in the template.")
        html_content = template.template_html
        rendered_html = render_html_template(html_content, data)
        try:
            pdf_bytes = html_to_pdf(rendered_html)
            certificate.certificate_pdf = await save_certificate_file(certificate.id, pdf_bytes, "pdf")
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

async def get_generated_certificate_by_id(db: AsyncSession, certificate_id: int):
    """Get a certificate by ID from any certificate table"""
    models = [
        SpaTherapistCertificate,
        ManagerSalaryCertificate,
        ExperienceLetterCertificate,
        AppointmentLetterCertificate,
        InvoiceSpaBillCertificate,
        IDCardCertificate,
        GeneratedCertificate,
    ]
    
    # Search all certificate tables
    for model in models:
        try:
            stmt = select(model).where(model.id == certificate_id)
            result = await db.execute(stmt)
            certificate = result.scalar_one_or_none()
            if certificate:
                return certificate
        except Exception as e:
            logger.warning(f"Error searching {model.__tablename__} for certificate {certificate_id}: {e}")
            continue
    
    return None


async def get_public_certificates(db: AsyncSession, skip: int = 0, limit: int = 100):
    """Get all public generated certificates from all certificate tables
    
    Optimized: Executes queries in parallel and uses database-level sorting where possible
    """
    import asyncio
    models = [
        SpaTherapistCertificate,
        ManagerSalaryCertificate,
        ExperienceLetterCertificate,
        AppointmentLetterCertificate,
        InvoiceSpaBillCertificate,
        IDCardCertificate,
        GeneratedCertificate,
    ]
    
    # Execute all queries in parallel for better performance
    async def fetch_certificates(model):
        try:
            stmt = select(model).where(model.is_public.is_(True))
            result = await db.execute(stmt)
            return list(result.scalars().all())
        except Exception as e:
            logger.warning(f"Error fetching certificates from {model.__tablename__}: {e}")
            return []
    
    # Execute all queries concurrently
    results = await asyncio.gather(*[fetch_certificates(model) for model in models])
    
    # Flatten results
    all_certificates = []
    for cert_list in results:
        all_certificates.extend(cert_list)

    # Sort by generated_at (handling None values)
    all_certificates.sort(
        key=lambda x: x.generated_at if hasattr(x, 'generated_at') and x.generated_at else datetime(1970, 1, 1, tzinfo=timezone.utc),
        reverse=True
    )
    
    # Apply pagination
    return all_certificates[skip:skip + limit]


async def get_user_certificates(db: AsyncSession, user_id: int, skip: int = 0, limit: int = 100):
    """Get certificates created by a specific user
    
    Optimized: Executes queries in parallel for better performance
    """
    import asyncio
    models = [
        SpaTherapistCertificate,
        ManagerSalaryCertificate,
        ExperienceLetterCertificate,
        AppointmentLetterCertificate,
        InvoiceSpaBillCertificate,
        IDCardCertificate,
        GeneratedCertificate,
    ]
    
    # Execute all queries in parallel
    async def fetch_user_certificates(model):
        try:
            stmt = select(model).where(model.created_by == user_id)
            result = await db.execute(stmt)
            return list(result.scalars().all())
        except Exception as e:
            logger.warning(f"Error fetching certificates from {model.__tablename__}: {e}")
            return []
    
    # Execute all queries concurrently
    results = await asyncio.gather(*[fetch_user_certificates(model) for model in models])
    
    # Flatten results
    all_certificates = []
    for cert_list in results:
        all_certificates.extend(cert_list)

    # Sort certificates by date, handling None values and different date field names
    def get_sort_date(cert):
        if hasattr(cert, 'generated_at') and cert.generated_at:
            return cert.generated_at
        elif hasattr(cert, 'created_at') and cert.created_at:
            return cert.created_at
        else:
            # Fallback to a very old date if no date is available
            return datetime(1970, 1, 1, tzinfo=timezone.utc)
    
    all_certificates.sort(key=get_sort_date, reverse=True)
    return all_certificates[skip:skip + limit]


async def get_all_certificates_with_users(db: AsyncSession, skip: int = 0, limit: int = 100):
    """Get all certificates with user information
    
    Optimized: Executes queries in parallel and batches user lookups
    """
    import asyncio
    from apps.users.models import User
    
    models = [
        SpaTherapistCertificate,
        ManagerSalaryCertificate,
        ExperienceLetterCertificate,
        AppointmentLetterCertificate,
        InvoiceSpaBillCertificate,
        IDCardCertificate,
        GeneratedCertificate,
    ]
    
    # Execute all queries in parallel
    async def fetch_certificates(model):
        try:
            stmt = select(model).offset(skip).limit(limit)
            result = await db.execute(stmt)
            return list(result.scalars().all())
        except Exception as e:
            logger.warning(f"Error fetching certificates from {model.__tablename__}: {e}")
            return []
    
    # Execute all queries concurrently
    results = await asyncio.gather(*[fetch_certificates(model) for model in models])
    
    # Flatten results
    all_certificates = []
    for cert_list in results:
        all_certificates.extend(cert_list)
    
    # Sort by generated_at
    all_certificates.sort(
        key=lambda x: x.generated_at if hasattr(x, 'generated_at') and x.generated_at else getattr(x, 'created_at', None) or datetime(1970, 1, 1, tzinfo=timezone.utc),
        reverse=True
    )
    
    # Get user information for each certificate (batch lookup)
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


async def delete_certificate(db: AsyncSession, certificate_id: int, category: Optional[CertificateCategory] = None) -> bool:
    """Delete a certificate by ID from the appropriate table"""
    models = [
        (SpaTherapistCertificate, CertificateCategory.SPA_THERAPIST),
        (ManagerSalaryCertificate, CertificateCategory.MANAGER_SALARY),
        (ExperienceLetterCertificate, CertificateCategory.EXPERIENCE_LETTER),
        (AppointmentLetterCertificate, CertificateCategory.APPOINTMENT_LETTER),
        (InvoiceSpaBillCertificate, CertificateCategory.INVOICE_SPA_BILL),
        (IDCardCertificate, CertificateCategory.ID_CARD),
        (GeneratedCertificate, None),
    ]
    
    # If category is provided, only check that specific model
    if category:
        model_map = {
            CertificateCategory.SPA_THERAPIST: SpaTherapistCertificate,
            CertificateCategory.MANAGER_SALARY: ManagerSalaryCertificate,
            CertificateCategory.EXPERIENCE_LETTER: ExperienceLetterCertificate,
            CertificateCategory.APPOINTMENT_LETTER: AppointmentLetterCertificate,
            CertificateCategory.INVOICE_SPA_BILL: InvoiceSpaBillCertificate,
            CertificateCategory.ID_CARD: IDCardCertificate,
        }
        model = model_map.get(category)
        if model:
            stmt = delete(model).where(model.id == certificate_id)
            result = await db.execute(stmt)
            await db.commit()
            return result.rowcount > 0
        return False
    
    # If no category, search all models
    for model, _ in models:
        stmt = delete(model).where(model.id == certificate_id)
        result = await db.execute(stmt)
        if result.rowcount > 0:
            await db.commit()
            return True
    
    return False


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
        (IDCardCertificate, CertificateCategory.ID_CARD),
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

