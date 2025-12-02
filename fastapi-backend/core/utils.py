"""
Utility Functions
"""
import logging
from datetime import datetime, timezone
from typing import Iterable, Union, Optional, Tuple, List
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from config.settings import settings

logger = logging.getLogger(__name__)

# FastAPI-Mail configuration (lazy initialization)
_mail_config: Optional[ConnectionConfig] = None
_fastmail: Optional[FastMail] = None


def get_current_timestamp() -> datetime:
    """Get current UTC timestamp"""
    return datetime.now(timezone.utc)


def _get_mail_config() -> ConnectionConfig:
    """
    Get or create FastAPI-Mail connection configuration.
    Uses lazy initialization to avoid creating config before settings are loaded.
    """
    global _mail_config
    
    if _mail_config is None:
        # Validate SMTP settings first
        is_valid, error_msg = validate_smtp_settings()
        if not is_valid:
            logger.error(f"SMTP configuration error: {error_msg}")
            raise ValueError(error_msg)
        
        # Extract display name and email from FROM field
        from_email = settings.SMTP_FROM_EMAIL or settings.SERVER_EMAIL
        from_name = "SPADocs"
        
        # Check if FROM email contains display name format: "Display Name <email@example.com>"
        if "<" in from_email and ">" in from_email:
            # Extract display name and email
            parts = from_email.split("<")
            if len(parts) == 2:
                from_name = parts[0].strip().strip('"').strip("'")
                from_email = parts[1].strip().strip(">")
        
        _mail_config = ConnectionConfig(
            MAIL_USERNAME=settings.SMTP_USER,
            MAIL_PASSWORD=settings.SMTP_PASSWORD,
            MAIL_FROM=from_email,
            MAIL_FROM_NAME=from_name,
            MAIL_PORT=settings.SMTP_PORT,
            MAIL_SERVER=settings.SMTP_HOST,
            MAIL_STARTTLS=bool(settings.SMTP_USE_TLS),
            MAIL_SSL_TLS=False,  # Use STARTTLS instead of SSL
            USE_CREDENTIALS=True,
            VALIDATE_CERTS=True,
            MAIL_DEBUG=settings.DEBUG,
        )
        logger.info(f"FastAPI-Mail configuration initialized for {settings.SMTP_HOST}:{settings.SMTP_PORT}")
    
    return _mail_config


def _get_fastmail() -> FastMail:
    """
    Get or create FastMail instance.
    Uses lazy initialization.
    """
    global _fastmail
    
    if _fastmail is None:
        config = _get_mail_config()
        _fastmail = FastMail(config)
    
    return _fastmail


def validate_smtp_settings() -> Tuple[bool, Optional[str]]:
    """
    Validate SMTP settings are configured.
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not settings.SMTP_HOST:
        return False, "SMTP_HOST is not configured in environment variables"
    if not settings.SMTP_USER:
        return False, "SMTP_USER is not configured in environment variables"
    if not settings.SMTP_PASSWORD:
        return False, "SMTP_PASSWORD is not configured in environment variables"
    if not settings.SMTP_FROM_EMAIL and not settings.SERVER_EMAIL:
        return False, "SMTP_FROM_EMAIL or SERVER_EMAIL is not configured in environment variables"
    return True, None


async def send_email(
    subject: str, 
    body: str, 
    recipients: Union[str, Iterable[str]], 
    html_body: Optional[str] = None
) -> None:
    """
    Send an email using FastAPI-Mail (native async).

    Args:
        subject: Email subject line.
        body: Email body (plain text).
        recipients: Single email or iterable of emails.
        html_body: Optional HTML email body. If provided, email will be sent as HTML.
    
    Raises:
        ValueError: If SMTP settings are not configured or email sending fails.
    """
    # Convert recipients to list
    if isinstance(recipients, str):
        recipient_list: List[str] = [recipients]
    else:
        recipient_list = list(recipients)
    
    if not recipient_list:
        raise ValueError("At least one recipient email is required")
    
    # Validate SMTP settings first
    is_valid, error_msg = validate_smtp_settings()
    if not is_valid:
        logger.error(f"SMTP configuration error: {error_msg}")
        raise ValueError(error_msg)
    
    try:
        # Get FastMail instance
        fm = _get_fastmail()
        
        # Determine message type and body
        if html_body:
            # Send as HTML email
            message = MessageSchema(
                subject=subject,
                recipients=recipient_list,
                body=html_body,
                subtype=MessageType.html
            )
        else:
            # Send as plain text email
            message = MessageSchema(
                subject=subject,
                recipients=recipient_list,
                body=body,
                subtype=MessageType.plain
            )
        
        logger.info(f"Attempting to send email to {recipient_list} via {settings.SMTP_HOST}:{settings.SMTP_PORT}")
        await fm.send_message(message)
        logger.info(f"Email sent successfully to {recipient_list}")
        
    except Exception as exc:
        error_msg = f"Failed to send email: {str(exc)}"
        logger.error(error_msg, exc_info=True)
        raise ValueError(error_msg)

