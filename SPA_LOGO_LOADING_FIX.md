# SPA Logo Loading Fix

## Issue
When creating an ID card, the SPA logo is not showing even though:
- Logo exists in the database
- SPA object is provided in the payload
- But the `spa` object in payload doesn't include the `logo` field

## Root Cause
The code only loaded SPA data from the database if the `spa` object was **missing**:
```python
if certificate_data.spa_id and not cert_data.get("spa"):
    # Load from database
```

**Problem**: If the frontend sends a `spa` object (without logo), the condition `not cert_data.get("spa")` is `False`, so the database is never queried and the logo is never loaded.

## Fix Applied

### Updated Logic
Now the code:
1. **Always loads SPA from database** if `spa_id` is provided
2. **Merges logo** from database into existing `spa` object if it exists
3. **Creates full spa object** from database if `spa` object is missing

### Changes Made

#### File: `fastapi-backend/apps/certificates/routers.py`

**Preview Endpoint** (`/preview`):
- ✅ Changed condition from `if certificate_data.spa_id and not cert_data.get("spa")` 
- ✅ To: `if certificate_data.spa_id:` (always load if spa_id provided)
- ✅ Merges logo from database into existing spa object

**Generate Endpoint** (`/generate`):
- ✅ Same fix applied
- ✅ Always loads SPA from database to ensure logo is included

**Download PDF/Image Endpoints**:
- ✅ Same fix applied to all endpoints that load SPA data

#### File: `fastapi-backend/apps/certificates/services/certificate_service.py`
- ✅ Added logging to debug logo path resolution
- ✅ Better error messages when logo is missing

## How It Works Now

### Before (Broken):
```python
# Only loads if spa object is missing
if spa_id and not spa_object:
    load_from_database()  # Logo loaded here
# If spa object exists (even without logo), logo never loaded
```

### After (Fixed):
```python
# Always loads if spa_id provided
if spa_id:
    if spa_object_exists:
        # Merge logo from database into existing object
        spa_object["logo"] = database_logo
    else:
        # Create full object from database
        spa_object = load_from_database()
```

## Example Payload

**Before Fix:**
```json
{
  "spa_id": 101,
  "certificate_data": {
    "spa": {
      "id": 101,
      "name": "ARTH THAI SPA",
      "address": "...",
      // ❌ No logo field - logo never loaded
    }
  }
}
```

**After Fix:**
```json
{
  "spa_id": 101,
  "certificate_data": {
    "spa": {
      "id": 101,
      "name": "ARTH THAI SPA",
      "address": "...",
      // ✅ Logo automatically loaded from database and merged
      "logo": "spa_logos/uuid-filename.jpg"
    }
  }
}
```

## Testing

1. **Test Preview:**
   - Send payload with `spa_id` and `spa` object (without logo)
   - Logo should now appear in preview

2. **Test Generation:**
   - Generate ID card with same payload
   - Logo should appear in generated PDF/image

3. **Check Logs:**
   - Look for debug messages about logo path resolution
   - Check for warnings if logo is missing

## Next Steps

1. **Restart FastAPI service:**
   ```bash
   sudo systemctl restart fastapi.service
   ```

2. **Test with your payload:**
   - The logo should now be automatically loaded from database
   - Check backend logs for logo path resolution messages

3. **Verify logo file exists:**
   ```bash
   # Check if logo file exists
   ls -la /var/www/infodocs/fastapi-backend/uploads/spa_logos/
   ```

## Debugging

If logo still doesn't show:

1. **Check backend logs** for:
   - `SPA logo from data: ...` - Shows what logo path was received
   - `Preview: Using uploads logo URL: ...` - Shows final URL used
   - `No SPA logo found in spa data` - Warning if logo is missing

2. **Verify database:**
   ```sql
   SELECT id, name, logo FROM spas WHERE id = 101;
   ```

3. **Check file exists:**
   ```bash
   # If logo is "spa_logos/filename.jpg"
   ls -la /var/www/infodocs/fastapi-backend/uploads/spa_logos/filename.jpg
   ```

## Summary

✅ **Fixed**: Logo is now always loaded from database when `spa_id` is provided, even if `spa` object exists in payload  
✅ **Improved**: Better logging for debugging logo path issues  
✅ **Consistent**: All endpoints (preview, generate, download) now use the same logic

