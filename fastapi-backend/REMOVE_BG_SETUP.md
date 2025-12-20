# Remove.bg API Setup Guide

## Overview
The background removal service now uses remove.bg API as the primary method, with rembg library as a fallback.

## Configuration

### 1. Add API Key to Environment Variables

Add the following to your `.env` file:

```env
REMOVE_BG_API_KEY=5ibDmpUussdnWFp1xDbcA6Sf
```

### 2. API Key Details
- **Label**: Spa_image_bg_remove
- **API Key**: 5ibDmpUussdnWFp1xDbcA6Sf
- **Service**: remove.bg API

## How It Works

1. **Primary Method**: remove.bg API
   - Fast and reliable cloud-based service
   - No local dependencies required
   - Optimized for signatures and dark ink preservation

2. **Fallback Method**: rembg library
   - Used if API is unavailable or fails
   - Requires local installation: `pip install rembg pillow`

## Usage

The service is automatically used in:
- `SignatureUpload` component (signature background removal)
- `ImageUpload` component (optional background removal)
- All certificate generation workflows

## API Endpoints

- `POST /api/certificates/remove-background` - Remove background from uploaded file
- `POST /api/certificates/remove-background-base64` - Remove background from base64 image
- `GET /api/certificates/background-removal/status` - Check service availability

## Testing

After adding the API key, restart your FastAPI server and test:

```bash
curl http://localhost:8009/api/certificates/background-removal/status
```

You should see:
```json
{
  "available": true,
  "remove_bg_api": true,
  "rembg": false,
  "error": null,
  "message": "Background removal service is available"
}
```

## Notes

- The API key is stored in environment variables for security
- remove.bg API has usage limits based on your plan
- The service automatically falls back to rembg if the API fails
- Signature preservation is optimized for dark ink signatures
