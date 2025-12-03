# VPS PDF Generation Setup Guide

## Problem
Certificate PDF generation is failing on the VPS with `net::ERR_FAILED` error. This is typically due to missing system dependencies for WeasyPrint.

## Solution

### Step 1: Install System Dependencies

SSH into your VPS and run:

```bash
# Update package list
sudo apt update

# Install required system packages for WeasyPrint
sudo apt install -y \
    libpango-1.0-0 \
    libcairo2 \
    libffi-dev \
    libxml2 \
    libpq-dev \
    libjpeg-dev \
    poppler-utils \
    python3-dev \
    build-essential
```

### Step 2: Verify Python Packages

```bash
cd /var/www/infodocs/fastapi-backend

# Activate virtual environment (if using one)
source venv/bin/activate  # or your venv path

# Install/upgrade PDF generation packages
pip install --upgrade weasyprint xhtml2pdf pdf2image pillow
```

### Step 3: Test PDF Generation

Run the diagnostic script:

```bash
cd /var/www/infodocs/fastapi-backend
python3 check_pdf_dependencies.py
```

This will check all dependencies and test PDF generation.

### Step 4: Restart the Application

```bash
# If using systemd:
sudo systemctl restart infodocs-api

# If using supervisor:
sudo supervisorctl restart infodocs-api

# If using gunicorn directly:
sudo systemctl restart gunicorn
```

### Step 5: Check Logs

Monitor the logs to see if PDF generation is working:

```bash
# Check application logs
sudo tail -f /var/log/gunicorn/error.log
# OR
sudo journalctl -u infodocs-api -f
```

Look for:
- `✓ WeasyPrint is available (Recommended)`
- `PDF generated successfully`

## Troubleshooting

### Issue: WeasyPrint Import Error

**Error:** `OSError: cannot load library 'libpango-1.0.so.0'`

**Solution:**
```bash
sudo apt install -y libpango-1.0-0 libpangoft2-1.0-0
sudo ldconfig
```

### Issue: Cairo Not Found

**Error:** `OSError: cannot load library 'libcairo.so.2'`

**Solution:**
```bash
sudo apt install -y libcairo2 libcairo2-dev
sudo ldconfig
```

### Issue: Font Issues

**Error:** PDF generated but fonts are missing or incorrect

**Solution:**
```bash
# Install fonts
sudo apt install -y fonts-liberation fonts-dejavu-core
fc-cache -fv
```

### Issue: Memory Errors

**Error:** Out of memory when generating PDFs

**Solution:**
- Increase server memory
- Or use xhtml2pdf as fallback (less memory intensive)

### Issue: Permission Errors

**Error:** Cannot write to media directory

**Solution:**
```bash
# Fix permissions
sudo chown -R www-data:www-data /var/www/infodocs/fastapi-backend/media
sudo chmod -R 755 /var/www/infodocs/fastapi-backend/media
```

## Quick Fix Script

Run this complete setup script:

```bash
#!/bin/bash
# Complete PDF setup for VPS

echo "Installing system dependencies..."
sudo apt update
sudo apt install -y \
    libpango-1.0-0 \
    libcairo2 \
    libffi-dev \
    libxml2 \
    libpq-dev \
    libjpeg-dev \
    poppler-utils \
    python3-dev \
    build-essential \
    fonts-liberation \
    fonts-dejavu-core

echo "Updating library cache..."
sudo ldconfig
fc-cache -fv

echo "Installing Python packages..."
cd /var/www/infodocs/fastapi-backend
source venv/bin/activate  # Adjust if different
pip install --upgrade weasyprint xhtml2pdf pdf2image pillow

echo "Fixing permissions..."
sudo chown -R www-data:www-data media
sudo chmod -R 755 media

echo "Restarting service..."
sudo systemctl restart infodocs-api

echo "Setup complete! Check logs to verify."
```

## Verification

After setup, test the endpoint:

```bash
# Test with curl (replace with your actual token)
curl -X POST https://infodocs.api.d0s369.co.in/api/certificates/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"template_id": 1, "name": "Test", "certificate_data": {}}'
```

## Alternative: Use xhtml2pdf Only

If WeasyPrint continues to have issues, you can force the use of xhtml2pdf:

1. Uninstall WeasyPrint:
```bash
pip uninstall weasyprint
```

2. The code will automatically fall back to xhtml2pdf

Note: xhtml2pdf has limited CSS support but is more stable on some systems.

## Monitoring

Add this to your monitoring to catch PDF generation failures:

```python
# In your logging configuration
import logging
logging.getLogger('apps.certificates.services.pdf_generator').setLevel(logging.INFO)
```

## Support

If issues persist:
1. Check server logs: `sudo journalctl -u infodocs-api -n 100`
2. Check Python environment: `python3 -c "import weasyprint; print('OK')"`
3. Check system libraries: `ldconfig -p | grep pango`

