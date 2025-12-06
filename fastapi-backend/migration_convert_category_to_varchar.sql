-- =====================================================
-- Migration: Convert certificate_templates.category from ENUM to VARCHAR
-- Date: 2024
-- Description: Converts category column from ENUM to VARCHAR to work with native_enum=False
-- =====================================================

-- This migration converts the category column from ENUM to VARCHAR
-- This is needed because SQLAlchemy with native_enum=False stores enum values as VARCHAR
-- The existing ENUM values will be preserved as string values

-- Step 1: Convert ENUM to VARCHAR
-- This preserves all existing data
ALTER TABLE `certificate_templates` 
MODIFY COLUMN `category` VARCHAR(50) NOT NULL;

-- Optional: Add a check constraint to ensure only valid values are stored
-- Uncomment if you want database-level validation
-- ALTER TABLE `certificate_templates`
-- ADD CONSTRAINT `chk_category_valid` CHECK (
--     `category` IN (
--         'spa_therapist',
--         'manager_salary',
--         'offer_letter',
--         'experience_letter',
--         'appointment_letter',
--         'invoice_spa_bill',
--         'id_card'
--     )
-- );

-- Note: If you have other tables with category columns (like spa_therapist_certificates, etc.),
-- you may need to convert those as well. Check your database schema.
