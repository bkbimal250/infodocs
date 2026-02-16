"""
Background Removal Service
Reusable service for removing backgrounds from images using remove.bg API
Author: Bimal Developer
"""
import logging
from io import BytesIO
from typing import Optional
from PIL import Image
import base64
import asyncio
from concurrent.futures import ThreadPoolExecutor
import httpx
from config.settings import settings

logger = logging.getLogger(__name__)

# Check if remove.bg API is configured
REMOVE_BG_AVAILABLE = False
REMOVE_BG_ERROR = None

if settings.REMOVE_BG_API_KEY:
    REMOVE_BG_AVAILABLE = True
    logger.info("✓ remove.bg API is configured for background removal")
else:
    REMOVE_BG_ERROR = "REMOVE_BG_API_KEY not set in environment variables"
    logger.warning(f"remove.bg API not configured: {REMOVE_BG_ERROR}")

# Fallback: Check if rembg is available as backup
REMBG_AVAILABLE = False
REMBG_ERROR = None
try:
    from rembg import remove
    REMBG_AVAILABLE = True
    logger.info("✓ rembg is available as fallback for background removal")
except ImportError as e:
    REMBG_ERROR = str(e)
    logger.warning(f"rembg not available: {e}.")

# Thread pool executor for running CPU-intensive operations
_executor = ThreadPoolExecutor(max_workers=2, thread_name_prefix="bg-removal")


async def _remove_background_using_api(image_data: bytes, preserve_dark_ink: bool = True) -> bytes:
    """
    Remove background using remove.bg API
    
    Args:
        image_data: Raw image bytes
        preserve_dark_ink: If True, uses settings optimized for signatures
    
    Returns:
        Bytes of the image with background removed
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Prepare multipart form data for remove.bg API
            # remove.bg expects 'image_file' as the file field name
            files = {
                'image_file': ('image.png', BytesIO(image_data), 'image/png')
            }
            
            # API parameters
            data = {
                'size': 'auto',  # Auto-detect best size
            }
            
            # For signatures, use specific settings
            if preserve_dark_ink:
                # Use 'auto' type for better detection
                data['type'] = 'auto'  # Auto-detect type (person/product/auto)
            
            headers = {
                'X-Api-Key': settings.REMOVE_BG_API_KEY
            }
            
            logger.info(f"Calling remove.bg API with {len(image_data)} bytes")
            response = await client.post(
                settings.REMOVE_BG_API_URL,
                headers=headers,
                files=files,
                data=data
            )
            
            if response.status_code == 200:
                logger.info(f"Successfully removed background using remove.bg API. Response size: {len(response.content)} bytes")
                return response.content
            else:
                error_msg = f"remove.bg API returned status {response.status_code}: {response.text}"
                logger.error(error_msg)
                raise Exception(error_msg)
    
    except httpx.TimeoutException:
        logger.error("remove.bg API request timed out")
        raise Exception("Background removal API request timed out")
    except Exception as e:
        logger.error(f"Error calling remove.bg API: {e}", exc_info=True)
        raise


async def _remove_background_using_rembg(image_data: bytes, preserve_dark_ink: bool = True) -> bytes:
    """
    Remove background using rembg library (fallback method)
    """
    if not REMBG_AVAILABLE:
        raise ImportError("rembg library is not installed")
    
    try:
        # Prepare rembg settings optimized for signatures/dark ink
        rembg_settings = {}
        
        # Run rembg in thread pool to avoid blocking the event loop
        loop = asyncio.get_event_loop()
        
        if preserve_dark_ink:
            # For signatures, use alpha matting with optimized thresholds
            try:
                from rembg import new_session
                from rembg import remove as rembg_remove
                
                # Use u2net model which is better for fine details like signatures
                session = new_session('u2net')
                
                # Alpha matting settings optimized for dark ink signatures
                rembg_settings = {
                    "alpha_matting": True,
                    "alpha_matting_foreground_threshold": 240,
                    "alpha_matting_background_threshold": 10,
                    "alpha_matting_erode_size": 10,
                    "post_process_mask": True,
                }
                
                logger.info("Using signature-optimized settings with u2net model")
                
                def remove_with_settings(data):
                    return rembg_remove(data, session=session, **rembg_settings)
                
                output_bytes = await loop.run_in_executor(_executor, remove_with_settings, image_data)
            except (ImportError, AttributeError, TypeError) as e:
                logger.warning(f"Could not use session-based rembg: {e}. Trying alternative approach.")
                try:
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
                    logger.warning("Alpha matting parameters not supported, using basic remove")
                    output_bytes = await loop.run_in_executor(_executor, remove, image_data)
                    output_bytes = await _enhance_signature_preservation(output_bytes)
        else:
            output_bytes = await loop.run_in_executor(_executor, remove, image_data)
        
        return output_bytes
    
    except Exception as e:
        logger.error(f"Error using rembg: {e}", exc_info=True)
        raise


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
    Remove background from an image using remove.bg API (primary) or rembg (fallback)
    
    Args:
        image_data: Raw image bytes
        output_format: Output format (PNG, JPEG, etc.). Default is PNG for transparency support.
        preserve_dark_ink: If True, uses settings optimized for preserving dark ink (signatures).
                          For remove.bg API, this parameter is used to set appropriate API options.
    
    Returns:
        Bytes of the image with background removed, or None if processing fails
    """
    try:
        output_bytes = None
        
        # Try remove.bg API first (preferred method)
        if REMOVE_BG_AVAILABLE:
            try:
                output_bytes = await _remove_background_using_api(image_data, preserve_dark_ink)
                logger.info("Successfully used remove.bg API for background removal")
            except Exception as e:
                logger.warning(f"remove.bg API failed: {e}. Falling back to rembg if available.")
                # Fall through to rembg fallback
                if REMBG_AVAILABLE:
                    try:
                        output_bytes = await _remove_background_using_rembg(image_data, preserve_dark_ink)
                        logger.info("Successfully used rembg fallback for background removal")
                    except Exception as rembg_error:
                        logger.error(f"Both remove.bg API and rembg failed: {rembg_error}")
                        raise Exception(f"Background removal failed: remove.bg API error: {e}, rembg error: {rembg_error}")
                else:
                    raise Exception(f"remove.bg API failed and rembg is not available: {e}")
        else:
            # Use rembg if API is not configured
            if not REMBG_AVAILABLE:
                error_msg = "Background removal service is not available. "
                error_msg += "REMOVE_BG_API_KEY not configured and rembg library is not installed."
                logger.error(error_msg)
                raise ImportError(error_msg + " Please configure REMOVE_BG_API_KEY or install rembg: pip install rembg pillow")
            
            output_bytes = await _remove_background_using_rembg(image_data, preserve_dark_ink)
        
        if output_bytes is None:
            raise Exception("Background removal returned None")
        
        # If output format is not PNG, convert it
        # If output format is not PNG, convert it
        if output_format.upper() != "PNG":
            def convert_format(data, fmt):
                img = Image.open(BytesIO(data))
                # Convert RGBA to RGB if output format doesn't support transparency
                if fmt.upper() in ["JPEG", "JPG"]:
                    # Create white background for JPEG
                    rgb_img = Image.new("RGB", img.size, (255, 255, 255))
                    rgb_img.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
                    img = rgb_img
                
                output_buffer = BytesIO()
                img.save(output_buffer, format=fmt.upper())
                return output_buffer.getvalue()

            # Run blocking PIL operations in thread pool
            from starlette.concurrency import run_in_threadpool
            output_bytes = await run_in_threadpool(convert_format, output_bytes, output_format)
        
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
