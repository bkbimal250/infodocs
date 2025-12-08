#!/usr/bin/env python3
"""
Check file permissions for static files and media uploads
Run this script to verify permissions are set correctly
"""
import os
from pathlib import Path
import stat

def check_permissions(path, name):
    """Check and display permissions for a path"""
    print(f"\n{'='*60}")
    print(f"Checking: {name}")
    print(f"Path: {path}")
    print(f"{'='*60}")
    
    if not path.exists():
        print(f"❌ Path does not exist!")
        return False
    
    path_obj = Path(path)
    
    # Check if it's a file or directory
    if path_obj.is_file():
        print(f"Type: File")
    elif path_obj.is_dir():
        print(f"Type: Directory")
    else:
        print(f"Type: Unknown")
        return False
    
    # Get permissions
    file_stat = path_obj.stat()
    mode = file_stat.st_mode
    
    # Parse permissions
    permissions = stat.filemode(mode)
    print(f"Permissions: {permissions}")
    
    # Check read permission
    is_readable = os.access(path, os.R_OK)
    print(f"Readable: {'✅ Yes' if is_readable else '❌ No'}")
    
    # Check if directory, list contents
    if path_obj.is_dir():
        try:
            contents = list(path_obj.iterdir())
            print(f"Contents: {len(contents)} items")
            if len(contents) > 0:
                print("Sample files:")
                for item in contents[:5]:
                    item_stat = item.stat()
                    item_mode = stat.filemode(item_stat.st_mode)
                    item_readable = os.access(item, os.R_OK)
                    status = "✅" if item_readable else "❌"
                    print(f"  {status} {item.name} ({item_mode})")
        except PermissionError:
            print("❌ Cannot list directory contents (permission denied)")
            return False
    
    return is_readable

def main():
    """Main function to check all relevant paths"""
    print("File Permission Checker for FastAPI Backend")
    print("=" * 60)
    
    # Get base directory
    base_dir = Path(__file__).parent
    
    # Check Static directory
    static_dir = base_dir / "Static"
    static_images = static_dir / "images" if static_dir.exists() else None
    
    # Check media directory (from settings)
    try:
        from config.settings import settings
        media_dir = Path(settings.UPLOAD_DIR)
        if not media_dir.is_absolute():
            media_dir = base_dir / media_dir
    except Exception as e:
        print(f"Warning: Could not load settings: {e}")
        media_dir = base_dir / "media"
    
    # Check spa_logos directory
    spa_logos_dir = media_dir / "logo" / "spa_logos" if media_dir.exists() else None
    
    # Check candidate photos directory
    candidate_photos_dir = media_dir / "certificates" if media_dir.exists() else None
    
    results = []
    
    # Check Static directory
    if static_dir.exists():
        results.append(("Static Directory", static_dir, check_permissions(static_dir, "Static Directory")))
        if static_images and static_images.exists():
            results.append(("Static Images", static_images, check_permissions(static_images, "Static Images Directory")))
    else:
        print(f"\n⚠️  Static directory not found: {static_dir}")
    
    # Check media directory
    if media_dir.exists():
        results.append(("Media Directory", media_dir, check_permissions(media_dir, "Media Directory")))
        
        # Check spa_logos
        if spa_logos_dir and spa_logos_dir.exists():
            results.append(("SPA Logos", spa_logos_dir, check_permissions(spa_logos_dir, "SPA Logos Directory")))
        else:
            print(f"\n⚠️  SPA logos directory not found: {spa_logos_dir}")
        
        # Check candidate photos
        if candidate_photos_dir and candidate_photos_dir.exists():
            results.append(("Candidate Photos", candidate_photos_dir, check_permissions(candidate_photos_dir, "Candidate Photos Directory")))
        else:
            print(f"\n⚠️  Candidate photos directory not found: {candidate_photos_dir}")
    else:
        print(f"\n⚠️  Media directory not found: {media_dir}")
    
    # Summary
    print(f"\n{'='*60}")
    print("SUMMARY")
    print(f"{'='*60}")
    
    all_ok = True
    for name, path, is_readable in results:
        status = "✅ OK" if is_readable else "❌ FAILED"
        print(f"{status} - {name}")
        if not is_readable:
            all_ok = False
    
    if not all_ok:
        print(f"\n{'='*60}")
        print("RECOMMENDED FIXES")
        print(f"{'='*60}")
        print("""
To fix permission issues, run these commands (adjust paths as needed):

# Make directories readable by web server
sudo chmod -R 755 /var/www/infodocs/fastapi-backend/Static
sudo chmod -R 755 /var/www/infodocs/fastapi-backend/media

# Make files readable
sudo find /var/www/infodocs/fastapi-backend/Static -type f -exec chmod 644 {} \\;
sudo find /var/www/infodocs/fastapi-backend/media -type f -exec chmod 644 {} \\;

# Ensure web server user (www-data or gunicorn user) can read
sudo chown -R www-data:www-data /var/www/infodocs/fastapi-backend/Static
sudo chown -R www-data:www-data /var/www/infodocs/fastapi-backend/media

# Or if using a different user for gunicorn:
sudo chown -R gunicorn:gunicorn /var/www/infodocs/fastapi-backend/Static
sudo chown -R gunicorn:gunicorn /var/www/infodocs/fastapi-backend/media
        """)
    else:
        print("\n✅ All permissions look good!")
    
    # Check current user
    import getpass
    current_user = getpass.getuser()
    print(f"\nCurrent user: {current_user}")
    print(f"Current user ID: {os.getuid()}")

if __name__ == "__main__":
    main()

