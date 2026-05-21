"""
Staff Management Module Exceptions
Enforces clean exception mapping to standardized HTTP responses.
"""
from typing import Optional
from core.exceptions import CustomException, NotFoundError, ValidationError


class StaffNotFoundError(NotFoundError):
    """Raised when a staff record does not exist or is soft-deleted"""
    def __init__(self, staff_id: Optional[int] = None, staff_uuid: Optional[str] = None):
        if staff_id:
            msg = f"Staff member with ID {staff_id} was not found."
        elif staff_uuid:
            msg = f"Staff member with UUID {staff_uuid} was not found."
        else:
            msg = "Staff member was not found."
        super().__init__(message=msg)


class SpaNotFoundError(NotFoundError):
    """Raised when the specified spa ID is invalid"""
    def __init__(self, spa_id: int):
        super().__init__(message=f"SPA branch with ID {spa_id} was not found.")


class DuplicateStaffError(ValidationError):
    """Raised when creating staff with duplicate unique records (phone, Aadhaar, PAN)"""
    def __init__(self, field: str, value: str):
        super().__init__(
            message=f"Staff duplicate entry detected. The {field} '{value}' is already registered in the system."
        )


class StaffActionError(ValidationError):
    """Raised when an illegal workflow state transition is attempted"""
    def __init__(self, message: str):
        super().__init__(message=message)


class DocumentError(ValidationError):
    """Raised for invalid document payloads or verification errors"""
    def __init__(self, message: str):
        super().__init__(message=message)
