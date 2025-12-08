# SPA Logo Path Fix

## Issue
SPA logos and candidate photos not showing in ID card templates even though files exist in backend.

## Root Cause
**Path Mismatch:**
- Files are saved to: `uploads/spa_logos/` (by `save_uploaded_file` in `forms_app/routers.py`)
- Certificate service was looking in: `media/` (from `settings.UPLOAD_DIR`)
- Static file serving only mounted `/media`, not `/uploads`

## Fixes Applied

### 1. Updated `main.py`
- ✅ Added mount for `/uploads` directory
- ✅ Now both `/media` and `/uploads` are served as static files

### 2. Updated `certificate_service.py`
- ✅ Logo path resolution now checks `uploads/` first, then falls back to `media/`
- ✅ For HTTP URLs (preview): Uses `/uploads/` if file exists, else `/media/`
- ✅ For file:// URLs (PDF): Checks `uploads/` first, then `media/`
- ✅ Same fix applied to `candidate_photo` path handling

### 3. Updated `check_file_permissions.py`
- ✅ Now checks both `uploads/spa_logos` and `media/logo/spa_logos`
- ✅ Checks both `uploads/certificates` and `media/certificates`
- ✅ Updated fix commands to include `uploads` directory

## File Locations

### Where Files Are Saved
- **SPA Logos**: `fastapi-backend/uploads/spa_logos/`
- **Candidate Photos**: `fastapi-backend/uploads/certificates/` (or `media/certificates/`)
- **Candidate Forms**: `fastapi-backend/uploads/candidate_forms/`

### Database Storage
- Logo path stored as: `spa_logos/filename.jpg` (relative to uploads)
- Photo path stored as: `certificates/filename.jpg` (relative to uploads or media)

## How It Works Now

### For Browser Preview (use_http_urls=True)
1. Check if file exists in `uploads/spa_logos/` → Use `https://domain.com/uploads/spa_logos/filename.jpg`
2. If not found, check `media/logo/spa_logos/` → Use `https://domain.com/media/logo/spa_logos/filename.jpg`

### For PDF Generation (use_http_urls=False)
1. Check if file exists in `uploads/spa_logos/` → Use `file:///path/to/uploads/spa_logos/filename.jpg`
2. If not found, check `media/logo/spa_logos/` → Use `file:///path/to/media/logo/spa_logos/filename.jpg`

## Next Steps

### 1. Restart FastAPI Service
```bash
sudo systemctl restart fastapi.service
```

### 2. Fix Permissions (if needed)
```bash
cd /var/www/infodocs/fastapi-backend

# Fix uploads directory permissions
sudo chmod -R 755 uploads
sudo find uploads -type f -exec chmod 644 {} \;

# Fix ownership
sudo chown -R www-data:www-data uploads
# OR if gunicorn runs as different user:
# sudo chown -R gunicorn:gunicorn uploads
```

### 3. Verify Static File Serving
```bash
# Test uploads directory is accessible
curl -I https://infodocs.api.d0s369.co.in/uploads/spa_logos/your-logo.jpg

# Test media directory (if used)
curl -I https://infodocs.api.d0s369.co.in/media/logo/spa_logos/your-logo.jpg
```

### 4. Test ID Card Generation
- Generate a new ID card
- Check if logo and candidate photo appear
- Check browser console for any 404 errors

## Verification

Run the updated permission checker:
```bash
cd /var/www/infodocs/fastapi-backend
python3 check_file_permissions.py
```

It should now find:
- ✅ `uploads/spa_logos/` directory
- ✅ Files in that directory
- ✅ Proper permissions

## Summary of Changes

| File | Change |
|------|--------|
| `main.py` | Added mount for `/uploads` directory |
| `certificate_service.py` | Updated logo/photo path resolution to check `uploads/` first |
| `check_file_permissions.py` | Updated to check both `uploads/` and `media/` directories |

## Important Notes

1. **Path Resolution Order**: Always checks `uploads/` first (where files are actually saved), then falls back to `media/` (legacy)
2. **Static File Serving**: Both `/uploads` and `/media` are now mounted, so HTTP URLs work for both
3. **File Permissions**: Make sure gunicorn user can read files in `uploads/` directory
4. **Database Paths**: Logo paths in database are relative (e.g., `spa_logos/filename.jpg`), which is correct

