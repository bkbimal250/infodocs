"""
Custom Exceptions
"""
from typing import Optional


class CustomException(Exception):
    """Base custom exception"""
    def __init__(
        self,
        message: str,
        status_code: int = 400,
        detail: Optional[str] = None
    ):
        self.message = message
        self.status_code = status_code
        self.detail = detail
        super().__init__(self.message)


class NotFoundError(CustomException):
    """Resource not found exception"""
    def __init__(self, message: str = "Resource not found", detail: Optional[str] = None):
        super().__init__(message, status_code=404, detail=detail)


class ValidationError(CustomException):
    """Validation error exception"""
    def __init__(self, message: str = "Validation error", detail: Optional[str] = None):
        super().__init__(message, status_code=422, detail=detail)


class AuthenticationError(CustomException):
    """Authentication error exception"""
    def __init__(self, message: str = "Authentication failed", detail: Optional[str] = None):
        super().__init__(message, status_code=401, detail=detail)


class AuthorizationError(CustomException):
    """Authorization error exception"""
    def __init__(self, message: str = "Permission denied", detail: Optional[str] = None):
        super().__init__(message, status_code=403, detail=detail)

