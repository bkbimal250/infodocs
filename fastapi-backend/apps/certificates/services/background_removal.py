"""
Background Removal Service
Reusable service for removing backgrounds from images using rembg
Author: Bimal Developer
"""
import logging
from io import BytesIO
from typing import Optional
from PIL import Image
import base64
import asyncio
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)

# Check if rembg is available
REMBG_AVAILABLE = False
REMBG_ERROR = None
try:
    from rembg import remove
    REMBG_AVAILABLE = True
    logger.info("✓ rembg is available for background removal")
except ImportError as e:
    REMBG_ERROR = str(e)
    logger.warning(f"rembg not available: {e}. Background removal will not work.")

# Thread pool executor for running CPU-intensive rembg operations
_executor = ThreadPoolExecutor(max_workers=2, thread_name_prefix="rembg")


async def remove_background_from_image(
    image_data: bytes,
    output_format: str = "PNG"
) -> Optional[bytes]:
    """
    Remove background from an image using rembg
    
    Args:
        image_data: Raw image bytes
        output_format: Output format (PNG, JPEG, etc.). Default is PNG for transparency support.
    
    Returns:
        Bytes of the image with background removed, or None if processing fails
    """
    if not REMBG_AVAILABLE:
        logger.error("rembg is not available. Cannot remove background.")
        raise ImportError("rembg library is not installed. Please install it with: pip install rembg pillow")
    
    try:
        # Run rembg in thread pool to avoid blocking the event loop
        # rembg.remove() is CPU-intensive and synchronous
        loop = asyncio.get_event_loop()
        output_bytes = await loop.run_in_executor(_executor, remove, image_data)
        
        # If output format is not PNG, convert it
        if output_format.upper() != "PNG":
            img = Image.open(BytesIO(output_bytes))
            # Convert RGBA to RGB if output format doesn't support transparency
            if output_format.upper() in ["JPEG", "JPG"]:
                # Create white background for JPEG
                rgb_img = Image.new("RGB", img.size, (255, 255, 255))
                rgb_img.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
                img = rgb_img
            
            output_buffer = BytesIO()
            img.save(output_buffer, format=output_format.upper())
            output_bytes = output_buffer.getvalue()
        
        logger.info(f"Successfully removed background. Output size: {len(output_bytes)} bytes")
        return output_bytes
    
    except Exception as e:
        logger.error(f"Error removing background: {e}", exc_info=True)
        raise Exception(f"Failed to remove background: {str(e)}")


async def remove_background_from_base64(
    base64_string: str,
    output_format: str = "PNG"
) -> Optional[str]:
    """
    Remove background from a base64-encoded image
    
    Args:
        base64_string: Base64-encoded image string (with or without data URL prefix)
        output_format: Output format (PNG, JPEG, etc.). Default is PNG.
    
    Returns:
        Base64-encoded string of the image with background removed
    """
    try:
        # Remove data URL prefix if present
        if base64_string.startswith("data:image"):
            base64_string = base64_string.split(",")[1]
        
        # Decode base64 to bytes
        image_data = base64.b64decode(base64_string)
        
        # Remove background
        output_bytes = await remove_background_from_image(image_data, output_format)
        
        if output_bytes is None:
            return None
        
        # Encode back to base64
        output_base64 = base64.b64encode(output_bytes).decode("utf-8")
        
        # Add data URL prefix
        mime_type = f"image/{output_format.lower()}" if output_format.upper() != "JPG" else "image/jpeg"
        return f"data:{mime_type};base64,{output_base64}"
    
    except Exception as e:
        logger.error(f"Error processing base64 image: {e}", exc_info=True)
        raise Exception(f"Failed to process base64 image: {str(e)}")
