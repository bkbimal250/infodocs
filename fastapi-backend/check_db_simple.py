import asyncio
import sys
import os
from sqlalchemy import create_engine, text

# Correct DB URL format
DB_URL = "mysql+pymysql://dosadmin:DishaSolution%408989@82.25.109.137:3306/spadocs"

def check():
    try:
        engine = create_engine(DB_URL)
        with engine.connect() as conn:
            print("Checking columns...")
            res = conn.execute(text("DESCRIBE users"))
            cols = [r[0] for r in res]
            print(f"COLUMNS: {cols}")
            
            missing = []
            if 'last_login_at' not in cols: missing.append('last_login_at')
            if 'is_verified' not in cols: missing.append('is_verified')
            
            if missing:
                print(f"FOUND MISSING: {missing}")
            else:
                print("No missing columns found.")
    except Exception as e:
        print(f"Connection Error: {e}")

if __name__ == "__main__":
    check()
