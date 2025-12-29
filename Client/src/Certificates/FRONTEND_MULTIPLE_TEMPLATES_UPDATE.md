# Frontend Multiple Template Variants Update

## Overview
Updated the frontend certificate system to support multiple UI template variants per category. Users can now filter templates by category and variant (UI type).

## Changes Made

### 1. **certificateConstants.js**
- ✅ Added `DAILY_SHEET` to `CERTIFICATE_CATEGORIES`
- ✅ Added Daily Sheet metadata to `CERTIFICATE_CATEGORY_METADATA`
- ✅ Added Daily Sheet to `SPA_REQUIRED_CATEGORIES`
- ✅ Added Daily Sheet field definitions to `CERTIFICATE_FIELDS`

### 2. **certificateApi.js**
- ✅ Updated `getPublicTemplates()` to accept optional `category` and `variant` parameters
- ✅ Added `getTemplatesByCategory(category)` endpoint to get templates grouped by variant

### 3. **Certifications.jsx** (Template Browser)
- ✅ Added category filter dropdown
- ✅ Added variant filter dropdown (shows when category is selected)
- ✅ Added clear filters button
- ✅ Shows template variant badges on template cards
- ✅ Displays filtered templates based on category and variant selection
- ✅ Shows category and variant info in template cards

### 4. **CreateCertifications.jsx** (Certificate Creation)
- ✅ Added category selector dropdown
- ✅ Added variant selector dropdown (shows when category is selected)
- ✅ Template selector now filters by selected category and variant
- ✅ Shows variant name in template dropdown options
- ✅ Automatically loads templates by category when category is selected

## Features

### Category Filtering
Users can filter templates by certificate category:
- Spa Therapist & Beautician
- Manager Salary Certificate
- Offer Letter
- Experience Letter
- Appointment Letter
- SPA Invoice/Bill
- Employee ID Card
- **Daily Sheet** (NEW)

### Variant Filtering
When a category is selected, users can filter by template variant:
- Default (templates without variant)
- Modern
- Classic
- Minimal
- v1, v2, etc. (any custom variant name)

### Template Display
- Template cards show:
  - Category badge
  - Variant badge (if available)
  - Template type (IMAGE/HTML)
  - Template name
  - Template image

## User Flow

### Browsing Templates (Certifications.jsx)
1. User visits certificate templates page
2. User can select a category from dropdown
3. If category has variants, variant dropdown appears
4. User can select a specific variant or view all variants
5. Templates are filtered and displayed
6. User clicks on a template to create certificate

### Creating Certificate (CreateCertifications.jsx)
1. User selects category
2. If category has variants, variant dropdown appears
3. User selects variant (optional - can view all)
4. Template dropdown shows filtered templates
5. User selects template and fills form
6. Certificate is generated

## API Integration

### Get Templates by Category
```javascript
// Get all variants for a category
const response = await certificateApi.getTemplatesByCategory('spa_therapist');
// Returns: { "default": [...], "modern": [...], "classic": [...] }
```

### Filter Templates
```javascript
// Filter by category
const response = await certificateApi.getPublicTemplates('spa_therapist');

// Filter by category and variant
const response = await certificateApi.getPublicTemplates('spa_therapist', 'modern');
```

## UI Components

### Filter Section
- Category dropdown with all certificate categories
- Variant dropdown (conditional - shows when category selected)
- Clear filters button
- Responsive design (stacks on mobile)

### Template Cards
- Enhanced to show variant badges
- Color-coded badges:
  - Blue: Category
  - Purple: Variant
  - Gray: Template Type

## Backend Integration

The frontend now fully integrates with the backend multiple template variants system:
- ✅ Uses `/api/certificates/templates/by-category/{category}` endpoint
- ✅ Uses `/api/certificates/templates?category={category}&variant={variant}` endpoint
- ✅ Displays `template_variant` field from backend
- ✅ Groups templates by variant when category is selected

## Testing Checklist

- [ ] Category filter works for all categories
- [ ] Variant filter appears when category is selected
- [ ] Variant filter shows correct variants for selected category
- [ ] Templates are filtered correctly by category
- [ ] Templates are filtered correctly by variant
- [ ] Clear filters button resets all filters
- [ ] Template cards display variant badges
- [ ] Template selection in CreateCertifications works with filters
- [ ] Daily Sheet category appears and works correctly
- [ ] All existing categories still work

## Notes

- Variant names are displayed with first letter capitalized
- "default" variant is displayed as "Default"
- If no variant is selected, all variants for the category are shown
- If no category is selected, all templates are shown
- Template cards show variant information when available
