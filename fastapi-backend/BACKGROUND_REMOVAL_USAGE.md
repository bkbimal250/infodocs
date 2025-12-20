# Background Removal Service - Usage Guide

## Overview
The background removal service uses **remove.bg API** as the primary method, with rembg library as a fallback. It's automatically applied in signature uploads and can be used anywhere in the application.

## Where Background Removal is Used

### 1. **Signature Upload Component** (`Client/src/Certificates/components/SignatureUpload.jsx`)
- **Automatic**: Background is removed automatically after image crop
- **Manual**: Users can click the sparkles button to remove background from existing images
- **Used in**:
  - `SpaTherapistCertificateForm` - Candidate signature
  - `AppointmentLetterForm` - Manager signature
  - `OfferLetterForm` - Signature fields

### 2. **Image Upload Component** (`Client/src/Certificates/components/ImageUpload.jsx`)
- **Optional**: Background removal can be enabled via `removeBackground` prop
- **Currently**: Uses frontend library (can be updated to use backend API)
- **Used in**:
  - `SpaTherapistCertificateForm` - Passport size photo
  - `IdCardForm` - Candidate photo

## API Configuration

### Step 1: Add API Key to `.env` file

Add this line to your `fastapi-backend/.env` file:

```env
REMOVE_BG_API_KEY=5ibDmpUussdnWFp1xDbcA6Sf
```

### Step 2: Restart Backend Server

After adding the API key, restart your FastAPI server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
uvicorn main:app --reload --host 0.0.0.0 --port 8009
```

### Step 3: Verify Configuration

Check the status endpoint:

```bash
curl http://localhost:8009/api/certificates/background-removal/status
```

Expected response:
```json
{
  "available": true,
  "remove_bg_api": true,
  "rembg": false,
  "error": null,
  "message": "Background removal service is available"
}
```

## API Endpoints

### 1. Remove Background from File Upload
```
POST /api/certificates/remove-background
Content-Type: multipart/form-data

Parameters:
- file: Image file
- output_format: PNG (default) or JPEG
```

### 2. Remove Background from Base64
```
POST /api/certificates/remove-background-base64
Content-Type: multipart/form-data

Parameters:
- image: Base64-encoded image string
- output_format: PNG (default) or JPEG
```

### 3. Check Service Status
```
GET /api/certificates/background-removal/status
```

## How It Works

1. **Primary**: remove.bg API
   - Fast cloud-based service
   - Optimized for signatures
   - No local dependencies

2. **Fallback**: rembg library
   - Used if API fails or is unavailable
   - Requires: `pip install rembg pillow`

## Features

- ✅ **Automatic background removal** for signatures
- ✅ **Manual background removal** button for existing images
- ✅ **Signature preservation** - dark ink is preserved
- ✅ **Automatic fallback** to rembg if API fails
- ✅ **Reusable** - can be used anywhere in the application

## Testing

1. Upload a signature image
2. Crop the image
3. Background is automatically removed
4. Or click the sparkles button on existing images

## Troubleshooting

### API Key Not Working
- Verify the key is correct in `.env`
- Check server logs for API errors
- Test with status endpoint

### Service Not Available
- Check if API key is set: `echo $REMOVE_BG_API_KEY`
- Verify backend server is running
- Check network connectivity to remove.bg API

### Signature Being Removed
- The service is optimized for signatures
- If issues persist, check remove.bg API response
- Fallback to rembg may help

## API Key Details

- **Label**: Spa_image_bg_remove
- **API Key**: 5ibDmpUussdnWFp1xDbcA6Sf
- **Service**: remove.bg API
- **Usage**: Unlimited (based on your remove.bg plan)
