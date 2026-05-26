"""
Background Removal Service
Reusable service for removing backgrounds from images using rembg (Local CPU)
"""
import asyncio
import base64
import logging
from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
from typing import Optional

from PIL import Image

logger = logging.getLogger(__name__)

# Thread pool executor for running CPU-intensive operations.
_executor = ThreadPoolExecutor(max_workers=2, thread_name_prefix="bg-removal")
_session_lock = asyncio.Lock()

REMBG_AVAILABLE = False
REMBG_SESSION = None
REMBG_ERROR = None

try:
    from rembg import remove, new_session

    REMBG_AVAILABLE = True
except ImportError as e:
    REMBG_ERROR = str(e)
    logger.warning(f"rembg not available: {e}. Install with 'pip install rembg[cpu]'")


async def get_rembg_session():
    """
    Lazy-initializes and returns the rembg session.
    This prevents startup hangs during module import and avoids duplicate model loads.
    """
    global REMBG_SESSION

    if not REMBG_AVAILABLE:
        return None

    if REMBG_SESSION is None:
        async with _session_lock:
            if REMBG_SESSION is not None:
                return REMBG_SESSION

            loop = asyncio.get_event_loop()
            try:
                logger.info("Lazy-initializing rembg session (isnet-general-use)...")
                REMBG_SESSION = await loop.run_in_executor(
                    _executor,
                    lambda: new_session("isnet-general-use"),
                )
                logger.info("rembg session initialized (isnet-general-use)")
            except Exception as e:
                logger.warning(f"Failed to initialize isnet-general-use, falling back to u2net: {e}")
                try:
                    REMBG_SESSION = await loop.run_in_executor(
                        _executor,
                        lambda: new_session("u2net"),
                    )
                    logger.info("rembg session initialized (u2net)")
                except Exception as e2:
                    logger.error(f"Failed to initialize any rembg session: {e2}", exc_info=True)
                    return None

    return REMBG_SESSION


async def _remove_background_using_rembg(image_data: bytes) -> bytes:
    """Remove background using local rembg library with a cached session."""
    session = await get_rembg_session()
    if not REMBG_AVAILABLE or session is None:
        raise ImportError("rembg library not installed or session failed to initialize")

    try:
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            _executor,
            lambda: remove(image_data, session=session),
        )
    except Exception as e:
        logger.error(f"Error using local rembg: {e}", exc_info=True)
        raise


async def remove_background_from_image(
    image_data: bytes,
    output_format: str = "PNG",
    preserve_dark_ink: bool = True,
) -> Optional[bytes]:
    """
    Remove background from an image using local rembg.

    Args:
        image_data: Raw bytes of the image.
        output_format: Target format (PNG/JPEG). JPEG loses transparency.
        preserve_dark_ink: Kept for external API compatibility.
    """
    try:
        if not image_data:
            raise ValueError("Empty image data")

        if len(image_data) > 10 * 1024 * 1024:
            raise ValueError("Image too large (>10MB). Please optimize first.")

        if not REMBG_AVAILABLE:
            error_msg = f"Local background removal service unavailable. {REMBG_ERROR or 'Install rembg[cpu]'}"
            logger.error(error_msg)
            raise RuntimeError(error_msg)

        logger.info("Using local rembg for background removal")
        output_bytes = await _remove_background_using_rembg(image_data)

        if output_bytes is None:
            raise RuntimeError("Background removal result was empty")

        if output_format.upper() != "PNG":
            output_bytes = await _convert_format(output_bytes, output_format)

        return output_bytes

    except Exception as e:
        logger.error(f"Background removal failed: {e}")
        raise


async def _convert_format(image_bytes: bytes, target_format: str) -> bytes:
    """Convert image format without blocking the event loop."""

    def convert(data, fmt):
        img = Image.open(BytesIO(data))
        normalized_format = "JPEG" if fmt.upper() == "JPG" else fmt.upper()

        if normalized_format == "JPEG":
            if img.mode == "RGBA":
                rgb_img = Image.new("RGB", img.size, (255, 255, 255))
                rgb_img.paste(img, mask=img.split()[3])
                img = rgb_img
            elif img.mode != "RGB":
                img = img.convert("RGB")

        out = BytesIO()
        img.save(out, format=normalized_format)
        return out.getvalue()

    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(_executor, convert, image_bytes, target_format)


async def remove_background_from_base64(
    base64_string: str,
    output_format: str = "PNG",
    preserve_dark_ink: bool = True,
) -> Optional[str]:
    """Remove background from a base64 image and return a data URL."""
    try:
        if "base64," in base64_string:
            _, base64_string = base64_string.split("base64,", 1)

        image_data = base64.b64decode(base64_string)
        output_bytes = await remove_background_from_image(image_data, output_format, preserve_dark_ink)

        if not output_bytes:
            return None

        output_base64 = base64.b64encode(output_bytes).decode("utf-8")
        mime = "image/png" if output_format.upper() == "PNG" else "image/jpeg"
        return f"data:{mime};base64,{output_base64}"

    except Exception as e:
        logger.error(f"Base64 processing error: {e}")
        raise
