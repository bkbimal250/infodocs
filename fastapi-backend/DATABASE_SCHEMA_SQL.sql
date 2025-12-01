-- =====================================================
-- Database Schema SQL Reference
-- This file shows the SQL structure equivalent to the SQLAlchemy models
-- Note: Tables are created automatically by SQLAlchemy, this is for reference only
-- =====================================================

-- =====================================================
-- 1. USERS MODULE
-- =====================================================

-- Table: users
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(100) NOT NULL UNIQUE,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('super_admin', 'admin', 'spa_manager', 'user') NOT NULL DEFAULT 'user',
    `phone_number` VARCHAR(20) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `is_verified` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    INDEX `ix_users_id` (`id`),
    INDEX `ix_users_username` (`username`),
    INDEX `ix_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: otps
CREATE TABLE IF NOT EXISTS `otps` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `code` VARCHAR(10) NOT NULL,
    `purpose` VARCHAR(50) NOT NULL,
    `is_used` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `expires_at` DATETIME(6) NOT NULL,
    INDEX `ix_otps_id` (`id`),
    INDEX `ix_otps_user_id` (`user_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. FORMS APP MODULE
-- =====================================================

-- Table: spas
CREATE TABLE IF NOT EXISTS `spas` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `address` TEXT NULL,
    `city` VARCHAR(100) NULL,
    `state` VARCHAR(100) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    INDEX `ix_spas_id` (`id`),
    INDEX `ix_spas_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: candidate_forms
CREATE TABLE IF NOT EXISTS `candidate_forms` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `spa_id` INT NULL,
    `spa_name_text` VARCHAR(255) NULL,
    `first_name` VARCHAR(100) NOT NULL,
    `middle_name` VARCHAR(100) NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `current_address` TEXT NOT NULL,
    `aadhar_address` TEXT NULL,
    `city` VARCHAR(100) NOT NULL,
    `zip_code` VARCHAR(20) NOT NULL,
    `state` VARCHAR(100) NOT NULL,
    `country` VARCHAR(100) NOT NULL DEFAULT 'India',
    `phone_number` VARCHAR(20) NOT NULL,
    `work_experience` VARCHAR(255) NOT NULL,
    `Therapist_experience` VARCHAR(255) NOT NULL,
    `alternate_number` VARCHAR(20) NULL,
    `age` INT NOT NULL,
    `position_applied_for` VARCHAR(255) NOT NULL,
    `education_certificate_courses` TEXT NULL,
    `passport_size_photo` VARCHAR(500) NULL,
    `age_proof_document` VARCHAR(500) NULL,
    `aadhar_card_front` VARCHAR(500) NULL,
    `aadhar_card_back` VARCHAR(500) NULL,
    `pan_card` VARCHAR(500) NULL,
    `signature` VARCHAR(500) NULL,
    `documents` JSON NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    INDEX `ix_candidate_forms_id` (`id`),
    INDEX `ix_candidate_forms_spa_id` (`spa_id`),
    FOREIGN KEY (`spa_id`) REFERENCES `spas`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: hiring_forms
CREATE TABLE IF NOT EXISTS `hiring_forms` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `spa_id` INT NULL,
    `for_role` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `required_experience` VARCHAR(255) NOT NULL,
    `required_education` VARCHAR(255) NOT NULL,
    `required_skills` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    INDEX `ix_hiring_forms_id` (`id`),
    INDEX `ix_hiring_forms_spa_id` (`spa_id`),
    FOREIGN KEY (`spa_id`) REFERENCES `spas`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. CERTIFICATES MODULE
-- =====================================================

-- Table: certificate_templates
CREATE TABLE IF NOT EXISTS `certificate_templates` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `category` ENUM(
        'Spa Therapist & Beautician',
        'manager Salary Certificate',
        'offer Letter',
        'Letter of Experience',
        'Appointment Letter',
        'invoice spa bill'
    ) NOT NULL,
    `template_image` VARCHAR(500) NULL,
    `template_html` TEXT NULL,
    `template_type` ENUM('image', 'html') NOT NULL DEFAULT 'image',
    `created_by` INT NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `is_public` BOOLEAN NOT NULL DEFAULT TRUE,
    `template_config` JSON NOT NULL DEFAULT (JSON_OBJECT()),
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    INDEX `ix_certificate_templates_id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: generated_certificates
CREATE TABLE IF NOT EXISTS `generated_certificates` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `template_id` INT NOT NULL,
    `candidate_id` INT NULL,
    `candidate_name` VARCHAR(255) NULL,
    `candidate_email` VARCHAR(255) NULL,
    `certificate_pdf` VARCHAR(500) NULL,
    `qr_code` VARCHAR(500) NULL,
    `qr_code_data` TEXT NULL,
    `certificate_data` JSON NOT NULL DEFAULT (JSON_OBJECT()),
    `generated_by` INT NULL,
    `is_public` BOOLEAN NOT NULL DEFAULT FALSE,
    `generated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `is_verified` BOOLEAN NOT NULL DEFAULT FALSE,
    `verified_at` DATETIME(6) NULL,
    INDEX `ix_generated_certificates_id` (`id`),
    INDEX `ix_generated_certificates_template_id` (`template_id`),
    INDEX `ix_generated_certificates_candidate_id` (`candidate_id`)
    -- Note: No foreign keys defined for template_id, candidate_id, or generated_by
    -- These are soft references (application-level only)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- RELATIONSHIP SUMMARY
-- =====================================================

-- Explicit Foreign Key Relationships:
-- 1. otps.user_id → users.id (CASCADE DELETE)
-- 2. candidate_forms.spa_id → spas.id (NULLABLE)
-- 3. hiring_forms.spa_id → spas.id (NULLABLE)

-- Soft References (no foreign keys):
-- 1. certificate_templates.created_by → users.id
-- 2. generated_certificates.template_id → certificate_templates.id
-- 3. generated_certificates.candidate_id → users.id
-- 4. generated_certificates.generated_by → users.id

