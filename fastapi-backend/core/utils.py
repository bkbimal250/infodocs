"""
Utility Functions
"""
import asyncio
import logging
import ssl
from datetime import datetime, timezone
from typing import Iterable, Union, Optional, Tuple, List
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import httpx
from config.settings import settings

logger = logging.getLogger(__name__)
_sms_client: Optional[httpx.AsyncClient] = None
_sms_client_lock = asyncio.Lock()


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


def _mask_phone_number(phone_number: str) -> str:
    digits = "".join(ch for ch in str(phone_number) if ch.isdigit())
    if len(digits) <= 4:
        return "****"
    return f"****{digits[-4:]}"


def _mask_secret(value: str) -> str:
    value = str(value or "")
    if len(value) <= 4:
        return "****"
    return f"{value[:2]}****{value[-2:]}"


def _sms_log_payload(payload: dict) -> dict:
    safe_payload = dict(payload)
    if "apikey" in safe_payload:
        safe_payload["apikey"] = _mask_secret(safe_payload["apikey"])
    if "mobile" in safe_payload:
        safe_payload["mobile"] = _mask_phone_number(safe_payload["mobile"])
    if "message" in safe_payload:
        safe_payload["message"] = f"<redacted length={len(str(safe_payload['message']))}>"
    return safe_payload


def _is_ssl_error(exc: BaseException) -> bool:
    current: Optional[BaseException] = exc
    while current:
        if isinstance(current, ssl.SSLError):
            return True
        current = current.__cause__ or current.__context__
    return False


def _sms_timeout() -> httpx.Timeout:
    total_timeout = max(float(settings.SMS_TIMEOUT_SECONDS), 1.0)
    connect_timeout = max(float(settings.SMS_CONNECT_TIMEOUT_SECONDS), 1.0)
    return httpx.Timeout(
        total_timeout,
        connect=min(connect_timeout, total_timeout),
    )


async def get_sms_client() -> httpx.AsyncClient:
    """Reuse one async HTTP client per worker so concurrent OTP requests do not block or reconnect repeatedly."""
    global _sms_client
    if _sms_client and not _sms_client.is_closed:
        return _sms_client

    async with _sms_client_lock:
        if _sms_client and not _sms_client.is_closed:
            return _sms_client

        if not settings.SMS_VERIFY_SSL:
            logger.warning("SMS SSL certificate verification is disabled by SMS_VERIFY_SSL=false.")

        _sms_client = httpx.AsyncClient(
            timeout=_sms_timeout(),
            verify=settings.SMS_VERIFY_SSL,
            limits=httpx.Limits(max_connections=100, max_keepalive_connections=20),
            follow_redirects=False,
        )
        return _sms_client


async def close_sms_client() -> None:
    """Close the per-worker SMS HTTP client during FastAPI/Gunicorn worker shutdown."""
    global _sms_client
    if _sms_client and not _sms_client.is_closed:
        await _sms_client.aclose()
    _sms_client = None


def _sms_provider_accepted(response: httpx.Response) -> bool:
    """Return True only when the SMS provider response looks successful."""
    body = response.text.strip()
    body_lower = body.lower()

    failure_markers = (
        "fail",
        "failed",
        "error",
        "invalid",
        "unauthorized",
        "denied",
        "reject",
        "rejected",
        "insufficient",
        "not sent",
        "1702",
        "1703",
        "1704",
        "1705",
        "1706",
        "1707",
        "1708",
        "1709",
    )
    if any(marker in body_lower for marker in failure_markers):
        logger.error(
            "SMS provider rejected request status=%s body=%s",
            response.status_code,
            body[:500],
        )
        return False

    success_markers = (
        "success",
        "sent",
        "submit",
        "submitted",
        "accepted",
        "ok",
        "1701",
    )
    if not body or any(marker in body_lower for marker in success_markers):
        return True

    logger.error(
        "SMS provider returned HTTP %s with unclassified body=%s",
        response.status_code,
        body[:500],
    )
    return False


async def _send_sms_request(phone_number: str, message: str) -> None:
    """Send an SMS through the provider without blocking the FastAPI event loop."""
    masked_phone = _mask_phone_number(phone_number)
    payload = {
        "username": settings.SMS_USERNAME,
        "apikey": settings.SMS_API_KEY,
        "apirequest": settings.SMS_API_REQUEST,
        "route": settings.SMS_ROUTE,
        "TemplateID": settings.SMS_TEMPLATE_ID,
        "sender": settings.SMS_SENDER_ID,
        "mobile": phone_number,
        "message": message,
    }

    method = str(settings.SMS_HTTP_METHOD or "GET").strip().upper()
    if method not in ("GET", "POST"):
        raise ValueError("SMS_HTTP_METHOD must be GET or POST")

    retry_count = max(int(settings.SMS_MAX_RETRIES), 0)
    client = await get_sms_client()

    for attempt in range(retry_count + 1):
        try:
            logger.info(
                "Sending SMS provider request method=%s url=%s phone=%s attempt=%s timeout=%s payload=%s",
                method,
                settings.SMS_API_URL,
                masked_phone,
                attempt + 1,
                settings.SMS_TIMEOUT_SECONDS,
                _sms_log_payload(payload),
            )

            # Hilite's configured /websms/api/http/index.php endpoint is an HTTP API
            # that receives the SMS fields as query parameters. POST remains configurable
            # for provider-side changes without touching the OTP routes.
            if method == "POST":
                response = await client.post(settings.SMS_API_URL, data=payload)
            else:
                response = await client.get(settings.SMS_API_URL, params=payload)

            response_body = response.text.strip()
            logger.info(
                "SMS provider response phone=%s status=%s attempt=%s body=%s",
                masked_phone,
                response.status_code,
                attempt + 1,
                response_body[:1000],
            )
            response.raise_for_status()

            if not _sms_provider_accepted(response):
                raise ValueError(f"SMS provider rejected or returned unknown response: {response_body[:250]}")

            logger.info(
                "SMS provider accepted OTP message phone=%s status=%s attempt=%s",
                masked_phone,
                response.status_code,
                attempt + 1,
            )
            return
        except httpx.HTTPStatusError as exc:
            status_code = exc.response.status_code
            response_body = exc.response.text.strip()
            if status_code < 500 or attempt >= retry_count:
                logger.exception(
                    "SMS provider HTTP error phone=%s status=%s attempt=%s body=%s",
                    masked_phone,
                    status_code,
                    attempt + 1,
                    response_body[:1000],
                )
                raise ValueError(
                    f"SMS provider HTTP error status={status_code} body={response_body[:250]}"
                ) from exc

            logger.warning(
                "Retrying SMS after provider HTTP %s phone=%s attempt=%s body=%s",
                status_code,
                masked_phone,
                attempt + 1,
                response_body[:500],
            )
        except httpx.TimeoutException as exc:
            if attempt >= retry_count:
                logger.exception(
                    "SMS provider timeout phone=%s attempt=%s timeout=%s",
                    masked_phone,
                    attempt + 1,
                    settings.SMS_TIMEOUT_SECONDS,
                )
                raise ValueError(
                    f"SMS provider timed out after {settings.SMS_TIMEOUT_SECONDS}s"
                ) from exc

            logger.warning(
                "Retrying SMS after timeout phone=%s attempt=%s timeout=%s",
                masked_phone,
                attempt + 1,
                settings.SMS_TIMEOUT_SECONDS,
            )
        except httpx.TransportError as exc:
            if _is_ssl_error(exc):
                logger.exception(
                    "SMS provider SSL error phone=%s verify_ssl=%s attempt=%s",
                    masked_phone,
                    settings.SMS_VERIFY_SSL,
                    attempt + 1,
                )
                raise ValueError(
                    "SMS provider SSL verification failed. Check provider certificate chain or SMS_VERIFY_SSL."
                ) from exc

            if attempt >= retry_count:
                logger.exception(
                    "SMS provider transport error phone=%s attempt=%s",
                    masked_phone,
                    attempt + 1,
                )
                raise ValueError(f"SMS provider transport error: {str(exc)}") from exc

            logger.warning(
                "Retrying SMS after transport error phone=%s attempt=%s error=%s",
                masked_phone,
                attempt + 1,
                exc,
            )


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
        logger.info("SKIP_SMS is enabled. SMS not sent to %s.", _mask_phone_number(phone_number))
        return

    try:
        await _send_sms_request(phone_number, message)
    except Exception as exc:
        logger.exception("Failed to send SMS to %s", _mask_phone_number(phone_number))
        raise ValueError(f"Failed to send SMS: {str(exc)}") from exc

