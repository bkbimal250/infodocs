"""
Forms Routers
API endpoints for form submissions and SPA management
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import EmailStr
from config.database import get_db
from apps.users.models import User
from core.dependencies import require_role, get_current_active_user
import logging
import traceback

logger = logging.getLogger(__name__)
from apps.forms_app.services.spa_service import (
    create_spa,
    get_spa_by_id,
    get_all_spas,
    update_spa,
    delete_spa,
    hard_delete_spa,
)
from apps.forms_app.services.candidate_form_service import (
    create_candidate_form,
    get_candidate_form_by_id,
    get_all_candidate_forms,
    get_all_candidate_forms_with_users,
    update_candidate_form,
    delete_candidate_form,
    get_forms_statistics,
)
from apps.forms_app.services.hiring_form_service import (
    create_hiring_form,
    get_hiring_form_by_id,
    get_all_hiring_forms,
    get_all_hiring_forms_with_users,
    update_hiring_form,
    delete_hiring_form,
)


from apps.forms_app.schemas import (
    SPACreate,
    SPAUpdate,
    SPAResponse,
    CandidateFormCreate,
    CandidateFormUpdate,
    CandidateFormResponse,
    HiringFormCreate,
    HiringFormUpdate,
    HiringFormResponse,
)
from pydantic import BaseModel


class MessageResponseSchema(BaseModel):
    """Message response schema"""
    message: str
from core.exceptions import NotFoundError, ValidationError
import os
import uuid
from pathlib import Path

forms_router = APIRouter()

# File upload directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
(UPLOAD_DIR / "candidate_forms").mkdir(exist_ok=True)


def save_uploaded_file(file: UploadFile, subdirectory: str = "") -> str:
    """Save uploaded file and return the relative file path"""
    file_ext = Path(file.filename).suffix if file.filename else ""
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    save_dir = UPLOAD_DIR / subdirectory
    save_dir.mkdir(exist_ok=True)
    file_path = save_dir / unique_filename
    
    with open(file_path, "wb") as buffer:
        content = file.file.read()
        buffer.write(content)
    
    # Return relative path from UPLOAD_DIR for easier serving
    relative_path = file_path.relative_to(UPLOAD_DIR)
    return str(relative_path).replace('\\', '/')  # Normalize path separators


# Public Endpoints (No authentication required)


@forms_router.get("/spas", response_model=List[SPAResponse])
async def list_spas(db: AsyncSession = Depends(get_db)):
    """List all active SPAs/locations (Public endpoint)"""
    spas = await get_all_spas(db, active_only=True)
    return spas


@forms_router.post("/candidate-forms", response_model=MessageResponseSchema, status_code=status.HTTP_201_CREATED)
async def submit_candidate_form(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    first_name: str = Form(...),
    last_name: str = Form(...),
    middle_name: str = Form(None),
    current_address: str = Form(...),
    aadhar_address: str = Form(None),
    city: str = Form(...),
    zip_code: str = Form(...),
    state: str = Form(...),
    country: str = Form("India"),
    phone_number: str = Form(...),
    work_experience: str = Form(...),
    Therapist_experience: str = Form(...),
    alternate_number: str = Form(None),
    age: int = Form(...),
    position_applied_for: str = Form(...),
    education_certificate_courses: str = Form(None),
    spa_id: int = Form(None),
    spa_name_text: str = Form(None),
    passport_size_photo: UploadFile = File(None),
    age_proof_document: UploadFile = File(None),
    aadhar_card_front: UploadFile = File(None),
    aadhar_card_back: UploadFile = File(None),
    pan_card: UploadFile = File(None),
    signature: UploadFile = File(None),
    documents: List[UploadFile] = File(None),
):
    """Submit candidate form (Authentication required)"""
    try:
        # Validate that at least spa_id or spa_name_text is provided
        if not spa_id and not spa_name_text:
            raise HTTPException(
                status_code=422,
                detail="Either spa_id or spa_name_text must be provided"
            )
        
        # Get IP address and user agent for activity tracking
        ip_address = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent")
        # Prepare file paths
        file_paths = {}
        
        upload_targets = [
            ("passport_size_photo", passport_size_photo),
            ("age_proof_document", age_proof_document),
            ("aadhar_card_front", aadhar_card_front),
            ("aadhar_card_back", aadhar_card_back),
            ("pan_card", pan_card),
            ("signature", signature),
        ]

        for key, upload in upload_targets:
            if upload:
                file_paths[key] = save_uploaded_file(upload, "candidate_forms")
        
        if documents:
            doc_paths = []
            for doc in documents:
                doc_path = save_uploaded_file(doc, "candidate_forms")
                doc_paths.append(doc_path)
            file_paths['documents'] = doc_paths
        
        # Create form data
        form_data = CandidateFormCreate(
            first_name=first_name,
            last_name=last_name,
            middle_name=middle_name,
            current_address=current_address,
            aadhar_address=aadhar_address,
            city=city,
            zip_code=zip_code,
            state=state,
            country=country,
            phone_number=phone_number,
            work_experience=work_experience,
            Therapist_experience=Therapist_experience,
            alternate_number=alternate_number,
            age=age,
            position_applied_for=position_applied_for,
            education_certificate_courses=education_certificate_courses,
            spa_id=spa_id,
            spa_name_text=spa_name_text,
        )
        
        # Create candidate form
        candidate_form = await create_candidate_form(
            db, 
            form_data, 
            file_paths if file_paths else None,
            created_by=current_user.id
        )
        
        # Track activity
        try:
            from apps.notifications.services.activity_service import log_activity
            await log_activity(
                db=db,
                user_id=current_user.id,
                activity_type="form_submitted",
                activity_description=f"Submitted candidate form for {form_data.first_name} {form_data.last_name}",
                entity_type="candidate_form",
                entity_id=candidate_form.id,
                metadata={
                    "spa_id": form_data.spa_id,
                    "position": form_data.position_applied_for
                },
                ip_address=ip_address,
                user_agent=user_agent
            )
        except Exception as e:
            logger.error(f"Error tracking form activity: {e}", exc_info=True)
        
        return MessageResponseSchema(message="Candidate form submitted successfully")
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit form: {str(e)}")


@forms_router.post("/hiring-forms", response_model=MessageResponseSchema, status_code=status.HTTP_201_CREATED)
async def submit_hiring_form(
    hiring_data: HiringFormCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Submit hiring form (Authentication required)"""
    try:
        # Get IP address and user agent for activity tracking
        ip_address = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent")
        
        hiring_form = await create_hiring_form(
            db=db,
            spa_id=hiring_data.spa_id,
            spa_name_text=None,  # Not in model, but keeping for consistency
            staff_required=hiring_data.staff_required,
            for_role=hiring_data.for_role,
            description=hiring_data.description,
            required_experience=hiring_data.required_experience,
            required_education=hiring_data.required_education,
            required_skills=hiring_data.required_skills,
            created_by=current_user.id
        )
        
        # Track activity
        try:
            from apps.notifications.services.activity_service import log_activity
            await log_activity(
                db=db,
                user_id=current_user.id,
                activity_type="hiring_submitted",
                activity_description=f"Submitted hiring form for {hiring_data.for_role}",
                entity_type="hiring_form",
                entity_id=hiring_form.id,
                metadata={
                    "spa_id": hiring_data.spa_id,
                    "role": hiring_data.for_role
                },
                ip_address=ip_address,
                user_agent=user_agent
            )
        except Exception as e:
            logger.error(f"Error tracking hiring activity: {e}", exc_info=True)
        
        return MessageResponseSchema(message="Hiring form submitted successfully")
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit hiring form: {str(e)}")


        
# Protected Endpoints (Admin, Super Admin, SPA Manager only)

# TEST ENDPOINT - Remove after testing
@forms_router.post("/spas/test", response_model=SPAResponse)
async def create_spa_test(
    name: str = Form(...),
    code: str | None = Form(None),
    address: str | None = Form(None),
    area: str | None = Form(None),
    city: str | None = Form(None),
    state: str | None = Form(None),
    country: str | None = Form(None),
    pincode: str | None = Form(None),
    phone_number: str | None = Form(None),
    alternate_number: str | None = Form(None),
    email: str | None = Form(None),
    website: str | None = Form(None),
    is_active: str | None = Form("true"),
    logo: UploadFile | None = File(None),
    db: AsyncSession = Depends(get_db),
):
    """TEST - Create a new SPA location (no auth required)"""
    
    try:
        # Helper to convert empty strings or None to None
        def to_none_if_empty(value):
            if value is None:
                return None
            if isinstance(value, str) and value.strip() == "":
                return None
            return value

        # Convert is_active from string
        is_active_bool = is_active not in (None, "false", "0", False) if isinstance(is_active, str) else bool(is_active)

        # Convert code from string to int if not empty
        code_int = None
        if code and code.strip():
            try:
                code_int = int(code.strip())
            except (ValueError, TypeError):
                code_int = None

        # Validate file upload
        logo_path = None
        if logo:
            if logo.content_type not in ["image/jpeg", "image/png", "image/webp"]:
                raise HTTPException(400, "Invalid logo file type")
            logo_path = save_uploaded_file(logo, "spa_logos")

        # Clean all fields
        name_clean = to_none_if_empty(name.strip() if isinstance(name, str) else name)
        email_clean = to_none_if_empty(email)
        website_clean = to_none_if_empty(website)
        country_clean = to_none_if_empty(country) or "India"

        spa_data = SPACreate(
            name=name_clean,
            code=code_int,
            address=to_none_if_empty(address),
            area=to_none_if_empty(area),
            city=to_none_if_empty(city),
            state=to_none_if_empty(state),
            country=country_clean,
            pincode=to_none_if_empty(pincode),
            phone_number=to_none_if_empty(phone_number),
            alternate_number=to_none_if_empty(alternate_number),
            email=email_clean,
            website=website_clean,
            logo=logo_path,
            is_active=is_active_bool,
        )

        spa = await create_spa(db, spa_data)
        return spa
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))


@forms_router.post("/spas", response_model=SPAResponse)
async def create_spa_location(
    name: str = Form(...),
    code: str | None = Form(None),
    address: str | None = Form(None),
    area: str | None = Form(None),
    city: str | None = Form(None),
    state: str | None = Form(None),
    country: str | None = Form(None),
    pincode: str | None = Form(None),
    phone_number: str | None = Form(None),
    alternate_number: str | None = Form(None),
    email: str | None = Form(None),
    website: str | None = Form(None),
    is_active: str | None = Form("true"),
    logo: UploadFile | None = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "super_admin", "spa_manager")),
):
    """Create a new SPA location"""
    
    try:
        # Helper to convert empty strings or None to None
        def to_none_if_empty(value):
            if value is None:
                return None
            if isinstance(value, str) and value.strip() == "":
                return None
            return value

        # Convert is_active from string
        is_active_bool = is_active not in (None, "false", "0", False) if isinstance(is_active, str) else bool(is_active)

        # Convert code from string to int if not empty
        code_int = None
        if code and code.strip():
            try:
                code_int = int(code.strip())
            except (ValueError, TypeError):
                code_int = None

        # Validate file upload
        logo_path = None
        if logo:
            if logo.content_type not in ["image/jpeg", "image/png", "image/webp"]:
                raise HTTPException(400, "Invalid logo file type")
            logo_path = save_uploaded_file(logo, "spa_logos")

        # Clean all fields
        name_clean = to_none_if_empty(name.strip() if isinstance(name, str) else name)
        email_clean = to_none_if_empty(email)
        website_clean = to_none_if_empty(website)
        country_clean = to_none_if_empty(country) or "India"

        spa_data = SPACreate(
            name=name_clean,
            code=code_int,
            address=to_none_if_empty(address),
            area=to_none_if_empty(area),
            city=to_none_if_empty(city),
            state=to_none_if_empty(state),
            country=country_clean,
            pincode=to_none_if_empty(pincode),
            phone_number=to_none_if_empty(phone_number),
            alternate_number=to_none_if_empty(alternate_number),
            email=email_clean,
            website=website_clean,
            logo=logo_path,
            is_active=is_active_bool,
        )

        spa = await create_spa(db, spa_data, created_by=current_user.id)
        return spa
        
    except ValidationError as e:
        error_detail = getattr(e, 'message', str(e))
        raise HTTPException(
            status_code=422,
            detail=error_detail
        )
    except HTTPException:
        raise
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error creating SPA: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create SPA: {str(e)}"
        )


@forms_router.get("/spas/all", response_model=List[SPAResponse])
async def list_all_spas(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "super_admin", "spa_manager", "hr"))
):
    """List all SPAs including inactive ones (Admin/Super Admin/SPA Manager/HR only)"""
    spas = await get_all_spas(db, active_only=False)
    return spas


@forms_router.get("/spas/{spa_id}", response_model=SPAResponse)
async def get_spa(
    spa_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "super_admin", "spa_manager"))
):
    """Get SPA by ID (Admin/Super Admin/SPA Manager only)"""
    spa = await get_spa_by_id(db, spa_id)
    if not spa:
        raise HTTPException(status_code=404, detail="SPA not found")
    return spa


@forms_router.put("/spas/{spa_id}", response_model=SPAResponse)
async def update_spa_location(
    spa_id: int,
    name: str | None = Form(None),
    code: int | None = Form(None),
    address: str | None = Form(None),
    area: str | None = Form(None),
    city: str | None = Form(None),
    state: str | None = Form(None),
    country: str | None = Form(None),
    pincode: str | None = Form(None),
    phone_number: str | None = Form(None),
    alternate_number: str | None = Form(None),
    email: str | None = Form(None),
    website: str | None = Form(None),
    is_active: bool | None = Form(None),
    logo: UploadFile | None = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "super_admin", "spa_manager")),
):
    """Update SPA location (Admin/Super Admin/SPA Manager only)"""
    try:
        # Build update data only with provided fields (avoid setting required cols to NULL)
        update_dict: dict = {}

        if name is not None:
            update_dict["name"] = name
        if code is not None:
            update_dict["code"] = code
        if address is not None:
            update_dict["address"] = address
        if area is not None:
            update_dict["area"] = area
        if city is not None:
            update_dict["city"] = city
        if state is not None:
            update_dict["state"] = state
        if country is not None:
            update_dict["country"] = country
        if pincode is not None:
            update_dict["pincode"] = pincode
        if phone_number is not None:
            update_dict["phone_number"] = phone_number
        if alternate_number is not None:
            update_dict["alternate_number"] = alternate_number
        if email is not None:
            update_dict["email"] = email
        if website is not None:
            update_dict["website"] = website
        if is_active is not None:
            update_dict["is_active"] = is_active

        # Handle optional logo upload
        if logo:
            logo_path = save_uploaded_file(logo, "spa_logos")
            update_dict["logo"] = logo_path

        update_payload = SPAUpdate(**update_dict)

        spa = await update_spa(db, spa_id, update_payload)
        return spa
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=e.message)
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=e.message)


@forms_router.delete("/spas/{spa_id}", response_model=MessageResponseSchema)
async def delete_spa_location(
    spa_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "super_admin", "spa_manager"))
):
    """
    Delete SPA location.

    - super_admin: permanently deletes the SPA record
    - admin / spa_manager: performs a soft delete (marks SPA as inactive)
    """
    try:
        if current_user.role == "super_admin":
            await hard_delete_spa(db, spa_id)
            return MessageResponseSchema(message="SPA permanently deleted successfully")

        await delete_spa(db, spa_id)
        return MessageResponseSchema(message="SPA deleted successfully")
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=e.message)


@forms_router.get("/candidate-forms", response_model=List[CandidateFormResponse])
async def list_candidate_forms(
    skip: int = 0,
    limit: int = 100,
    created_by: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "super_admin", "spa_manager", "hr", "user"))
):
    """List candidate form submissions
    
    - Admin/HR: See all forms (created_by is ignored)
    - Manager/User: Only see their own forms (created_by is set to current_user.id)
    """
    # For managers and regular users, only show their own forms
    if current_user.role in ("spa_manager", "user") and created_by is None:
        created_by = current_user.id
    
    forms = await get_all_candidate_forms(db, skip=skip, limit=limit, created_by=created_by)
    return forms


@forms_router.get("/candidate-forms/{form_id}", response_model=CandidateFormResponse)
async def get_candidate_form(
    form_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "super_admin", "spa_manager", "hr", "user"))
):
    """Get a single candidate form submission
    
    - Admin/HR: Can access any form
    - Manager/User: Can only access their own forms
    """
    form = await get_candidate_form_by_id(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Candidate form not found")
    
    # For managers and regular users, ensure they can only access their own forms
    if current_user.role in ("spa_manager", "user"):
        if form.created_by != current_user.id:
            raise HTTPException(status_code=403, detail="You can only access your own candidate forms")
    
    return form


@forms_router.put("/candidate-forms/{form_id}", response_model=CandidateFormResponse)
async def update_candidate_form_endpoint(
    form_id: int,
    form_data: CandidateFormUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "super_admin", "spa_manager", "hr", "user"))
):
    """Update a candidate form submission
    
    - Admin/HR: Can update any form
    - Manager/User: Can only update their own forms
    """
    form = await get_candidate_form_by_id(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Candidate form not found")
    
    # For managers and regular users, only allow updating their own forms
    if current_user.role in ("spa_manager", "user"):
        if form.created_by != current_user.id:
            raise HTTPException(status_code=403, detail="You can only update your own candidate forms")
    
    form_dict = form_data.model_dump(exclude_unset=True)
    updated_form = await update_candidate_form(db, form_id, form_dict)
    if not updated_form:
        raise HTTPException(status_code=404, detail="Candidate form not found")
    return updated_form


@forms_router.delete("/candidate-forms/{form_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_candidate_form_endpoint(
    form_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "super_admin", "spa_manager", "hr", "user"))
):
    """Delete a candidate form submission
    
    - Admin/HR: Can delete any form
    - Manager/User: Can only delete their own forms
    """
    form = await get_candidate_form_by_id(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Candidate form not found")
    
    # For managers and regular users, only allow deleting their own forms
    if current_user.role in ("spa_manager", "user"):
        if form.created_by != current_user.id:
            raise HTTPException(status_code=403, detail="You can only delete your own candidate forms")
    
    deleted = await delete_candidate_form(db, form_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Candidate form not found")


@forms_router.options("/files/{file_path:path}")
async def serve_file_options(file_path: str, request: Request):
    """Handle CORS preflight requests for file serving"""
    from fastapi.responses import Response
    from config.settings import settings
    
    origin = request.headers.get("origin")
    response = Response()
    
    if origin and origin in settings.CORS_ORIGINS:
        response.headers["Access-Control-Allow-Origin"] = origin
    else:
        if isinstance(settings.CORS_ORIGINS, list):
            response.headers["Access-Control-Allow-Origin"] = settings.CORS_ORIGINS[0] if settings.CORS_ORIGINS else "*"
        else:
            response.headers["Access-Control-Allow-Origin"] = "*"
    
    response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "*"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Max-Age"] = "3600"
    
    return response

@forms_router.get("/files/{file_path:path}")
async def serve_file(file_path: str, request: Request):
    """Serve uploaded files (Public endpoint for file access)"""
    from fastapi.responses import FileResponse, Response
    from starlette.responses import FileResponse as StarletteFileResponse
    import mimetypes
    import logging
    from config.settings import settings
    
    logger = logging.getLogger(__name__)
    
    try:
        # Security: Only allow files from uploads directory
        # Normalize the path
        file_path = file_path.replace('\\', '/')  # Normalize path separators
        
        # Construct full path
        full_path = UPLOAD_DIR / file_path
        
        # Security check: Ensure path is within UPLOAD_DIR
        full_path = full_path.resolve()
        upload_dir_resolved = UPLOAD_DIR.resolve()
        
        if not str(full_path).startswith(str(upload_dir_resolved)):
            logger.warning(f"Access denied: {file_path} is outside upload directory")
            raise HTTPException(status_code=403, detail="Access denied")
        
        if not full_path.exists():
            logger.warning(f"File not found: {full_path}")
            raise HTTPException(status_code=404, detail="File not found")
        
        # Determine media type based on file extension
        media_type, _ = mimetypes.guess_type(str(full_path))
        if not media_type:
            # Default to image/jpeg for common image extensions
            if str(full_path).lower().endswith(('.jpg', '.jpeg')):
                media_type = "image/jpeg"
            elif str(full_path).lower().endswith('.png'):
                media_type = "image/png"
            elif str(full_path).lower().endswith('.pdf'):
                media_type = "application/pdf"
            else:
                media_type = "application/octet-stream"
        
        logger.info(f"Serving file: {full_path} as {media_type}")
        
        # Get origin from request
        origin = request.headers.get("origin")
        
        # Create FileResponse with CORS headers
        response = FileResponse(
            path=str(full_path),
            media_type=media_type,
            filename=full_path.name
        )
        
        # Add CORS headers explicitly
        if origin and origin in settings.CORS_ORIGINS:
            response.headers["Access-Control-Allow-Origin"] = origin
        else:
            # Allow all origins from settings
            if isinstance(settings.CORS_ORIGINS, list):
                response.headers["Access-Control-Allow-Origin"] = settings.CORS_ORIGINS[0] if settings.CORS_ORIGINS else "*"
            else:
                response.headers["Access-Control-Allow-Origin"] = "*"
        
        response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        
        return response
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error serving file {file_path}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error serving file: {str(e)}")


@forms_router.get("/hiring-forms", response_model=List[HiringFormResponse])
async def list_hiring_forms(
    skip: int = 0,
    limit: int = 100,
    created_by: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "super_admin", "spa_manager", "hr", "user"))
):
    """List hiring form submissions
    
    - Admin: See all forms (created_by is ignored)
    - HR: See only forms submitted by users and managers (exclude HR/admin created forms)
    - Manager/User: Only see their own forms (created_by is set to current_user.id)
    """
    # For managers and regular users, only show their own forms
    if current_user.role in ("spa_manager", "user") and created_by is None:
        created_by = current_user.id
    
    # For HR, exclude forms created by HR/admin/super_admin (only show user/manager submissions)
    exclude_hr_admin = (current_user.role == "hr")
    
    forms = await get_all_hiring_forms(
        db, 
        skip=skip, 
        limit=limit, 
        created_by=created_by,
        exclude_hr_admin=exclude_hr_admin
    )
    return forms


@forms_router.get("/hiring-forms/{form_id}", response_model=HiringFormResponse)
async def get_hiring_form(
    form_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "super_admin", "spa_manager", "hr", "user"))
):
    """Get a single hiring form submission
    
    - Admin/HR: Can access any form
    - Manager/User: Can only access their own forms
    """
    form = await get_hiring_form_by_id(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Hiring form not found")
    
    # For managers and regular users, only allow access to their own forms
    if current_user.role in ("spa_manager", "user"):
        if form.created_by != current_user.id:
            raise HTTPException(status_code=403, detail="You can only access your own hiring forms")
    
    return form


@forms_router.put("/hiring-forms/{form_id}", response_model=HiringFormResponse)
async def update_hiring_form_endpoint(
    form_id: int,
    form_data: HiringFormUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "super_admin", "spa_manager", "hr", "user"))
):
    """Update a hiring form submission
    
    - Admin/HR: Can update any form
    - Manager/User: Can only update their own forms
    """
    form = await get_hiring_form_by_id(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Hiring form not found")
    
    # For managers and regular users, only allow updating their own forms
    if current_user.role in ("spa_manager", "user"):
        if form.created_by != current_user.id:
            raise HTTPException(status_code=403, detail="You can only update your own hiring forms")
    
    updated_form = await update_hiring_form(
        db=db,
        form_id=form_id,
        spa_id=form_data.spa_id,
        staff_required=form_data.staff_required,
        for_role=form_data.for_role,
        description=form_data.description,
        required_experience=form_data.required_experience,
        required_education=form_data.required_education,
        required_skills=form_data.required_skills
    )
    if not updated_form:
        raise HTTPException(status_code=404, detail="Hiring form not found")
    return updated_form


@forms_router.delete("/hiring-forms/{form_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_hiring_form_endpoint(
    form_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "super_admin", "spa_manager", "hr", "user"))
):
    """Delete a hiring form submission
    
    - Admin/HR: Can delete any form
    - Manager/User: Can only delete their own forms
    """
    form = await get_hiring_form_by_id(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Hiring form not found")
    
    # For managers and regular users, only allow deleting their own forms
    if current_user.role in ("spa_manager", "user"):
        if form.created_by != current_user.id:
            raise HTTPException(status_code=403, detail="You can only delete your own hiring forms")
    
    deleted = await delete_hiring_form(db, form_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Hiring form not found")


# -------------------------
# Admin Statistics Endpoints
# -------------------------

@forms_router.get("/admin/statistics")
async def get_forms_statistics_endpoint(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "super_admin"))
):
    """Get forms statistics for admin dashboard"""
    return await get_forms_statistics(db)


@forms_router.get("/admin/candidate-forms")
async def get_all_candidate_forms_admin(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "super_admin"))
):
    """Get all candidate forms with user information (admin only)"""
    forms = await get_all_candidate_forms_with_users(db, skip=skip, limit=limit)
    return forms


@forms_router.get("/admin/hiring-forms")
async def get_all_hiring_forms_admin(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "super_admin"))
):
    """Get all hiring forms with user information (admin only)"""
    forms = await get_all_hiring_forms_with_users(db, skip=skip, limit=limit)
    return forms
