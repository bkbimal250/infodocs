# DateTime Timezone Fix - OTP Verification

## Issue

Error when verifying OTP:
```
RuntimeError: Database session creation failed: can't compare offset-naive and offset-aware datetimes
```

## Root Cause

MySQL was returning datetime values as timezone-naive, even though the SQLAlchemy model specified `DateTime(timezone=True)`. When comparing `datetime.now(timezone.utc)` (timezone-aware) with `otp.expires_at` (potentially timezone-naive), Python raised an error.

## Solution

### 1. Fixed `verify_otp` Function
- Added `_ensure_timezone_aware()` helper function
- Normalizes datetimes to be timezone-aware (UTC) before comparison
- Handles both timezone-aware and timezone-naive datetimes from MySQL

### 2. Configured MySQL Connection
- Added timezone setting on connection: `SET time_zone = '+00:00'`
- Ensures MySQL uses UTC for all datetime operations

## Files Modified

### `fastapi-backend/apps/users/services/otp_service.py`
- Added `_ensure_timezone_aware()` helper function
- Updated `verify_otp()` to normalize `expires_at` before comparison

### `fastapi-backend/config/database.py`
- Added `event` import from SQLAlchemy
- Added event listener to set MySQL timezone to UTC on connection

## Code Changes

### Before
```python
# Check expiration
if datetime.now(timezone.utc) > otp.expires_at:  # ❌ Error if expires_at is naive
    return False
```

### After
```python
# Check expiration - ensure both datetimes are timezone-aware
now = datetime.now(timezone.utc)
expires_at = _ensure_timezone_aware(otp.expires_at)  # ✅ Normalize to UTC

if now > expires_at:
    return False
```

## Testing

After the fix, OTP verification should work:

1. **Request OTP** (login or forgot password)
2. **Receive OTP** via email
3. **Verify OTP** - should now work without datetime errors

## Verification

Test the fix:
```bash
# 1. Request login OTP
POST /api/users/auth/request_login_otp
{
  "email": "user@example.com"
}

# 2. Verify OTP
POST /api/users/auth/login_with_otp
{
  "email": "user@example.com",
  "otp": "123456"
}
```

## Additional Notes

- All datetime operations now ensure timezone-awareness
- MySQL connection is configured to use UTC
- Helper function can be reused for other datetime comparisons if needed

## Status

✅ **Fixed** - OTP verification should now work correctly

