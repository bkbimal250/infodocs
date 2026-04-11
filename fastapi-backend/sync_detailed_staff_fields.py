import asyncio
import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from config.database import connect_to_db, close_db_connection
from sqlalchemy import text
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def migrate():
    """Add detailed profile fields to staff table"""
    logger.info("=" * 60)
    logger.info("Migration: Add Detailed Staff Profile Fields")
    logger.info("=" * 60)
    
    try:
        await connect_to_db()
        from config.database import engine
        
        async with engine.begin() as conn:
            # List of columns to add
            new_columns = [
                ("email", "VARCHAR(255) NULL"),
                ("gender", "VARCHAR(20) NULL"),
                ("date_of_birth", "DATETIME NULL"),
                ("father_name", "VARCHAR(255) NULL"),
                ("blood_group", "VARCHAR(10) NULL"),
                ("emergency_contact_name", "VARCHAR(255) NULL"),
                ("emergency_contact_number", "VARCHAR(20) NULL"),
                ("designation", "VARCHAR(100) NULL"),
                ("salary", "INT NULL"),
                ("bank_name", "VARCHAR(255) NULL"),
                ("account_number", "VARCHAR(100) NULL"),
                ("ifsc_code", "VARCHAR(50) NULL"),
            ]
            
            # Check existing columns
            result = await conn.execute(text("DESCRIBE staff"))
            existing_columns = [row[0] for row in result.fetchall()]
            
            for col_name, col_def in new_columns:
                if col_name not in existing_columns:
                    logger.info(f"Adding column '{col_name}'...")
                    await conn.execute(text(f"ALTER TABLE staff ADD COLUMN {col_name} {col_def}"))
                else:
                    logger.info(f"✅ Column '{col_name}' already exists.")
            
            logger.info("=" * 60)
            logger.info("✅ Migration completed successfully!")
            logger.info("=" * 60)
            
    except Exception as e:
        logger.error(f"❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        await close_db_connection()

if __name__ == "__main__":
    asyncio.run(migrate())
