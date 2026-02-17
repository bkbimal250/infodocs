"""
Background Removal Service
Reusable service for removing backgrounds from images using rembg (Local CPU)
Author: Bimal Developer (Refactored for Production)
"""
import logging
from io import BytesIO
from typing import Optional
from PIL import Image
import base64
import asyncio
from concurrent.futures import ThreadPoolExecutor

# Removed external API imports
# from config.settings import settings

logger = logging.getLogger(__name__)

# ==============================================================================
# CONFIGURATION & GLOBAL STATE
# ==============================================================================

# Thread pool executor for running CPU-intensive operations
_executor = ThreadPoolExecutor(max_workers=2, thread_name_prefix="bg-removal")

# rembg Configuration (Global Model Loading)
REMBG_AVAILABLE = False
REMBG_SESSION = None
REMBG_ERROR = None

try:
    from rembg import remove, new_session
    REMBG_AVAILABLE = True
    
    # Initialize session globally to avoid per-request reload overhead
    # using 'isnet-general-use' as it is better for signatures/general edges
    try:
         logger.info("Initializing rembg session (isnet-general-use)...")
         REMBG_SESSION = new_session("isnet-general-use")
         logger.info("✓ rembg session initialized (isnet-general-use)")
    except Exception as e:
        logger.warning(f"Failed to initialize isnet-general-use, falling back to u2net: {e}")
        REMBG_SESSION = new_session("u2net")
        logger.info("✓ rembg session initialized (u2net)")

except ImportError as e:
    REMBG_ERROR = str(e)
    logger.warning(f"rembg not available: {e}. Install with 'pip install rembg[cpu]'")


# ==============================================================================
# CORE SERVICES
# ==============================================================================

async def _remove_background_using_rembg(image_data: bytes) -> bytes:
    """
    Remove background using local rembg library with global session
    """
    if not REMBG_AVAILABLE or REMBG_SESSION is None:
        raise ImportError("rembg library not installed or session not initialized")
    
    try:
        # Run in thread pool to avoid blocking event loop
        loop = asyncio.get_event_loop()
        
        # Use lambda to pass the global session
        output_bytes = await loop.run_in_executor(
            _executor,
            lambda: remove(image_data, session=REMBG_SESSION)
        )
        return output_bytes
    
    except Exception as e:
        logger.error(f"Error using local rembg: {e}", exc_info=True)
        raise


# ==============================================================================
# PUBLIC INTERFACE
# ==============================================================================

async def remove_background_from_image(
    image_data: bytes,
    output_format: str = "PNG",
    preserve_dark_ink: bool = True
) -> Optional[bytes]:
    """
    Remove background from an image using local rembg.
    
    Args:
        image_data: Raw bytes of the image
        output_format: Target format (PNG/JPEG). Note: JPEG loses transparency.
        preserve_dark_ink: Ignored (was for external API compatibility)
    """
    try:
        # 1. Validation
        if not image_data:
            raise ValueError("Empty image data")
        
        # Limit file size to 10MB to prevent crashes
        if len(image_data) > 10 * 1024 * 1024:
            raise ValueError("Image too large (>10MB). Please optimize first.")

        if not REMBG_AVAILABLE:
            error_msg = f"Local background removal service unavailable. {REMBG_ERROR or 'Install rembg[cpu]'}"
            logger.error(error_msg)
            raise RuntimeError(error_msg)

        # 2. Process
        logger.info("Using local rembg for background removal")
        output_bytes = await _remove_background_using_rembg(image_data)
        
        if output_bytes is None:
            raise RuntimeError("Background removal result was empty")

        # 3. Format Conversion
        if output_format.upper() != "PNG":
            output_bytes = await _convert_format(output_bytes, output_format)
        
        return output_bytes

    except Exception as e:
        logger.error(f"Background removal failed: {e}")
        raise


async def _convert_format(image_bytes: bytes, target_format: str) -> bytes:
    """Helper to convert image format asynchronously"""
    def convert(data, fmt):
        img = Image.open(BytesIO(data))
        if fmt.upper() in ["JPEG", "JPG"]:
            # Drop alpha channel for JPEG
            if img.mode == 'RGBA':
                rgb_img = Image.new("RGB", img.size, (255, 255, 255))
                rgb_img.paste(img, mask=img.split()[3])
                img = rgb_img
            elif img.mode != 'RGB':
                img = img.convert('RGB')
        
        out = BytesIO()
        img.save(out, format=fmt.upper())
        return out.getvalue()

    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(_executor, convert, image_bytes, target_format)


async def remove_background_from_base64(
    base64_string: str,
    output_format: str = "PNG",
    preserve_dark_ink: bool = True
) -> Optional[str]:
    """
    Wrapper for base64 inputs
    """
    try:
        # Strip header
        if "base64," in base64_string:
            header, base64_string = base64_string.split("base64,")
        
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
