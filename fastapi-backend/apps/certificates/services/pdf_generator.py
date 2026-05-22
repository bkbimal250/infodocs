"""
Enhanced PDF and Image Generator Service
Robust HTML to PDF/Image conversion with better error handling
Author: Bimal Developer (Enhanced)
"""
import os
import re
from pathlib import Path
from typing import Optional, Dict, Any, List
from io import BytesIO
from datetime import datetime
from config.settings import settings
import logging

logger = logging.getLogger(__name__)

# PDF Generation Libraries Check
WEASYPRINT_AVAILABLE = False
XHTML2PDF_AVAILABLE = False
PDF2IMAGE_AVAILABLE = False
_FONT_CONFIG = None  # Global cache for WeasyPrint font configuration

try:
    from weasyprint import HTML, CSS
    from weasyprint.text.fonts import FontConfiguration
    WEASYPRINT_AVAILABLE = True
    logger.info("✓ WeasyPrint is available (Recommended)")
except (ImportError, OSError) as e:
    logger.warning(f"WeasyPrint not available: {e}")
    try:
        from xhtml2pdf import pisa
        XHTML2PDF_AVAILABLE = True
        logger.info("✓ xhtml2pdf is available (Fallback)")
    except ImportError:
        logger.error("⚠ No PDF generation library available!")


# Async file I/O
AIOFILES_AVAILABLE = False
try:
    import aiofiles
    import aiofiles.os
    AIOFILES_AVAILABLE = True
    logger.info("✓ aiofiles is available (Async file I/O enabled)")
except ImportError:
    logger.warning("aiofiles not available - using synchronous file I/O")

# Ensure media directory exists
MEDIA_DIR = Path(settings.UPLOAD_DIR) / "certificates"
MEDIA_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# CORE PDF GENERATION
# ============================================================

async def html_to_pdf(
    html_content: str,
    output_path: Optional[str] = None
) -> bytes:
    """
    Convert HTML content to PDF with automatic fallback
    """

    if not html_content or not html_content.strip():
        raise ValueError("HTML content cannot be empty")

    try:

        if WEASYPRINT_AVAILABLE:

            logger.info("Generating PDF with WeasyPrint")

            # FIXED: await added
            return await _html_to_pdf_weasyprint(
                html_content,
                output_path
            )

        elif XHTML2PDF_AVAILABLE:

            logger.info("Generating PDF with xhtml2pdf")

            # FIXED: await added
            return await _html_to_pdf_xhtml2pdf(
                html_content,
                output_path
            )

        else:

            raise RuntimeError(
                "No PDF generation library available. "
                "Install with: pip install weasyprint "
                "OR pip install xhtml2pdf"
            )

    except Exception as e:

        logger.error(
            f"PDF generation failed: {str(e)}",
            exc_info=True
        )

        raise RuntimeError(
            f"PDF generation error: {str(e)}"
        ) from e
    

async def _html_to_pdf_weasyprint(html_content: str, output_path: Optional[str] = None) -> bytes:
    """
    Convert HTML to PDF using WeasyPrint (Best Quality)
    
    Features:
    - Proper CSS3 support
    - Better image handling
    - Accurate layout rendering
    """
    from weasyprint import HTML, CSS
    from weasyprint.text.fonts import FontConfiguration
    
    # Use global font config to avoid reloading fonts on every request (huge performance boost)
    global _FONT_CONFIG
    if _FONT_CONFIG is None:
        _FONT_CONFIG = FontConfiguration()
    
    # Enhanced CSS for professional certificates (A4 portrait)
    # Added hyphens: none to improve performance
    css = CSS(string="""
        @page {
            size: A4;
            margin: 0;
        }
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            width: 100%;
            overflow: hidden;
            hyphens: none;
        }
        * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color-adjust: exact;
        }
        img {
            max-width: 100%;
            height: auto;
        }
        table {
            border-collapse: collapse;
            width: 100%;
        }
        @media print {
            body {
                -webkit-print-color-adjust: exact;
            }
        }
    """)
    
    try:
        html = HTML(string=html_content)
        pdf_bytes = html.write_pdf(
            stylesheets=[css], 
            font_config=_FONT_CONFIG,
            optimize_images=True,  # Reduce image size
            jpeg_quality=75,       # Aggressive compression for <5MB target
            optimize_size=('fonts', 'images')  # Enable full optimization
        )
        
        # Save to file if path provided
        if output_path:
            Path(output_path).parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, 'wb') as f:
                f.write(pdf_bytes)
            logger.info(f"PDF saved to: {output_path}")
        
        logger.info(f"PDF generated successfully ({len(pdf_bytes)} bytes)")
        return pdf_bytes
        
    except Exception as e:
        logger.error(f"WeasyPrint error: {str(e)}")
        raise


async def _html_to_pdf_xhtml2pdf(html_content: str, output_path: Optional[str] = None) -> bytes:
    """
    Convert HTML to PDF using xhtml2pdf (Windows-friendly fallback)
    
    Note: Less CSS support than WeasyPrint but more compatible
    """
    from xhtml2pdf import pisa
    
    result = BytesIO()
    
    # Clean HTML for xhtml2pdf compatibility
    html_clean = html_content.replace('<!DOCTYPE html>', '')
    
    try:
        pdf = pisa.pisaDocument(
            BytesIO(html_clean.encode('utf-8')), 
            result,
            encoding='utf-8'
        )
        
        if pdf.err:
            raise RuntimeError(f"xhtml2pdf conversion error: {pdf.err}")
        
        pdf_bytes = result.getvalue()
        
        # Save to file if path provided
        if output_path:
            Path(output_path).parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, 'wb') as f:
                f.write(pdf_bytes)
            logger.info(f"PDF saved to: {output_path}")
        
        logger.info(f"PDF generated successfully ({len(pdf_bytes)} bytes)")
        return pdf_bytes
        
    except Exception as e:
        logger.error(f"xhtml2pdf error: {str(e)}")
        raise


# ============================================================
# TEMPLATE RENDERING ENGINE
# ============================================================

async def render_html_template(
    template_html: str,
    data: Dict[str, Any]
) -> str:
    """
    Enhanced HTML template rendering with nested data support

    Supports:
    - {{variable}}
    - {{object.property}}
    - {{#if variable}}...{{/if}}
    - {{#each items}}...{{/each}}
    """

    if not template_html:
        raise ValueError("Template HTML cannot be empty")

    try:
        rendered = template_html

        # Step 1: Handle conditionals
        rendered = _render_conditionals(rendered, data)

        # Step 2: Handle loops
        rendered = _render_loops(rendered, data)

        # Step 3: Replace variables
        rendered = _render_variables(rendered, data)

        # Step 4: Cleanup unused placeholders
        rendered = re.sub(r"\{\{[^}]+\}\}", "", rendered)

        return rendered

    except Exception as e:
        logger.error(
            f"Template rendering error: {str(e)}",
            exc_info=True
        )

        raise RuntimeError(
            f"Template rendering failed: {str(e)}"
        ) from e


# ============================================================
# VARIABLE RENDERING
# ============================================================

def _render_variables(
    template: str,
    data: Dict[str, Any]
) -> str:
    """
    Replace:
    {{variable}}
    {{object.property}}
    """

    def replace_placeholder(match):

        key_path = match.group(1).strip()

        keys = key_path.split(".")

        value = data

        try:

            for key in keys:

                if isinstance(value, dict):
                    value = value.get(key, "")
                else:
                    value = getattr(value, key, "")

            if value is None:
                return ""

            return str(value)

        except Exception:
            logger.warning(
                f"Could not resolve placeholder: {key_path}"
            )

            return ""

    return re.sub(
        r"\{\{([^#/][^}]*)\}\}",
        replace_placeholder,
        template
    )


# ============================================================
# CONDITIONAL RENDERING
# ============================================================

def _render_conditionals(
    template: str,
    data: Dict[str, Any]
) -> str:
    """
    Handle:
    {{#if variable}}...{{/if}}
    {{#if variable}}...{{else}}...{{/if}}
    """

    def replace_conditional(match):

        var_name = match.group(1).strip()

        content = match.group(2)

        value = _get_nested_value(
            data,
            var_name
        )

        if "{{else}}" in content:

            if_content, else_content = content.split(
                "{{else}}",
                1
            )

            return if_content if value else else_content

        return content if value else ""

    pattern = r"\{\{#if\s+([^}]+)\}\}(.*?)\{\{/if\}\}"

    return re.sub(
        pattern,
        replace_conditional,
        template,
        flags=re.DOTALL
    )


# ============================================================
# LOOP RENDERING
# ============================================================

def _render_loops(
    template: str,
    data: Dict[str, Any]
) -> str:
    """
    Handle:
    {{#each items}}...{{/each}}
    """

    def replace_loop(match):

        var_name = match.group(1).strip()

        loop_template = match.group(2)

        items = _get_nested_value(
            data,
            var_name
        )

        if not items or not isinstance(items, (list, tuple)):
            return ""

        result = []

        for item in items:

            if isinstance(item, dict):

                item_rendered = _render_variables(
                    loop_template,
                    item
                )

            else:

                item_rendered = loop_template.replace(
                    "{{this}}",
                    str(item)
                )

            result.append(item_rendered)

        return "".join(result)

    pattern = r"\{\{#each\s+([^}]+)\}\}(.*?)\{\{/each\}\}"

    return re.sub(
        pattern,
        replace_loop,
        template,
        flags=re.DOTALL
    )


# ============================================================
# NESTED VALUE GETTER
# ============================================================

def _get_nested_value(
    data: Dict[str, Any],
    key_path: str
) -> Any:
    """
    Get nested dictionary/object value using dot notation
    Example:
    spa.name
    user.profile.email
    """

    keys = key_path.split(".")

    value = data

    try:

        for key in keys:

            if isinstance(value, dict):
                value = value.get(key)
            else:
                value = getattr(value, key, None)

        return value

    except Exception:
        return None


# ============================================================
# FILE MANAGEMENT
# ============================================================

async def save_base64_image(base64_data: str, certificate_id: int, image_type: str = "photo") -> Optional[str]:
    """
    Save base64 image to file and return relative path (async)
    
    Args:
        base64_data: Base64 encoded image string (with or without data:image prefix)
        certificate_id: Certificate ID for unique filename
        image_type: Type of image (photo, signature, etc.)
    
    Returns:
        Relative file path or None if invalid
    """
    if not base64_data or not base64_data.strip():
        return None
    
    try:
        import base64
        
        # Remove data:image prefix if present
        if ',' in base64_data:
            header, data = base64_data.split(',', 1)
            # Extract file extension from header
            if 'jpeg' in header or 'jpg' in header:
                ext = 'jpg'
            elif 'png' in header:
                ext = 'png'
            elif 'gif' in header:
                ext = 'gif'
            elif 'webp' in header:
                ext = 'webp'
            else:
                ext = 'jpg'  # default
        else:
            data = base64_data
            ext = 'jpg'  # default
        
        # Decode base64
        try:
            image_bytes = base64.b64decode(data)
        except Exception as e:
            logger.warning(f"Invalid base64 data for {image_type}: {e}")
            return None
        
        # Create unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"cert_{certificate_id}_{image_type}_{timestamp}.{ext}"
        file_path = MEDIA_DIR / filename
        
        # Ensure directory exists (async if available)
        if AIOFILES_AVAILABLE:
            await aiofiles.os.makedirs(str(file_path.parent), exist_ok=True)
        else:
            file_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Write file (async if available, fallback to sync)
        if AIOFILES_AVAILABLE:
            async with aiofiles.open(file_path, 'wb') as f:
                await f.write(image_bytes)
        else:
            with open(file_path, 'wb') as f:
                f.write(image_bytes)
        
        logger.info(f"Image saved: {filename} ({len(image_bytes)} bytes)")
        
        # Return relative path for HTTP access (matches MEDIA_DIR structure)
        # MEDIA_DIR is settings.UPLOAD_DIR / "certificates"
        # So relative path is "certificates/filename"
        return f"certificates/{filename}"
        
    except Exception as e:
        logger.error(f"Error saving base64 image: {str(e)}")
        return None


async def save_certificate_file(
    certificate_id: int, 
    file_bytes: bytes, 
    file_type: str = "pdf"
) -> str:
    """
    Save certificate file and return relative path (async)
    
    Args:
        certificate_id: Certificate ID
        file_bytes: File bytes to save
        file_type: File type (pdf, png, jpg)
    
    Returns:
        Relative file path
    """
    if not file_bytes:
        raise ValueError("File bytes cannot be empty")
    
    try:
        # Create unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"certificate_{certificate_id}_{timestamp}.{file_type}"
        file_path = MEDIA_DIR / filename
        
        # Ensure directory exists (async if available)
        if AIOFILES_AVAILABLE:
            await aiofiles.os.makedirs(str(file_path.parent), exist_ok=True)
        else:
            file_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Write file (async if available, fallback to sync)
        if AIOFILES_AVAILABLE:
            async with aiofiles.open(file_path, 'wb') as f:
                await f.write(file_bytes)
        else:
            with open(file_path, 'wb') as f:
                f.write(file_bytes)
        
        logger.info(f"Certificate saved: {filename} ({len(file_bytes)} bytes)")
        
        # Return relative path
        return f"certificates/{filename}"
        
    except Exception as e:
        logger.error(f"Error saving certificate file: {str(e)}")
        raise RuntimeError(f"Failed to save certificate: {str(e)}") from e


def get_certificate_path(
    relative_path: str
) -> Path:
    """
    Convert relative path to absolute path
    """

    return Path(settings.UPLOAD_DIR) / relative_path


async def delete_certificate_file(
    relative_path: str
) -> bool:
    """
    Delete certificate file
    """

    try:

        file_path = get_certificate_path(
            relative_path
        )

        if file_path.exists():

            file_path.unlink()

            logger.info(
                f"Deleted certificate: {relative_path}"
            )

            return True

        return False

    except Exception as e:

        logger.error(
            f"Error deleting certificate: {str(e)}"
        )

        return False

# ============================================================
# UTILITY FUNCTIONS
# ============================================================

async def validate_html(html_content: str) -> bool:
    """Basic HTML validation"""
    if not html_content or not html_content.strip():
        return False
    
    # Check for basic HTML structure
    has_html = '<html' in html_content.lower()
    has_body = '<body' in html_content.lower()
    
    return has_html or has_body


async def get_pdf_library_info() -> Dict[str, Any]:
    """Get information about available PDF libraries"""
    return {
        "weasyprint": WEASYPRINT_AVAILABLE,
        "xhtml2pdf": XHTML2PDF_AVAILABLE,
        "pdf2image": PDF2IMAGE_AVAILABLE,
        "recommended": "weasyprint" if WEASYPRINT_AVAILABLE else "xhtml2pdf",
        "status": "ready" if (WEASYPRINT_AVAILABLE or XHTML2PDF_AVAILABLE) else "no_library"
    }