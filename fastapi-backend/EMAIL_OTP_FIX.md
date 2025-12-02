# Email OTP Fix - Login and Forgot Password

## Issue Fixed
Email OTP was not being sent for login and forgot password functionality.

## Root Causes Identified

1. **Blocking Event Loop**: The `send_email` function was synchronous and used blocking `smtplib.SMTP`, which blocked the async event loop when called from async functions.

2. **Missing SMTP Configuration**: SMTP settings (SMTP_USER, SMTP_PASSWORD, SMTP_FROM_EMAIL) might not be properly configured in the `.env` file.

3. **Error Handling**: Errors were being caught but not properly logged or handled for critical OTP purposes (login, password_reset).

## Solutions Implemented

### 1. Async Email Sending
- Converted `send_email` to an async function
- Uses `asyncio.to_thread()` to run the synchronous SMTP operations in a thread pool
- Prevents blocking the async event loop

### 2. Improved Error Handling
- Added `validate_smtp_settings()` function to check SMTP configuration before attempting to send
- Better error messages and logging
- Login and password reset OTP failures now properly raise errors (critical for security)
- Email verification OTP failures are non-blocking (registration still succeeds)

### 3. Enhanced Logging
- Added detailed logging at each step of email sending
- Errors are logged with full stack traces for debugging
- SMTP configuration errors are caught early and logged clearly

## Configuration Required

To enable email sending, you **MUST** configure the following in your `.env` file:

```env
# SMTP Configuration (Required for email OTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USE_TLS=True
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password-here
SMTP_FROM_EMAIL=your-email@gmail.com
SERVER_EMAIL=your-email@gmail.com

# Optional: Set to True to skip email sending in development
SKIP_EMAIL=False
```

### Gmail Setup Instructions

1. **Enable 2-Step Verification**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification if not already enabled

2. **Generate App Password**
   - Go to [Google Account App Passwords](https://myaccount.google.com/apppasswords)
   - Select **Mail** as the app
   - Select **Other (Custom name)** as the device
   - Enter name: "SPADocs API" (or any name you prefer)
   - Click **Generate**
   - Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

3. **Update .env File**
   ```env
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=abcdefghijklmnop  # Use the 16-character app password (spaces optional)
   SMTP_FROM_EMAIL=your-email@gmail.com
   SERVER_EMAIL=your-email@gmail.com
   ```

**Important Notes:**
- Use the **App Password**, NOT your regular Gmail password
- You can remove spaces from the app password if you prefer
- The email address in `SMTP_USER` and `SMTP_FROM_EMAIL` should be the same

## Testing

After configuring SMTP settings:

1. **Test Login OTP:**
   - Go to login page
   - Select "OTP" tab
   - Enter email and click "Send OTP"
   - Check email inbox for OTP code

2. **Test Forgot Password:**
   - Go to forgot password page
   - Enter email and submit
   - Check email inbox for password reset OTP code

3. **Check Backend Logs:**
   - Look for log messages like:
     - `"Attempting to send email to [email] via smtp.gmail.com:587"`
     - `"Email sent successfully to [email]"`
   - If errors occur, check logs for detailed error messages

## Troubleshooting

### Error: "SMTP_HOST is not configured"
- Add `SMTP_HOST=smtp.gmail.com` to your `.env` file

### Error: "SMTP_USER is not configured"
- Add `SMTP_USER=your-email@gmail.com` to your `.env` file

### Error: "SMTP_PASSWORD is not configured"
- Add `SMTP_PASSWORD=your-app-password` to your `.env` file
- Make sure you're using an App Password, not your regular password

### Error: "SMTP Authentication failed"
- Verify you're using an App Password (not regular password)
- Ensure 2-Step Verification is enabled on your Google account
- Try generating a new App Password

### Error: "Failed to connect to SMTP server"
- Check your internet connection
- Verify firewall settings allow outbound connections on port 587
- Try using port 465 with SSL instead (requires code changes)

### Emails Still Not Sending
1. Check backend logs for detailed error messages
2. Verify all SMTP settings in `.env` file
3. Restart the FastAPI server after updating `.env` file
4. Test SMTP connection manually using Python:
   ```python
   import smtplib
   server = smtplib.SMTP('smtp.gmail.com', 587)
   server.starttls()
   server.login('your-email@gmail.com', 'your-app-password')
   server.quit()
   ```

## Code Changes Summary

### Files Modified:
1. **`fastapi-backend/core/utils.py`**
   - Converted `send_email` to async function
   - Added `_send_email_sync` for thread pool execution
   - Added `validate_smtp_settings()` function
   - Improved error handling and logging

2. **`fastapi-backend/apps/users/services/otp_service.py`**
   - Updated to `await send_email()` instead of calling it synchronously
   - Improved error handling for login and password_reset OTPs
   - Better logging for email failures

## Next Steps

1. **Configure SMTP settings** in `.env` file (see Configuration Required section above)
2. **Restart the FastAPI server** to load new environment variables
3. **Test email sending** using login OTP and forgot password features
4. **Monitor logs** for any email sending errors

## Production Considerations

- Use a dedicated email service (SendGrid, AWS SES, etc.) instead of Gmail for production
- Set up proper email monitoring and alerting
- Consider using email queues for better reliability
- Implement rate limiting for OTP requests
- Add email delivery status tracking

