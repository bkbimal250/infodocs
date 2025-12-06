-- =====================================================
-- SQL Script to Drop and Recreate certificate_templates table
-- Run this in your MySQL client to fix enum validation issues
-- =====================================================

-- Step 1: Drop foreign key constraints (if they exist)
-- Note: Adjust constraint names based on your actual database

ALTER TABLE `spa_therapist_certificates` DROP FOREIGN KEY IF EXISTS `spa_therapist_certificates_ibfk_1`;
ALTER TABLE `manager_salary_certificates` DROP FOREIGN KEY IF EXISTS `manager_salary_certificates_ibfk_1`;
ALTER TABLE `experience_letter_certificates` DROP FOREIGN KEY IF EXISTS `experience_letter_certificates_ibfk_1`;
ALTER TABLE `appointment_letter_certificates` DROP FOREIGN KEY IF EXISTS `appointment_letter_certificates_ibfk_1`;
ALTER TABLE `invoice_spa_bill_certificates` DROP FOREIGN KEY IF EXISTS `invoice_spa_bill_certificates_ibfk_1`;
ALTER TABLE `id_card_certificates` DROP FOREIGN KEY IF EXISTS `id_card_certificates_ibfk_1`;
ALTER TABLE `generated_certificates` DROP FOREIGN KEY IF EXISTS `generated_certificates_ibfk_1`;

-- Step 2: Drop the table
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

-- Step 4: Recreate foreign key constraints (optional, only if tables exist)
-- Uncomment and adjust constraint names as needed:

-- ALTER TABLE `spa_therapist_certificates` 
-- ADD CONSTRAINT `fk_spa_therapist_certificates_template` 
-- FOREIGN KEY (`template_id`) REFERENCES `certificate_templates`(`id`) ON DELETE SET NULL;

-- ALTER TABLE `manager_salary_certificates` 
-- ADD CONSTRAINT `fk_manager_salary_certificates_template` 
-- FOREIGN KEY (`template_id`) REFERENCES `certificate_templates`(`id`) ON DELETE SET NULL;

-- ALTER TABLE `experience_letter_certificates` 
-- ADD CONSTRAINT `fk_experience_letter_certificates_template` 
-- FOREIGN KEY (`template_id`) REFERENCES `certificate_templates`(`id`) ON DELETE SET NULL;

-- ALTER TABLE `appointment_letter_certificates` 
-- ADD CONSTRAINT `fk_appointment_letter_certificates_template` 
-- FOREIGN KEY (`template_id`) REFERENCES `certificate_templates`(`id`) ON DELETE SET NULL;

-- ALTER TABLE `invoice_spa_bill_certificates` 
-- ADD CONSTRAINT `fk_invoice_spa_bill_certificates_template` 
-- FOREIGN KEY (`template_id`) REFERENCES `certificate_templates`(`id`) ON DELETE SET NULL;

-- ALTER TABLE `id_card_certificates` 
-- ADD CONSTRAINT `fk_id_card_certificates_template` 
-- FOREIGN KEY (`template_id`) REFERENCES `certificate_templates`(`id`) ON DELETE SET NULL;

-- ALTER TABLE `generated_certificates` 
-- ADD CONSTRAINT `fk_generated_certificates_template` 
-- FOREIGN KEY (`template_id`) REFERENCES `certificate_templates`(`id`) ON DELETE SET NULL;
