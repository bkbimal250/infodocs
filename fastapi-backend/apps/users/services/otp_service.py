"""
OTP Service
Handles OTP generation and verification using SQLAlchemy
"""
from datetime import datetime, timedelta, timezone
import random
from typing import Optional
from pathlib import Path
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from apps.users.models import OTP, User
from core.exceptions import ValidationError
from core.utils import send_email


async def generate_otp(db: AsyncSession, user_id: int, purpose: str) -> str:
    """Generate and store OTP"""
    # Validate user exists
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        raise ValidationError("User not found")

    # Generate 6-digit OTP
    code = str(random.randint(100000, 999999))
    
    # Set expiration (10 minutes)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    
    otp = OTP(
        user_id=user_id,
        code=code,
        purpose=purpose,
        is_used=False,
        expires_at=expires_at,
    )
    
    db.add(otp)
    await db.commit()
    await db.refresh(otp)

    subject = _get_otp_subject(purpose)
    body = _build_otp_body(user.full_name, code, purpose)
    html_body = _build_otp_html_template(user.full_name, code, purpose)
    
    # Try to send email, but don't fail if it doesn't work (for development/testing)
    import logging
    from config.settings import settings
    logger = logging.getLogger(__name__)
    
    # Check if email should be skipped (development mode)
    if settings.SKIP_EMAIL:
        logger.info(
            f"SKIP_EMAIL is enabled. OTP code {code} generated for user {user.email} "
            f"(purpose: {purpose}) but email not sent."
        )
        return code
    
    try:
        send_email(subject, body, user.email, html_body=html_body)
        logger.info(f"OTP email sent successfully to {user.email}")
    except Exception as e:
        # Log the error but don't fail - OTP is still generated and stored
        logger.warning(
            f"Failed to send OTP email to {user.email}: {str(e)}. "
            f"OTP code {code} is still valid and stored in database. "
            f"User can verify using the OTP code directly."
        )
        # Only raise error for critical purposes like login OTP
        # For email verification, allow registration to succeed
        if purpose == "login":
            raise ValidationError(f"Failed to send OTP email: {str(e)}")
        # For other purposes (like email_verification), just log and continue
        logger.info(f"Registration/OTP generation succeeded despite email failure. OTP: {code}")
    
    return code


def _get_otp_subject(purpose: str) -> str:
    """Return email subject based on OTP purpose."""
    subject_map = {
        "email_verification": "Verify your email address",
        "password_reset": "Password reset verification code",
        "login": "Login verification code",
    }
    return subject_map.get(purpose, "One Time Password (OTP)")


def _build_otp_body(full_name: str, code: str, purpose: str) -> str:
    """Create the OTP email body (plain text)."""
    return (
        f"Hello {full_name},\n\n"
        f"Your OTP for {purpose.replace('_', ' ')} is: {code}\n"
        "This code is valid for 10 minutes. If you did not request this, please ignore this email.\n\n"
        "Regards,\n"
        "Disha Online Solution"
    )


def _build_otp_html_template(full_name: str, code: str, purpose: str) -> str:
    """
    Create the OTP email HTML template.

    Prefer loading from template file `apps/users/templates/otp_email.html`,
    falling back to the previous inline HTML if file is missing.
    """
    purpose_text = purpose.replace('_', ' ').title()

    # Default values for header/subject depending on purpose
    header_text = "OTP Verification Code"
    if purpose == "password_reset":
        header_text = "Password Reset Verification Code"
    elif purpose == "login":
        header_text = "Login Verification Code"
    elif purpose == "email_verification":
        header_text = "Email Verification Code"

    # Try to load external HTML template
    try:
        base_dir = Path(__file__).resolve().parent.parent  # apps/users/
        template_path = base_dir / "templates" / "otp_email.html"
        if template_path.exists():
            template_str = template_path.read_text(encoding="utf-8")
            # Very simple placeholder replacement (not full Jinja)
            html = (
                template_str
                .replace("{{ full_name }}", full_name)
                .replace("{{ code }}", code)
                .replace("{{ purpose_text }}", purpose_text)
                .replace("{{ header_text }}", header_text)
                .replace("{{ subject }}", header_text)
            )
            return html
    except Exception:
        # On any error, fall back to inline template below
        pass

    # Fallback inline template (previous behaviour)
    html_template = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OTP Verification</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f4f4;">
            <tr>
                <td style="padding: 20px 0;">
                    <table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                                    OTP Verification Code
                                </h1>
                            </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px 30px;">
                                <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                                    Hello <strong>{full_name}</strong>,
                                </p>
                                
                                <p style="margin: 0 0 30px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                                    Your One-Time Password (OTP) for <strong>{purpose_text}</strong> is:
                                </p>
                                
                                <!-- OTP Code Box -->
                                <div style="background-color: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                                    <p style="margin: 0; font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                        {code}
                                    </p>
                                </div>
                                
                                <p style="margin: 20px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                                    This code is valid for <strong>10 minutes</strong>. Please do not share this code with anyone.
                                </p>
                                
                                <p style="margin: 30px 0 0 0; color: #999999; font-size: 12px; line-height: 1.6;">
                                    If you did not request this OTP, please ignore this email or contact our support team.
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;">
                                <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px; font-weight: 600;">
                                    Disha Online Solution
                                </p>
                                <p style="margin: 0; color: #999999; font-size: 12px;">
                                    This is an automated email. Please do not reply to this message.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """
    return html_template


async def verify_otp(db: AsyncSession, user_id: int, code: str, purpose: str) -> bool:
    """Verify OTP"""
    stmt = select(OTP).where(
        and_(
            OTP.user_id == user_id,
            OTP.code == code,
            OTP.purpose == purpose,
            OTP.is_used == False
        )
    )
    result = await db.execute(stmt)
    otp = result.scalar_one_or_none()
    
    if not otp:
        return False
    
    # Check expiration
    if datetime.now(timezone.utc) > otp.expires_at:
        return False
    
    # Mark as used
    otp.is_used = True
    await db.commit()
    
    return True
