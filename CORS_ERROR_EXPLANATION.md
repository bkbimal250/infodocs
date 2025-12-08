# CORS Error Explanation and Fix

## Understanding the CORS Error

### What is CORS?
CORS (Cross-Origin Resource Sharing) is a security mechanism implemented by web browsers. It prevents web pages from making requests to a different domain, port, or protocol than the one serving the web page.

### Your Error
```
Access to XMLHttpRequest at 'http://localhost:8009/api/analytics' 
from origin 'http://localhost:5173' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**What this means:**
- Your frontend is running on `http://localhost:5173` (Vite dev server)
- Your backend is running on `http://localhost:8009` (FastAPI server)
- These are **different origins** (different ports = different origins)
- The browser is blocking the request because the backend didn't send the proper CORS headers

### Why It Happens

1. **500 Internal Server Error**: The backend is returning a 500 error, which might prevent CORS headers from being added properly
2. **Missing CORS Configuration**: The backend might not have `http://localhost:5173` in its allowed origins list
3. **Backend Not Running**: The backend server might not be running on port 8009

## The Fix

### 1. Backend CORS Configuration (Already Fixed)

The backend has been updated to:
- Automatically include `http://localhost:5173` in allowed origins
- Ensure CORS headers are added to all responses, including error responses
- Log allowed origins for debugging

### 2. Verify Backend is Running

Make sure your FastAPI backend is running:
```bash
cd fastapi-backend
python main.py
# Or
uvicorn main:app --host 0.0.0.0 --port 8009 --reload
```

### 3. Check Environment Variables

Create or update `fastapi-backend/.env` file:
```env
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173
DEBUG=True
SECRET_KEY=your-secret-key-here
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=3306
```

### 4. Check Frontend API Configuration

Make sure your frontend is configured to use the correct backend URL.

Create or update `Client/.env` file:
```env
VITE_API_BASE_URL=http://localhost:8009/api
```

Then restart your frontend dev server:
```bash
cd Client
npm run dev
```

## Common Issues and Solutions

### Issue 1: Backend Not Running
**Symptom**: Network Error, ERR_NETWORK
**Solution**: Start the backend server on port 8009

### Issue 2: Wrong Port
**Symptom**: Connection refused
**Solution**: Check that backend is running on port 8009 (not 8000)

### Issue 3: 500 Internal Server Error
**Symptom**: CORS error + 500 error in console
**Solution**: 
- Check backend logs for the actual error
- Verify database connection
- Check authentication token is valid
- The analytics endpoint requires admin/hr/manager role

### Issue 4: Authentication Error
**Symptom**: 401 Unauthorized
**Solution**: 
- Make sure you're logged in
- Check that the auth token is being sent in headers
- Verify token hasn't expired

## Testing CORS

### Test if backend is accessible:
```bash
curl http://localhost:8009/health
```

### Test CORS headers:
```bash
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Authorization" \
     -X OPTIONS \
     http://localhost:8009/api/analytics \
     -v
```

You should see headers like:
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: *
Access-Control-Allow-Headers: *
```

## Next Steps

1. **Restart the backend server** to apply the CORS fixes
2. **Check backend logs** to see if there are any errors
3. **Verify the analytics endpoint** works by testing it directly
4. **Check browser console** for any other errors

## Additional Notes

- CORS is a **browser security feature** - it doesn't affect server-to-server requests
- The CORS middleware in FastAPI should handle most cases automatically
- If you're still seeing CORS errors after these fixes, check:
  - Backend server is actually running
  - Port numbers match (5173 for frontend, 8009 for backend)
  - No firewall blocking the connection
  - Browser cache (try hard refresh: Ctrl+Shift+R)

