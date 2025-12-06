"""
Migration Script: Convert certificate_templates.category from ENUM to VARCHAR
This script converts the category column to VARCHAR to work with native_enum=False
Run this script to fix enum validation errors when reading templates
"""

import asyncio
import sys
from sqlalchemy import text
from config.database import connect_to_db, engine, close_db_connection

async def run_migration():
    """Run the migration to convert category from ENUM to VARCHAR"""
    try:
        print("Connecting to database...")
        await connect_to_db()
        
        if not engine:
            print("ERROR: Database engine not initialized")
            sys.exit(1)
        
        print("Checking current column type...")
        
        async with engine.begin() as conn:
            # Check current column type
            check_query = text("""
                SELECT COLUMN_TYPE 
                FROM information_schema.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE()
                AND TABLE_NAME = 'certificate_templates' 
                AND COLUMN_NAME = 'category'
            """)
            
            result = await conn.execute(check_query)
            row = result.fetchone()
            
            if row:
                current_type = row[0]
                print(f"Current column type: {current_type}")
                
                if 'enum' in current_type.lower() or 'ENUM' in current_type:
                    print()
                    print("Converting certificate_templates.category from ENUM to VARCHAR...")
                    print("This will allow SQLAlchemy to properly handle enum values with native_enum=False.")
                    print()
                    
                    # Convert ENUM to VARCHAR
                    migration_sql = text("""
                        ALTER TABLE `certificate_templates` 
                        MODIFY COLUMN `category` VARCHAR(50) NOT NULL
                    """)
                    
                    await conn.execute(migration_sql)
                    print("✓ Migration completed successfully!")
                    print("✓ The category column is now VARCHAR(50) and will work with enum values.")
                    print()
                    print("You can now read and write templates without enum validation errors.")
                else:
                    print("✓ Column is already VARCHAR or another compatible type.")
                    print("No migration needed.")
            else:
                print("WARNING: Could not find category column in certificate_templates table.")
                print("The table might not exist or the column name might be different.")
        
    except Exception as e:
        print(f"ERROR: Migration failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        await close_db_connection()


if __name__ == "__main__":
    print("=" * 60)
    print("Certificate Templates Category Column Type Migration")
    print("=" * 60)
    print()
    asyncio.run(run_migration())
