# File Permissions Guide for Static Files and Media Uploads

## Problem
Logo and candidate images not showing in ID card templates even though files exist in backend.

## Root Causes
1. **File Permissions**: Web server (gunicorn) doesn't have read permissions
2. **Directory Permissions**: Directories not accessible
3. **Ownership**: Files owned by wrong user
4. **Static File Serving**: FastAPI static file mounting not working

## How to Check Permissions

### 1. Run the Permission Checker Script
```bash
cd /var/www/infodocs/fastapi-backend
python3 check_file_permissions.py
```

### 2. Manual Check
```bash
# Check Static directory
ls -la /var/www/infodocs/fastapi-backend/Static
ls -la /var/www/infodocs/fastapi-backend/Static/images

# Check media directory
ls -la /var/www/infodocs/fastapi-backend/media
ls -la /var/www/infodocs/fastapi-backend/media/logo/spa_logos
ls -la /var/www/infodocs/fastapi-backend/media/certificates

# Check specific file
ls -la /var/www/infodocs/fastapi-backend/media/logo/spa_logos/your-logo.png
```

## Required Permissions

### Directories
- **Read (r)**: Required to list directory contents
- **Execute (x)**: Required to access files inside directory
- **Recommended**: `755` (rwxr-xr-x)

### Files
- **Read (r)**: Required to read file content
- **Recommended**: `644` (rw-r--r--)

## Fix Permissions

### Option 1: Fix All at Once
```bash
# Navigate to backend directory
cd /var/www/infodocs/fastapi-backend

# Fix Static directory
sudo chmod -R 755 Static
sudo find Static -type f -exec chmod 644 {} \;

# Fix media directory
sudo chmod -R 755 media
sudo find media -type f -exec chmod 644 {} \;
```

### Option 2: Fix Ownership (if needed)
```bash
# Find out what user gunicorn runs as
ps aux | grep gunicorn

# Usually it's www-data or a specific user
# Fix ownership
sudo chown -R www-data:www-data /var/www/infodocs/fastapi-backend/Static
sudo chown -R www-data:www-data /var/www/infodocs/fastapi-backend/media

# Or if gunicorn runs as a different user (check systemd service)
sudo chown -R gunicorn:gunicorn /var/www/infodocs/fastapi-backend/Static
sudo chown -R gunicorn:gunicorn /var/www/infodocs/fastapi-backend/media
```

### Option 3: Set Permissions for Specific Directories
```bash
# Static images
sudo chmod 755 /var/www/infodocs/fastapi-backend/Static
sudo chmod 755 /var/www/infodocs/fastapi-backend/Static/images
sudo chmod 644 /var/www/infodocs/fastapi-backend/Static/images/*

# SPA logos
sudo chmod 755 /var/www/infodocs/fastapi-backend/media
sudo chmod 755 /var/www/infodocs/fastapi-backend/media/logo
sudo chmod 755 /var/www/infodocs/fastapi-backend/media/logo/spa_logos
sudo chmod 644 /var/www/infodocs/fastapi-backend/media/logo/spa_logos/*

# Candidate photos
sudo chmod 755 /var/www/infodocs/fastapi-backend/media/certificates
sudo chmod 644 /var/www/infodocs/fastapi-backend/media/certificates/*
```

## Verify Static File Serving

### Check FastAPI Configuration
The `main.py` should have:
```python
# Mount Static directory
static_dir = Path(__file__).parent / "Static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

# Mount media directory
media_dir = Path(settings.UPLOAD_DIR)
if media_dir.exists():
    app.mount("/media", StaticFiles(directory=str(media_dir)), name="media")
```

### Test Static File Access
```bash
# Test if static files are accessible via HTTP
curl -I https://infodocs.api.d0s369.co.in/static/images/info%20docs.png

# Test if media files are accessible
curl -I https://infodocs.api.d0s369.co.in/media/logo/spa_logos/your-logo.png
```

## Common Issues and Solutions

### Issue 1: 403 Forbidden
**Cause**: Directory not readable
**Fix**: `sudo chmod 755 /path/to/directory`

### Issue 2: 404 Not Found
**Cause**: File doesn't exist or path is wrong
**Fix**: Check file path and verify file exists

### Issue 3: Images show in browser but not in PDF
**Cause**: Using HTTP URLs instead of file:// URLs for PDF generation
**Fix**: This is handled by `use_http_urls` parameter in `prepare_certificate_data`

### Issue 4: Permission Denied in Logs
**Cause**: Gunicorn user doesn't have access
**Fix**: Change ownership to gunicorn user or add read permissions

## Check Gunicorn User

```bash
# Check systemd service
sudo systemctl status fastapi.service

# Check process owner
ps aux | grep gunicorn

# Check systemd service file
sudo cat /etc/systemd/system/fastapi.service
```

## After Fixing Permissions

1. **Restart FastAPI service**:
   ```bash
   sudo systemctl restart fastapi.service
   ```

2. **Test image access**:
   - Try accessing a logo via browser
   - Generate a new ID card and check if images appear

3. **Check logs**:
   ```bash
   sudo journalctl -u fastapi.service -f
   ```

## Security Note

- Don't use `777` permissions (too permissive)
- Use `755` for directories and `644` for files
- Ensure only web server user can write, everyone can read

