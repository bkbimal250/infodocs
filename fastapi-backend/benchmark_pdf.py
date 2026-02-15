
import sys
import time
import os
import asyncio
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from apps.certificates.services.pdf_generator import html_to_pdf

MINIMAL_HTML = """
<!DOCTYPE html>
<html>
<head>
    <title>Test Certificate</title>
    <style>
        body { font-family: Arial, sans-serif; }
        .header { text-align: center; color: #333; }
        .content { margin: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Certificate of Achievement</h1>
    </div>
    <div class="content">
        <p>This is to certify that <strong>Test User</strong> has completed the benchmark.</p>
        <p>Date: 2024-05-22</p>
    </div>
</body>
</html>
"""

def bench():
    print("Starting PDF generation benchmark...")
    
    # Run 1: Cold start (includes font loading)
    start_time = time.time()
    try:
        pdf_bytes = html_to_pdf(MINIMAL_HTML)
        end_time = time.time()
        print(f"Run 1 (Cold Start): {end_time - start_time:.4f} seconds")
        print(f"PDF Size: {len(pdf_bytes)} bytes")
    except Exception as e:
        print(f"Run 1 Failed: {e}")
        return

    # Run 2: Warm start
    start_time = time.time()
    try:
        pdf_bytes = html_to_pdf(MINIMAL_HTML)
        end_time = time.time()
        print(f"Run 2 (Warm Start): {end_time - start_time:.4f} seconds")
    except Exception as e:
        print(f"Run 2 Failed: {e}")

    # Run 3: Warm start again
    start_time = time.time()
    try:
        pdf_bytes = html_to_pdf(MINIMAL_HTML)
        end_time = time.time()
        print(f"Run 3 (Warm Start): {end_time - start_time:.4f} seconds")
    except Exception as e:
        print(f"Run 3 Failed: {e}")

if __name__ == "__main__":
    bench()
