# Multiple Template Variants Guide

## Overview
The certificate system now supports **multiple UI template types per category**. This means you can have different visual designs (variants) for the same certificate category, all using the same data structure.

## How It Works

### Database Structure
- `CertificateTemplate` table has a new `template_variant` field
- Multiple templates can exist for the same `category` with different `template_variant` values
- Example: `SPA_THERAPIST` category can have:
  - Variant: `"modern"` - Modern design template
  - Variant: `"classic"` - Classic design template
  - Variant: `"minimal"` - Minimal design template
  - Variant: `None` - Default template (backward compatible)

### Key Concepts
1. **Category**: The certificate type (e.g., `SPA_THERAPIST`, `MANAGER_SALARY`)
2. **Template Variant**: The UI design type (e.g., `"modern"`, `"classic"`, `"v1"`, `"v2"`)
3. **Same Data**: All variants use the same data structure, just different HTML/CSS

## Adding Multiple Templates to a Category

### Method 1: Using the Helper Function (Recommended)

```python
from apps.certificates.category_helper import create_category_templates
from apps.certificates.models import CertificateCategory, TemplateType

# Create multiple variants for SPA_THERAPIST category
templates = await create_category_templates(
    db=db,
    category=CertificateCategory.SPA_THERAPIST,
    created_by=current_user.id,
    templates=[
        {
            "name": "Spa Therapist Certificate - Modern",
            "template_variant": "modern",
            "template_html": "<html>...modern design...</html>",
            "template_type": TemplateType.HTML
        },
        {
            "name": "Spa Therapist Certificate - Classic",
            "template_variant": "classic",
            "template_html": "<html>...classic design...</html>",
            "template_type": TemplateType.HTML
        },
        {
            "name": "Spa Therapist Certificate - Minimal",
            "template_variant": "minimal",
            "template_html": "<html>...minimal design...</html>",
            "template_type": TemplateType.HTML
        }
    ],
    is_public=True,
    is_active=True
)
```

### Method 2: Using API Endpoints

#### Create Template with Variant
```bash
POST /api/certificates/templates
{
    "name": "Spa Therapist Certificate - Modern",
    "category": "spa_therapist",
    "template_type": "html",
    "template_variant": "modern",
    "template_html": "<html>...your HTML...</html>",
    "is_public": true,
    "is_active": true
}
```

#### Get All Variants for a Category
```bash
GET /api/certificates/templates/by-category/spa_therapist
```

Response:
```json
{
    "default": [
        {
            "id": 1,
            "name": "Spa Therapist Certificate",
            "template_variant": null,
            ...
        }
    ],
    "modern": [
        {
            "id": 2,
            "name": "Spa Therapist Certificate - Modern",
            "template_variant": "modern",
            ...
        }
    ],
    "classic": [
        {
            "id": 3,
            "name": "Spa Therapist Certificate - Classic",
            "template_variant": "classic",
            ...
        }
    ]
}
```

#### Filter Templates by Category and Variant
```bash
GET /api/certificates/templates?category=spa_therapist&variant=modern
```

## Adding a New Category with Multiple Templates

### Step 1: Add Category to Enum
Edit `fastapi-backend/apps/certificates/models.py`:

```python
class CertificateCategory(str, PyEnum):
    # ... existing categories ...
    NEW_CATEGORY = "new_category"  # Add your new category
```

### Step 2: Create Certificate Model (if needed)
If you need a specific model for the category, add it to `models.py`:

```python
class NewCategoryCertificate(CertificateBase):
    __tablename__ = "new_category_certificates"
    
    category = Column(SQLEnum(CertificateCategory, ...), default=CertificateCategory.NEW_CATEGORY)
    
    # Add your specific fields here
    field1 = Column(String(255))
    field2 = Column(String(255))
    
    template = relationship("CertificateTemplate", back_populates="new_category_certificates")
```

### Step 3: Create Multiple Template Variants
Use the helper function or API to create multiple templates:

```python
from apps.certificates.category_helper import create_category_templates, get_category_template_structure

# Check what fields are needed
structure = get_category_template_structure(CertificateCategory.NEW_CATEGORY)

# Create multiple variants
templates = await create_category_templates(
    db=db,
    category=CertificateCategory.NEW_CATEGORY,
    created_by=user_id,
    templates=[
        {
            "name": "New Category - Variant 1",
            "template_variant": "v1",
            "template_html": "<html>Variant 1 HTML</html>",
            "template_type": TemplateType.HTML
        },
        {
            "name": "New Category - Variant 2",
            "template_variant": "v2",
            "template_html": "<html>Variant 2 HTML</html>",
            "template_type": TemplateType.HTML
        }
    ]
)
```

## API Endpoints

### List Templates (with filters)
```
GET /api/certificates/templates
GET /api/certificates/templates?category=spa_therapist
GET /api/certificates/templates?category=spa_therapist&variant=modern
```

### Get Templates by Category (grouped by variant)
```
GET /api/certificates/templates/by-category/{category}
```

### Create Template
```
POST /api/certificates/templates
Body: {
    "name": "...",
    "category": "...",
    "template_variant": "modern",  // Optional
    "template_html": "...",
    ...
}
```

### Update Template
```
PUT /api/certificates/templates/{id}
Body: {
    "template_variant": "updated_variant",  // Can update variant
    ...
}
```

## Best Practices

1. **Naming Convention**: Use descriptive variant names
   - Good: `"modern"`, `"classic"`, `"minimal"`, `"v1"`, `"v2"`
   - Avoid: `"template1"`, `"new"`, `"test"`

2. **Default Template**: Keep at least one template with `template_variant = null` for backward compatibility

3. **Same Data Structure**: All variants for a category must use the same data fields

4. **Template Config**: Use `template_config` JSON field to store variant-specific settings

## Example: Complete Workflow

```python
# 1. Get category structure
from apps.certificates.category_helper import get_category_template_structure
structure = get_category_template_structure(CertificateCategory.SPA_THERAPIST)
print(structure["fields"])  # See what fields are available

# 2. Create multiple variants
templates = await create_category_templates(
    db=db,
    category=CertificateCategory.SPA_THERAPIST,
    created_by=user_id,
    templates=[
        {
            "name": "Spa Therapist - Modern Design",
            "template_variant": "modern",
            "template_html": load_html_template("spa_therapist_modern.html"),
            "template_type": TemplateType.HTML
        },
        {
            "name": "Spa Therapist - Classic Design",
            "template_variant": "classic",
            "template_html": load_html_template("spa_therapist_classic.html"),
            "template_type": TemplateType.HTML
        }
    ]
)

# 3. Frontend can now show all variants and let user choose
# GET /api/certificates/templates/by-category/spa_therapist
```

## Migration Notes

- Existing templates will have `template_variant = null` (backward compatible)
- No database migration needed if column is nullable
- All existing functionality continues to work
- New `template_variant` field is optional

## Helper Functions

Located in `fastapi-backend/apps/certificates/category_helper.py`:

1. `create_category_templates()` - Create multiple variants at once
2. `get_category_template_structure()` - Get required fields for a category
3. `generate_template_variant_names()` - Generate template names from variants
