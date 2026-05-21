import asyncio

from sqlalchemy import text

from config.database import engine


async def check():
    try:
        async with engine.connect() as conn:
            print("Checking columns...")
            res = await conn.execute(text("DESCRIBE users"))
            cols = [row[0] for row in res]
            print(f"COLUMNS: {cols}")

            missing = []
            if "last_login_at" not in cols:
                missing.append("last_login_at")
            if "is_verified" not in cols:
                missing.append("is_verified")

            if missing:
                print(f"FOUND MISSING: {missing}")
            else:
                print("No missing columns found.")
    except Exception as e:
        print(f"Connection Error: {e}")


if __name__ == "__main__":
    asyncio.run(check())
