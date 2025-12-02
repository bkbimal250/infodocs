# Environment Setup Guide

This guide will help you set up the environment variables for production deployment.

## Backend Setup

### 1. Create `.env` file

Copy the example file:
```bash
cd fastapi-backend
cp .env.example .env
```

### 2. Configure Required Variables

Edit `.env` and set the following **REQUIRED** variables:

#### Application
- `DEBUG=False` - Set to False in production
- `HOST=0.0.0.0` - Server host
- `PORT=8000` - Server port

#### Security (CRITICAL)
- `SECRET_KEY` - Generate a secure random key:
  ```bash
  python -c "import secrets; print(secrets.token_urlsafe(32))"
  ```
  **Never use the default secret key in production!**

#### Database
- `DB_NAME` - Your MySQL database name
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `DB_HOST` - Database host (IP or domain)
- `DB_PORT` - Database port (default: 3306)

#### CORS
- `CORS_ORIGINS` - Comma-separated list of allowed origins:
  ```
  CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
  ```

#### Email (Required for OTP and notifications)
- `SMTP_USER` - Your email address
- `SMTP_PASSWORD` - Gmail App Password (not regular password)
- `SMTP_FROM_EMAIL` - Display name and email: `Your App <email@gmail.com>`
- `SERVER_EMAIL` - Server email address
- `SKIP_EMAIL=False` - Set to False to enable email sending

**Gmail App Password Setup:**
1. Go to https://myaccount.google.com/apppasswords
2. Generate a new app password for "Mail"
3. Use the generated 16-character password in `SMTP_PASSWORD`

### 3. Verify Configuration

Test your configuration:
```bash
python -c "from config.settings import settings; print('Settings loaded successfully')"
```

## Frontend Setup

### 1. Create `.env` file

Copy the example file:
```bash
cd Client
cp .env.example .env
```

### 2. Configure API URL

Edit `.env` and set:
```
VITE_API_BASE_URL=https://your-api-domain.com/api
```

For development:
```
VITE_API_BASE_URL=https://infodocs.api.d0s369.co.in/api
```

### 3. Build for Production

```bash
npm run build
```

The build will use the environment variables from `.env`.

## Security Checklist

Before deploying to production:

- [ ] `SECRET_KEY` is a strong random string (32+ characters)
- [ ] `DEBUG=False` in production
- [ ] Database credentials are secure
- [ ] `CORS_ORIGINS` only includes your production domains
- [ ] `SKIP_EMAIL=False` to enable email sending
- [ ] Gmail App Password is set (not regular password)
- [ ] `.env` files are in `.gitignore` (never commit them)
- [ ] All sensitive data is in `.env`, not hardcoded

## Production Deployment

1. **Backend:**
   - Set all environment variables in `.env`
   - Use a process manager (PM2, systemd, etc.)
   - Set up SSL/TLS (HTTPS)
   - Configure firewall rules

2. **Frontend:**
   - Set `VITE_API_BASE_URL` to production API URL
   - Build with `npm run build`
   - Serve static files via Nginx or similar
   - Configure HTTPS

## Troubleshooting

### Backend won't start
- Check all required variables are set
- Verify database connection
- Check logs for specific errors

### Emails not sending
- Verify `SKIP_EMAIL=False`
- Check Gmail App Password is correct
- Verify SMTP settings
- Check server logs for email errors

### CORS errors
- Verify `CORS_ORIGINS` includes your frontend domain
- Check for trailing slashes
- Ensure protocol matches (http vs https)

