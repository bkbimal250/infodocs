"""
Certificate Routers
API endpoints for certificate management
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response, Query
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from pathlib import Path
import io
import logging

from config.database import get_db
from config.settings import settings
from apps.users.models import User
from core.dependencies import require_role, get_current_active_user
from apps.certificates.models import CertificateCategory, TemplateType
from apps.certificates.schemas import (
    PublicCertificateCreate,
    CertificateTemplateResponse,
    GeneratedCertificateResponse,
    TemplateCreate,
    TemplateUpdate,
)
from pydantic import BaseModel
from apps.certificates.services.certificate_service import (
    get_public_templates,
    get_template_by_id,
    get_all_templates,
    create_template,
    update_template,
    delete_template,
    create_generated_certificate,
    get_generated_certificate_by_id,
    get_public_certificates,
    get_user_certificates,
    get_all_certificates_with_users,
    get_certificate_statistics,
    prepare_certificate_data,
    delete_certificate,
)
from apps.certificates.services.pdf_generator import render_html_template, html_to_pdf, html_to_image
from core.exceptions import NotFoundError, ValidationError

logger = logging.getLogger(__name__)
certificates_router = APIRouter()


# -------------------------
# Public Endpoints
# -------------------------

@certificates_router.get("/templates", response_model=List[CertificateTemplateResponse])
async def list_public_templates(db: AsyncSession = Depends(get_db)):
    """List all public certificate templates"""
    try:
        return await get_public_templates(db)
    except Exception as e:
        logger.error(f"Error listing public templates: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to retrieve templates: {str(e)}")


@certificates_router.get("/templates/{template_id}", response_model=CertificateTemplateResponse)
async def get_public_template(template_id: int, db: AsyncSession = Depends(get_db)):
    """Get a single public certificate template"""
    try:
        template = await get_template_by_id(db, template_id)
        if not template or not template.is_public or not template.is_active:
            raise HTTPException(status_code=404, detail="Template not found or unavailable")
        return template
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting public template {template_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to retrieve template: {str(e)}")


@certificates_router.post("/preview")
async def preview_certificate(
    certificate_data: PublicCertificateCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Preview certificate HTML before generation (Authentication required)"""
    template = await get_template_by_id(db, certificate_data.template_id)
    if not template or not template.is_public or not template.is_active:
        raise HTTPException(status_code=404, detail="Template not found or unavailable")

    # Get base URL for HTTP image paths (for browser preview)
    base_url = str(request.base_url).rstrip('/')
    cert_data = certificate_data.certificate_data or {}
    cert_data['base_url'] = base_url
    
    # Load SPA data from database if spa_id is provided but spa object is missing
    if certificate_data.spa_id and not cert_data.get("spa"):
        from apps.forms_app.models import SPA
        from sqlalchemy import select
        spa_stmt = select(SPA).where(SPA.id == certificate_data.spa_id)
        spa_result = await db.execute(spa_stmt)
        spa_obj = spa_result.scalar_one_or_none()
        if spa_obj:
            cert_data["spa"] = {
                "id": spa_obj.id,
                "name": spa_obj.name or "",
                "address": spa_obj.address or "",
                "area": spa_obj.area or "",
                "city": spa_obj.city or "",
                "state": spa_obj.state or "",
                "country": spa_obj.country or "",
                "pincode": spa_obj.pincode or "",
                "phone_number": spa_obj.phone_number or "",
                "alternate_number": spa_obj.alternate_number or "",
                "email": spa_obj.email or "",
                "website": spa_obj.website or "",
                "logo": spa_obj.logo or "",
            }
            cert_data["spa_id"] = spa_obj.id
    
    data = prepare_certificate_data(template, cert_data, certificate_data.name, use_http_urls=True)
    if template.template_type != TemplateType.HTML:
        raise HTTPException(status_code=400, detail="Preview not available for this template type")

    if not template.template_html:
        raise HTTPException(status_code=400, detail="HTML template requires template_html content. Please provide HTML in the template.")
    
    html_content = template.template_html
    rendered_html = render_html_template(html_content, data)
    return {"html": rendered_html}


@certificates_router.post("/generate")
async def generate_certificate(
    certificate_data: PublicCertificateCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Generate a certificate and return PDF for download (Authentication required)"""
    try:
        # Get IP address and user agent for activity tracking
        ip_address = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent")
        
        certificate = await create_generated_certificate(
            db=db,
            template_id=certificate_data.template_id,
            name=certificate_data.name,
            certificate_data=certificate_data.certificate_data,
            created_by=current_user.id,
            is_public=True,
            ip_address=ip_address,
            user_agent=user_agent
        )

        template = await get_template_by_id(db, certificate.template_id)
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")

        display_name = getattr(certificate, 'therapist_name', None) \
                       or getattr(certificate, 'employee_name', None) \
                       or certificate_data.name
        
        # Load SPA data from database if spa_id is provided but spa object is missing
        cert_data = certificate.certificate_data or {}
        if certificate_data.spa_id and not cert_data.get("spa"):
            from apps.forms_app.models import SPA
            from sqlalchemy import select
            spa_stmt = select(SPA).where(SPA.id == certificate_data.spa_id)
            spa_result = await db.execute(spa_stmt)
            spa_obj = spa_result.scalar_one_or_none()
            if spa_obj:
                cert_data["spa"] = {
                    "id": spa_obj.id,
                    "name": spa_obj.name or "",
                    "address": spa_obj.address or "",
                    "area": spa_obj.area or "",
                    "city": spa_obj.city or "",
                    "state": spa_obj.state or "",
                    "country": spa_obj.country or "",
                    "pincode": spa_obj.pincode or "",
                    "phone_number": spa_obj.phone_number or "",
                    "alternate_number": spa_obj.alternate_number or "",
                    "email": spa_obj.email or "",
                    "website": spa_obj.website or "",
                    "logo": spa_obj.logo or "",
                }
                cert_data["spa_id"] = spa_obj.id
        
        # For PDF generation, use file:// paths (not HTTP URLs)
        data = prepare_certificate_data(template, cert_data, display_name, use_http_urls=False)

        if template.template_type != TemplateType.HTML:
            raise HTTPException(status_code=400, detail="PDF generation not available for this template type")

        if not template.template_html:
            raise HTTPException(status_code=400, detail="HTML template requires template_html content. Please provide HTML in the template.")
        
        html_content = template.template_html
        rendered_html = render_html_template(html_content, data)
        
        # Generate PDF with detailed error logging
        try:
            logger.info(f"Generating PDF for certificate {certificate.id}")
            pdf_bytes = html_to_pdf(rendered_html)
            logger.info(f"PDF generated successfully: {len(pdf_bytes)} bytes")
        except Exception as pdf_error:
            logger.error(f"PDF generation failed: {pdf_error}", exc_info=True)
            raise HTTPException(
                status_code=500,
                detail=f"PDF generation failed: {str(pdf_error)}. Please check server logs and ensure WeasyPrint dependencies are installed."
            )

        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=certificate_{certificate.id}.pdf"}
        )
    except HTTPException:
        raise
    except ValidationError as e:
        error_detail = getattr(e, 'message', str(e))
        raise HTTPException(status_code=422, detail=error_detail)
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error generating certificate: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to generate certificate: {str(e)}")


@certificates_router.get("/generated/public", response_model=List[GeneratedCertificateResponse])
async def list_public_certificates(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    """List all public generated certificates"""
    return await get_public_certificates(db, skip=skip, limit=limit)


@certificates_router.get("/generated/my-certificates", response_model=List[GeneratedCertificateResponse])
async def list_my_certificates(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List certificates created by the current user"""
    try:
        return await get_user_certificates(db, user_id=current_user.id, skip=skip, limit=limit)
    except Exception as e:
        logger.error(f"Error listing user certificates: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to retrieve certificates: {str(e)}")


@certificates_router.get("/generated/{certificate_id}", response_model=GeneratedCertificateResponse)
async def get_public_certificate(certificate_id: int, db: AsyncSession = Depends(get_db)):
    """Get a single public certificate"""
    certificate = await get_generated_certificate_by_id(db, certificate_id)
    if not certificate or not certificate.is_public:
        raise HTTPException(status_code=404, detail="Certificate not found or not public")
    return certificate


@certificates_router.get("/generated/{certificate_id}/download/pdf")
async def download_certificate_pdf(certificate_id: int, db: AsyncSession = Depends(get_db)):
    """Download certificate as PDF"""
    certificate = await get_generated_certificate_by_id(db, certificate_id)
    if not certificate or not certificate.is_public:
        raise HTTPException(status_code=404, detail="Certificate not found or not public")

    if certificate.certificate_pdf:
        pdf_path = Path(settings.UPLOAD_DIR) / certificate.certificate_pdf
        if pdf_path.exists():
            return FileResponse(str(pdf_path), media_type="application/pdf",
                                filename=f"certificate_{certificate_id}.pdf")

    template = await get_template_by_id(db, certificate.template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    if not template.template_html:
        raise HTTPException(status_code=400, detail="HTML template requires template_html content.")
    
    # Load SPA data from database if spa_id exists but spa object is missing
    cert_data = certificate.certificate_data or {}
    
    # For MANAGER_SALARY certificates, merge model fields into cert_data
    if hasattr(certificate, 'manager_name'):
        from apps.certificates.models import ManagerSalaryCertificate
        if isinstance(certificate, ManagerSalaryCertificate):
            cert_data["manager_name"] = certificate.manager_name or cert_data.get("manager_name")
            cert_data["position"] = certificate.position or cert_data.get("position")
            cert_data["joining_date"] = certificate.joining_date or cert_data.get("joining_date")
            cert_data["monthly_salary"] = certificate.monthly_salary or cert_data.get("monthly_salary")
            cert_data["monthly_salary_in_words"] = certificate.monthly_salary_in_words or cert_data.get("monthly_salary_in_words")
            # Always include month_year_list and month_salary_list from model, even if empty
            if hasattr(certificate, 'month_year_list'):
                cert_data["month_year_list"] = certificate.month_year_list if certificate.month_year_list else []
            if hasattr(certificate, 'month_salary_list'):
                cert_data["month_salary_list"] = certificate.month_salary_list if certificate.month_salary_list else []
    
    # For ID_CARD certificates, merge model fields into cert_data
    if hasattr(certificate, 'candidate_name') and hasattr(certificate, 'designation'):
        from apps.certificates.models import IDCardCertificate
        if isinstance(certificate, IDCardCertificate):
            cert_data["candidate_name"] = certificate.candidate_name or cert_data.get("candidate_name")
            cert_data["candidate_photo"] = certificate.candidate_photo or cert_data.get("candidate_photo")
            cert_data["designation"] = certificate.designation or cert_data.get("designation")
            cert_data["date_of_joining"] = certificate.date_of_joining or cert_data.get("date_of_joining")
            cert_data["contact_number"] = certificate.contact_number or cert_data.get("contact_number")
            cert_data["issue_date"] = certificate.issue_date or cert_data.get("issue_date")
    
    if hasattr(certificate, 'spa_id') and certificate.spa_id and not cert_data.get("spa"):
        from apps.forms_app.models import SPA
        from sqlalchemy import select
        spa_stmt = select(SPA).where(SPA.id == certificate.spa_id)
        spa_result = await db.execute(spa_stmt)
        spa_obj = spa_result.scalar_one_or_none()
        if spa_obj:
            cert_data["spa"] = {
                "id": spa_obj.id,
                "name": spa_obj.name or "",
                "address": spa_obj.address or "",
                "area": spa_obj.area or "",
                "city": spa_obj.city or "",
                "state": spa_obj.state or "",
                "country": spa_obj.country or "",
                "pincode": spa_obj.pincode or "",
                "phone_number": spa_obj.phone_number or "",
                "alternate_number": spa_obj.alternate_number or "",
                "email": spa_obj.email or "",
                "website": spa_obj.website or "",
                "logo": spa_obj.logo or "",
            }
            cert_data["spa_id"] = spa_obj.id
    
    data = prepare_certificate_data(template, cert_data, certificate.candidate_name or "", use_http_urls=False)
    html_content = template.template_html
    rendered_html = render_html_template(html_content, data)
    pdf_bytes = html_to_pdf(rendered_html)

    return StreamingResponse(io.BytesIO(pdf_bytes), media_type="application/pdf",
                             headers={"Content-Disposition": f"attachment; filename=certificate_{certificate_id}.pdf"})


@certificates_router.get("/generated/{certificate_id}/download/image")
async def download_certificate_image(certificate_id: int, db: AsyncSession = Depends(get_db)):
    """Download certificate as image (PNG)"""
    certificate = await get_generated_certificate_by_id(db, certificate_id)
    if not certificate or not certificate.is_public:
        raise HTTPException(status_code=404, detail="Certificate not found or not public")

    template = await get_template_by_id(db, certificate.template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    if not template.template_html:
        raise HTTPException(status_code=400, detail="HTML template requires template_html content.")
    
    # Load SPA data from database if spa_id exists but spa object is missing
    cert_data = certificate.certificate_data or {}
    if hasattr(certificate, 'spa_id') and certificate.spa_id and not cert_data.get("spa"):
        from apps.forms_app.models import SPA
        from sqlalchemy import select
        spa_stmt = select(SPA).where(SPA.id == certificate.spa_id)
        spa_result = await db.execute(spa_stmt)
        spa_obj = spa_result.scalar_one_or_none()
        if spa_obj:
            cert_data["spa"] = {
                "id": spa_obj.id,
                "name": spa_obj.name or "",
                "address": spa_obj.address or "",
                "area": spa_obj.area or "",
                "city": spa_obj.city or "",
                "state": spa_obj.state or "",
                "country": spa_obj.country or "",
                "pincode": spa_obj.pincode or "",
                "phone_number": spa_obj.phone_number or "",
                "alternate_number": spa_obj.alternate_number or "",
                "email": spa_obj.email or "",
                "website": spa_obj.website or "",
                "logo": spa_obj.logo or "",
            }
            cert_data["spa_id"] = spa_obj.id
    
    data = prepare_certificate_data(template, cert_data, certificate.candidate_name or "", use_http_urls=False)
    html_content = template.template_html
    rendered_html = render_html_template(html_content, data)
    image_bytes = html_to_image(rendered_html)

    return StreamingResponse(io.BytesIO(image_bytes), media_type="image/png",
                             headers={"Content-Disposition": f"attachment; filename=certificate_{certificate_id}.png"})


# -------------------------
# Protected Endpoints (Admin/Manager/HR)
# -------------------------

@certificates_router.post("/templates", response_model=CertificateTemplateResponse, status_code=status.HTTP_201_CREATED)
async def create_template_endpoint(
    template_data: TemplateCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "super_admin", "spa_manager", "hr"))
):
    """Create certificate template"""
    try:
        # Validate HTML template has content
        if template_data.template_type == TemplateType.HTML and not template_data.template_html:
            raise HTTPException(
                status_code=422,
                detail="template_html is required when template_type is 'html'. Please paste your HTML code in the Template HTML field."
            )
        
        category_enum = CertificateCategory(template_data.category)
        template_type_enum = TemplateType(template_data.template_type)

        return await create_template(
            db=db,
            name=template_data.name,
            category=category_enum,
            created_by=current_user.id,
            template_image=template_data.template_image,
            template_html=template_data.template_html,
            template_type=template_type_enum,
            is_active=template_data.is_active,
            is_public=template_data.is_public,
            template_config=template_data.template_config or {}
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))


@certificates_router.put("/templates/{template_id}", response_model=CertificateTemplateResponse)
async def update_template_endpoint(
    template_id: int,
    template_data: TemplateUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "super_admin", "spa_manager", "hr"))
):
    """Update certificate template"""
    try:
        category_enum = TemplateType(template_data.template_type) if template_data.template_type else None
        template_enum = CertificateCategory(template_data.category) if template_data.category else None

        template = await update_template(
            db=db,
            template_id=template_id,
            name=template_data.name,
            category=template_enum,
            template_image=template_data.template_image,
            template_html=template_data.template_html,
            template_type=category_enum,
            is_active=template_data.is_active,
            is_public=template_data.is_public,
            template_config=template_data.template_config
        )

        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        return template
    except HTTPException:
        raise
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Error updating template {template_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to update template: {str(e)}")


@certificates_router.delete("/templates/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_template_endpoint(
    template_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "super_admin", "spa_manager", "hr"))
):
    """Delete certificate template"""
    try:
        deleted = await delete_template(db, template_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Template not found")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting template {template_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to delete template: {str(e)}")


@certificates_router.get("/admin/statistics")
async def get_certificate_statistics_endpoint(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "super_admin"))
):
    """Get certificate statistics for admin dashboard"""
    try:
        return await get_certificate_statistics(db)
    except Exception as e:
        logger.error(f"Error getting certificate statistics: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to retrieve statistics: {str(e)}")


@certificates_router.get("/admin/all")
async def get_all_certificates_admin(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "super_admin"))
):
    """Get all certificates with user information (admin only)"""
    try:
        certificates = await get_all_certificates_with_users(db, skip=skip, limit=limit)
        return certificates
    except Exception as e:
        logger.error(f"Error getting all certificates: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to retrieve certificates: {str(e)}")


@certificates_router.delete("/admin/{certificate_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_certificate_admin(
    certificate_id: int,
    category: Optional[str] = Query(None, description="Optional category to speed up deletion"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "super_admin"))
):
    """Delete a certificate (admin only)"""
    try:
        cert_category = None
        if category:
            try:
                cert_category = CertificateCategory(category)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid category: {category}")
        
        deleted = await delete_certificate(db, certificate_id, cert_category)
        if not deleted:
            raise HTTPException(status_code=404, detail="Certificate not found")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting certificate {certificate_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to delete certificate: {str(e)}")


class BulkDeleteRequest(BaseModel):
    certificate_ids: List[int]


@certificates_router.post("/admin/bulk-delete", status_code=status.HTTP_200_OK)
async def bulk_delete_certificates_admin(
    request: BulkDeleteRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "super_admin"))
):
    """Delete multiple certificates (admin only)"""
    try:
        deleted_count = 0
        failed_ids = []
        
        for cert_id in request.certificate_ids:
            try:
                deleted = await delete_certificate(db, cert_id, None)
                if deleted:
                    deleted_count += 1
                else:
                    failed_ids.append(cert_id)
            except Exception as e:
                logger.error(f"Error deleting certificate {cert_id}: {e}")
                failed_ids.append(cert_id)
        
        return {
            "deleted_count": deleted_count,
            "failed_count": len(failed_ids),
            "failed_ids": failed_ids,
            "message": f"Successfully deleted {deleted_count} certificate(s)"
        }
    except Exception as e:
        logger.error(f"Error in bulk delete: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to delete certificates: {str(e)}")
