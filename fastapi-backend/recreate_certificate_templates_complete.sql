-- =====================================================
-- Complete SQL Script to Recreate certificate_templates Table
-- Run all commands below in order
-- =====================================================

-- Step 1: Drop all foreign key constraints
ALTER TABLE `appointment_letter_certificates` DROP FOREIGN KEY `appointment_letter_certificates_ibfk_2`;
ALTER TABLE `experience_letter_certificates` DROP FOREIGN KEY `experience_letter_certificates_ibfk_2`;
ALTER TABLE `generated_certificates` DROP FOREIGN KEY `generated_certificates_ibfk_1`;
ALTER TABLE `id_card_certificates` DROP FOREIGN KEY `fk_idcard_template`;
ALTER TABLE `invoice_spa_bill_certificates` DROP FOREIGN KEY `invoice_spa_bill_certificates_ibfk_2`;
ALTER TABLE `manager_salary_certificates` DROP FOREIGN KEY `manager_salary_certificates_ibfk_2`;
ALTER TABLE `spa_therapist_certificates` DROP FOREIGN KEY `spa_therapist_certificates_ibfk_1`;

-- Step 2: Drop the certificate_templates table
DROP TABLE IF EXISTS `certificate_templates`;

-- Step 3: Recreate the table with VARCHAR instead of ENUM
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

-- Step 4: Recreate foreign key constraints (optional - only if you need them)
-- Uncomment these if you want to restore the foreign key relationships:

-- ALTER TABLE `appointment_letter_certificates` 
-- ADD CONSTRAINT `appointment_letter_certificates_ibfk_2` 
-- FOREIGN KEY (`template_id`) REFERENCES `certificate_templates`(`id`) ON DELETE SET NULL;

-- ALTER TABLE `experience_letter_certificates` 
-- ADD CONSTRAINT `experience_letter_certificates_ibfk_2` 
-- FOREIGN KEY (`template_id`) REFERENCES `certificate_templates`(`id`) ON DELETE SET NULL;

-- ALTER TABLE `generated_certificates` 
-- ADD CONSTRAINT `generated_certificates_ibfk_1` 
-- FOREIGN KEY (`template_id`) REFERENCES `certificate_templates`(`id`) ON DELETE SET NULL;

-- ALTER TABLE `id_card_certificates` 
-- ADD CONSTRAINT `fk_idcard_template` 
-- FOREIGN KEY (`template_id`) REFERENCES `certificate_templates`(`id`) ON DELETE SET NULL;

-- ALTER TABLE `invoice_spa_bill_certificates` 
-- ADD CONSTRAINT `invoice_spa_bill_certificates_ibfk_2` 
-- FOREIGN KEY (`template_id`) REFERENCES `certificate_templates`(`id`) ON DELETE SET NULL;

-- ALTER TABLE `manager_salary_certificates` 
-- ADD CONSTRAINT `manager_salary_certificates_ibfk_2` 
-- FOREIGN KEY (`template_id`) REFERENCES `certificate_templates`(`id`) ON DELETE SET NULL;

-- ALTER TABLE `spa_therapist_certificates` 
-- ADD CONSTRAINT `spa_therapist_certificates_ibfk_1` 
-- FOREIGN KEY (`template_id`) REFERENCES `certificate_templates`(`id`) ON DELETE SET NULL;

-- =====================================================
-- Done! The table is now recreated with VARCHAR columns.
-- Restart your FastAPI server and try creating templates again.
-- =====================================================
