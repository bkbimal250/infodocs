"""
Utility Functions
"""
import logging
import smtplib
from email.message import EmailMessage
from datetime import datetime, timezone
from typing import Iterable, Union, Optional

from config.settings import settings

logger = logging.getLogger(__name__)


def get_current_timestamp() -> datetime:
    """Get current UTC timestamp"""
    return datetime.now(timezone.utc)


def send_email(
    subject: str, 
    body: str, 
    recipients: Union[str, Iterable[str]], 
    html_body: Optional[str] = None
) -> None:
    """
    Send an email using the configured SMTP settings.

    Args:
        subject: Email subject line.
        body: Email body (plain text).
        recipients: Single email or iterable of emails.
        html_body: Optional HTML email body. If provided, email will be sent as multipart.
    """
    if isinstance(recipients, str):
        to_addresses = [recipients]
    else:
        to_addresses = list(recipients)

    if not to_addresses:
        raise ValueError("At least one recipient email is required")

    message = EmailMessage()
    message["Subject"] = subject
    
    # Extract email address from FROM field if it contains display name
    from_email = settings.SMTP_FROM_EMAIL or settings.SERVER_EMAIL
    if "<" in from_email and ">" in from_email:
        # Format: "Display Name <email@example.com>"
        message["From"] = from_email
    else:
        # Just email address
        message["From"] = from_email
    
    message["To"] = ", ".join(to_addresses)
    message.set_content(body)
    
    # Add HTML content if provided
    if html_body:
        message.add_alternative(html_body, subtype='html')

    # Validate SMTP settings
    if not settings.SMTP_HOST:
        error_msg = "SMTP_HOST is not configured in environment variables"
        logger.error(error_msg)
        raise ValueError(error_msg)
    if not settings.SMTP_USER:
        error_msg = "SMTP_USER is not configured in environment variables"
        logger.error(error_msg)
        raise ValueError(error_msg)
    if not settings.SMTP_PASSWORD:
        error_msg = "SMTP_PASSWORD is not configured in environment variables"
        logger.error(error_msg)
        raise ValueError(error_msg)
    
    try:
        logger.info(f"Attempting to send email to {to_addresses} via {settings.SMTP_HOST}:{settings.SMTP_PORT}")
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=30) as server:
            server.set_debuglevel(0)  # Set to 1 for debug output
            if settings.SMTP_USE_TLS:
                logger.info("Starting TLS...")
                server.starttls()
            logger.info(f"Logging in as {settings.SMTP_USER}")
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            logger.info("Sending email message...")
            server.send_message(message)
            logger.info(f"Email sent successfully to {to_addresses}")
    except smtplib.SMTPAuthenticationError as exc:
        error_msg = f"SMTP Authentication failed. Check your email and password. Error: {str(exc)}"
        logger.error(error_msg)
        raise ValueError(error_msg)
    except smtplib.SMTPConnectError as exc:
        error_msg = f"Failed to connect to SMTP server {settings.SMTP_HOST}:{settings.SMTP_PORT}. Error: {str(exc)}"
        logger.error(error_msg)
        raise ValueError(error_msg)
    except smtplib.SMTPException as exc:
        error_msg = f"SMTP error occurred: {str(exc)}"
        logger.error(error_msg)
        raise ValueError(error_msg)
    except Exception as exc:
        error_msg = f"Unexpected error sending email: {str(exc)}"
        logger.error(error_msg, exc_info=True)
        raise ValueError(error_msg)

