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
    
    # Check uploads directory (where files are actually saved)
    uploads_dir = base_dir / "uploads"
    
    # Check spa_logos directory - check both possible locations
    # 1. uploads/spa_logos (where save_uploaded_file saves)
    spa_logos_dir_uploads = uploads_dir / "spa_logos" if uploads_dir.exists() else None
    # 2. media/logo/spa_logos (legacy path)
    spa_logos_dir_media = media_dir / "logo" / "spa_logos" if media_dir.exists() else None
    # Use whichever exists
    spa_logos_dir = spa_logos_dir_uploads if (spa_logos_dir_uploads and spa_logos_dir_uploads.exists()) else spa_logos_dir_media
    
    # Check candidate photos directory - check both locations
    candidate_photos_dir_uploads = uploads_dir / "certificates" if uploads_dir.exists() else None
    candidate_photos_dir_media = media_dir / "certificates" if media_dir.exists() else None
    candidate_photos_dir = candidate_photos_dir_uploads if (candidate_photos_dir_uploads and candidate_photos_dir_uploads.exists()) else candidate_photos_dir_media
    
    results = []
    
    # Check Static directory
    if static_dir.exists():
        results.append(("Static Directory", static_dir, check_permissions(static_dir, "Static Directory")))
        if static_images and static_images.exists():
            results.append(("Static Images", static_images, check_permissions(static_images, "Static Images Directory")))
    else:
        print(f"\n⚠️  Static directory not found: {static_dir}")
    
    # Check uploads directory (where files are actually saved)
    if uploads_dir.exists():
        results.append(("Uploads Directory", uploads_dir, check_permissions(uploads_dir, "Uploads Directory")))
        
        # Check spa_logos in uploads
        if spa_logos_dir_uploads and spa_logos_dir_uploads.exists():
            results.append(("SPA Logos (uploads)", spa_logos_dir_uploads, check_permissions(spa_logos_dir_uploads, "SPA Logos Directory (uploads/spa_logos)")))
        else:
            print(f"\n⚠️  SPA logos directory not found in uploads: {spa_logos_dir_uploads}")
        
        # Check candidate photos in uploads
        if candidate_photos_dir_uploads and candidate_photos_dir_uploads.exists():
            results.append(("Candidate Photos (uploads)", candidate_photos_dir_uploads, check_permissions(candidate_photos_dir_uploads, "Candidate Photos Directory (uploads/certificates)")))
        else:
            print(f"\n⚠️  Candidate photos directory not found in uploads: {candidate_photos_dir_uploads}")
    else:
        print(f"\n⚠️  Uploads directory not found: {uploads_dir}")
    
    # Check media directory (legacy/alternative location)
    if media_dir.exists():
        results.append(("Media Directory", media_dir, check_permissions(media_dir, "Media Directory")))
        
        # Check spa_logos in media (if different from uploads)
        if spa_logos_dir_media and spa_logos_dir_media.exists() and spa_logos_dir_media != spa_logos_dir_uploads:
            results.append(("SPA Logos (media)", spa_logos_dir_media, check_permissions(spa_logos_dir_media, "SPA Logos Directory (media/logo/spa_logos)")))
        
        # Check candidate photos in media (if different from uploads)
        if candidate_photos_dir_media and candidate_photos_dir_media.exists() and candidate_photos_dir_media != candidate_photos_dir_uploads:
            results.append(("Candidate Photos (media)", candidate_photos_dir_media, check_permissions(candidate_photos_dir_media, "Candidate Photos Directory (media/certificates)")))
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
sudo chmod -R 755 /var/www/infodocs/fastapi-backend/uploads

# Make files readable
sudo find /var/www/infodocs/fastapi-backend/Static -type f -exec chmod 644 {} \\;
sudo find /var/www/infodocs/fastapi-backend/media -type f -exec chmod 644 {} \\;
sudo find /var/www/infodocs/fastapi-backend/uploads -type f -exec chmod 644 {} \\;

# Ensure web server user (www-data or gunicorn user) can read
sudo chown -R www-data:www-data /var/www/infodocs/fastapi-backend/Static
sudo chown -R www-data:www-data /var/www/infodocs/fastapi-backend/media
sudo chown -R www-data:www-data /var/www/infodocs/fastapi-backend/uploads

# Or if using a different user for gunicorn:
sudo chown -R gunicorn:gunicorn /var/www/infodocs/fastapi-backend/Static
sudo chown -R gunicorn:gunicorn /var/www/infodocs/fastapi-backend/media
sudo chown -R gunicorn:gunicorn /var/www/infodocs/fastapi-backend/uploads
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

