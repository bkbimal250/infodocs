import asyncio
import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from config.database import connect_to_db, close_db_connection, engine
from sqlalchemy import text
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def get_tables_info():
    await connect_to_db()
    from config.database import engine
    async with engine.begin() as conn:
        # Get all tables
        result = await conn.execute(text("SHOW TABLES"))
        tables = [row[0] for row in result.fetchall()]
        logger.info(f"Existing tables: {tables}")
        
        # Check specific tables
        relevant_tables = ['users', 'staff', 'staff_events', 'work_history', 'spas']
        for table in relevant_tables:
            if table in tables:
                logger.info(f"\n--- Columns in '{table}' ---")
                res = await conn.execute(text(f"DESCRIBE {table}"))
                for col in res.fetchall():
                    logger.info(f"  {col[0]}: {col[1]} ({col[2]})")
            else:
                logger.info(f"❌ Table '{table}' DOES NOT exist.")
    await close_db_connection()

if __name__ == "__main__":
    asyncio.run(get_tables_info())
