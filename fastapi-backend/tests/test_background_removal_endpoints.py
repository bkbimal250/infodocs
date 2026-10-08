import io
import unittest
from unittest.mock import patch
from fastapi.testclient import TestClient

from main import app
from apps.certificates.services.background_removal import (
    RembgBusyError,
    RembgTimeoutError,
    RembgUnavailableError,
)

class TestBackgroundRemovalEndpoints(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app, raise_server_exceptions=False)

    def test_status_endpoint(self):
        resp = self.client.get("/api/certificates/background-removal/status")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("available", data)
        self.assertIn("rembg", data)

    def test_remove_background_non_image_file(self):
        files = {"file": ("test.txt", io.BytesIO(b"hello world"), "text/plain")}
        resp = self.client.post("/api/certificates/remove-background", files=files)
        self.assertEqual(resp.status_code, 400)

    @patch("apps.certificates.routers.remove_background_from_image")
    def test_remove_background_busy_returns_503(self, mock_remove):
        mock_remove.side_effect = RembgBusyError("Busy")
        files = {"file": ("test.png", io.BytesIO(b"fake-bytes"), "image/png")}
        resp = self.client.post("/api/certificates/remove-background", files=files)
        self.assertEqual(resp.status_code, 503)
        self.assertIn("busy", resp.json()["detail"].lower())
        self.assertEqual(resp.headers.get("retry-after"), "5")

    @patch("apps.certificates.routers.remove_background_from_image")
    def test_remove_background_timeout_returns_504(self, mock_remove):
        mock_remove.side_effect = RembgTimeoutError("Timed out")
        files = {"file": ("test.png", io.BytesIO(b"fake-bytes"), "image/png")}
        resp = self.client.post("/api/certificates/remove-background", files=files)
        self.assertEqual(resp.status_code, 504)
        self.assertIn("timed out", resp.json()["detail"].lower())

    @patch("apps.certificates.routers.remove_background_from_image")
    def test_remove_background_unavailable_returns_503(self, mock_remove):
        mock_remove.side_effect = RembgUnavailableError("Unavailable")
        files = {"file": ("test.png", io.BytesIO(b"fake-bytes"), "image/png")}
        resp = self.client.post("/api/certificates/remove-background", files=files)
        self.assertEqual(resp.status_code, 503)
        self.assertIn("unavailable", resp.json()["detail"].lower())

    @patch("apps.certificates.routers.remove_background_from_image")
    def test_remove_background_validation_error_returns_400(self, mock_remove):
        mock_remove.side_effect = ValueError("Image dimensions exceed maximum")
        files = {"file": ("test.png", io.BytesIO(b"fake-bytes"), "image/png")}
        resp = self.client.post("/api/certificates/remove-background", files=files)
        self.assertEqual(resp.status_code, 400)
        self.assertIn("exceed", resp.json()["detail"].lower())

    @patch("apps.certificates.routers.remove_background_from_base64")
    def test_remove_background_base64_busy_returns_503(self, mock_remove_b64):
        mock_remove_b64.side_effect = RembgBusyError("Busy")
        data = {"image": "data:image/png;base64,aGVsbG8="}
        resp = self.client.post("/api/certificates/remove-background-base64", data=data)
        self.assertEqual(resp.status_code, 503)
        self.assertIn("busy", resp.json()["detail"].lower())
        self.assertEqual(resp.headers.get("retry-after"), "5")


if __name__ == "__main__":
    unittest.main()
