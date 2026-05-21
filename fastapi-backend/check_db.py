import asyncio
import os
import sys

from sqlalchemy import text

sys.path.append(os.getcwd())

from config.database import engine


async def check_schema():
    try:
        async with engine.connect() as conn:
            print("Checking users table structure...")
            result = await conn.execute(text("DESCRIBE users"))
            columns = [row[0] for row in result.all()]
            print(f"Columns found: {', '.join(columns)}")

            required_cols = ["last_login_at", "is_verified", "phone_number", "spa_id"]
            missing = [col for col in required_cols if col not in columns]

            if missing:
                print(f"MISSING COLUMNS: {missing}")
                for col in missing:
                    if col == "last_login_at":
                        print("Fix: ALTER TABLE users ADD COLUMN last_login_at DATETIME(6);")
                    elif col == "is_verified":
                        print("Fix: ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;")
            else:
                print("All required columns are present.")
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    asyncio.run(check_schema())
