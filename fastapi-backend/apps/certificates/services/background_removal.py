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


async def _enhance_signature_preservation(image_bytes: bytes) -> bytes:
    """
    Post-process image to enhance dark ink signature preservation.
    This function ensures dark pixels (signature) are preserved even if rembg was too aggressive.
    """
    try:
        img = Image.open(BytesIO(image_bytes))
        
        # Convert to RGBA if not already
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        # Get image data
        pixels = img.load()
        width, height = img.size
        
        # Enhance dark pixels (signature) by ensuring they remain opaque
        # Dark pixels (low brightness) should be preserved as foreground
        for y in range(height):
            for x in range(width):
                r, g, b, a = pixels[x, y]
                # Calculate brightness
                brightness = (r + g + b) / 3
                
                # If pixel is dark (likely signature ink) and alpha is low, increase alpha
                # Dark pixels (brightness < 100) should be preserved
                if brightness < 100 and a < 200:
                    # Increase alpha for dark pixels to preserve signature
                    pixels[x, y] = (r, g, b, min(255, a + 100))
                # If pixel is very light (likely background) and alpha is high, decrease alpha
                elif brightness > 240 and a > 50:
                    # Decrease alpha for very light pixels (background)
                    pixels[x, y] = (r, g, b, max(0, a - 150))
        
        # Save enhanced image
        output_buffer = BytesIO()
        img.save(output_buffer, format='PNG')
        return output_buffer.getvalue()
    
    except Exception as e:
        logger.warning(f"Error in signature enhancement: {e}. Returning original.")
        return image_bytes


async def remove_background_from_image(
    image_data: bytes,
    output_format: str = "PNG",
    preserve_dark_ink: bool = True
) -> Optional[bytes]:
    """
    Remove background from an image using rembg
    
    Args:
        image_data: Raw image bytes
        output_format: Output format (PNG, JPEG, etc.). Default is PNG for transparency support.
        preserve_dark_ink: If True, uses settings optimized for preserving dark ink (signatures).
                          Uses alpha matting with high foreground threshold to preserve dark pixels.
    
    Returns:
        Bytes of the image with background removed, or None if processing fails
    """
    if not REMBG_AVAILABLE:
        logger.error("rembg is not available. Cannot remove background.")
        raise ImportError("rembg library is not installed. Please install it with: pip install rembg pillow")
    
    try:
        # Prepare rembg settings optimized for signatures/dark ink
        # These settings help preserve dark ink while removing white/light backgrounds
        rembg_settings = {}
        
        # Run rembg in thread pool to avoid blocking the event loop
        # rembg.remove() is CPU-intensive and synchronous
        loop = asyncio.get_event_loop()
        
        if preserve_dark_ink:
            # For signatures, use alpha matting with optimized thresholds
            # Try to use rembg's session with u2net model which is better for fine details
            try:
                from rembg import new_session
                from rembg import remove as rembg_remove
                
                # Use u2net model which is better for fine details like signatures
                session = new_session('u2net')
                
                # Alpha matting settings optimized for dark ink signatures
                # High foreground threshold (240) ensures dark ink is preserved as foreground
                # Low background threshold (10) identifies white/light backgrounds
                rembg_settings = {
                    "alpha_matting": True,
                    "alpha_matting_foreground_threshold": 240,  # High threshold preserves dark ink
                    "alpha_matting_background_threshold": 10,   # Low threshold identifies white background
                    "alpha_matting_erode_size": 10,
                    "post_process_mask": True,
                }
                
                logger.info("Using signature-optimized settings with u2net model")
                
                # Use session and settings
                def remove_with_settings(data):
                    return rembg_remove(data, session=session, **rembg_settings)
                
                output_bytes = await loop.run_in_executor(_executor, remove_with_settings, image_data)
            except (ImportError, AttributeError, TypeError) as e:
                # Fallback: try with just alpha matting parameters (different API versions)
                logger.warning(f"Could not use session-based rembg: {e}. Trying alternative approach.")
                try:
                    # Try with just alpha_matting parameters
                    rembg_settings = {
                        "alpha_matting": True,
                        "alpha_matting_foreground_threshold": 240,
                        "alpha_matting_background_threshold": 10,
                        "alpha_matting_erode_size": 10,
                    }
                    output_bytes = await loop.run_in_executor(
                        _executor,
                        lambda: remove(image_data, **rembg_settings)
                    )
                except TypeError:
                    # If parameters don't work, use basic remove and post-process
                    logger.warning("Alpha matting parameters not supported, using basic remove")
                    output_bytes = await loop.run_in_executor(_executor, remove, image_data)
                    # Post-process to enhance dark pixels (signature)
                    output_bytes = await _enhance_signature_preservation(output_bytes)
        else:
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
    output_format: str = "PNG",
    preserve_dark_ink: bool = True
) -> Optional[str]:
    """
    Remove background from a base64-encoded image
    
    Args:
        base64_string: Base64-encoded image string (with or without data URL prefix)
        output_format: Output format (PNG, JPEG, etc.). Default is PNG.
        preserve_dark_ink: If True, uses settings optimized for preserving dark ink (signatures).
    
    Returns:
        Base64-encoded string of the image with background removed
    """
    try:
        # Remove data URL prefix if present
        if base64_string.startswith("data:image"):
            base64_string = base64_string.split(",")[1]
        
        # Decode base64 to bytes
        image_data = base64.b64decode(base64_string)
        
        # Remove background with signature-optimized settings
        output_bytes = await remove_background_from_image(image_data, output_format, preserve_dark_ink)
        
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
