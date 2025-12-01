# Database Relations Summary

## Quick Reference Guide

### Total Tables: 7

1. **users** - User accounts and authentication
2. **otps** - One-time passwords for verification
3. **spas** - SPA/Wellness center locations
4. **candidate_forms** - Job application forms from candidates
5. **hiring_forms** - Job postings/requirements from SPAs
6. **certificate_templates** - Certificate template definitions
7. **generated_certificates** - Generated certificate records

---

## Relationship Map

```
USERS MODULE
├── users (1) ──< (many) otps
│   └── CASCADE DELETE: Deleting user deletes all their OTPs

FORMS MODULE
├── spas (1) ──< (many) candidate_forms
│   └── NULLABLE: Forms can exist without SPA link
└── spas (1) ──< (many) hiring_forms
    └── NULLABLE: Forms can exist without SPA link

CERTIFICATES MODULE
├── certificate_templates (standalone)
│   └── created_by → users.id (soft reference, no FK)
└── generated_certificates
    ├── template_id → certificate_templates.id (soft reference, no FK)
    ├── candidate_id → users.id (soft reference, no FK)
    └── generated_by → users.id (soft reference, no FK)
```

---

## Foreign Key Relationships (Database Enforced)

| Parent Table | Child Table | Foreign Key Column | Cascade Action |
|--------------|-------------|-------------------|----------------|
| `users` | `otps` | `otps.user_id` | DELETE CASCADE |
| `spas` | `candidate_forms` | `candidate_forms.spa_id` | None (nullable) |
| `spas` | `hiring_forms` | `hiring_forms.spa_id` | None (nullable) |

---

## Soft References (Application Level Only)

| Table | Column | References | Notes |
|-------|--------|------------|-------|
| `certificate_templates` | `created_by` | `users.id` | No FK constraint |
| `generated_certificates` | `template_id` | `certificate_templates.id` | No FK constraint |
| `generated_certificates` | `candidate_id` | `users.id` | No FK constraint |
| `generated_certificates` | `generated_by` | `users.id` | No FK constraint |

---

## Key Points

### ✅ Strong Relationships (with Foreign Keys)
- **users → otps**: Strong relationship with CASCADE DELETE
- **spas → candidate_forms**: Foreign key exists but nullable
- **spas → hiring_forms**: Foreign key exists but nullable

### ⚠️ Weak Relationships (Soft References)
- Certificate module uses integer references instead of foreign keys
- Application code must handle referential integrity
- No automatic cascade deletes
- Orphaned records possible if referenced records are deleted

### 📝 Design Decisions
1. **Nullable SPA references**: Allows forms to be submitted even if SPA doesn't exist in database (uses `spa_name_text` as fallback)
2. **Soft references in certificates**: Provides flexibility but requires careful application-level handling
3. **CASCADE DELETE only on OTPs**: Prevents orphaned OTP records when users are deleted

---

## Table Creation

Tables are automatically created on application startup via:
- **File**: `config/database.py`
- **Function**: `init_db()`
- **Method**: `Base.metadata.create_all()`
- **Trigger**: Application lifespan startup event in `main.py`

All models are imported in `config/database.py` to ensure they're registered with SQLAlchemy's Base metadata before table creation.

