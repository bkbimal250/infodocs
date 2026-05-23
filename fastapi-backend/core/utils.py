"""
Utility Functions
"""
import asyncio
import logging
from datetime import datetime, timezone
from typing import Iterable, Union, Optional, Tuple, List
import smtplib
import requests
import urllib3
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from config.settings import settings

logger = logging.getLogger(__name__)


async def get_current_timestamp() -> datetime:
    """Get current UTC timestamp"""
    return datetime.now(timezone.utc)


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


def _send_email_sync(
    subject: str,
    body: str,
    recipient_list: List[str],
    html_body: Optional[str] = None,
) -> None:
    """
    Synchronous helper to send email via smtplib.
    """
    from_email = settings.SMTP_FROM_EMAIL or settings.SERVER_EMAIL
    from_name = "SPADocs"

    if "<" in from_email and ">" in from_email:
        parts = from_email.split("<")
        if len(parts) == 2:
            from_name = parts[0].strip().strip('"').strip("'")
            from_email = parts[1].strip().strip(">")

    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = f"{from_name} <{from_email}>"
    msg['To'] = ", ".join(recipient_list)

    msg.attach(MIMEText(body, 'plain'))
    if html_body:
        msg.attach(MIMEText(html_body, 'html'))

    logger.info(
        "Attempting to send email to %s via %s:%s | SSL=%s TLS=%s | from=%s",
        recipient_list,
        settings.SMTP_HOST,
        settings.SMTP_PORT,
        settings.SMTP_USE_SSL,
        settings.SMTP_USE_TLS,
        from_email,
    )
    logger.info("Subject: %s", subject)
    logger.info("Body type: %s", type(body))
    logger.info("HTML type: %s", type(html_body))

    if settings.SMTP_USE_SSL:
        server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=30)
    else:
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=30)

    try:
        server.ehlo()
        if settings.SMTP_USE_TLS and not settings.SMTP_USE_SSL:
            server.starttls()
            server.ehlo()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(from_email, recipient_list, msg.as_string())
    finally:
        try:
            server.quit()
        except Exception:
            pass

    logger.info("Email sent successfully to %s", recipient_list)


async def send_email(
    subject: str,
    body: str,
    recipients: Union[str, Iterable[str]],
    html_body: Optional[str] = None,
) -> None:
    """
    Send an email using the configured SMTP server.

    Args:
        subject: Email subject line.
        body: Email body (plain text).
        recipients: Single email or iterable of emails.
        html_body: Optional HTML email body. If provided, email will be sent as HTML.
    
    Raises:
        ValueError: If SMTP settings are not configured or email sending fails.
    """
    subject = str(subject)
    body = str(body)
    if html_body is not None:
        html_body = str(html_body)

    if isinstance(recipients, str):
        recipient_list: List[str] = [recipients]
    else:
        recipient_list = list(recipients)

    if not recipient_list:
        raise ValueError("At least one recipient email is required")

    is_valid, error_msg = validate_smtp_settings()
    if not is_valid:
        logger.error("SMTP configuration error: %s", error_msg)
        raise ValueError(error_msg)

    try:
        await asyncio.to_thread(
            _send_email_sync,
            subject,
            body,
            recipient_list,
            html_body,
        )
    except Exception as exc:
        logger.exception("Failed to send email via SMTP: %s", exc)
        raise ValueError(f"Failed to send email: {str(exc)}")


async def send_smtp_test_email(recipient: str) -> str:
    """Send a simple SMTP test email using current Hostinger SMTP configuration."""
    subject = "SMTP Test Email"
    body = (
        "This is a test email sent using the current SMTP configuration. "
        "If you receive it, the Hostinger SMTP settings are working correctly."
    )
    html_body = (
        "<html><body>"
        "<p>This is a test email sent using the current SMTP configuration.</p>"
        "<p>If you receive it, the Hostinger SMTP settings are working correctly.</p>"
        "</body></html>"
    )

    await send_email(subject, body, recipient, html_body=html_body)
    logger.info("SMTP test email sent successfully to %s", recipient)
    return f"SMTP test email sent successfully to {recipient}"


def validate_sms_settings() -> Tuple[bool, Optional[str]]:
    """Validate SMS settings for phone OTP delivery."""
    if settings.SKIP_SMS:
        return True, None
    if not settings.SMS_API_URL:
        return False, "SMS_API_URL is not configured"
    if not settings.SMS_USERNAME:
        return False, "SMS_USERNAME is not configured"
    if not settings.SMS_API_KEY:
        return False, "SMS_API_KEY is not configured"
    if not settings.SMS_SENDER_ID:
        return False, "SMS_SENDER_ID is not configured"
    if not settings.SMS_TEMPLATE_ID:
        return False, "SMS_TEMPLATE_ID is not configured"
    return True, None


def _send_sms_sync(phone_number: str, message: str) -> None:
    """Send an SMS using the Hilite Multimedia HTTP SMS gateway."""
    params = {
        "username": settings.SMS_USERNAME,
        "apikey": settings.SMS_API_KEY,
        "apirequest": settings.SMS_API_REQUEST,
        "route": settings.SMS_ROUTE,
        "TemplateID": settings.SMS_TEMPLATE_ID,
        "sender": settings.SMS_SENDER_ID,
        "mobile": phone_number,
        "message": message,
    }

    if not settings.SMS_VERIFY_SSL:
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
        logger.warning("SMS SSL certificate verification is disabled for provider request.")

    response = requests.get(
        settings.SMS_API_URL,
        params=params,
        timeout=30,
        verify=settings.SMS_VERIFY_SSL,
    )
    response.raise_for_status()


async def send_sms(phone_number: str, message: str) -> None:
    """
    Send an SMS for phone OTP login.

    The gateway URL/key can be added later in environment variables without changing routes.
    """
    phone_number = str(phone_number).strip()
    message = str(message)
    if not phone_number:
        raise ValueError("Phone number is required")

    is_valid, error_msg = validate_sms_settings()
    if not is_valid:
        logger.error("SMS configuration error: %s", error_msg)
        raise ValueError(error_msg)

    if settings.SKIP_SMS:
        logger.info("SKIP_SMS is enabled. SMS not sent to %s.", phone_number)
        return

    try:
        await asyncio.to_thread(_send_sms_sync, phone_number, message)
    except Exception as exc:
        logger.exception("Failed to send SMS: %s", exc)
        raise ValueError(f"Failed to send SMS: {str(exc)}")

