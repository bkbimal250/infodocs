# Logo Display Fix for Invoice Template

## Issue
Logo was not showing in the invoice PDF/certificate generation.

## Root Cause
The `spa_logo` path was not being converted to the proper format for PDF generation:
- For **preview** (browser): Needs HTTP URL like `http://domain.com/media/spa_logos/logo.jpg`
- For **PDF generation**: Needs file:// path like `file:///path/to/media/spa_logos/logo.jpg`

## Solution

### 1. Added Logo Path Conversion (certificate_service.py)
- Added `spa_logo` to the data dictionary
- Converts relative logo paths to proper file:// URLs for PDF generation
- Converts to HTTP URLs for browser preview

### 2. Updated Template (invoice.html)
- Added conditional rendering: `{{#if spa_logo}}...{{/if}}`
- Logo only displays if `spa_logo` is provided
- Added proper styling for logo image

### 3. Fixed PDF Generation Endpoint (routers.py)
- Ensured `use_http_urls=False` is passed for PDF generation
- This ensures file:// paths are used instead of HTTP URLs

## How It Works

1. **Logo Path Storage**: Logo is stored in database as relative path (e.g., `spa_logos/logo.jpg`)

2. **Path Conversion**:
   - **Preview**: `spa_logos/logo.jpg` → `http://domain.com/media/spa_logos/logo.jpg`
   - **PDF**: `spa_logos/logo.jpg` → `file:///absolute/path/to/media/spa_logos/logo.jpg`

3. **Template Rendering**:
   - Template checks if `spa_logo` exists
   - If exists, displays image with proper path
   - If not, shows nothing (conditional rendering)

## Testing

1. **Test Preview**:
   - Generate preview of invoice
   - Logo should display in browser

2. **Test PDF Generation**:
   - Generate PDF of invoice
   - Logo should appear in PDF

3. **Test Without Logo**:
   - Create invoice for SPA without logo
   - Should not show broken image, just empty logo box

## Files Modified

1. `fastapi-backend/apps/certificates/services/certificate_service.py`
   - Added `spa_logo` path conversion logic
   - Added `spa_logo` to data dictionary

2. `fastapi-backend/apps/certificates/templates/invoice.html`
   - Added conditional rendering for logo
   - Improved logo styling

3. `fastapi-backend/apps/certificates/routers.py`
   - Ensured `use_http_urls=False` for PDF generation

## Notes

- Logo paths are automatically converted based on context (preview vs PDF)
- WeasyPrint requires `file://` paths for local file access
- HTTP URLs work for browser preview but not for PDF generation
- The logo box will be empty if no logo is provided (no broken image)

