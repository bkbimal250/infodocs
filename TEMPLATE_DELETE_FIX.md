# Template Delete Error Fix

## Issues Identified

1. **CORS Error**: Production frontend `https://docs.dishaonlinesolution.in` was not properly included in CORS origins
2. **Database Error**: "404: Template not found" error in database context manager
3. **Cache Issue**: Templates showing in UI but database is empty (stale cache)

## Fixes Applied

### 1. CORS Configuration (`fastapi-backend/main.py`)
- ✅ Added production frontend origins to CORS automatically
- ✅ Now includes: `https://docs.dishaonlinesolution.in` and `https://www.docs.dishaonlinesolution.in`

### 2. Delete Template Endpoint (`fastapi-backend/apps/certificates/routers.py`)
- ✅ Improved error handling
- ✅ Returns proper 204 No Content response on success
- ✅ Better exception handling to avoid database context manager issues

### 3. Cache Invalidation (`fastapi-backend/apps/certificates/services/certificate_service.py`)
- ✅ Delete now bypasses cache when checking if template exists (`use_cache=False`)
- ✅ Clears both individual template cache and list cache when deleting
- ✅ Ensures fresh data after deletion

## Changes Made

### File: `fastapi-backend/main.py`
```python
# Added production frontend origins
production_origins = ["https://docs.dishaonlinesolution.in", "https://www.docs.dishaonlinesolution.in"]
```

### File: `fastapi-backend/apps/certificates/routers.py`
- Improved delete endpoint error handling
- Returns proper Response object for 204 status

### File: `fastapi-backend/apps/certificates/services/certificate_service.py`
- `delete_template` now uses `use_cache=False` when checking template existence
- Clears both `_template_cache` and `_template_list_cache` on delete

## Next Steps for Production

1. **Restart the FastAPI service:**
   ```bash
   sudo systemctl restart fastapi.service
   ```

2. **Clear the cache manually (if needed):**
   The cache is in-memory, so restarting the service will clear it. However, if templates still appear:
   - Check if templates exist in a different database
   - Verify the database connection is correct
   - Check if there are multiple database instances

3. **Verify CORS is working:**
   ```bash
   curl -H "Origin: https://docs.dishaonlinesolution.in" \
        -H "Access-Control-Request-Method: DELETE" \
        -H "Access-Control-Request-Headers: Authorization" \
        -X OPTIONS \
        https://infodocs.api.d0s369.co.in/api/certificates/templates/7 \
        -v
   ```

4. **Check database:**
   ```sql
   -- Verify table exists and structure
   DESCRIBE certificate_templates;
   
   -- Check if templates exist
   SELECT * FROM certificate_templates;
   
   -- Check if there are templates in other tables
   SHOW TABLES LIKE '%template%';
   ```

## Root Cause Analysis

The error "404: Template not found" appearing in the database context manager suggests:
1. Template doesn't exist in database (table is empty)
2. Cache has stale data showing templates that no longer exist
3. When trying to delete, `get_template_by_id` returns None
4. HTTPException(404) is raised, which gets caught by database context manager

## Additional Recommendations

1. **Add admin endpoint that bypasses cache:**
   Consider adding a separate admin endpoint that always fetches from database:
   ```python
   @certificates_router.get("/admin/templates", response_model=List[CertificateTemplateResponse])
   async def list_all_templates_admin(
       db: AsyncSession = Depends(get_db),
       current_user: User = Depends(require_role("admin", "super_admin"))
   ):
       """List all templates (admin only, no cache)"""
       return await get_all_templates(db, skip=0, limit=1000)
   ```

2. **Add cache invalidation endpoint:**
   ```python
   @certificates_router.post("/admin/templates/cache/clear")
   async def clear_template_cache(
       current_user: User = Depends(require_role("admin", "super_admin"))
   ):
       """Clear template cache (admin only)"""
       _invalidate_template_cache()
       return {"message": "Cache cleared"}
   ```

3. **Update frontend to use admin endpoint:**
   Change `adminApi.certificates.getTemplates()` to use `/certificates/admin/templates` if you add the endpoint above.

## Testing

After deploying fixes:
1. Try deleting a template that exists in database - should work
2. Try deleting a template that doesn't exist - should return 404 properly
3. Check CORS headers in browser network tab
4. Verify templates list refreshes after deletion

