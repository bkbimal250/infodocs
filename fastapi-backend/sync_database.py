import asyncio
import sys
import os
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from config.database import connect_to_db, close_db_connection, engine
from sqlalchemy import text
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def run_migration():
    """Sync database schema with models"""
    try:
        await connect_to_db()
        from config.database import engine
        
        async with engine.begin() as conn:
            # 1. Ensure Staff and related tables exist
            logger.info("Checking for StaffManagement tables...")
            
            # Create staff table if not exists
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS staff (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NULL,
                    phone VARCHAR(20) NOT NULL UNIQUE,
                    adhar_card VARCHAR(50) NULL,
                    adhar_card_photo VARCHAR(255) NULL,
                    pan_card VARCHAR(50) NULL,
                    pan_card_photo VARCHAR(255) NULL,
                    passport_photo VARCHAR(255) NULL,
                    photo VARCHAR(255) NULL,
                    address TEXT NULL,
                    current_status VARCHAR(20) DEFAULT 'inactive',
                    spa_id INT NULL,
                    joining_date DATETIME NULL,
                    leave_date DATETIME NULL,
                    transfer_date DATETIME NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX ix_staff_id (id),
                    INDEX ix_staff_phone (phone),
                    INDEX ix_staff_spa_id (spa_id),
                    CONSTRAINT fk_staff_spa_id FOREIGN KEY (spa_id) REFERENCES spas(id) ON DELETE SET NULL
                ) ENGINE=InnoDB
            """))
            
            # Create staff_events table if not exists
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS staff_events (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    staff_id INT NOT NULL,
                    type VARCHAR(20) NOT NULL,
                    spa_id INT NULL,
                    from_spa_id INT NULL,
                    to_spa_id INT NULL,
                    event_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                    notes TEXT NULL,
                    created_by INT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    INDEX ix_staff_events_id (id),
                    INDEX ix_staff_events_staff_id (staff_id),
                    INDEX ix_staff_events_type (type),
                    INDEX ix_staff_events_spa_id (spa_id),
                    INDEX idx_staff_event_type_date (type, event_date),
                    CONSTRAINT fk_event_staff_id FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
                    CONSTRAINT fk_event_spa_id FOREIGN KEY (spa_id) REFERENCES spas(id) ON DELETE SET NULL,
                    CONSTRAINT fk_event_from_spa_id FOREIGN KEY (from_spa_id) REFERENCES spas(id) ON DELETE SET NULL,
                    CONSTRAINT fk_event_to_spa_id FOREIGN KEY (to_spa_id) REFERENCES spas(id) ON DELETE SET NULL,
                    CONSTRAINT fk_event_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
                ) ENGINE=InnoDB
            """))
            
            # Create work_history table if not exists
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS work_history (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    staff_id INT NOT NULL,
                    spa_id INT NOT NULL,
                    join_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                    leave_date DATETIME NULL,
                    status VARCHAR(20) DEFAULT 'active',
                    is_transferred BOOLEAN DEFAULT FALSE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX ix_work_history_id (id),
                    INDEX ix_work_history_staff_id (staff_id),
                    INDEX ix_work_history_spa_id (spa_id),
                    INDEX idx_staff_spa_status (staff_id, spa_id, status),
                    CONSTRAINT fk_work_staff_id FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
                    CONSTRAINT fk_work_spa_id FOREIGN KEY (spa_id) REFERENCES spas(id) ON DELETE CASCADE
                ) ENGINE=InnoDB
            """))
            
            logger.info("✅ StaffManagement tables verified/created.")

            # 2. Sync Users table (for spa_id and any other new fields)
            logger.info("Checking for 'users.spa_id' column...")
            res = await conn.execute(text("""
                SELECT COUNT(*) FROM information_schema.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'users' 
                AND COLUMN_NAME = 'spa_id'
            """))
            if res.scalar() == 0:
                logger.info("Adding 'spa_id' to 'users' table...")
                await conn.execute(text("ALTER TABLE users ADD COLUMN spa_id INT NULL"))
                await conn.execute(text("CREATE INDEX ix_users_spa_id ON users(spa_id)"))
                await conn.execute(text("ALTER TABLE users ADD CONSTRAINT fk_user_spa_id FOREIGN KEY (spa_id) REFERENCES spas(id) ON DELETE SET NULL"))
            
            # 3. Ensure user_spa_history table exists
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS user_spa_history (
                    user_id INT NOT NULL,
                    spa_id INT NOT NULL,
                    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (user_id, spa_id),
                    CONSTRAINT fk_history_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    CONSTRAINT fk_history_spa_id FOREIGN KEY (spa_id) REFERENCES spas(id) ON DELETE CASCADE
                ) ENGINE=InnoDB
            """))

            logger.info("✅ All tables and columns synchronized successfully!")

    except Exception as e:
        logger.error(f"❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        await close_db_connection()

if __name__ == "__main__":
    asyncio.run(run_migration())
