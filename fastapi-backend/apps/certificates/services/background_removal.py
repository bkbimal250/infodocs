"""
Background Removal Service
Reusable service for removing backgrounds from images using rembg.

Architecture note:
- The API worker does not permanently retain a global rembg session.
- The rembg model is isolated inside a dedicated subprocess worker to keep ML memory
  out of the normal Gunicorn API workers.
- The API-facing functions remain compatible with the existing endpoints.
"""
import asyncio
import base64
import gc
import logging
import os
import queue
import sys
import threading
import time

try:
    import resource
except ImportError:  # pragma: no cover - Windows does not provide resource
    resource = None
from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
from multiprocessing import get_context
from typing import Optional

from PIL import Image

logger = logging.getLogger(__name__)

# Keep rembg work serialized per worker and isolate the real model in a dedicated child process.
_REMBG_CONCURRENCY_LIMIT = 1
_REMBG_SEMAPHORE = asyncio.Semaphore(_REMBG_CONCURRENCY_LIMIT)

# Thread pool executor for running CPU-intensive operations.
_executor = ThreadPoolExecutor(max_workers=2, thread_name_prefix="bg-removal")
_session_lock = threading.Lock()

REMBG_AVAILABLE = False
REMBG_SESSION = None
REMBG_ERROR = None

try:
    from rembg import remove, new_session

    REMBG_AVAILABLE = True
except ImportError as e:
    REMBG_ERROR = str(e)
    logger.warning("rembg not available: %s. Install with 'pip install rembg[cpu]'", e)

_REMBG_WORKER_QUEUE = None
_REMBG_WORKER_PROCESS = None
_REMBG_WORKER_STARTED = False


def _rss_mb() -> Optional[float]:
    """Return current process RSS in MB when available; None if unsupported."""
    try:
        import psutil  # optional dependency

        return psutil.Process().memory_info().rss / (1024 * 1024)
    except Exception:
        pass

    if resource is not None:
        try:
            if sys.platform == "darwin":
                value = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
                return value / (1024 * 1024)
            value = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
            return value / 1024.0
        except Exception:
            return None

    return None


def _log_memory_diag(operation: str, *, rss_before: Optional[float], rss_after: Optional[float], duration_ms: int, input_bytes: Optional[int] = None, output_bytes: Optional[int] = None) -> None:
    """Log a compact memory diagnostic without exposing request data."""
    before = "unknown" if rss_before is None else f"{rss_before:.2f}"
    after = "unknown" if rss_after is None else f"{rss_after:.2f}"
    logger.info(
        "operation=%s rss_before_mb=%s rss_after_mb=%s duration_ms=%s input_bytes=%s output_bytes=%s",
        operation,
        before,
        after,
        duration_ms,
        input_bytes if input_bytes is not None else "n/a",
        output_bytes if output_bytes is not None else "n/a",
    )


def _rembg_worker_target(queue_obj):
    """Dedicated subprocess worker that owns the rembg model for the lifetime of the worker."""
    session = None
    try:
        try:
            session = new_session("isnet-general-use")
            logger.info("REMBG worker initialized with isnet-general-use")
        except Exception as exc:
            logger.warning("isnet-general-use failed, retrying with u2net: %s", exc)
            session = new_session("u2net")
            logger.info("REMBG worker initialized with u2net")

        while True:
            try:
                item = queue_obj.get(timeout=1)
            except queue.Empty:
                continue

            if item is None:
                break

            payload = item.get("payload")
            output_format = item.get("output_format", "PNG")

            try:
                result = remove(payload, session=session)
                if output_format.upper() != "PNG":
                    result = _convert_format_for_worker(result, output_format)
                queue_obj.put({"status": "ok", "data": result})
            except Exception as exc:  # pragma: no cover - worker-side path only
                queue_obj.put({"status": "error", "message": str(exc)})
            finally:
                payload = None
                gc.collect()

    except Exception as exc:  # pragma: no cover - worker-side path only
        logger.error("REMBG worker crashed: %s", exc, exc_info=True)


def _convert_format_for_worker(image_bytes: bytes, target_format: str) -> bytes:
    """Format conversion helper used within the rembg worker process."""
    normalized_format = "JPEG" if target_format.upper() == "JPG" else target_format.upper()

    with Image.open(BytesIO(image_bytes)) as img:
        if normalized_format == "JPEG":
            if img.mode == "RGBA":
                rgba = img.convert("RGBA")
                rgb_img = Image.new("RGB", rgba.size, (255, 255, 255))
                rgb_img.paste(rgba, mask=rgba.split()[3])
                img = rgb_img
            elif img.mode != "RGB":
                img = img.convert("RGB")
        out = BytesIO()
        try:
            img.save(out, format=normalized_format)
            return out.getvalue()
        finally:
            out.close()


def _start_rembg_worker_if_needed() -> Optional[object]:
    """Start a dedicated rembg worker process once per Python worker."""
    global _REMBG_WORKER_QUEUE, _REMBG_WORKER_PROCESS, _REMBG_WORKER_STARTED

    if not REMBG_AVAILABLE:
        return None

    if _REMBG_WORKER_STARTED:
        return _REMBG_WORKER_QUEUE

    with _session_lock:
        if _REMBG_WORKER_STARTED:
            return _REMBG_WORKER_QUEUE

        ctx = get_context("spawn")
        queue_obj = ctx.Queue()
        proc = ctx.Process(
            target=_rembg_worker_target,
            args=(queue_obj,),
            daemon=True,
            name="infodocs-rembg-worker",
        )
        proc.start()
        _REMBG_WORKER_QUEUE = queue_obj
        _REMBG_WORKER_PROCESS = proc
        _REMBG_WORKER_STARTED = True
        logger.info("Started dedicated rembg worker process (pid=%s)", proc.pid)
        return queue_obj


def _shutdown_rembg_worker() -> None:
    global _REMBG_WORKER_QUEUE, _REMBG_WORKER_PROCESS, _REMBG_WORKER_STARTED

    if _REMBG_WORKER_QUEUE is not None and _REMBG_WORKER_PROCESS is not None:
        try:
            _REMBG_WORKER_QUEUE.put(None)
        except Exception:
            pass
        try:
            _REMBG_WORKER_PROCESS.join(timeout=5)
        except Exception:
            pass
        _REMBG_WORKER_QUEUE = None
        _REMBG_WORKER_PROCESS = None
        _REMBG_WORKER_STARTED = False


async def _run_rembg_in_worker(image_data: bytes, output_format: str = "PNG") -> bytes:
    """Run rembg in a dedicated subprocess worker and await the result."""
    queue_obj = _start_rembg_worker_if_needed()
    if queue_obj is None:
        raise RuntimeError("rembg library not available")

    req = {"payload": image_data, "output_format": output_format}
    loop = asyncio.get_event_loop()

    def _enqueue_and_wait():
        queue_obj.put(req)
        response = queue_obj.get(timeout=90)
        if response.get("status") != "ok":
            raise RuntimeError(response.get("message", "Background removal failed"))
        return response.get("data")

    return await loop.run_in_executor(_executor, _enqueue_and_wait)


async def get_rembg_session():
    """Compatibility wrapper; rembg is no longer kept resident in the API worker.

    The model is intentionally owned by a dedicated child process in the same host.
    """
    return None


async def _remove_background_using_rembg(image_data: bytes) -> bytes:
    """Remove background using the dedicated rembg worker process."""
    if not REMBG_AVAILABLE:
        raise ImportError("rembg library not installed")
    return await _run_rembg_in_worker(image_data, output_format="PNG")


async def remove_background_from_image(
    image_data: bytes,
    output_format: str = "PNG",
    preserve_dark_ink: bool = True,
) -> Optional[bytes]:
    """Remove background from an image using the dedicated rembg worker process."""
    rss_before = _rss_mb()
    start_ms = time.perf_counter() * 1000.0

    try:
        if not image_data:
            raise ValueError("Empty image data")

        if len(image_data) > 10 * 1024 * 1024:
            raise ValueError("Image too large (>10MB). Please optimize first.")

        if not REMBG_AVAILABLE:
            error_msg = f"Local background removal service unavailable. {REMBG_ERROR or 'Install rembg[cpu]'}"
            logger.error(error_msg)
            raise RuntimeError(error_msg)

        logger.info("Using dedicated rembg worker for background removal")
        async with _REMBG_SEMAPHORE:
            output_bytes = await _remove_background_using_rembg(image_data)

            if output_bytes is None:
                raise RuntimeError("Background removal result was empty")

            if output_format.upper() != "PNG":
                output_bytes = await _convert_format(output_bytes, output_format)

            rss_after = _rss_mb()
            _log_memory_diag(
                "background_removal",
                rss_before=rss_before,
                rss_after=rss_after,
                duration_ms=int(time.perf_counter() * 1000.0 - start_ms),
                input_bytes=len(image_data),
                output_bytes=len(output_bytes),
            )
            return output_bytes

    except Exception as e:
        rss_after = _rss_mb()
        _log_memory_diag(
            "background_removal",
            rss_before=rss_before,
            rss_after=rss_after,
            duration_ms=int(time.perf_counter() * 1000.0 - start_ms),
            input_bytes=len(image_data) if isinstance(image_data, (bytes, bytearray)) else None,
            output_bytes=None,
        )
        logger.error("Background removal failed: %s", e)
        raise
    finally:
        gc.collect()


async def _convert_format(image_bytes: bytes, target_format: str) -> bytes:
    """Convert image format without blocking the event loop."""
    if not image_bytes:
        return image_bytes

    def convert(data, fmt):
        normalized_format = "JPEG" if fmt.upper() == "JPG" else fmt.upper()

        with Image.open(BytesIO(data)) as img:
            if normalized_format == "JPEG":
                if img.mode == "RGBA":
                    rgb_img = Image.new("RGB", img.size, (255, 255, 255))
                    rgb_img.paste(img, mask=img.split()[3])
                    img = rgb_img
                elif img.mode != "RGB":
                    img = img.convert("RGB")

            out = BytesIO()
            try:
                img.save(out, format=normalized_format)
                return out.getvalue()
            finally:
                out.close()

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
        logger.error("Base64 processing error: %s", e)
        raise


atexit = None
try:
    import atexit

    atexit.register(_shutdown_rembg_worker)
except Exception:
    pass
