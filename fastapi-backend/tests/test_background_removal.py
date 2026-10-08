import asyncio
import base64
import os
import tempfile
import unittest
from io import BytesIO
from unittest.mock import MagicMock, patch

from PIL import Image

from apps.certificates.services.background_removal import (
    CrossProcessJobLock,
    RembgBusyError,
    RembgTimeoutError,
    RembgUnavailableError,
    _validate_image,
    _convert_format_sync,
    remove_background_from_image,
    remove_background_from_base64,
    get_rembg_session,
    REMBG_AVAILABLE,
)


class TestBackgroundRemovalValidation(unittest.TestCase):
    def setUp(self):
        # Create a valid test image (50x50 PNG)
        img = Image.new("RGBA", (50, 50), color=(255, 0, 0, 255))
        buf = BytesIO()
        img.save(buf, format="PNG")
        self.valid_png_bytes = buf.getvalue()

    def test_validate_empty_bytes(self):
        with self.assertRaises(ValueError) as ctx:
            _validate_image(b"", max_bytes=1024, max_pixels=10000)
        self.assertIn("Empty image data", str(ctx.exception))

    def test_validate_oversized_bytes(self):
        with self.assertRaises(ValueError) as ctx:
            _validate_image(self.valid_png_bytes, max_bytes=10, max_pixels=10000)
        self.assertIn("file size exceeds", str(ctx.exception))

    def test_validate_corrupt_bytes(self):
        with self.assertRaises(ValueError) as ctx:
            _validate_image(b"not an image", max_bytes=1024 * 1024, max_pixels=10000)
        self.assertIn("Invalid or corrupted", str(ctx.exception))

    def test_validate_oversized_pixels(self):
        # 50x50 = 2500 pixels; set limit to 1000
        with self.assertRaises(ValueError) as ctx:
            _validate_image(self.valid_png_bytes, max_bytes=1024 * 1024, max_pixels=1000)
        self.assertIn("exceed maximum allowed limit", str(ctx.exception))

    def test_validate_valid_image(self):
        # Should not raise
        _validate_image(self.valid_png_bytes, max_bytes=1024 * 1024, max_pixels=10000)


class TestCrossProcessJobLock(unittest.TestCase):
    def setUp(self):
        self.lock_file = os.path.join(tempfile.gettempdir(), f"test_rembg_lock_{os.getpid()}.lock")

    def tearDown(self):
        try:
            if os.path.exists(self.lock_file):
                os.remove(self.lock_file)
        except Exception:
            pass

    def test_acquire_and_release(self):
        lock = CrossProcessJobLock(self.lock_file)
        self.assertTrue(lock.acquire())
        # Second acquire in another instance should fail
        lock2 = CrossProcessJobLock(self.lock_file)
        self.assertFalse(lock2.acquire())
        # Release first lock
        lock.release()
        # Now second acquire should succeed
        self.assertTrue(lock2.acquire())
        lock2.release()


class TestFormatConversion(unittest.TestCase):
    def test_png_to_jpeg_conversion(self):
        img = Image.new("RGBA", (20, 20), color=(100, 150, 200, 128))
        buf = BytesIO()
        img.save(buf, format="PNG")
        png_data = buf.getvalue()

        jpeg_data = _convert_format_sync(png_data, "JPEG")
        with Image.open(BytesIO(jpeg_data)) as result_img:
            self.assertEqual(result_img.format, "JPEG")
            self.assertEqual(result_img.mode, "RGB")


class TestBackgroundRemovalService(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        img = Image.new("RGBA", (20, 20), color=(0, 128, 255, 255))
        buf = BytesIO()
        img.save(buf, format="PNG")
        self.valid_png_bytes = buf.getvalue()

    async def test_get_rembg_session_compat(self):
        session = await get_rembg_session()
        self.assertIsNone(session)

    @patch("apps.certificates.services.background_removal._execute_job_with_lock")
    async def test_successful_image_inference(self, mock_exec):
        mock_exec.return_value = b"fake-processed-png"
        result = await remove_background_from_image(self.valid_png_bytes, output_format="PNG")
        self.assertEqual(result, b"fake-processed-png")
        mock_exec.assert_called_once()

    @patch("apps.certificates.services.background_removal._execute_job_with_lock")
    async def test_busy_lock_raises_busy_error(self, mock_exec):
        mock_exec.side_effect = RembgBusyError("Service is busy")
        with self.assertRaises(RembgBusyError):
            await remove_background_from_image(self.valid_png_bytes, output_format="PNG")

    @patch("apps.certificates.services.background_removal._execute_job_with_lock")
    async def test_timeout_raises_timeout_error(self, mock_exec):
        mock_exec.side_effect = RembgTimeoutError("Timed out")
        with self.assertRaises(RembgTimeoutError):
            await remove_background_from_image(self.valid_png_bytes, output_format="PNG")

    @patch("apps.certificates.services.background_removal._execute_job_with_lock")
    async def test_crash_raises_unavailable_error(self, mock_exec):
        mock_exec.side_effect = RembgUnavailableError("Child crashed")
        with self.assertRaises(RembgUnavailableError):
            await remove_background_from_image(self.valid_png_bytes, output_format="PNG")

    @patch("apps.certificates.services.background_removal._execute_job_with_lock")
    async def test_base64_processing(self, mock_exec):
        mock_exec.return_value = self.valid_png_bytes
        raw_b64 = base64.b64encode(self.valid_png_bytes).decode("utf-8")
        data_url = f"data:image/png;base64,{raw_b64}"

        # Test with data URL prefix
        result = await remove_background_from_base64(data_url, output_format="PNG")
        self.assertTrue(result.startswith("data:image/png;base64,"))

        # Test with raw base64 string
        result_raw = await remove_background_from_base64(raw_b64, output_format="PNG")
        self.assertTrue(result_raw.startswith("data:image/png;base64,"))


if __name__ == "__main__":
    unittest.main()
