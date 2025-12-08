# PDF Image Path Fix

## Issues Fixed

### 1. Double Slash in file:// URLs
**Problem**: `file:////var/www/...` (double slash after `file://`)
**Cause**: Path strings started with `/`, and `file:///` already includes a slash
**Fix**: Use `.lstrip("/")` to remove leading slashes from path strings before constructing `file://` URLs

### 2. Incorrect Uploads Path
**Problem**: Path was `fastapi-backend/apps/uploads` instead of `fastapi-backend/uploads`
**Cause**: Only going up 3 levels instead of 4 from `certificate_service.py`
**Fix**: Changed from `.parent.parent.parent` to `.parent.parent.parent.parent` to get to backend root

### 3. Blob URL Handling
**Problem**: Frontend sends `blob:http://localhost:5173/...` which can't be used for PDF generation
**Fix**: 
- For preview: Keep blob URLs (they work in browsers)
- For PDF: Detect blob URLs, log error, and set empty string to avoid broken images
- Frontend should send base64 data URLs or file paths instead of blob URLs

## Changes Made

### File: `fastapi-backend/apps/certificates/services/certificate_service.py`

1. **Fixed uploads path calculation**:
   ```python
   # Before:
   base_dir = Path(__file__).parent.parent.parent
   
   # After:
   base_dir = Path(__file__).parent.parent.parent.parent
   ```

2. **Fixed file:// URL construction**:
   ```python
   # Before:
   uploads_base_path_str = str(uploads_base_path.resolve()).replace("\\", "/")
   spa_logo = f"file:///{uploads_base_path_str}/{spa_logo}"  # Creates file:////var/...
   
   # After:
   uploads_base_path_str = str(uploads_base_path.resolve()).replace("\\", "/").lstrip("/")
   spa_logo = f"file:///{uploads_base_path_str}/{spa_logo}"  # Creates file:///var/...
   ```

3. **Added blob URL detection**:
   ```python
   elif photo.startswith("blob:"):
       if use_http_urls:
           # For preview: blob URLs work in browsers
           data["candidate_photo"] = photo
       else:
           # For PDF: blob URLs don't work
           logger.error("Blob URL cannot be used for PDF generation...")
           data["candidate_photo"] = ""  # Empty to avoid broken image
   ```

## Frontend Fix Needed

The frontend should **convert blob URLs to base64 data URLs** before sending to the backend for PDF generation.

### Example Fix in Frontend:
```javascript
// Convert blob URL to base64
async function blobToBase64(blobUrl) {
  const response = await fetch(blobUrl);
  const blob = await response.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

// Before sending to backend
if (candidatePhoto.startsWith('blob:')) {
  candidatePhoto = await blobToBase64(candidatePhoto);
}
```

## Testing

After applying fixes:

1. **Check logo path in logs**:
   - Should see: `file:///var/www/infodocs/fastapi-backend/uploads/spa_logos/...`
   - Should NOT see: `file:////var/www/...` (double slash)

2. **Check candidate photo**:
   - Preview: Should work with blob URLs
   - PDF: Should convert blob URLs to base64 or file paths

3. **Verify images in PDF**:
   - Logo should appear
   - Candidate photo should appear

## Summary

✅ Fixed double slash in file:// URLs  
✅ Fixed incorrect uploads directory path  
✅ Added blob URL detection and handling  
⚠️ Frontend needs to convert blob URLs to base64 for PDF generation

