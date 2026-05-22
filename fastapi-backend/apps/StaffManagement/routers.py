"""
Staff Management Routers
Exposes secure RESTful routes mapping API calls to backend services.
"""
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query, Path, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession as Session

from apps.StaffManagement.dependencies import (
    db_dependency,
    current_user_dependency,
    admin_only,
    verify_staff_permission_dependency,
)
from apps.StaffManagement.schemas import (
    StaffCreate,
    StaffUpdate,
    StaffResponse,
    StaffVerificationRequest,
    StaffTransferRequest,
    StaffLeaveRequest,
    StaffBlacklistRequest,
    StaffDocumentCreate,
    StaffDocumentResponse,
    WorkHistoryResponse,
)
from apps.StaffManagement.services.staff_service import StaffService
from apps.StaffManagement.services.transfer_service import TransferService
from apps.StaffManagement.services.verification_service import VerificationService
from apps.StaffManagement.services.document_service import DocumentService
from apps.StaffManagement.utils.pagination import Page
from apps.StaffManagement.models import VerificationStatusEnum, EmploymentStatusEnum
from apps.users.models import User


router = APIRouter(
    prefix="",
    tags=["Staff Master Registry"]
)


# =========================================================
# STAFF LIFECYCLE ENDPOINTS
# =========================================================

@router.post(
    "/",
    response_model=StaffResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new staff member"
)
async def  create_staff_endpoint(
    payload: StaffCreate,
    db: Session = db_dependency,
    current_user: User = current_user_dependency
):
    """
    Registers a new employee inside the spa internal ecosystem.
    Prevents duplicate phones/documents, deterministically hashes sensitive info,
    and logs a joining event.
    """
    return await StaffService.create_staff(
        db=db,
        data=payload,
        creator_id=current_user.id
    )


@router.get(
    "/",
    response_model=Page[StaffResponse],
    summary="Query paginated staff index with rich filtering options"
)
async def list_staff_endpoint(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    skip: Optional[int] = Query(None, ge=0, description="Frontend alias for offset pagination"),
    search: Optional[str] = Query(None, description="Search by name or city"),
    phone: Optional[str] = Query(None, description="Filter by telephone contact"),
    verification_status: Optional[VerificationStatusEnum] = Query(None, description="Filter by HR verification status"),
    employment_status: Optional[EmploymentStatusEnum] = Query(None, description="Filter by active status"),
    status: Optional[str] = Query(None, description="Frontend alias for employment_status"),
    spa_id: Optional[int] = Query(None, description="Filter by active branch ID"),
    city: Optional[str] = Query(None, description="Filter by city registry"),
    db: Session = db_dependency,
    current_user: User = current_user_dependency
):
    """Retrieves list of registered employees matching requested criteria."""
    # Resolve frontend pagination offset alias 'skip'
    actual_offset = skip if skip is not None else offset

    # Resolve frontend state 'status' mapping to backend 'employment_status'
    actual_employment_status = employment_status
    if actual_employment_status is None and status:
        try:
            actual_employment_status = EmploymentStatusEnum(status)
        except ValueError:
            pass

    items, total = await StaffService.list_staff_paginated(
        db=db,
        limit=limit,
        offset=actual_offset,
        search=search,
        phone=phone,
        verification_status=verification_status,
        employment_status=actual_employment_status,
        spa_id=spa_id,
        city=city
    )
    return Page(items=items, total=total, limit=limit, offset=actual_offset)


@router.get(
    "/{staff_uuid}",
    response_model=StaffResponse,
    summary="Fetch complete profile details for a staff member"
)
async def get_staff_details_endpoint(
    staff_uuid: str = Path(..., description="Unique staff UUID identifier"),
    db: Session = db_dependency,
    current_user: User = current_user_dependency
):
    """Loads a full employee graph including work history timeline, docs, and event audits."""
    return await StaffService.get_staff_by_uuid(db, staff_uuid)


@router.put(
    "/{staff_uuid}",
    response_model=StaffResponse,
    summary="Update basic staff parameters"
)
async def update_staff_endpoint(
    payload: StaffUpdate,
    staff_uuid: str = Path(..., description="Unique staff UUID identifier"),
    db: Session = db_dependency,
    current_user: User = current_user_dependency
):
    """
    Updates basic staff profile attributes.
    Direct branch transfers are blocked here (must be routed via the `/transfer` endpoint).
    """
    return await StaffService.update_staff(
        db=db,
        staff_uuid=staff_uuid,
        data=payload,
        updater_id=current_user.id
    )


@router.delete(
    "/{staff_uuid}",
    summary="Delete a staff record"
)
async def delete_staff_endpoint(
    staff_uuid: str = Path(..., description="Unique staff UUID identifier"),
    db: Session = db_dependency,
    current_user: User = current_user_dependency
):
    """
    Super Admin permanently deletes the staff record and child records.
    Admin/HR/Manager keep the existing soft-delete audit behavior.
    """
    role = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)

    if role == "super_admin":
        return await StaffService.hard_delete_staff(
            db=db,
            staff_uuid=staff_uuid
        )

    if role not in {"admin", "spa_manager", "hr"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete staff records."
        )

    return await StaffService.soft_delete_staff(
        db=db,
        staff_uuid=staff_uuid,
        deleter_id=current_user.id
    )


# =========================================================
# WORKFLOW OPERATIONS (HR / MANAGERS / ADMINS ONLY)
# =========================================================

@router.patch(
    "/{staff_uuid}/verify",
    response_model=StaffResponse,
    summary="[Admin/Manager] Approve or reject a staff's verification status"
)
async def verify_staff_endpoint(
    payload: StaffVerificationRequest,
    staff_uuid: str = Path(..., description="Unique staff UUID identifier"),
    db: Session = db_dependency,
    current_user: User = verify_staff_permission_dependency
):
    """
    Triggers HR verification workflows.
    Updates status, transitions employment automatically, and creates a secure state verification log.
    """
    return await VerificationService.verify_staff(
        db=db,
        staff_uuid=staff_uuid,
        status=payload.status,
        reason=payload.reason,
        verifier_id=current_user.id
    )


@router.post(
    "/{staff_uuid}/transfer",
    response_model=StaffResponse,
    dependencies=[admin_only],
    summary="[Admin/HR] Transfer a staff member to another branch location (POST support)"
)
@router.patch(
    "/{staff_uuid}/transfer",
    response_model=StaffResponse,
    dependencies=[admin_only],
    summary="[Admin/HR] Transfer a staff member to another branch location"
)
async def transfer_staff_endpoint(
    payload: StaffTransferRequest,
    staff_uuid: str = Path(..., description="Unique staff UUID identifier"),
    db: Session = db_dependency,
    current_user: User = current_user_dependency
):
    """
    Performs transactional spa location relocation.
    Closes the current work session (flagging is_transferred=True), opens a new work history, and logs a movement event.
    """
    return await TransferService.transfer_staff(
        db=db,
        staff_uuid=staff_uuid,
        target_spa_id=payload.target_spa_id,
        reason=payload.transfer_reason,
        notes=payload.notes,
        operator_id=current_user.id
    )


@router.patch(
    "/{staff_uuid}/blacklist",
    response_model=StaffResponse,
    dependencies=[admin_only],
    summary="[Admin/HR] Blacklist a staff member for disciplinary/security issues"
)
async def blacklist_staff_endpoint(
    payload: StaffBlacklistRequest,
    staff_uuid: str = Path(..., description="Unique staff UUID identifier"),
    db: Session = db_dependency,
    current_user: User = current_user_dependency
):
    """
    Secures the ecosystem by blacklisting/unblacklisting employees.
    If blacklisted, the employee is set to inactive, all active spa branch associations are terminated, and events are logged.
    """
    return await VerificationService.toggle_blacklist(
        db=db,
        staff_uuid=staff_uuid,
        is_blacklisted=payload.is_blacklisted,
        reason=payload.blacklist_reason,
        operator_id=current_user.id
    )


# =========================================================
# ANALYTICS ENDPOINTS
# =========================================================

@router.get(
    "/analytics/today",
    summary="Get today's staff movement analytics"
)
async def get_today_analytics(
    spa_id: Optional[int] = Query(None, description="Filter by SPA branch ID"),
    db: Session = db_dependency,
    current_user: User = current_user_dependency
):
    """
    Retrieves today's staff movement metrics: joined, resigned, and transferred.
    Can be filtered by a specific SPA branch.
    """
    from datetime import datetime, time
    from sqlalchemy import func, or_, select
    from apps.StaffManagement.models import StaffEvent, StaffEventTypeEnum
    
    start_of_today = datetime.combine(datetime.utcnow().date(), time.min)
    
    query = select(StaffEvent.event_type, func.count(StaffEvent.id)).where(
        StaffEvent.event_date >= start_of_today
    )
    
    if spa_id:
        query = query.where(
            or_(
                StaffEvent.spa_id == spa_id,
                StaffEvent.from_spa_id == spa_id,
                StaffEvent.to_spa_id == spa_id
            )
        )
        
    query = query.group_by(StaffEvent.event_type)
    result = await db.execute(query)
    event_counts = {event_type: count for event_type, count in result.all()}
    
    return {
        "joined": event_counts.get(StaffEventTypeEnum.joined, 0),
        "left": event_counts.get(StaffEventTypeEnum.resigned, 0),
        "transferred": event_counts.get(StaffEventTypeEnum.transferred, 0)
    }


@router.get(
    "/analytics/overall",
    summary="Get overall staff status analytics"
)
async def get_overall_analytics(
    spa_id: Optional[int] = Query(None, description="Filter by SPA branch ID"),
    db: Session = db_dependency,
    current_user: User = current_user_dependency
):
    """
    Retrieves overall metrics: total registered staff, active staff,
    verification status breakdown, and blacklisted staff.
    """
    from sqlalchemy import case, func, select
    from apps.StaffManagement.models import Staff, VerificationStatusEnum, EmploymentStatusEnum
    
    base_conditions = [Staff.deleted_at.is_(None)]
    if spa_id:
        base_conditions.append(Staff.current_spa_id == spa_id)

    stmt = select(
        func.count(Staff.id),
        func.sum(case((Staff.employment_status == EmploymentStatusEnum.active, 1), else_=0)),
        func.sum(case((Staff.verification_status == VerificationStatusEnum.pending, 1), else_=0)),
        func.sum(case((Staff.verification_status == VerificationStatusEnum.verified, 1), else_=0)),
        func.sum(case((Staff.verification_status == VerificationStatusEnum.rejected, 1), else_=0)),
        func.sum(case((Staff.is_blacklisted.is_(True), 1), else_=0)),
    ).where(*base_conditions)

    result = await db.execute(stmt)
    (
        total_registered,
        active_staff,
        pending_verification,
        verified_verification,
        rejected_verification,
        total_blacklisted,
    ) = result.one()
    
    return {
        "total_registered": total_registered,
        "active_staff": active_staff or 0,
        "verification_breakdown": {
            "pending": pending_verification or 0,
            "verified": verified_verification or 0,
            "rejected": rejected_verification or 0
        },
        "total_blacklisted": total_blacklisted or 0
    }


@router.get(
    "/analytics/consolidated",
    summary="Get consolidated spa-by-spa active staff and demographic breakdown"
)
async def get_consolidated_analytics(
    spa_id: Optional[int] = Query(None, description="Filter by SPA branch ID"),
    db: Session = db_dependency,
    current_user: User = current_user_dependency
):
    """
    Retrieves aggregated dashboard data: SPA-by-SPA active staff count,
    gender ratios, designation breakdown, active and left totals, and today's changes.
    """
    from sqlalchemy import and_, func, or_, select
    from apps.StaffManagement.models import Staff, EmploymentStatusEnum, StaffEvent, StaffEventTypeEnum
    from apps.forms_app.models import SPA
    from datetime import datetime, time
    
    active_conditions = [
        Staff.employment_status == EmploymentStatusEnum.active,
        Staff.deleted_at.is_(None)
    ]
    if spa_id:
        active_conditions.append(Staff.current_spa_id == spa_id)

    gender_stmt = (
        select(Staff.gender, func.count(Staff.id))
        .where(*active_conditions)
        .group_by(Staff.gender)
    )
    gender_res = await db.execute(gender_stmt)
    gender_counts = {
        ((gender or "Not Specified").strip().capitalize()): count
        for gender, count in gender_res.all()
    }

    designation_stmt = (
        select(Staff.designation, func.count(Staff.id))
        .where(*active_conditions)
        .group_by(Staff.designation)
    )
    designation_res = await db.execute(designation_stmt)
    designation_counts = {
        ((designation or "Not Specified").strip()): count
        for designation, count in designation_res.all()
    }

    spa_join_conditions = [
        Staff.current_spa_id == SPA.id,
        Staff.employment_status == EmploymentStatusEnum.active,
        Staff.deleted_at.is_(None),
    ]
    spa_query = (
        select(SPA.id, SPA.name, func.count(Staff.id))
        .outerjoin(Staff, and_(*spa_join_conditions))
        .group_by(SPA.id, SPA.name)
    )
    if spa_id:
        spa_query = spa_query.where(SPA.id == spa_id)
    spa_res = await db.execute(spa_query)
    spa_stats = [
        {
            "spa_id": current_spa_id,
            "spa_name": spa_name,
            "active_count": active_count,
        }
        for current_spa_id, spa_name, active_count in spa_res.all()
    ]

    total_active_query = select(func.count(Staff.id)).where(*active_conditions)
    total_active_res = await db.execute(total_active_query)
    total_active = total_active_res.scalar_one()

    left_conditions = [
        Staff.employment_status == EmploymentStatusEnum.resigned,
        Staff.deleted_at.is_(None)
    ]
    if spa_id:
        left_conditions.append(Staff.current_spa_id == spa_id)
    left_query = select(func.count(Staff.id)).where(*left_conditions)
    left_res = await db.execute(left_query)
    total_left = left_res.scalar_one()

    # Today breakdown query
    start_of_today = datetime.combine(datetime.utcnow().date(), time.min)
    event_query = select(StaffEvent.event_type, func.count(StaffEvent.id)).where(
        StaffEvent.event_date >= start_of_today
    )
    if spa_id:
        event_query = event_query.where(
            or_(
                StaffEvent.spa_id == spa_id,
                StaffEvent.from_spa_id == spa_id,
                StaffEvent.to_spa_id == spa_id
            )
        )
    event_query = event_query.group_by(StaffEvent.event_type)
    event_res = await db.execute(event_query)
    today_counts = {event_type: count for event_type, count in event_res.all()}

    today_new_join = today_counts.get(StaffEventTypeEnum.joined, 0)
    today_re_join = 0
    today_transfer_out = today_counts.get(StaffEventTypeEnum.transferred, 0)
    today_leave = today_counts.get(StaffEventTypeEnum.resigned, 0)

    return {
        "spa_stats": spa_stats,
        "gender_ratio": gender_counts,
        "designations": designation_counts,
        "total_active": total_active,
        "total_left": total_left,
        "today": {
            "today_new_join": today_new_join,
            "today_re_join": today_re_join,
            "today_transfer_out": today_transfer_out,
            "today_leave": today_leave
        }
    }


# =========================================================
# DOCUMENT MANAGEMENT ENDPOINTS
# =========================================================

@router.post(
    "/{staff_uuid}/documents",
    response_model=StaffDocumentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Attach an identity or course document to a staff profile"
)
async def upload_document_endpoint(
    payload: StaffDocumentCreate,
    staff_uuid: str = Path(..., description="Unique staff UUID identifier"),
    db: Session = db_dependency,
    current_user: User = current_user_dependency
):
    """
    Attaches a document image/PDF to an employee profile.
    Attaches optional document/image files to staff profiles.
    """
    return await DocumentService.add_document(
        db=db,
        staff_uuid=staff_uuid,
        data=payload
    )


@router.patch(
    "/documents/{doc_id}/verify",
    response_model=StaffDocumentResponse,
    dependencies=[admin_only],
    summary="[Admin/HR] Approve and verify an uploaded staff document"
)
async def verify_document_endpoint(
    doc_id: int = Path(..., description="Database ID of the document"),
    db: Session = db_dependency,
    current_user: User = current_user_dependency
):
    """Flags a specific document as verified by checking matching credentials."""
    return await DocumentService.verify_document(
        db=db,
        doc_id=doc_id,
        verifier_id=current_user.id
    )


@router.delete(
    "/documents/{doc_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a document attachment"
)
async def delete_document_endpoint(
    doc_id: int = Path(..., description="Database ID of the document"),
    db: Session = db_dependency,
    current_user: User = current_user_dependency
):
    """Permanently deletes document metadata tracking."""
    await DocumentService.delete_document(db=db, doc_id=doc_id)
    return None


# =========================================================
# EXTRA BACKEND-FRONTEND INTEGRATION ENDPOINTS
# =========================================================

@router.get(
    "/cities",
    summary="Get all unique cities where staff are registered"
)
async def get_cities_endpoint(
    db: Session = db_dependency,
    current_user: User = current_user_dependency
):
    """Retrieves a list of all unique cities represented in the staff registry."""
    from apps.StaffManagement.repositories.staff_repository import StaffRepository
    cities = await StaffRepository.get_unique_cities(db)
    return cities


@router.get(
    "/phone/{phone}",
    response_model=StaffResponse,
    summary="Retrieve staff member details by phone number"
)
async def get_staff_by_phone_endpoint(
    phone: str = Path(..., description="Telephone contact number"),
    db: Session = db_dependency,
    current_user: User = current_user_dependency
):
    """Fetches a staff profile matching the specified phone number."""
    from fastapi import HTTPException
    staff = await StaffService.get_staff_by_phone(db, phone)
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found with this phone number")
    return staff


@router.post(
    "/{staff_uuid}/leave",
    response_model=StaffResponse,
    summary="Mark staff member as left"
)
async def mark_staff_left_endpoint(
    payload: StaffLeaveRequest,
    staff_uuid: str = Path(..., description="Unique staff UUID identifier"),
    db: Session = db_dependency,
    current_user: User = current_user_dependency
):
    """
    Marks an employee as left, terminating active branch associations and recording exit parameters.
    """
    return await StaffService.mark_left(
        db=db,
        staff_uuid=staff_uuid,
        leave_date=payload.leave_date,
        reason=payload.reason,
        notes=payload.notes,
        operator_id=current_user.id
    )


@router.get(
    "/{staff_uuid}/history",
    response_model=List[WorkHistoryResponse],
    summary="Retrieve work history timeline for a specific employee"
)
async def get_staff_history_endpoint(
    staff_uuid: str = Path(..., description="Unique staff UUID identifier"),
    db: Session = db_dependency,
    current_user: User = current_user_dependency
):
    """Retrieves complete work history timeline logs for the employee."""
    staff = await StaffService.get_staff_by_uuid(db, staff_uuid)
    return staff.work_history


@router.post(
    "/upload",
    summary="Upload image or document file"
)
async def upload_staff_file(
    file: UploadFile = File(...),
    current_user: User = current_user_dependency
):
    """Handles asynchronous file upload for employee photos/documents using the internal helper."""
    from apps.forms_app.routers import save_uploaded_file
    path = await save_uploaded_file(file, "staff")
    return {"url": f"/uploads/{path}"}
