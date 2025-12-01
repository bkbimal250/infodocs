"""
User Routers
API endpoints for user management and authentication
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from config.database import get_db
from apps.users.schemas import (
    UserRegistrationSchema,
    UserLoginSchema,
    EmailLoginSchema,
    OTPRequestSchema,
    OTPLoginSchema,
    PasswordResetRequestSchema,
    PasswordResetConfirmSchema,
    UserUpdateSchema,
    UserResponseSchema,
    TokenResponseSchema,
    MessageResponseSchema,
)
from apps.users.services.user_service import (
    create_user,
    authenticate_user,
    get_user_by_email,
    get_user_by_id,
    update_user,
    get_all_users,
)
from apps.users.services.auth_service import create_token_response
from apps.users.services.otp_service import generate_otp, verify_otp
from core.dependencies import get_current_user, get_current_active_user, require_role
from apps.users.models import User
from core.exceptions import AuthenticationError, ValidationError, NotFoundError

auth_router = APIRouter()
users_router = APIRouter()


@auth_router.post("/register", response_model=MessageResponseSchema, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegistrationSchema, db: AsyncSession = Depends(get_db)):
    """User registration"""
    try:
        user = await create_user(
            db=db,
            username=user_data.username,
            email=user_data.email,
            password=user_data.password,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            role=user_data.role,
            phone_number=user_data.phone_number,
        )
        # Try to send OTP for email verification (non-blocking)
        # Registration succeeds even if email fails
        try:
            await generate_otp(db, user.id, "email_verification")
            return MessageResponseSchema(
                message="Registration successful. Please verify your email."
            )
        except ValidationError as email_error:
            # If email fails, registration still succeeds but user is not verified
            # Log the error for admin review
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(
                f"User {user.username} ({user.email}) registered successfully, "
                f"but email verification OTP could not be sent: {str(email_error)}"
            )
            return MessageResponseSchema(
                message="Registration successful. However, email verification could not be sent. "
                       "Please contact support or try logging in directly."
            )
    except ValidationError as e:
        error_detail = getattr(e, 'message', str(e))
        raise HTTPException(status_code=422, detail=error_detail)


@auth_router.post("/login", response_model=TokenResponseSchema)
async def login(
    credentials: UserLoginSchema, 
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Login with username/email and password"""
    if not credentials.username and not credentials.email:
        raise HTTPException(
            status_code=422,
            detail="Username or email is required"
        )
    
    username_or_email = credentials.username or credentials.email
    user = await authenticate_user(db, username_or_email, credentials.password)
    
    if not user:
        # Track failed login attempt
        try:
            from apps.notifications.services.activity_service import log_login_activity
            ip_address = request.client.host if request.client else None
            user_agent = request.headers.get("user-agent")
            await log_login_activity(
                db=db,
                user_id=None,  # User not found
                ip_address=ip_address,
                user_agent=user_agent,
                status="failed",
                failure_reason="Invalid credentials"
            )
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error tracking failed login: {e}", exc_info=True)
        
        raise AuthenticationError("Invalid credentials")
    
    # Track successful login
    try:
        from apps.notifications.services.activity_service import log_login_activity
        from apps.notifications.services.notification_service import create_login_notification
        
        ip_address = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent")
        
        # Update last login time
        from datetime import datetime, timezone
        user.last_login_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(user)  # Refresh to ensure updated_at is loaded
        
        # Log login activity
        await log_login_activity(
            db=db,
            user_id=user.id,
            ip_address=ip_address,
            user_agent=user_agent,
            status="success"
        )
        
        # Create login notification
        await create_login_notification(
            db=db,
            user_id=user.id,
            ip_address=ip_address,
            user_agent=user_agent
        )
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error tracking login: {e}", exc_info=True)
    
    # Ensure user is refreshed before creating token response
    try:
        await db.refresh(user)
    except Exception:
        pass
    
    return create_token_response(user)


@auth_router.post("/login_with_email", response_model=TokenResponseSchema)
async def login_with_email(
    credentials: EmailLoginSchema, 
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Login with email and password"""
    user = await authenticate_user(db, credentials.email, credentials.password)
    
    if not user:
        # Track failed login attempt
        try:
            from apps.notifications.services.activity_service import log_login_activity
            ip_address = request.client.host if request.client else None
            user_agent = request.headers.get("user-agent")
            await log_login_activity(
                db=db,
                user_id=None,
                ip_address=ip_address,
                user_agent=user_agent,
                status="failed",
                failure_reason="Invalid credentials"
            )
        except Exception:
            pass
        
        raise AuthenticationError("Invalid credentials")
    
    # Track successful login
    try:
        from apps.notifications.services.activity_service import log_login_activity
        from apps.notifications.services.notification_service import create_login_notification
        from datetime import datetime, timezone
        
        ip_address = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent")
        
        # Update last login time
        user.last_login_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(user)  # Refresh to ensure updated_at is loaded
        
        # Log login activity
        await log_login_activity(
            db=db,
            user_id=user.id,
            ip_address=ip_address,
            user_agent=user_agent,
            status="success"
        )
        
        # Create login notification
        await create_login_notification(
            db=db,
            user_id=user.id,
            ip_address=ip_address,
            user_agent=user_agent
        )
    except Exception:
        pass
    
    # Ensure user is refreshed before creating token response
    try:
        await db.refresh(user)
    except Exception:
        pass
    
    return create_token_response(user)


@auth_router.post("/request_login_otp", response_model=MessageResponseSchema)
async def request_login_otp(otp_request: OTPRequestSchema, db: AsyncSession = Depends(get_db)):
    """Request OTP for login"""
    user = await get_user_by_email(db, otp_request.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        code = await generate_otp(db, user.id, "login")
        return MessageResponseSchema(message="OTP sent to email")
    except ValidationError as e:
        error_detail = getattr(e, 'message', str(e))
        raise HTTPException(status_code=422, detail=error_detail)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send OTP: {str(e)}")


@auth_router.post("/login_with_otp", response_model=TokenResponseSchema)
async def login_with_otp(
    otp_data: OTPLoginSchema, 
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Login with email and OTP"""
    user = await get_user_by_email(db, otp_data.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not await verify_otp(db, user.id, otp_data.otp, "login"):
        # Track failed login attempt
        try:
            from apps.notifications.services.activity_service import log_login_activity
            ip_address = request.client.host if request.client else None
            user_agent = request.headers.get("user-agent")
            await log_login_activity(
                db=db,
                user_id=user.id,
                ip_address=ip_address,
                user_agent=user_agent,
                status="failed",
                failure_reason="Invalid or expired OTP"
            )
        except Exception:
            pass
        
        raise AuthenticationError("Invalid or expired OTP")
    
    # Track successful login
    try:
        from apps.notifications.services.activity_service import log_login_activity
        from apps.notifications.services.notification_service import create_login_notification
        from datetime import datetime, timezone
        
        ip_address = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent")
        
        # Update last login time
        user.last_login_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(user)  # Refresh to ensure updated_at is loaded
        
        # Log login activity
        await log_login_activity(
            db=db,
            user_id=user.id,
            ip_address=ip_address,
            user_agent=user_agent,
            status="success"
        )
        
        # Create login notification
        await create_login_notification(
            db=db,
            user_id=user.id,
            ip_address=ip_address,
            user_agent=user_agent
        )
    except Exception:
        pass
    
    # Ensure user is refreshed before creating token response
    try:
        await db.refresh(user)
    except Exception:
        pass
    
    return create_token_response(user)


@auth_router.post("/request_password_reset", response_model=MessageResponseSchema)
async def request_password_reset(
    payload: PasswordResetRequestSchema,
    db: AsyncSession = Depends(get_db)
):
    """
    Start password reset flow.

    - Accepts user email
    - If user exists, generates an OTP with purpose "password_reset" and emails it
    - Always returns a generic message to avoid leaking which emails exist
    """
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        # Normalize email to lowercase for case-insensitive matching
        email_lower = payload.email.lower().strip()
        logger.info(f"Password reset requested for email: {email_lower}")
        
        # Try to find user with case-insensitive email match
        from sqlalchemy import select, func
        from apps.users.models import User
        stmt = select(User).where(func.lower(User.email) == email_lower)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if user:
            logger.info(f"User found: {user.id}, email: {user.email}, is_active: {user.is_active}")
            
            # Check if user is active
            if not user.is_active:
                logger.warning(f"Password reset requested for inactive user: {user.email}")
                # Still return generic message for security
            
            # Generate OTP for password reset
            try:
                otp_code = await generate_otp(db, user.id, "password_reset")
                logger.info(f"OTP generated successfully for user {user.id}: {otp_code}")
            except ValidationError as e:
                logger.error(f"OTP generation failed for user {user.id}: {e}", exc_info=True)
            except Exception as e:
                logger.error(f"Unexpected error generating OTP for user {user.id}: {e}", exc_info=True)
        else:
            logger.info(f"No user found with email: {email_lower}")
            
    except ValidationError as e:
        # Log but don't reveal internal details to client
        logger.warning(f"Password reset OTP generation failed for {payload.email}: {e}")
    except Exception as e:
        # Also log unexpected errors but still return generic message
        logger.error(
            f"Unexpected error during password reset request for {payload.email}: {e}",
            exc_info=True,
        )

    # Always respond with success message (do not leak email existence)
    return MessageResponseSchema(
        message="If an account with that email exists, a password reset code has been sent."
    )


@auth_router.post("/reset_password", response_model=MessageResponseSchema)
async def reset_password(
    payload: PasswordResetConfirmSchema,
    db: AsyncSession = Depends(get_db)
):
    """
    Complete password reset using email, OTP, and new password.

    - Verifies OTP with purpose "password_reset"
    - On success, updates the user's password
    """
    try:
        # Find user by email
        user = await get_user_by_email(db, payload.email)
        if not user:
            # Don't reveal whether user exists
            raise HTTPException(status_code=400, detail="Invalid email or OTP")

        # Verify OTP
        is_valid = await verify_otp(db, user.id, payload.otp, "password_reset")
        if not is_valid:
            raise HTTPException(status_code=400, detail="Invalid or expired OTP")

        # Update password using existing service (handles hashing)
        try:
            await update_user(db, user.id, {"password": payload.new_password})
        except ValidationError as e:
            error_detail = getattr(e, "message", str(e))
            raise HTTPException(status_code=422, detail=error_detail)
        except NotFoundError as e:
            raise HTTPException(status_code=404, detail=str(e))
        except Exception as e:
            # Log unexpected errors
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Unexpected error updating password for user {user.id}: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail="Failed to update password. Please try again.")

        return MessageResponseSchema(message="Password has been reset successfully.")
    except HTTPException:
        # Re-raise HTTPException as-is
        raise
    except Exception as e:
        # Log and return generic error for unexpected exceptions
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Unexpected error in reset_password: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="An error occurred while resetting password.")


@auth_router.get("/user", response_model=UserResponseSchema)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """Get current authenticated user"""
    return UserResponseSchema(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        role=current_user.role,
        phone_number=current_user.phone_number,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        created_at=current_user.created_at.isoformat(),
        updated_at=current_user.updated_at.isoformat(),
    )


@auth_router.put("/user", response_model=UserResponseSchema)
async def update_current_user_profile(
    user_data: UserUpdateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update current user's own profile (any authenticated user can update their own profile)"""
    # Only allow updating own profile fields, not role, is_active, is_verified
    allowed_fields = ['username', 'email', 'first_name', 'last_name', 'phone_number', 'password']
    update_dict = {k: v for k, v in user_data.model_dump(exclude_unset=True).items() if k in allowed_fields}
    
    if not update_dict:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    
    user = await update_user(db, current_user.id, update_dict)
    return UserResponseSchema(
        id=user.id,
        username=user.username,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role,
        phone_number=user.phone_number,
        is_active=user.is_active,
        is_verified=user.is_verified,
        created_at=user.created_at.isoformat(),
        updated_at=user.updated_at.isoformat(),
    )


@users_router.get("", response_model=list[UserResponseSchema])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "super_admin"))
):
    """List all users (Admin/Super Admin only)"""
    users = await get_all_users(db, skip=skip, limit=limit)
    return [
        UserResponseSchema(
            id=user.id,
            username=user.username,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            role=user.role,
            phone_number=user.phone_number,
            is_active=user.is_active,
            is_verified=user.is_verified,
            created_at=user.created_at.isoformat(),
            updated_at=user.updated_at.isoformat(),
        )
        for user in users
    ]


@users_router.post("", response_model=UserResponseSchema, status_code=status.HTTP_201_CREATED)
async def create_user_by_admin(
    user_data: UserRegistrationSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "super_admin"))
):
    """Create a new user (Admin/Super Admin only)"""
    try:
        user = await create_user(
            db=db,
            username=user_data.username,
            email=user_data.email,
            password=user_data.password,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            role=user_data.role,
            phone_number=user_data.phone_number,
        )
        return UserResponseSchema(
            id=user.id,
            username=user.username,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            role=user.role,
            phone_number=user.phone_number,
            is_active=user.is_active,
            is_verified=user.is_verified,
            created_at=user.created_at.isoformat(),
            updated_at=user.updated_at.isoformat(),
        )
    except ValidationError as e:
        error_detail = getattr(e, 'message', str(e))
        raise HTTPException(status_code=422, detail=error_detail)


@users_router.get("/{user_id}", response_model=UserResponseSchema)
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "super_admin"))
):
    """Get user by ID"""
    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponseSchema(
        id=user.id,
        username=user.username,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role,
        phone_number=user.phone_number,
        is_active=user.is_active,
        is_verified=user.is_verified,
        created_at=user.created_at.isoformat(),
        updated_at=user.updated_at.isoformat(),
    )


@users_router.put("/{user_id}", response_model=UserResponseSchema)
async def update_user_info(
    user_id: int,
    user_data: UserUpdateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin", "super_admin"))
):
    """Update user (Admin/Super Admin only)"""
    update_dict = user_data.model_dump(exclude_unset=True)
    user = await update_user(db, user_id, update_dict)
    return UserResponseSchema(
        id=user.id,
        username=user.username,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role,
        phone_number=user.phone_number,
        is_active=user.is_active,
        is_verified=user.is_verified,
        created_at=user.created_at.isoformat(),
        updated_at=user.updated_at.isoformat(),
    )


@users_router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin"))
):
    """Delete user (Super Admin only)"""
    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent deleting yourself
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    from sqlalchemy import delete as sql_delete
    stmt = sql_delete(User).where(User.id == user_id)
    await db.execute(stmt)
    await db.commit()
    return None
