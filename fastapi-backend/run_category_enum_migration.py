"""
Migration Script: Update certificate_templates.category ENUM
This script updates the category ENUM to include all values from Python CertificateCategory enum
Run this script to fix the "Data truncated for column 'category'" error
"""

import asyncio
import sys
from sqlalchemy import text
from config.database import connect_to_db, engine, close_db_connection

# SQL to update the ENUM
MIGRATION_SQL = """
ALTER TABLE `certificate_templates` 
MODIFY COLUMN `category` ENUM(
    'spa_therapist',
    'manager_salary',
    'offer_letter',
    'experience_letter',
    'appointment_letter',
    'invoice_spa_bill',
    'id_card'
) NOT NULL;
"""


async def run_migration():
    """Run the migration to update the category ENUM"""
    try:
        print("Connecting to database...")
        await connect_to_db()
        
        if not engine:
            print("ERROR: Database engine not initialized")
            sys.exit(1)
        
        print("Running migration: Updating certificate_templates.category ENUM...")
        print("This will add 'id_card' and update all enum values to match Python code.")
        print()
        
        async with engine.begin() as conn:
            # Execute the migration
            await conn.execute(text(MIGRATION_SQL))
            print("✓ Migration completed successfully!")
            print("✓ The category ENUM now includes: spa_therapist, manager_salary, offer_letter,")
            print("  experience_letter, appointment_letter, invoice_spa_bill, id_card")
            print()
            print("You can now create ID Card templates without errors.")
        
    except Exception as e:
        print(f"ERROR: Migration failed: {e}")
        print()
        print("If you see an error about existing data, you may need to:")
        print("1. First update existing rows with old enum values to new values")
        print("2. Then run this migration again")
        print()
        print("Check the migration_update_category_enum.sql file for manual steps.")
        sys.exit(1)
    finally:
        await close_db_connection()


if __name__ == "__main__":
    print("=" * 60)
    print("Certificate Templates Category ENUM Migration")
    print("=" * 60)
    print()
    asyncio.run(run_migration())
