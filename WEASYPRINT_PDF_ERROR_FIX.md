# WeasyPrint PDF Generation Error Fix

## Issue
When generating PDFs, the following error occurs:
```
PDF.__init__() takes 1 positional argument but 3 were given
```

This is a **compatibility issue** between WeasyPrint and pydyf.

## Root Cause
- **pydyf version 0.11.0** introduced breaking changes
- **WeasyPrint 57.1** is not compatible with pydyf 0.11.0+
- The error occurs when WeasyPrint tries to create PDF objects internally

## Solution Applied

### Fixed `requirements.txt`
Changed:
```txt
pydyf==0.11.0
```

To:
```txt
pydyf==0.8.0
```

This pins pydyf to a version that is compatible with WeasyPrint 57.1.

## Installation Steps

On the server, run:

```bash
cd /var/www/infodocs/fastapi-backend
source venv/bin/activate
pip install pydyf==0.8.0
# Or reinstall all requirements:
pip install -r requirements.txt
```

Then restart the FastAPI service:
```bash
sudo systemctl restart fastapi.service
```

## Alternative Solution (If Needed)

If pinning pydyf doesn't work, you can upgrade WeasyPrint instead:

```txt
weasyprint>=62.0
```

But this might require testing as newer versions may have different behavior.

## Verification

After applying the fix:
1. Try generating a certificate PDF
2. Check server logs for any WeasyPrint errors
3. Verify PDFs are generated successfully

## References

- [WeasyPrint GitHub Issue #2205](https://github.com/Kozea/WeasyPrint/issues/2205)
- pydyf 0.11.0 introduced breaking changes incompatible with older WeasyPrint versions

