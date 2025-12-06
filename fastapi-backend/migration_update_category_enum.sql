-- =====================================================
-- Migration: Update certificate_templates.category ENUM
-- Date: 2024
-- Description: Updates the category ENUM to match Python CertificateCategory enum values
-- =====================================================

-- This migration updates the category ENUM in certificate_templates table
-- to include all values from the Python CertificateCategory enum:
-- - spa_therapist
-- - manager_salary
-- - offer_letter
-- - experience_letter
-- - appointment_letter
-- - invoice_spa_bill
-- - id_card (NEW - this is the missing value causing the error)

-- Step 1: Modify the ENUM column to include all new values
-- Note: MySQL requires you to specify ALL enum values when modifying
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

-- If the above fails due to existing data with old enum values, you may need to:
-- 1. First update existing rows to new enum values
-- 2. Then modify the ENUM

-- Optional: Update existing rows if they have old enum values
-- Uncomment and modify these if you have existing data with old values:

-- UPDATE `certificate_templates` 
-- SET `category` = 'spa_therapist' 
-- WHERE `category` = 'Spa Therapist & Beautician';

-- UPDATE `certificate_templates` 
-- SET `category` = 'manager_salary' 
-- WHERE `category` = 'manager Salary Certificate';

-- UPDATE `certificate_templates` 
-- SET `category` = 'offer_letter' 
-- WHERE `category` = 'offer Letter';

-- UPDATE `certificate_templates` 
-- SET `category` = 'experience_letter' 
-- WHERE `category` = 'Letter of Experience';

-- UPDATE `certificate_templates` 
-- SET `category` = 'appointment_letter' 
-- WHERE `category` = 'Appointment Letter';

-- UPDATE `certificate_templates` 
-- SET `category` = 'invoice_spa_bill' 
-- WHERE `category` = 'invoice spa bill';
