#!/usr/bin/env python
"""
Quick script to check if rembg is installed and available
"""
import sys

def check_rembg():
    try:
        from rembg import remove
        print("✓ rembg is installed and available")
        print("✓ Background removal service should work")
        return True
    except ImportError as e:
        print("✗ rembg is NOT installed")
        print(f"Error: {e}")
        print("\nTo install rembg, run:")
        print("  pip install rembg pillow")
        print("\nOr if using requirements.txt:")
        print("  pip install -r requirements.txt")
        return False

if __name__ == "__main__":
    success = check_rembg()
    sys.exit(0 if success else 1)
