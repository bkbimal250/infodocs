# Troubleshooting Guide

## Network/SSL Errors

### ERR_SSL_PROTOCOL_ERROR

If you're getting SSL protocol errors when connecting to the backend:

1. **Check Backend URL**: Ensure your backend is running on `http://localhost:8009` (not `https://`)

2. **Check Environment Variables**: 
   - Create a `.env` file in the `Client` folder
   - Set: `VITE_API_BASE_URL=https://infodocs.api.d0s369.co.in/api`
   - Make sure it's `http://` not `https://`

3. **Use Vite Proxy**: The `vite.config.js` is configured with a proxy that automatically handles CORS and SSL issues. The API will use relative paths in development mode.

4. **Restart Dev Server**: After changing environment variables, restart the Vite dev server:
   ```bash
   npm run dev
   ```

### ERR_NETWORK / Network Error

If you're getting network errors:

1. **Check if Backend is Running**: 
   - Make sure the Django backend is running on `http://localhost:8009`
   - Test by visiting `https://infodocs.api.d0s369.co.in/api/users/` in your browser

2. **Check CORS Settings**: 
   - Ensure Django CORS settings allow `http://localhost:5173`
   - Check `dosdocs-backend/config/settings/base.py` for CORS configuration

3. **Check Firewall**: 
   - Make sure your firewall isn't blocking the connection

4. **Check Console**: 
   - Open browser DevTools Console
   - Look for the logged API Base URL
   - Verify it's correct

## Common Issues

### API Base URL is wrong

The API config automatically:
- Uses `/api` (relative) in development (leverages Vite proxy)
- Uses full URL from `VITE_API_BASE_URL` environment variable
- Converts `https://localhost` to `http://localhost` automatically

### Authentication not working

1. Check if token is being stored: `localStorage.getItem('authToken')`
2. Check if token is being sent in headers
3. Verify backend token authentication is working

### CORS Errors

The Vite proxy should handle CORS automatically. If you still get CORS errors:
1. Check Django CORS settings
2. Make sure `CORS_ALLOWED_ORIGINS` includes `http://localhost:5173`

