#!/usr/bin/env python3
"""
Check PDF Generation Dependencies
Run this script on the VPS to diagnose PDF generation issues
"""
import sys
import subprocess
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_system_package(package):
    """Check if a system package is installed"""
    try:
        result = subprocess.run(
            ['dpkg', '-l', package],
            capture_output=True,
            text=True,
            timeout=5
        )
        return result.returncode == 0 and package in result.stdout
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return False

def check_python_package(package):
    """Check if a Python package is installed"""
    try:
        __import__(package)
        return True
    except ImportError:
        return False

def main():
    print("=" * 60)
    print("PDF Generation Dependencies Check")
    print("=" * 60)
    print()
    
    # Check Python packages
    print("Python Packages:")
    print("-" * 60)
    python_packages = {
        'weasyprint': 'WeasyPrint (Primary PDF library)',
        'xhtml2pdf': 'xhtml2pdf (Fallback PDF library)',
        'pdf2image': 'pdf2image (For image conversion)',
        'PIL': 'Pillow (Image processing)',
    }
    
    all_python_ok = True
    for package, description in python_packages.items():
        installed = check_python_package(package)
        status = "✓" if installed else "✗"
        print(f"{status} {description}: {'Installed' if installed else 'MISSING'}")
        if not installed:
            all_python_ok = False
    
    print()
    
    # Check system packages (Linux)
    print("System Packages (Linux):")
    print("-" * 60)
    system_packages = {
        'libpango-1.0-0': 'Pango (Text layout)',
        'libcairo2': 'Cairo (Graphics rendering)',
        'libffi-dev': 'libffi (Foreign function interface)',
        'libxml2': 'libxml2 (XML parsing)',
        'libpq-dev': 'PostgreSQL dev (Optional)',
        'libjpeg-dev': 'JPEG support',
        'poppler-utils': 'Poppler (For pdf2image)',
    }
    
    all_system_ok = True
    for package, description in system_packages.items():
        installed = check_system_package(package)
        status = "✓" if installed else "✗"
        print(f"{status} {description}: {'Installed' if installed else 'MISSING'}")
        if not installed:
            all_system_ok = False
    
    print()
    print("=" * 60)
    
    if all_python_ok and all_system_ok:
        print("✓ All dependencies are installed!")
        print()
        print("Testing PDF generation...")
        try:
            from apps.certificates.services.pdf_generator import html_to_pdf
            test_html = "<html><body><h1>Test PDF</h1></body></html>"
            pdf_bytes = html_to_pdf(test_html)
            print(f"✓ PDF generation test successful! ({len(pdf_bytes)} bytes)")
            return 0
        except Exception as e:
            print(f"✗ PDF generation test failed: {e}")
            return 1
    else:
        print("✗ Some dependencies are missing!")
        print()
        print("Installation commands:")
        print("-" * 60)
        print("# Install system packages:")
        print("sudo apt update")
        print("sudo apt install -y libpango-1.0-0 libcairo2 libffi-dev libxml2 libpq-dev libjpeg-dev poppler-utils")
        print()
        print("# Install Python packages (if missing):")
        print("pip install weasyprint xhtml2pdf pdf2image pillow")
        return 1

if __name__ == "__main__":
    sys.exit(main())

