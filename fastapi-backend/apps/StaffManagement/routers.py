from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import date
import os

from config.database import get_db
from apps.StaffManagement import schemas
from apps.StaffManagement.services import staff_service
from apps.users.models import User
from core.dependencies import require_role
from config.settings import settings

router = APIRouter(
    tags=["Staff Management"]
)

# -----------------------------
# CREATE STAFF
# -----------------------------
@router.post("/", response_model=schemas.StaffResponse)
async def create_staff(staff: schemas.StaffCreate, db: AsyncSession = Depends(get_db)):
    return await staff_service.create_staff(db, staff)


# -----------------------------
# GET ALL STAFF (WITH SPA FILTER)
# -----------------------------
@router.get("/", response_model=schemas.PaginatedStaffResponse)
async def get_all_staff(
    spa_id: Optional[int] = Query(None, description="Filter by SPA ID"),
    status: Optional[schemas.StaffStatusEnum] = Query(None, description="Filter by status"),
    city: Optional[str] = Query(None, description="Filter by staff city"),
    search: Optional[str] = Query(None, description="Search by name or phone"),
    from_date: Optional[date] = Query(None, description="Filter from joining date"),
    to_date: Optional[date] = Query(None, description="Filter to joining date"),
    skip: int = Query(0, description="Records to skip"),
    limit: int = Query(100, description="Maximum records to return"),
    current_user: User = Depends(require_role("admin", "hr", "spa_manager", "super_admin")),
    db: AsyncSession = Depends(get_db)
):
    return await staff_service.get_all_staff(
        db, 
        spa_id=spa_id, 
        status=status, 
        city=city, 
        search=search,
        from_date=from_date,
        to_date=to_date,
        skip=skip,
        limit=limit
    )


# -----------------------------
# GET UNIQUE CITIES
# -----------------------------
@router.get("/cities", response_model=List[str])
async def get_unique_cities(
    db: AsyncSession = Depends(get_db)
):
    """Get list of unique cities where staff are located"""
    return await staff_service.get_unique_cities(db)


# -----------------------------
# GET STAFF BY PHONE
# -----------------------------
@router.get("/phone/{phone}", response_model=Optional[schemas.StaffResponse])
async def get_staff_by_phone(phone: str, db: AsyncSession = Depends(get_db)):
    return await staff_service.get_staff_by_phone(db, phone)


# -----------------------------
# UPLOAD STAFF DOCUMENT
# -----------------------------
@router.post("/upload")
async def upload_staff_file(
    file: UploadFile = File(...),
):
    """
    Generic upload endpoint for staff documents (Aadhar, PAN, Photos).
    Returns the relative path to the saved file.
    """
    if not file.content_type.startswith(('image/', 'application/pdf')):
        raise HTTPException(status_code=400, detail="Only images and PDFs are allowed")
    
    file_path = await staff_service.save_staff_file(file)
    return {"url": file_path}


# -----------------------------
# GET STAFF BY ID
# -----------------------------
@router.get("/{staff_id}", response_model=schemas.StaffResponse)
async def get_staff(staff_id: int, db: AsyncSession = Depends(get_db)):
    staff = await staff_service.get_staff(db, staff_id)
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    return staff




# -----------------------------
# UPDATE STAFF
# -----------------------------
@router.put("/{staff_id}", response_model=schemas.StaffResponse)
async def update_staff(
    staff_id: int,
    update_data: schemas.StaffUpdate,
    db: AsyncSession = Depends(get_db)
):
    staff = await staff_service.update_staff(db, staff_id, update_data)
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    return staff


# -----------------------------
# MARK STAFF AS LEFT
# -----------------------------
@router.post("/{staff_id}/leave", response_model=schemas.StaffResponse)
async def mark_staff_left(
    staff_id: int,
    leave_data: schemas.StaffLeave,
    db: AsyncSession = Depends(get_db)
):
    staff = await staff_service.mark_staff_left(db, staff_id, leave_data)
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    return staff


# -----------------------------
# TRANSFER STAFF
# -----------------------------
@router.post("/{staff_id}/transfer", response_model=schemas.StaffResponse)
async def transfer_staff(
    staff_id: int,
    transfer_data: schemas.StaffTransfer,
    db: AsyncSession = Depends(get_db)
):
    staff = await staff_service.transfer_staff(db, staff_id, transfer_data)
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    return staff


# -----------------------------
# STAFF FULL HISTORY
# -----------------------------
@router.get("/{staff_id}/history", response_model=List[schemas.StaffEventResponse])
async def get_staff_history(staff_id: int, db: AsyncSession = Depends(get_db)):
    return await staff_service.get_staff_history(db, staff_id)


# -----------------------------
# TODAY ANALYTICS
# -----------------------------
@router.get("/analytics/today")
async def today_analytics(
    spa_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    try:
        spa_id_int = int(spa_id) if spa_id and str(spa_id).isdigit() else None
    except:
        spa_id_int = None
    return await staff_service.today_analytics(db, spa_id=spa_id_int)

# -----------------------------
# OVERALL ANALYTICS
# -----------------------------
@router.get("/analytics/overall")
async def overall_analytics(
    spa_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    try:
        spa_id_int = int(spa_id) if spa_id and str(spa_id).isdigit() else None
    except:
        spa_id_int = None
    return await staff_service.overall_analytics(db, spa_id=spa_id_int)


# -----------------------------
# CONSOLIDATED ANALYTICS (DASHBOARD)
# -----------------------------
@router.get("/analytics/consolidated")
async def consolidated_analytics(
    spa_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Combines Today and Overall analytics into a single response to reduce frontend calls.
    """
    import asyncio
    try:
        spa_id_int = int(spa_id) if spa_id and str(spa_id).isdigit() else None
    except:
        spa_id_int = None
        
    # Execute analytics sequentially for session stability
    today_task = await staff_service.today_analytics(db, spa_id=spa_id_int)
    overall_task = await staff_service.overall_analytics(db, spa_id=spa_id_int)
    
    return {
        **overall_task,
        "today": today_task
    }



# -----------------------------
# DELETE STAFF (PERMANENT)
# -----------------------------
@router.delete("/{staff_id}")
async def delete_staff(staff_id: int, db: AsyncSession = Depends(get_db)):
    success = await staff_service.delete_staff(db, staff_id)
    if not success:
         raise HTTPException(status_code=404, detail="Staff not found")
    return {"message": "Staff member and all history deleted successfully"}