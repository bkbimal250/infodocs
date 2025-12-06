-- =====================================================
-- SQL Commands to Fix certificate_templates Table
-- Copy and paste these commands into your MySQL client
-- =====================================================

-- Step 1: Find and drop foreign key constraints
-- Run this query first to see your actual FK constraint names:
SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME
FROM information_schema.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = DATABASE()
AND REFERENCED_TABLE_NAME = 'certificate_templates';

-- Step 2: Drop foreign keys (replace CONSTRAINT_NAME with actual names from Step 1)
-- Example (adjust constraint names based on Step 1 results):
-- ALTER TABLE `spa_therapist_certificates` DROP FOREIGN KEY `your_constraint_name_here`;
-- ALTER TABLE `manager_salary_certificates` DROP FOREIGN KEY `your_constraint_name_here`;
-- ALTER TABLE `experience_letter_certificates` DROP FOREIGN KEY `your_constraint_name_here`;
-- ALTER TABLE `appointment_letter_certificates` DROP FOREIGN KEY `your_constraint_name_here`;
-- ALTER TABLE `invoice_spa_bill_certificates` DROP FOREIGN KEY `your_constraint_name_here`;
-- ALTER TABLE `id_card_certificates` DROP FOREIGN KEY `your_constraint_name_here`;
-- ALTER TABLE `generated_certificates` DROP FOREIGN KEY `your_constraint_name_here`;

-- Step 3: Drop the table
DROP TABLE IF EXISTS `certificate_templates`;

-- Step 4: Recreate the table with VARCHAR instead of ENUM
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Done! The table is now recreated with VARCHAR columns instead of ENUM.
-- Restart your FastAPI server and try creating templates again.
