"""
Utility Functions
"""
import logging
from datetime import datetime, timezone
from typing import Iterable, Union, Optional, Tuple, List
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from config.settings import settings

logger = logging.getLogger(__name__)


async def get_current_timestamp() -> datetime:
    """Get current UTC timestamp"""
    return datetime.now(timezone.utc)


async def validate_smtp_settings() -> Tuple[bool, Optional[str]]:
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
    Send an email synchronously using smtplib.

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
        # Extract display name and email from FROM field
        from_email = settings.SMTP_FROM_EMAIL or settings.SERVER_EMAIL
        from_name = "SPADocs"
        
        # Check if FROM email contains display name format: "Display Name <email@example.com>"
        if "<" in from_email and ">" in from_email:
            parts = from_email.split("<")
            if len(parts) == 2:
                from_name = parts[0].strip().strip('"').strip("'")
                from_email = parts[1].strip().strip(">")
        
        # Create message container
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"{from_name} <{from_email}>"
        msg['To'] = ", ".join(recipient_list)
        
        if html_body:
            msg.attach(MIMEText(html_body, 'html'))
        else:
            msg.attach(MIMEText(body, 'plain'))
            
        logger.info(f"Attempting to send email to {recipient_list} via {settings.SMTP_HOST}:{settings.SMTP_PORT}")
        
        # Connect to SMTP server
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        if settings.SMTP_USE_TLS:
            server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(from_email, recipient_list, msg.as_string())
        server.quit()
        
        logger.info(f"Email sent successfully to {recipient_list}")
        
    except Exception as exc:
        error_msg = f"Failed to send email: {str(exc)}"
        logger.error(error_msg, exc_info=True)
        raise ValueError(error_msg)


