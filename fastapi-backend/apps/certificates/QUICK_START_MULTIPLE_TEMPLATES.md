# Quick Start: Multiple Template Variants

## What Changed?

✅ **Added `template_variant` field** to `CertificateTemplate` model
- Allows multiple UI designs for the same category
- Same data structure, different visual designs
- Backward compatible (existing templates work as-is)

## Quick Example: Adding Multiple Templates to a Category

### Step 1: Create Templates via API

```bash
# Template 1 - Modern Design
POST /api/certificates/templates
{
    "name": "Spa Therapist Certificate - Modern",
    "category": "spa_therapist",
    "template_type": "html",
    "template_variant": "modern",
    "template_html": "<html>...modern design HTML...</html>",
    "is_public": true
}

# Template 2 - Classic Design
POST /api/certificates/templates
{
    "name": "Spa Therapist Certificate - Classic",
    "category": "spa_therapist",
    "template_type": "html",
    "template_variant": "classic",
    "template_html": "<html>...classic design HTML...</html>",
    "is_public": true
}

# Template 3 - Minimal Design
POST /api/certificates/templates
{
    "name": "Spa Therapist Certificate - Minimal",
    "category": "spa_therapist",
    "template_type": "html",
    "template_variant": "minimal",
    "template_html": "<html>...minimal design HTML...</html>",
    "is_public": true
}
```

### Step 2: Get All Variants

```bash
GET /api/certificates/templates/by-category/spa_therapist
```

Response:
```json
{
    "default": [/* templates without variant */],
    "modern": [/* modern templates */],
    "classic": [/* classic templates */],
    "minimal": [/* minimal templates */]
}
```

### Step 3: Filter by Variant

```bash
GET /api/certificates/templates?category=spa_therapist&variant=modern
```

## Adding a New Category

### 1. Add to Enum (models.py)
```python
class CertificateCategory(str, PyEnum):
    # ... existing ...
    NEW_CATEGORY = "new_category"
```

### 2. Create Multiple Templates
Use the helper function or API to create variants:

```python
from apps.certificates.category_helper import create_category_templates

templates = await create_category_templates(
    db=db,
    category=CertificateCategory.NEW_CATEGORY,
    created_by=user_id,
    templates=[
        {"name": "New Category - V1", "template_variant": "v1", "template_html": "..."},
        {"name": "New Category - V2", "template_variant": "v2", "template_html": "..."},
    ]
)
```

## Key Points

1. **Same Data**: All variants use the same data fields
2. **Different UI**: Only the HTML/CSS changes
3. **Easy to Add**: Just create multiple templates with different `template_variant` values
4. **Backward Compatible**: Existing templates work (variant = null)

## Files Modified

1. ✅ `models.py` - Added `template_variant` field
2. ✅ `schemas.py` - Added `template_variant` to schemas
3. ✅ `certificate_service.py` - Added helper functions
4. ✅ `routers.py` - Added new endpoints
5. ✅ `category_helper.py` - Created helper utilities

## Database Migration

The `template_variant` field is nullable, so:
- ✅ No migration needed for existing databases
- ✅ Existing templates will have `template_variant = null`
- ✅ New templates can specify variants

If you want to add the column manually:
```sql
ALTER TABLE certificate_templates 
ADD COLUMN template_variant VARCHAR(100) NULL;
CREATE INDEX idx_template_variant ON certificate_templates(template_variant);
```
