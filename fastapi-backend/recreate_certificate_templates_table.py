"""
Script to drop and recreate certificate_templates table
This fixes the enum validation issues by using VARCHAR instead of ENUM
"""

import asyncio
import sys
from sqlalchemy import text
from config.database import connect_to_db, engine, close_db_connection


async def recreate_table():
    """Drop and recreate certificate_templates table with correct schema"""
    try:
        print("Connecting to database...")
        await connect_to_db()
        
        if not engine:
            print("ERROR: Database engine not initialized")
            sys.exit(1)
        
        print("=" * 60)
        print("Recreating certificate_templates table")
        print("=" * 60)
        print()
        
        async with engine.begin() as conn:
            # Step 1: Drop foreign key constraints from related tables
            print("Step 1: Dropping foreign key constraints...")
            try:
                # Check and drop foreign keys from certificate tables
                fk_tables = [
                    'spa_therapist_certificates',
                    'manager_salary_certificates',
                    'experience_letter_certificates',
                    'appointment_letter_certificates',
                    'invoice_spa_bill_certificates',
                    'id_card_certificates',
                    'generated_certificates'
                ]
                
                for table in fk_tables:
                    try:
                        # Get foreign key constraint names
                        fk_query = text(f"""
                            SELECT CONSTRAINT_NAME 
                            FROM information_schema.KEY_COLUMN_USAGE 
                            WHERE TABLE_SCHEMA = DATABASE()
                            AND TABLE_NAME = '{table}'
                            AND REFERENCED_TABLE_NAME = 'certificate_templates'
                        """)
                        result = await conn.execute(fk_query)
                        fks = result.fetchall()
                        
                        for fk_row in fks:
                            fk_name = fk_row[0]
                            drop_fk = text(f"ALTER TABLE `{table}` DROP FOREIGN KEY `{fk_name}`")
                            await conn.execute(drop_fk)
                            print(f"  ✓ Dropped FK from {table}")
                    except Exception as e:
                        print(f"  ⚠ Could not drop FK from {table}: {e}")
                        # Continue anyway
            except Exception as e:
                print(f"  ⚠ Error dropping foreign keys: {e}")
                print("  Continuing anyway...")
            
            print()
            
            # Step 2: Drop the table
            print("Step 2: Dropping certificate_templates table...")
            try:
                drop_table = text("DROP TABLE IF EXISTS `certificate_templates`")
                await conn.execute(drop_table)
                print("  ✓ Table dropped successfully")
            except Exception as e:
                print(f"  ERROR: Could not drop table: {e}")
                raise
            
            print()
            
            # Step 3: Recreate the table with correct schema (VARCHAR for category)
            print("Step 3: Creating certificate_templates table with correct schema...")
            create_table = text("""
                CREATE TABLE `certificate_templates` (
                    `id` INT AUTO_INCREMENT PRIMARY KEY,
                    `name` VARCHAR(255) NOT NULL,
                    `category` VARCHAR(50) NOT NULL,
                    `template_type` VARCHAR(20) NOT NULL DEFAULT 'image',
                    `template_image` VARCHAR(500) NULL,
                    `template_html` TEXT NULL,
                    `template_config` JSON NOT NULL DEFAULT (JSON_OBJECT()),
                    `created_by` INT NOT NULL,
                    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
                    `is_public` BOOLEAN NOT NULL DEFAULT TRUE,
                    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                    `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                    INDEX `ix_certificate_templates_id` (`id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """)
            
            await conn.execute(create_table)
            print("  ✓ Table created successfully with VARCHAR(50) for category column")
            
            print()
            
            # Step 4: Recreate foreign key constraints
            print("Step 4: Recreating foreign key constraints...")
            try:
                fk_constraints = [
                    ("spa_therapist_certificates", "template_id"),
                    ("manager_salary_certificates", "template_id"),
                    ("experience_letter_certificates", "template_id"),
                    ("appointment_letter_certificates", "template_id"),
                    ("invoice_spa_bill_certificates", "template_id"),
                    ("id_card_certificates", "template_id"),
                    ("generated_certificates", "template_id")
                ]
                
                for table, column in fk_constraints:
                    try:
                        # Check if table exists
                        check_table = text(f"""
                            SELECT COUNT(*) 
                            FROM information_schema.TABLES 
                            WHERE TABLE_SCHEMA = DATABASE()
                            AND TABLE_NAME = '{table}'
                        """)
                        result = await conn.execute(check_table)
                        if result.scalar() > 0:
                            fk_name = f"fk_{table}_template"
                            add_fk = text(f"""
                                ALTER TABLE `{table}` 
                                ADD CONSTRAINT `{fk_name}` 
                                FOREIGN KEY (`{column}`) 
                                REFERENCES `certificate_templates`(`id`) 
                                ON DELETE SET NULL
                            """)
                            await conn.execute(add_fk)
                            print(f"  ✓ Recreated FK for {table}")
                    except Exception as e:
                        print(f"  ⚠ Could not recreate FK for {table}: {e}")
                        # Continue anyway
            except Exception as e:
                print(f"  ⚠ Error recreating foreign keys: {e}")
                print("  You may need to recreate them manually if needed")
            
            print()
            print("=" * 60)
            print("✓ Table recreation completed successfully!")
            print("=" * 60)
            print()
            print("The certificate_templates table has been recreated with:")
            print("  - category column as VARCHAR(50) (not ENUM)")
            print("  - template_type column as VARCHAR(20) (not ENUM)")
            print()
            print("You can now create templates without enum validation errors.")
            print("Note: All existing template data has been deleted.")
            print("You'll need to recreate your templates through the admin interface.")
        
    except Exception as e:
        print(f"ERROR: Migration failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        await close_db_connection()


if __name__ == "__main__":
    print()
    print("WARNING: This will DELETE all existing certificate templates!")
    print("Make sure you have a backup if you need to preserve any data.")
    print()
    response = input("Do you want to continue? (yes/no): ")
    
    if response.lower() in ['yes', 'y']:
        asyncio.run(recreate_table())
    else:
        print("Operation cancelled.")
        sys.exit(0)
