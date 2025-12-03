# CORS Configuration Fix

## Issue
Frontend running on `http://localhost:5173` is getting CORS errors when accessing production backend at `https://infodocs.api.d0s369.co.in`.

## Error Message
```
Access to XMLHttpRequest at 'https://infodocs.api.d0s369.co.in/api/certificates/generate' 
from origin 'http://localhost:5173' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Solution

### 1. Updated CORS Middleware (main.py)
- Enhanced CORS configuration to ensure proper origin parsing
- Added `expose_headers` and `max_age` for better CORS support
- Ensured CORS_ORIGINS is properly converted to a list

### 2. Current CORS_ORIGINS Setting
The `settings.py` file includes:
- `http://localhost:5173` (local development)
- `https://infodocs.api.d0s369.co.in` (production API)
- `https://docs.dishaonlinesolution.in` (production frontend)

### 3. Production Server Configuration
**IMPORTANT:** The production server's `.env` file must include:
```env
CORS_ORIGINS=http://localhost:5173,https://infodocs.api.d0s369.co.in,https://docs.dishaonlinesolution.in
```

### 4. Steps to Fix on Production Server

1. **SSH into production server**
2. **Edit the `.env` file:**
   ```bash
   nano /var/www/infodocs/fastapi-backend/.env
   ```

3. **Add or update CORS_ORIGINS:**
   ```env
   CORS_ORIGINS=http://localhost:5173,https://infodocs.api.d0s369.co.in,https://docs.dishaonlinesolution.in
   ```

4. **Restart the FastAPI server:**
   ```bash
   # If using systemd:
   sudo systemctl restart infodocs-api
   
   # Or if using gunicorn directly:
   sudo supervisorctl restart infodocs-api
   # OR
   sudo systemctl restart gunicorn
   ```

### 5. Verify CORS is Working

After restarting, test with:
```bash
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type,Authorization" \
     -X OPTIONS \
     https://infodocs.api.d0s369.co.in/api/certificates/generate \
     -v
```

You should see:
```
< HTTP/1.1 200 OK
< Access-Control-Allow-Origin: http://localhost:5173
< Access-Control-Allow-Methods: *
< Access-Control-Allow-Headers: *
```

## Additional Fixes

### Certificate Generation Endpoint
- Added comprehensive error handling
- Added CORS headers to StreamingResponse for file downloads
- Improved error messages for debugging

## Testing

1. **Local Development:**
   - Frontend: `http://localhost:5173`
   - Backend: `https://infodocs.api.d0s369.co.in`
   - Should work after production server restart

2. **Production:**
   - Frontend: `https://docs.dishaonlinesolution.in`
   - Backend: `https://infodocs.api.d0s369.co.in`
   - Should work with proper CORS configuration

## Notes

- The CORS middleware is configured in `main.py` (lines 65-77)
- CORS_ORIGINS is parsed from settings in `config/settings.py` (lines 49-66)
- The validator automatically converts comma-separated strings to lists
- All origins are trimmed of whitespace

## Troubleshooting

If CORS errors persist after restart:

1. **Check server logs:**
   ```bash
   sudo tail -f /var/log/gunicorn/error.log
   # OR
   sudo journalctl -u infodocs-api -f
   ```

2. **Verify CORS_ORIGINS is loaded:**
   - Check if the environment variable is set correctly
   - Verify the settings are being loaded from `.env`

3. **Test with curl:**
   ```bash
   curl -I -H "Origin: http://localhost:5173" \
        https://infodocs.api.d0s369.co.in/api/certificates/generate
   ```

4. **Check browser console:**
   - Look for CORS preflight (OPTIONS) request
   - Verify the response headers include `Access-Control-Allow-Origin`

