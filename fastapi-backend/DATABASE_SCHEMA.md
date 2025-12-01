# Database Schema Documentation

## Overview
This document describes all database tables, their columns, relationships, and constraints in the FastAPI backend application.

## Database: MySQL (using SQLAlchemy ORM)

---

## Table Relationships Diagram

```
┌─────────────┐
│    users    │
│             │
│  id (PK)    │
│  username   │
│  email      │
│  role       │
│  ...        │
└──────┬──────┘
       │
       │ 1:N (CASCADE DELETE)
       │
       ▼
┌─────────────┐
│    otps     │
│             │
│  id (PK)    │
│  user_id(FK)│
│  code       │
│  purpose    │
│  ...        │
└─────────────┘

┌─────────────┐
│    spas     │
│             │
│  id (PK)    │
│  name       │
│  address    │
│  city       │
│  state      │
│  is_active  │
│  ...        │
└──────┬──────┘
       │
       │ 1:N
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌─────────────┐  ┌─────────────┐
│candidate_   │  │hiring_forms │
│  forms      │  │             │
│             │  │  id (PK)    │
│  id (PK)    │  │  spa_id(FK) │
│  spa_id(FK) │  │  for_role   │
│  first_name │  │  description│
│  last_name  │  │  ...        │
│  ...        │  └─────────────┘
└─────────────┘

┌──────────────────────┐
│certificate_templates │
│                      │
│  id (PK)             │
│  name                │
│  category            │
│  template_type       │
│  created_by          │
│  ...                 │
└──────────────────────┘
       │
       │ (referenced by template_id)
       │
       ▼
┌──────────────────────┐
│generated_certificates│
│                      │
│  id (PK)             │
│  template_id         │
│  candidate_id        │
│  generated_by        │
│  ...                 │
└──────────────────────┘
```

---

## 1. Users Module

### Table: `users`

**Description**: Stores user account information including authentication and profile data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | Integer | PRIMARY KEY, AUTO_INCREMENT, INDEX | Unique user identifier |
| `username` | String(100) | UNIQUE, INDEX, NOT NULL | Username for login |
| `email` | String(255) | UNIQUE, INDEX, NOT NULL | User email address |
| `first_name` | String(100) | NOT NULL | User's first name |
| `last_name` | String(100) | NOT NULL | User's last name |
| `password_hash` | String(255) | NOT NULL | Hashed password |
| `role` | Enum | NOT NULL, DEFAULT='user' | User role: `super_admin`, `admin`, `spa_manager`, `user` |
| `phone_number` | String(20) | NULLABLE | Contact phone number |
| `is_active` | Boolean | NOT NULL, DEFAULT=True | Account active status |
| `is_verified` | Boolean | NOT NULL, DEFAULT=False | Email/account verification status |
| `created_at` | DateTime(timezone) | NOT NULL, DEFAULT=now() | Record creation timestamp |
| `updated_at` | DateTime(timezone) | NOT NULL, DEFAULT=now(), ON UPDATE=now() | Last update timestamp |

**Relationships**:
- **One-to-Many** with `otps` table (via `user_id` foreign key)
  - One user can have multiple OTP records
  - Cascade delete: When a user is deleted, all their OTPs are deleted

**Indexes**:
- Primary key on `id`
- Unique index on `username`
- Unique index on `email`

---

### Table: `otps`

**Description**: Stores One-Time Password (OTP) codes for email verification, password reset, and login verification.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | Integer | PRIMARY KEY, AUTO_INCREMENT | Unique OTP identifier |
| `user_id` | Integer | FOREIGN KEY, NOT NULL, INDEX | Reference to `users.id` |
| `code` | String(10) | NOT NULL | OTP code value |
| `purpose` | String(50) | NOT NULL | Purpose: `email_verification`, `password_reset`, `login` |
| `is_used` | Boolean | NOT NULL, DEFAULT=False | Whether OTP has been used |
| `created_at` | DateTime(timezone) | NOT NULL, DEFAULT=now() | OTP creation timestamp |
| `expires_at` | DateTime(timezone) | NOT NULL | OTP expiration timestamp |

**Foreign Keys**:
- `user_id` → `users.id` (ON DELETE CASCADE)
  - When a user is deleted, all their OTP records are automatically deleted

**Relationships**:
- **Many-to-One** with `users` table
  - Many OTPs belong to one user

**Indexes**:
- Primary key on `id`
- Index on `user_id` (for faster lookups)

---

## 2. Forms App Module

### Table: `spas`

**Description**: Stores SPA (Spa/Wellness Center) location information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | Integer | PRIMARY KEY, AUTO_INCREMENT, INDEX | Unique SPA identifier |
| `name` | String(255) | NOT NULL, INDEX | SPA name |
| `address` | Text | NULLABLE | Full address |
| `city` | String(100) | NULLABLE | City name |
| `state` | String(100) | NULLABLE | State name |
| `is_active` | Boolean | NOT NULL, DEFAULT=True | SPA active status |
| `created_at` | DateTime(timezone) | NOT NULL, DEFAULT=now() | Record creation timestamp |
| `updated_at` | DateTime(timezone) | NOT NULL, DEFAULT=now(), ON UPDATE=now() | Last update timestamp |

**Relationships**:
- **One-to-Many** with `candidate_forms` table
  - One SPA can have multiple candidate form submissions
- **One-to-Many** with `hiring_forms` table
  - One SPA can post multiple hiring requirements

**Indexes**:
- Primary key on `id`
- Index on `name` (for faster searches)

---

### Table: `candidate_forms`

**Description**: Stores candidate job application form submissions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | Integer | PRIMARY KEY, AUTO_INCREMENT | Unique form identifier |
| `spa_id` | Integer | FOREIGN KEY, NULLABLE, INDEX | Reference to `spas.id` |
| `spa_name_text` | String(255) | NULLABLE | SPA name as text (if not found in DB) |
| `first_name` | String(100) | NOT NULL | Candidate's first name |
| `middle_name` | String(100) | NULLABLE | Candidate's middle name |
| `last_name` | String(100) | NOT NULL | Candidate's last name |
| `current_address` | Text | NOT NULL | Current residential address |
| `aadhar_address` | Text | NULLABLE | Address as per Aadhar card |
| `city` | String(100) | NOT NULL | City name |
| `zip_code` | String(20) | NOT NULL | Postal/ZIP code |
| `state` | String(100) | NOT NULL | State name |
| `country` | String(100) | NOT NULL, DEFAULT='India' | Country name |
| `phone_number` | String(20) | NOT NULL | Primary contact number |
| `alternate_number` | String(20) | NULLABLE | Alternate contact number |
| `age` | Integer | NOT NULL | Candidate's age |
| `work_experience` | String(255) | NOT NULL | General work experience |
| `Therapist_experience` | String(255) | NOT NULL | Therapist-specific experience |
| `position_applied_for` | String(255) | NOT NULL | Job position applied for |
| `education_certificate_courses` | Text | NULLABLE | Education and certificate details |
| `passport_size_photo` | String(500) | NULLABLE | File path to photo |
| `age_proof_document` | String(500) | NULLABLE | File path to age proof |
| `aadhar_card_front` | String(500) | NULLABLE | File path to Aadhar front |
| `aadhar_card_back` | String(500) | NULLABLE | File path to Aadhar back |
| `pan_card` | String(500) | NULLABLE | File path to PAN card |
| `signature` | String(500) | NULLABLE | File path to signature |
| `documents` | JSON | NULLABLE | Additional documents array |
| `created_at` | DateTime(timezone) | NOT NULL, DEFAULT=now() | Form submission timestamp |
| `updated_at` | DateTime(timezone) | NOT NULL, DEFAULT=now(), ON UPDATE=now() | Last update timestamp |

**Foreign Keys**:
- `spa_id` → `spas.id` (NULLABLE)
  - Links candidate form to a SPA location
  - Can be NULL if SPA is not found in database (uses `spa_name_text` instead)

**Relationships**:
- **Many-to-One** with `spas` table
  - Many candidate forms can belong to one SPA

**Indexes**:
- Primary key on `id`
- Index on `spa_id` (for faster lookups)

---

### Table: `hiring_forms`

**Description**: Stores hiring requirements posted by SPAs.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | Integer | PRIMARY KEY, AUTO_INCREMENT | Unique hiring form identifier |
| `spa_id` | Integer | FOREIGN KEY, NULLABLE, INDEX | Reference to `spas.id` |
| `for_role` | String(255) | NOT NULL | Job role: "Therapist", "Receptionist", "Manager", etc. |
| `description` | Text | NOT NULL | Job description and requirements |
| `required_experience` | String(255) | NOT NULL | Required experience: "1 year", "2 years", etc. |
| `required_education` | String(255) | NOT NULL | Required education: "Bachelor's Degree", "Diploma", etc. |
| `required_skills` | String(255) | NOT NULL | Required skills: "Customer Service", "Communication", etc. |
| `created_at` | DateTime(timezone) | NOT NULL, DEFAULT=now() | Form creation timestamp |
| `updated_at` | DateTime(timezone) | NOT NULL, DEFAULT=now(), ON UPDATE=now() | Last update timestamp |

**Foreign Keys**:
- `spa_id` → `spas.id` (NULLABLE)
  - Links hiring form to a SPA location

**Relationships**:
- **Many-to-One** with `spas` table
  - Many hiring forms can belong to one SPA

**Indexes**:
- Primary key on `id`
- Index on `spa_id` (for faster lookups)

---

## 3. Certificates Module

### Table: `certificate_templates`

**Description**: Stores certificate template definitions for generating various types of certificates.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | Integer | PRIMARY KEY, AUTO_INCREMENT, INDEX | Unique template identifier |
| `name` | String(255) | NOT NULL | Template name |
| `description` | Text | NULLABLE | Template description |
| `category` | Enum | NOT NULL | Certificate category (see enum values below) |
| `template_image` | String(500) | NULLABLE | File path to template image |
| `template_html` | Text | NULLABLE | HTML template content |
| `template_type` | Enum | NOT NULL, DEFAULT='image' | Template type: `image` or `html` |
| `created_by` | Integer | NOT NULL | User ID who created the template |
| `is_active` | Boolean | NOT NULL, DEFAULT=True | Template active status |
| `is_public` | Boolean | NOT NULL, DEFAULT=True | Template visibility |
| `template_config` | JSON | NOT NULL, DEFAULT={} | Template configuration JSON |
| `created_at` | DateTime(timezone) | NOT NULL, DEFAULT=now() | Template creation timestamp |
| `updated_at` | DateTime(timezone) | NOT NULL, DEFAULT=now(), ON UPDATE=now() | Last update timestamp |

**CertificateCategory Enum Values**:
- `Spa Therapist & Beautician`
- `manager Salary Certificate`
- `offer Letter`
- `Letter of Experience`
- `Appointment Letter`
- `invoice spa bill`

**TemplateType Enum Values**:
- `image`
- `html`

**Note**: 
- `created_by` references `users.id` but is **NOT** a foreign key (just an integer reference)
- This table is standalone (no foreign key relationships defined)

**Indexes**:
- Primary key on `id`
- Index on `id` (for faster lookups)

---

### Table: `generated_certificates`

**Description**: Stores generated certificate records with PDF files and metadata.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | Integer | PRIMARY KEY, AUTO_INCREMENT | Unique certificate identifier |
| `template_id` | Integer | NOT NULL, INDEX | Reference to `certificate_templates.id` |
| `candidate_id` | Integer | NULLABLE, INDEX | User ID (candidate) who received certificate |
| `candidate_name` | String(255) | NULLABLE | Candidate's name |
| `candidate_email` | String(255) | NULLABLE | Candidate's email |
| `certificate_pdf` | String(500) | NULLABLE | File path to generated PDF |
| `qr_code` | String(500) | NULLABLE | File path to QR code image |
| `qr_code_data` | Text | NULLABLE | QR code data/content |
| `certificate_data` | JSON | NOT NULL, DEFAULT={} | Certificate data/metadata JSON |
| `generated_by` | Integer | NULLABLE | User ID who generated the certificate |
| `is_public` | Boolean | NOT NULL, DEFAULT=False | Certificate visibility |
| `generated_at` | DateTime(timezone) | NOT NULL, DEFAULT=now() | Certificate generation timestamp |
| `is_verified` | Boolean | NOT NULL, DEFAULT=False | Certificate verification status |
| `verified_at` | DateTime(timezone) | NULLABLE | Certificate verification timestamp |

**Note**: 
- `template_id` references `certificate_templates.id` but is **NOT** a foreign key (just an integer reference)
- `candidate_id` references `users.id` but is **NOT** a foreign key (just an integer reference)
- `generated_by` references `users.id` but is **NOT** a foreign key (just an integer reference)
- These are soft references (no database-level constraints)

**Indexes**:
- Primary key on `id`
- Index on `template_id` (for faster lookups)
- Index on `candidate_id` (for faster lookups)

---

## Summary of Relationships

### Explicit Foreign Key Relationships (with constraints):

1. **users** ←→ **otps**
   - Type: One-to-Many
   - Foreign Key: `otps.user_id` → `users.id`
   - Cascade: DELETE CASCADE (when user is deleted, OTPs are deleted)

2. **spas** ←→ **candidate_forms**
   - Type: One-to-Many
   - Foreign Key: `candidate_forms.spa_id` → `spas.id`
   - Cascade: None (nullable foreign key)

3. **spas** ←→ **hiring_forms**
   - Type: One-to-Many
   - Foreign Key: `hiring_forms.spa_id` → `spas.id`
   - Cascade: None (nullable foreign key)

### Soft References (no foreign key constraints):

1. **certificate_templates.created_by** → `users.id` (integer reference)
2. **generated_certificates.template_id** → `certificate_templates.id` (integer reference)
3. **generated_certificates.candidate_id** → `users.id` (integer reference)
4. **generated_certificates.generated_by** → `users.id` (integer reference)

---

## Table Creation

Tables are automatically created when the FastAPI application starts using SQLAlchemy's `Base.metadata.create_all()` method in the `init_db()` function.

**Location**: `fastapi-backend/config/database.py`

**Initialization**: Called during application startup in `main.py` lifespan context manager.

---

## Notes

1. **Soft References**: The certificates module uses integer references instead of foreign keys for `template_id`, `candidate_id`, and `generated_by`. This means:
   - No database-level referential integrity
   - No cascade deletes
   - Application code must handle orphaned records

2. **Nullable Foreign Keys**: Both `candidate_forms.spa_id` and `hiring_forms.spa_id` are nullable, allowing forms to exist without a linked SPA (using text fields as fallback).

3. **Cascade Deletes**: Only the `users` → `otps` relationship has CASCADE DELETE enabled.

4. **Timestamps**: All tables use timezone-aware DateTime columns with automatic `created_at` and `updated_at` timestamps.

5. **File Storage**: File paths are stored as strings (up to 500 characters) rather than BLOB data, indicating files are stored on the filesystem.

