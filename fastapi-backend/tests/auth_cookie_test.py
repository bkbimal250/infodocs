import asyncio
import unittest
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.testclient import TestClient
from jose import jwt

from apps.users.models import UserRole
from apps.users.routers import auth_router
from apps.users.services.otp_service import verify_otp
from config.database import get_db
from config.settings import settings
from core.exceptions import AuthenticationError


FRONTEND_ORIGIN = "https://docs.dishaonlinesolution.in"


class AuthCookieTests(unittest.TestCase):
    def setUp(self):
        self.db = SimpleNamespace(
            commit=AsyncMock(),
            refresh=AsyncMock(),
        )
        self.user = SimpleNamespace(
            id=314,
            username="otp-user",
            email="otp-user@example.com",
            first_name="OTP",
            last_name="User",
            role=UserRole.USER,
            phone_number="+15555550123",
            is_active=True,
            is_verified=True,
            spa_id=None,
            last_login_at=None,
            created_at=datetime.now(timezone.utc),
        )

        app = FastAPI()
        app.include_router(auth_router, prefix="/api/users/auth")
        app.add_middleware(
            CORSMiddleware,
            allow_origins=[FRONTEND_ORIGIN],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        app.dependency_overrides[get_db] = lambda: self.db

        @app.exception_handler(AuthenticationError)
        async def authentication_error_handler(request, exc):
            return JSONResponse(
                status_code=401,
                content={"detail": exc.message},
            )

        self.client = TestClient(app, base_url="https://testserver")

    def tearDown(self):
        self.client.close()

    def test_phone_otp_sets_persistent_cookie_and_cookie_authenticates_user(self):
        with (
            patch.object(settings, "DEBUG", False),
            patch("apps.users.routers.get_user_by_phone_number", new=AsyncMock(return_value=self.user)),
            patch("apps.users.routers.verify_otp", new=AsyncMock(return_value=True)),
            patch("apps.users.routers.handle_login_tracking_task", new=AsyncMock()),
            patch("core.dependencies.get_user_by_id", new=AsyncMock(return_value=self.user)),
        ):
            with self.assertLogs("apps.users.routers", level="INFO") as captured_logs:
                login_response = self.client.post(
                    "/api/users/auth/login_with_phone_otp",
                    json={"phone_number": self.user.phone_number, "otp": "123456"},
                    headers={"Origin": FRONTEND_ORIGIN},
                )

            self.assertEqual(login_response.status_code, 200)
            auth_logs = "\n".join(captured_logs.output)
            self.assertNotIn("123456", auth_logs)
            self.assertNotIn(self.user.phone_number, auth_logs)
            self.assertEqual(login_response.json()["message"], "Login successful")
            cookie_header = login_response.headers["set-cookie"]
            self.assertIn("access_token=", cookie_header)
            self.assertIn("HttpOnly", cookie_header)
            self.assertIn("Secure", cookie_header)
            self.assertIn("samesite=none", cookie_header.lower())
            self.assertIn("Path=/", cookie_header)
            self.assertNotIn("Domain=", cookie_header)

            user_response = self.client.get(
                "/api/users/auth/user",
                headers={"Origin": FRONTEND_ORIGIN},
            )

        self.assertEqual(user_response.status_code, 200)
        self.assertEqual(user_response.json()["id"], self.user.id)
        self.assertEqual(
            user_response.headers["access-control-allow-origin"],
            FRONTEND_ORIGIN,
        )
        self.assertEqual(
            user_response.headers["access-control-allow-credentials"],
            "true",
        )

    def test_missing_cookie_is_unauthorized(self):
        response = self.client.get("/api/users/auth/user")

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json()["detail"], "Not authenticated")

    def test_expired_token_is_unauthorized(self):
        expired_token = jwt.encode(
            {
                "sub": str(self.user.id),
                "exp": datetime.now(timezone.utc) - timedelta(minutes=1),
            },
            settings.SECRET_KEY,
            algorithm=settings.ALGORITHM,
        )
        self.client.cookies.set("access_token", expired_token)

        response = self.client.get("/api/users/auth/user")

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json()["detail"], "Session expired")

    def test_rejected_token_is_unauthorized(self):
        self.client.cookies.set("access_token", "not-a-valid-jwt")

        response = self.client.get("/api/users/auth/user")

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json()["detail"], "Invalid token")

    def test_otp_mismatch_logs_do_not_include_submitted_or_stored_codes(self):
        now = datetime.now(timezone.utc)
        stored_otp = SimpleNamespace(
            id=81,
            code="654321",
            is_used=False,
            expires_at=now + timedelta(minutes=5),
            created_at=now,
        )
        result = SimpleNamespace(
            scalars=lambda: SimpleNamespace(all=lambda: [stored_otp]),
        )
        db = SimpleNamespace(execute=AsyncMock(return_value=result))

        with self.assertLogs("apps.users.services.otp_service", level="INFO") as captured_logs:
            verified = asyncio.run(verify_otp(db, self.user.id, "123456", "phone_login"))

        self.assertFalse(verified)
        output = "\n".join(captured_logs.output)
        self.assertNotIn("123456", output)
        self.assertNotIn("654321", output)

    def test_user_lookup_failure_is_not_reported_as_invalid_authentication(self):
        valid_token = jwt.encode(
            {"sub": str(self.user.id), "exp": datetime.now(timezone.utc) + timedelta(minutes=5)},
            settings.SECRET_KEY,
            algorithm=settings.ALGORITHM,
        )
        self.client.cookies.set("access_token", valid_token)

        with patch(
            "core.dependencies.get_user_by_id",
            new=AsyncMock(side_effect=RuntimeError("database unavailable")),
        ):
            response = self.client.get("/api/users/auth/user")

        self.assertEqual(response.status_code, 503)
        self.assertEqual(
            response.json()["detail"],
            "Unable to verify authentication right now",
        )

    def test_cors_preflight_allows_credentialed_frontend_request(self):
        response = self.client.options(
            "/api/users/auth/user",
            headers={
                "Origin": FRONTEND_ORIGIN,
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "content-type",
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.headers["access-control-allow-origin"],
            FRONTEND_ORIGIN,
        )
        self.assertEqual(
            response.headers["access-control-allow-credentials"],
            "true",
        )


if __name__ == "__main__":
    unittest.main()
