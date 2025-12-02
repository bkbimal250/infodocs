"""
Script to check .env file configuration for email/SMTP settings
Run this to verify your SMTP configuration is correct
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file
env_path = Path(__file__).parent / ".env"
if env_path.exists():
    load_dotenv(env_path)
    print(f"✅ Found .env file at: {env_path}\n")
else:
    print(f"❌ .env file not found at: {env_path}")
    print("Please create a .env file in the fastapi-backend directory\n")
    exit(1)

# Required SMTP settings
required_settings = {
    "SMTP_HOST": os.getenv("SMTP_HOST", ""),
    "SMTP_PORT": os.getenv("SMTP_PORT", ""),
    "SMTP_USER": os.getenv("SMTP_USER", ""),
    "SMTP_PASSWORD": os.getenv("SMTP_PASSWORD", ""),
    "SMTP_FROM_EMAIL": os.getenv("SMTP_FROM_EMAIL", ""),
    "SERVER_EMAIL": os.getenv("SERVER_EMAIL", ""),
    "SMTP_USE_TLS": os.getenv("SMTP_USE_TLS", ""),
}

print("=" * 60)
print("SMTP Configuration Check")
print("=" * 60)
print()

# Check each setting
all_valid = True
for key, value in required_settings.items():
    if not value:
        print(f"❌ {key}: NOT SET")
        all_valid = False
    else:
        # Mask password for security
        if "PASSWORD" in key:
            masked = "*" * min(len(value), 16) + "..." if len(value) > 16 else "*" * len(value)
            print(f"✅ {key}: {masked} ({len(value)} characters)")
        else:
            print(f"✅ {key}: {value}")

print()
print("=" * 60)

# Additional checks
print("\nAdditional Checks:")
print("-" * 60)

# Check if SMTP_FROM_EMAIL or SERVER_EMAIL is set
if not required_settings["SMTP_FROM_EMAIL"] and not required_settings["SERVER_EMAIL"]:
    print("❌ Neither SMTP_FROM_EMAIL nor SERVER_EMAIL is set")
    all_valid = False
else:
    print("✅ At least one FROM email is configured")

# Check SMTP_PORT is numeric
try:
    port = int(required_settings["SMTP_PORT"] or "0")
    if port > 0:
        print(f"✅ SMTP_PORT is valid: {port}")
    else:
        print("❌ SMTP_PORT is not set or invalid")
        all_valid = False
except ValueError:
    print("❌ SMTP_PORT must be a number")
    all_valid = False

# Check SMTP_USE_TLS
tls_value = required_settings["SMTP_USE_TLS"].lower() if required_settings["SMTP_USE_TLS"] else ""
if tls_value in ("true", "1", "yes", "on", ""):
    print("✅ SMTP_USE_TLS is configured")
else:
    print(f"⚠️  SMTP_USE_TLS: {required_settings['SMTP_USE_TLS']} (should be True/true/1/yes/on)")

# Check email format
email_fields = ["SMTP_USER", "SMTP_FROM_EMAIL", "SERVER_EMAIL"]
for field in email_fields:
    value = required_settings[field]
    if value and "@" in value:
        print(f"✅ {field} appears to be a valid email format")
    elif value:
        print(f"⚠️  {field} might not be a valid email: {value}")

print()
print("=" * 60)
if all_valid:
    print("✅ All required SMTP settings are configured!")
    print("\nYour .env file looks good. Email sending should work.")
else:
    print("❌ Some SMTP settings are missing or invalid.")
    print("\nPlease update your .env file with the missing settings.")
    print("\nRequired settings:")
    print("  SMTP_HOST=smtp.gmail.com")
    print("  SMTP_PORT=587")
    print("  SMTP_USE_TLS=True")
    print("  SMTP_USER=your-email@gmail.com")
    print("  SMTP_PASSWORD=your-app-password")
    print("  SMTP_FROM_EMAIL=your-email@gmail.com")
    print("  SERVER_EMAIL=your-email@gmail.com")
print("=" * 60)

