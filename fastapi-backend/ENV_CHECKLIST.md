# .env File Configuration Checklist

## Required SMTP Settings for Email OTP

Your `.env` file should contain these settings (lines 1-51 or wherever you have them):

```env
# ============================================
# SMTP Email Configuration
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USE_TLS=True
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-character-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
SERVER_EMAIL=your-email@gmail.com
SKIP_EMAIL=False
```

## Quick Check

Run this command to verify your configuration:

```bash
cd fastapi-backend
python check_env_config.py
```

## What Each Setting Does

| Setting | Required | Description | Example |
|---------|----------|-------------|---------|
| `SMTP_HOST` | ✅ Yes | SMTP server address | `smtp.gmail.com` |
| `SMTP_PORT` | ✅ Yes | SMTP server port | `587` (TLS) or `465` (SSL) |
| `SMTP_USE_TLS` | ✅ Yes | Use TLS encryption | `True` or `1` |
| `SMTP_USER` | ✅ Yes | Your email address | `your-email@gmail.com` |
| `SMTP_PASSWORD` | ✅ Yes | Gmail App Password (16 chars) | `abcdefghijklmnop` |
| `SMTP_FROM_EMAIL` | ✅ Yes | Sender email address | `your-email@gmail.com` |
| `SERVER_EMAIL` | ✅ Yes | Server email (fallback) | `your-email@gmail.com` |
| `SKIP_EMAIL` | ❌ No | Skip email in dev mode | `False` (production) |

## Common Issues

### ❌ Issue 1: Settings Not Set
```
SMTP_USER=
SMTP_PASSWORD=
```
**Fix:** Add your email and app password

### ❌ Issue 2: Using Regular Password
```
SMTP_PASSWORD=your-regular-gmail-password  # ❌ Won't work!
```
**Fix:** Generate a Gmail App Password (see below)

### ❌ Issue 3: Missing FROM Email
```
SMTP_FROM_EMAIL=
SERVER_EMAIL=
```
**Fix:** Set at least one of these

### ❌ Issue 4: Wrong Port
```
SMTP_PORT=25  # ❌ Gmail doesn't use port 25
```
**Fix:** Use `587` for TLS or `465` for SSL

## Gmail App Password Setup

1. **Enable 2-Step Verification**
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" → "Other (Custom name)"
   - Name it: "SPADocs API"
   - Click "Generate"
   - Copy the 16-character password

3. **Update .env**
   ```env
   SMTP_PASSWORD=abcdefghijklmnop  # Your 16-char app password
   ```

## Example .env File (Lines 1-51)

```env
# ============================================
# Database Configuration
# ============================================
DB_NAME=spadocs
DB_USER=root
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=3306

# ============================================
# Security & JWT
# ============================================
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200

# ============================================
# CORS Settings
# ============================================
CORS_ORIGINS=http://localhost:5173,http://localhost:8009

# ============================================
# SMTP Email Configuration
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USE_TLS=True
SMTP_USER=info.dishaonlinesolution@gmail.com
SMTP_PASSWORD=your-16-character-app-password-here
SMTP_FROM_EMAIL=info.dishaonlinesolution@gmail.com
SERVER_EMAIL=info.dishaonlinesolution@gmail.com
SKIP_EMAIL=False

# ============================================
# Application Settings
# ============================================
DEBUG=True
HOST=0.0.0.0
PORT=8000
```

## Verification Steps

1. ✅ Check all required settings are present
2. ✅ Verify email addresses are correct
3. ✅ Confirm using Gmail App Password (not regular password)
4. ✅ Ensure SMTP_PORT is 587 (or 465 for SSL)
5. ✅ Set SMTP_USE_TLS=True
6. ✅ Restart FastAPI server after changes

## Test Email Configuration

After configuring, test with:

```bash
# Run the check script
python check_env_config.py

# Or test directly in Python
python -c "from config.settings import settings; print(f'SMTP_HOST: {settings.SMTP_HOST}'); print(f'SMTP_USER: {settings.SMTP_USER}')"
```

## Need Help?

If email still doesn't work:
1. Check backend logs for error messages
2. Verify App Password is correct
3. Ensure 2-Step Verification is enabled
4. Try generating a new App Password
5. Check firewall/network settings

