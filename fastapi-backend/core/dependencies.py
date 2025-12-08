"""
Dependencies for FastAPI routes
"""
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from config.settings import settings
from config.database import get_db
from apps.users.models import User
from apps.users.services.user_service import get_user_by_id
from core.exceptions import AuthenticationError

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Get current authenticated user from JWT token
    """
    try:
        token = credentials.credentials
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise AuthenticationError("Invalid token")
    except JWTError as e:
        raise AuthenticationError(f"Invalid token: {str(e)}")
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error decoding JWT token: {str(e)}", exc_info=True)
        raise AuthenticationError("Invalid token")
    
    try:
        user = await get_user_by_id(db, int(user_id))
        if user is None:
            raise AuthenticationError("User not found")
        return user
    except ValueError as e:
        raise AuthenticationError(f"Invalid user ID: {str(e)}")
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error fetching user from database: {str(e)}", exc_info=True)
        raise AuthenticationError(f"Database error: {str(e)}")


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current active user"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    return current_user


def require_role(*allowed_roles: str):
    """Dependency to check user role"""
    async def role_checker(current_user: User = Depends(get_current_active_user)):
        try:
            # Get user role - handle both enum and string values
            user_role = current_user.role
            if user_role is None:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="User role not set"
                )
            
            # Convert enum to string if needed
            role_str = user_role.value if hasattr(user_role, 'value') else str(user_role)
            
            if role_str not in allowed_roles:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Insufficient permissions. Required roles: {', '.join(allowed_roles)}, but user has: {role_str}"
                )
            return current_user
        except HTTPException:
            raise
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error in role_checker: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error checking user role: {str(e)}"
            )
    return role_checker


async def get_optional_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer(auto_error=False)),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """
    Get current authenticated user from JWT token (optional - returns None if not authenticated)
    """
    if not credentials:
        return None
    
    try:
        token = credentials.credentials
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
    except (JWTError, Exception):
        return None
    
    user = await get_user_by_id(db, int(user_id))
    if user is None or not user.is_active:
        return None
    
    return user