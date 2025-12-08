# Analytics 500 Error Fix

## Issue
The `/api/analytics` endpoint was returning a 500 Internal Server Error.

## Root Causes Identified

### 1. Incorrect Role Name
The analytics endpoint was checking for `"manager"` role, but the actual role in the system is `"spa_manager"`. This mismatch could cause authorization failures.

**Fixed:** Updated all analytics endpoints to use the correct role names:
- `"admin"`
- `"hr"`
- `"spa_manager"` (was `"manager"`)
- `"super_admin"`

### 2. Missing Error Handling
The endpoint and dependencies lacked proper error handling for:
- Database connection errors
- Invalid user roles
- JWT token decoding errors
- User lookup failures

**Fixed:** Added comprehensive error handling with logging.

## Changes Made

### 1. `fastapi-backend/apps/analytics/routers.py`
- ✅ Fixed role names from `"manager"` to `"spa_manager"`
- ✅ Added `"super_admin"` to allowed roles
- ✅ Added try-catch blocks with proper HTTPException handling
- ✅ Added logging for debugging

### 2. `fastapi-backend/core/dependencies.py`

#### `get_current_user` function:
- ✅ Added error handling for JWT decoding
- ✅ Added error handling for database queries
- ✅ Added logging for debugging
- ✅ Better error messages

#### `require_role` function:
- ✅ Added null check for user role
- ✅ Handle both enum and string role values
- ✅ Better error messages showing required vs actual role
- ✅ Comprehensive exception handling

## Testing

After restarting the backend server, test the analytics endpoint:

```bash
# Test with curl (replace YOUR_TOKEN with actual JWT token)
curl -X GET "http://localhost:8009/api/analytics" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

Expected response:
```json
{
  "total_forms": 0,
  "total_certificates": 0,
  "active_users": 0
}
```

## Common Issues and Solutions

### Issue 1: 403 Forbidden
**Cause:** User doesn't have required role (admin, hr, spa_manager, or super_admin)
**Solution:** Check user's role in database or use an account with appropriate permissions

### Issue 2: 401 Unauthorized
**Cause:** Invalid or expired JWT token
**Solution:** Re-login to get a new token

### Issue 3: 500 Error Still Occurring
**Cause:** Database connection issue or other backend error
**Solution:** 
1. Check backend logs for detailed error message
2. Verify database is running and accessible
3. Check database connection settings in `.env` file

## Next Steps

1. **Restart the backend server** to apply changes
2. **Check backend logs** when accessing the analytics endpoint
3. **Verify user role** - make sure your user has one of: admin, hr, spa_manager, or super_admin
4. **Test the endpoint** using the browser or curl

## Debugging

If you still see errors, check the backend console/logs. The improved error handling will now show:
- Detailed error messages
- Stack traces
- User information (username, role)
- Database errors

Look for log messages like:
```
INFO: Analytics requested by user: admin (role: admin)
ERROR: Error in get_analytics: [error details]
```

