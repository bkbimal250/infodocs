# Installing Poppler for PDF to Image Conversion

The `pdf2image` library requires **Poppler** as a system dependency to convert PDFs to images.

## Windows Installation

### Option 1: Using Conda (Recommended)
If you're using conda:
```bash
conda install -c conda-forge poppler
```

### Option 2: Manual Installation
1. Download Poppler for Windows from:
   - https://github.com/oschwartz10612/poppler-windows/releases/
   - Or: https://blog.alivate.com.au/poppler-windows/

2. Extract the zip file to a location like `C:\poppler`

3. Add Poppler to your system PATH:
   - Open System Properties → Environment Variables
   - Add `C:\poppler\Library\bin` to your PATH
   - Or set it in your Python code (see below)

### Option 3: Set Poppler Path in Code
If you don't want to modify system PATH, you can set it in your environment:

```python
import os
os.environ['PATH'] += os.pathsep + r'C:\path\to\poppler\bin'
```

Or in your `.env` file:
```
POPPLER_PATH=C:\poppler\Library\bin
```

## Verify Installation

After installing Poppler, verify it works:

```python
from pdf2image import convert_from_path
import os

# Test if poppler is available
try:
    images = convert_from_path('test.pdf', dpi=150)
    print("✓ Poppler is working!")
except Exception as e:
    print(f"✗ Poppler error: {e}")
```

## Troubleshooting

If you get errors like:
- `poppler not found`
- `Unable to get page count`

Make sure:
1. Poppler binaries are in your PATH
2. Or set the path explicitly in code
3. Restart your Python environment after installation

## Alternative: Use PDF to Image Conversion

The code now automatically:
1. Tries to convert from existing PDF (if available) - **FASTEST**
2. Falls back to HTML generation if PDF doesn't exist

So Poppler is only needed when:
- Converting existing PDFs to images
- Generating images from HTML (fallback method)

