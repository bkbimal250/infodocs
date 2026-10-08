"""
Background Removal Service
Reusable service for removing backgrounds from images using rembg.

Architecture note:
- The API worker does NOT import rembg, ONNX Runtime, or load ML models.
- At most ONE inference job runs across all Gunicorn/API workers at any time,
  enforced by a non-blocking cross-process file lock (fcntl on Linux, msvcrt on Windows).
- If another inference job is already running, a RembgBusyError is raised immediately.
- Each inference job is executed in a dedicated, isolated child process (multiprocessing spawn).
- Dedicated parent/child Pipes ensure request and response channels are strictly isolated.
- The child process terminates after each job, and the parent explicitly reaps and joins it,
  releasing all model memory and ONNX runtime allocations back to the OS.
- If the child times out, crashes, or is cancelled, it is immediately terminated/killed,
  and the lock is reliably released in a finally block.
"""
import asyncio
import base64
import gc
import importlib.util
import logging
import os
import sys
import tempfile
import threading
import time
from io import BytesIO
from multiprocessing import get_context
from typing import Optional

from PIL import Image

try:
    import resource
except ImportError:  # pragma: no cover - Windows does not provide resource
    resource = None

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Custom Exceptions for clean HTTP error mapping
# ---------------------------------------------------------------------------
class RembgBusyError(Exception):
    """Raised when an inference job is already in progress across workers."""
    pass


class RembgTimeoutError(Exception):
    """Raised when an inference job exceeds the configured deadline."""
    pass


class RembgUnavailableError(Exception):
    """Raised when rembg is not installed, failed to initialize, or child worker crashed."""
    pass


# ---------------------------------------------------------------------------
# Availability Detection without importing ML libraries into the API worker
# ---------------------------------------------------------------------------
REMBG_SESSION = None
_rembg_spec = importlib.util.find_spec("rembg")
if _rembg_spec is not None:
    REMBG_AVAILABLE = True
    REMBG_ERROR = None
else:
    REMBG_AVAILABLE = False
    REMBG_ERROR = "rembg package not found. Install with 'pip install rembg[cpu] pillow'"
    logger.warning("rembg not available: %s", REMBG_ERROR)


# ---------------------------------------------------------------------------
# Memory Diagnostics Helpers
# ---------------------------------------------------------------------------
def _rss_mb() -> Optional[float]:
    """Return current process RSS in MB when available; None if unsupported."""
    try:
        import psutil  # optional dependency
        return psutil.Process().memory_info().rss / (1024 * 1024)
    except Exception:
        pass

    if sys.platform == "win32":
        try:
            import ctypes
            import ctypes.wintypes

            class _PROCESS_MEMORY_COUNTERS(ctypes.Structure):
                _fields_ = [
                    ("cb", ctypes.wintypes.DWORD),
                    ("PageFaultCount", ctypes.wintypes.DWORD),
                    ("PeakWorkingSetSize", ctypes.c_size_t),
                    ("WorkingSetSize", ctypes.c_size_t),
                    ("QuotaPeakPagedPoolUsage", ctypes.c_size_t),
                    ("QuotaPagedPoolUsage", ctypes.c_size_t),
                    ("QuotaPeakNonPagedPoolUsage", ctypes.c_size_t),
                    ("QuotaNonPagedPoolUsage", ctypes.c_size_t),
                    ("PagefileUsage", ctypes.c_size_t),
                    ("PeakPagefileUsage", ctypes.c_size_t),
                ]

            kernel32 = ctypes.windll.kernel32
            psapi = ctypes.windll.psapi
            kernel32.GetCurrentProcess.restype = ctypes.c_void_p
            psapi.GetProcessMemoryInfo.argtypes = [
                ctypes.c_void_p,
                ctypes.POINTER(_PROCESS_MEMORY_COUNTERS),
                ctypes.wintypes.DWORD,
            ]
            psapi.GetProcessMemoryInfo.restype = ctypes.wintypes.BOOL

            counters = _PROCESS_MEMORY_COUNTERS()
            counters.cb = ctypes.sizeof(counters)
            if psapi.GetProcessMemoryInfo(kernel32.GetCurrentProcess(), ctypes.byref(counters), counters.cb):
                return counters.WorkingSetSize / (1024 * 1024)
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


def _log_memory_diag(
    operation: str,
    *,
    rss_before: Optional[float],
    rss_after: Optional[float],
    duration_ms: int,
    input_bytes: Optional[int] = None,
    output_bytes: Optional[int] = None,
) -> None:
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


# ---------------------------------------------------------------------------
# Cross-Process Advisory Lock (at most 1 inference across all Gunicorn workers)
# ---------------------------------------------------------------------------
_local_thread_lock = threading.Lock()


class CrossProcessJobLock:
    """
    Enforces at most 1 inference job running concurrently across all threads
    and across all Gunicorn/Uvicorn worker processes.
    Non-blocking: returns False immediately if already locked.
    """
    def __init__(self, lock_path: str):
        self.lock_path = lock_path
        self._file = None
        self._has_thread_lock = False

    def acquire(self) -> bool:
        if not _local_thread_lock.acquire(blocking=False):
            return False
        self._has_thread_lock = True

        try:
            os.makedirs(os.path.dirname(os.path.abspath(self.lock_path)), exist_ok=True)
            self._file = open(self.lock_path, "a+b")
            if sys.platform == "win32":
                import msvcrt
                if os.path.getsize(self.lock_path) == 0:
                    self._file.write(b"x")
                    self._file.flush()
                self._file.seek(0)
                msvcrt.locking(self._file.fileno(), msvcrt.LK_NBLCK, 1)
            else:
                import fcntl
                fcntl.flock(self._file.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
            return True
        except (BlockingIOError, PermissionError, OSError):
            self.release()
            return False

    def release(self) -> None:
        if self._file is not None:
            try:
                if sys.platform == "win32":
                    import msvcrt
                    self._file.seek(0)
                    msvcrt.locking(self._file.fileno(), msvcrt.LK_UNLCK, 1)
                else:
                    import fcntl
                    fcntl.flock(self._file.fileno(), fcntl.LOCK_UN)
            except Exception:
                pass
            try:
                self._file.close()
            except Exception:
                pass
            self._file = None

        if self._has_thread_lock:
            try:
                _local_thread_lock.release()
            except RuntimeError:
                pass
            self._has_thread_lock = False

    def __enter__(self):
        if not self.acquire():
            raise RembgBusyError("Background removal service is currently busy processing another request. Please try again shortly.")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.release()


# ---------------------------------------------------------------------------
# Image Validation Helpers
# ---------------------------------------------------------------------------
def _validate_image(image_bytes: bytes, max_bytes: int, max_pixels: int) -> None:
    """
    Validate upload bytes and decoded pixel dimensions before spawning subprocess.
    Rejects empty buffers, oversized files, invalid image formats, and decompression bombs.
    """
    if not image_bytes:
        raise ValueError("Empty image data provided.")

    if len(image_bytes) > max_bytes:
        max_mb = max_bytes / (1024 * 1024)
        raise ValueError(f"Image file size exceeds maximum allowed limit ({max_mb:.1f} MB).")

    try:
        with Image.open(BytesIO(image_bytes)) as img:
            img.verify()
    except Exception as exc:
        raise ValueError(f"Invalid or corrupted image format: {exc}")

    # Re-open after verify() to inspect size and format safely
    try:
        with Image.open(BytesIO(image_bytes)) as img:
            width, height = img.size
            if width <= 0 or height <= 0:
                raise ValueError("Image dimensions must be positive.")
            total_pixels = width * height
            if total_pixels > max_pixels:
                raise ValueError(
                    f"Image dimensions ({width}x{height} = {total_pixels:,} pixels) exceed "
                    f"maximum allowed limit of {max_pixels:,} pixels."
                )
            if not img.format:
                raise ValueError("Unknown image format.")
    except ValueError:
        raise
    except Exception as exc:
        raise ValueError(f"Failed to inspect image dimensions: {exc}")


# ---------------------------------------------------------------------------
# Format Conversion Helper
# ---------------------------------------------------------------------------
def _convert_format_sync(image_bytes: bytes, target_format: str) -> bytes:
    """Format conversion helper."""
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


async def _convert_format(image_bytes: bytes, target_format: str) -> bytes:
    """Compatibility async wrapper for format conversion."""
    return await asyncio.to_thread(_convert_format_sync, image_bytes, target_format)


# ---------------------------------------------------------------------------
# Subprocess Inference Worker (Runs in spawned child process only)
# ---------------------------------------------------------------------------
def _child_inference_worker(conn, image_data: bytes, output_format: str) -> None:
    """
    Subprocess entrypoint.
    Runs in a dedicated 'spawn' child process. Loads ML model, runs inference,
    sends result back across pipe, and exits.
    When this process exits, all model memory is returned to the OS.
    """
    try:
        from rembg import new_session, remove

        session = None
        try:
            session = new_session("isnet-general-use")
            logger.info("Child inference process initialized with primary model: isnet-general-use")
        except Exception as exc:
            logger.warning(
                "Primary model isnet-general-use failed (%s); falling back to u2net",
                exc,
            )
            session = new_session("u2net")
            logger.info("Child inference process initialized with fallback model: u2net")

        result = remove(image_data, session=session)

        if output_format.upper() != "PNG":
            result = _convert_format_sync(result, output_format)

        conn.send({"success": True, "data": result})
    except Exception as exc:
        logger.error("Child inference process failed: %s", exc, exc_info=True)
        try:
            conn.send({"success": False, "error": str(exc), "error_type": type(exc).__name__})
        except Exception:
            pass
    finally:
        try:
            conn.close()
        except Exception:
            pass


# ---------------------------------------------------------------------------
# Job Execution Orchestrator
# ---------------------------------------------------------------------------
def _execute_job_with_lock(
    image_data: bytes,
    output_format: str,
    timeout_s: float,
    lock_path: str,
) -> bytes:
    """
    Acquires cross-process lock, spawns dedicated child, waits for result with deadline,
    and guarantees the child process is terminated and reaped.
    """
    lock = CrossProcessJobLock(lock_path)
    if not lock.acquire():
        raise RembgBusyError("Background removal service is currently busy processing another request. Please try again shortly.")

    ctx = get_context("spawn")
    parent_conn, child_conn = ctx.Pipe(duplex=False)
    proc = ctx.Process(
        target=_child_inference_worker,
        args=(child_conn, image_data, output_format),
        name="infodocs-rembg-job",
    )

    result_data = None
    worker_error = None
    crashed = False
    timed_out = False

    try:
        proc.start()
        # Close child's pipe end in parent process so EOF can be detected if child exits
        child_conn.close()

        deadline = time.monotonic() + timeout_s
        while True:
            remaining = deadline - time.monotonic()
            if remaining <= 0:
                timed_out = True
                break

            poll_wait = min(0.5, remaining)
            if parent_conn.poll(poll_wait):
                try:
                    res = parent_conn.recv()
                    if isinstance(res, dict) and res.get("success"):
                        result_data = res.get("data")
                    elif isinstance(res, dict):
                        worker_error = res.get("error", "Unknown inference failure")
                    else:
                        worker_error = "Unexpected response from worker process"
                except EOFError:
                    crashed = True
                break

            if not proc.is_alive():
                # Child exited before sending any data
                crashed = True
                break

    finally:
        try:
            if proc.is_alive():
                proc.terminate()
                proc.join(timeout=3)
                if proc.is_alive():
                    proc.kill()
                    proc.join(timeout=3)
            else:
                proc.join(timeout=2)
        except Exception as reap_err:
            logger.warning("Error reaping child inference process: %s", reap_err)

        try:
            parent_conn.close()
        except Exception:
            pass

        lock.release()

    if timed_out:
        raise RembgTimeoutError(f"Background removal request timed out after {timeout_s:.1f} seconds")

    if crashed:
        exitcode = getattr(proc, "exitcode", None)
        raise RembgUnavailableError(f"Background removal process crashed or was terminated (exit code: {exitcode})")

    if worker_error:
        raise RuntimeError(f"Background removal failed: {worker_error}")

    if result_data is None:
        raise RuntimeError("Background removal produced no result")

    return result_data


# ---------------------------------------------------------------------------
# Public Functions (Preserving all existing contracts and signatures)
# ---------------------------------------------------------------------------
async def get_rembg_session():
    """
    Compatibility wrapper. Models are no longer permanently kept resident in API workers.
    Each job loads inference in an isolated, short-lived subprocess.
    """
    return None


async def _remove_background_using_rembg(image_data: bytes) -> bytes:
    """Compatibility wrapper for background removal."""
    result = await remove_background_from_image(image_data, output_format="PNG")
    if result is None:
        raise RuntimeError("Background removal failed")
    return result


async def remove_background_from_image(
    image_data: bytes,
    output_format: str = "PNG",
    preserve_dark_ink: bool = True,
) -> Optional[bytes]:
    """
    Remove background from an image using an isolated child process.
    The model is loaded only in the spawned child, which exits immediately after inference,
    releasing all ONNX / model memory back to the operating system.

    Parameters:
    - image_data: Raw bytes of the input image.
    - output_format: Target format ("PNG", "JPEG", "JPG", etc.).
    - preserve_dark_ink: Compatibility flag (isnet-general-use natively preserves dark ink).
    """
    rss_before = _rss_mb()
    start_ms = time.perf_counter() * 1000.0

    try:
        if not REMBG_AVAILABLE:
            error_msg = f"Local background removal service unavailable. {REMBG_ERROR or 'Install rembg[cpu]'}"
            logger.error(error_msg)
            raise RembgUnavailableError(error_msg)

        from config.settings import settings
        max_bytes = getattr(settings, "REMBG_MAX_IMAGE_BYTES", 10 * 1024 * 1024)
        max_pixels = getattr(settings, "REMBG_MAX_IMAGE_PIXELS", 16_000_000)
        timeout_s = getattr(settings, "REMBG_JOB_TIMEOUT_SECONDS", 120.0)
        lock_path = (
            getattr(settings, "REMBG_LOCK_FILE", "")
            or os.path.join(tempfile.gettempdir(), "infodocs_rembg.lock")
        )

        # 1. Validate image bytes and pixel dimensions before spawning subprocess
        _validate_image(image_data, max_bytes=max_bytes, max_pixels=max_pixels)

        # 2. Execute with cross-process lock in dedicated worker thread
        output_bytes = await asyncio.to_thread(
            _execute_job_with_lock,
            image_data=image_data,
            output_format=output_format,
            timeout_s=timeout_s,
            lock_path=lock_path,
        )

        if not output_bytes:
            raise RuntimeError("Background removal result was empty")

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


async def remove_background_from_base64(
    base64_string: str,
    output_format: str = "PNG",
    preserve_dark_ink: bool = True,
) -> Optional[str]:
    """
    Remove background from a base64 image and return a data URL.
    """
    try:
        if not base64_string or not base64_string.strip():
            raise ValueError("Empty image data provided.")

        if "base64," in base64_string:
            _, base64_string = base64_string.split("base64,", 1)

        try:
            image_data = base64.b64decode(base64_string, validate=True)
        except Exception as exc:
            raise ValueError(f"Invalid base64-encoded image data: {exc}")

        output_bytes = await remove_background_from_image(
            image_data, output_format=output_format, preserve_dark_ink=preserve_dark_ink
        )
        if not output_bytes:
            return None

        output_base64 = base64.b64encode(output_bytes).decode("utf-8")
        norm_fmt = output_format.lower()
        mime = "image/jpeg" if norm_fmt in ("jpg", "jpeg") else f"image/{norm_fmt}"
        return f"data:{mime};base64,{output_base64}"

    except Exception as e:
        logger.error("Base64 processing error: %s", e)
        raise
