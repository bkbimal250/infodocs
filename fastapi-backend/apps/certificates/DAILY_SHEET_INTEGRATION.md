# Daily Sheet Integration with Multiple Template Variants

## Overview
The `DailySheet` model has been integrated with the certificate system, allowing you to create multiple UI template variants for daily sheets.

## What Was Added

### 1. Certificate Category
- Added `DAILY_SHEET = "daily_sheet"` to `CertificateCategory` enum

### 2. DailySheetCertificate Model
Created a new certificate model that extends `CertificateBase` with daily sheet-specific fields:

```python
class DailySheetCertificate(CertificateBase):
    category = CertificateCategory.DAILY_SHEET
    
    # SPA relationship
    spa_id = Column(Integer, ForeignKey("spas.id"))
    spa = relationship("SPA", back_populates="daily_sheet_certificates")
    
    # Daily sheet fields
    sheet_date = Column(String(50))  # Date of the sheet
    location = Column(String(255))   # Location name
    
    # Client entries (JSON array)
    client_entries = Column(JSON, default=list)
    # Format: [
    #   {
    #     "sr_no": 1,
    #     "client_name": "John Doe",
    #     "client_contact": "1234567890",
    #     "duration": "60 min",
    #     "in_time": "10:00 AM",
    #     "staff_name": "Jane Smith",
    #     "cash": "500",
    #     "card_gpay": "0",
    #     "remark": "Regular client"
    #   },
    #   ...
    # ]
    
    # Expenditure details (JSON array)
    expenditure_details = Column(JSON, default=list)
    # Format: ["Expense 1", "Expense 2", ...]
    
    # Financial totals
    total = Column(String(100))
    card_gpay_total = Column(String(100))
    expenses = Column(String(100))
    balance = Column(String(100))
    tip = Column(String(100))
    total_cash = Column(String(100))
```

### 3. Category Helper Updated
Added Daily Sheet structure to `category_helper.py`:

```python
CertificateCategory.DAILY_SHEET: {
    "name": "Daily Sheet",
    "fields": [
        "sheet_date",
        "location",
        "client_entries",
        "expenditure_details",
        "total",
        "card_gpay_total",
        "expenses",
        "balance",
        "tip",
        "total_cash"
    ],
    "spa_required": True
}
```

## Creating Multiple Template Variants for Daily Sheet

### Example: Create 3 Different UI Designs

```python
from apps.certificates.category_helper import create_category_templates
from apps.certificates.models import CertificateCategory, TemplateType

# Create multiple variants
templates = await create_category_templates(
    db=db,
    category=CertificateCategory.DAILY_SHEET,
    created_by=user_id,
    templates=[
        {
            "name": "Daily Sheet - Classic Design",
            "template_variant": "classic",
            "template_html": """
            <!DOCTYPE html>
            <html>
            <head>
                <title>Daily Sheet</title>
                <style>
                    /* Classic design styles */
                    body { font-family: Arial; }
                    .header { text-align: center; }
                    .client-table { border-collapse: collapse; width: 100%; }
                    .client-table th, .client-table td { border: 1px solid #000; padding: 5px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>श्री JAI SHREE RAM 卐</h1>
                    <h2>DAILY SHEET</h2>
                    <p>Date: {{sheet_date}}</p>
                    <p>Location: {{location}}</p>
                </div>
                
                <table class="client-table">
                    <thead>
                        <tr>
                            <th>SR.NO.</th>
                            <th>CLIENT NAME</th>
                            <th>CLIENT CONT_NO</th>
                            <th>DURATION</th>
                            <th>IN-TIME</th>
                            <th>STAFF NAME</th>
                            <th>CASH</th>
                            <th>CARD / GPAY</th>
                            <th>REMARK</th>
                        </tr>
                    </thead>
                    <tbody>
                        {{#each client_entries}}
                        <tr>
                            <td>{{sr_no}}</td>
                            <td>{{client_name}}</td>
                            <td>{{client_contact}}</td>
                            <td>{{duration}}</td>
                            <td>{{in_time}}</td>
                            <td>{{staff_name}}</td>
                            <td>{{cash}}</td>
                            <td>{{card_gpay}}</td>
                            <td>{{remark}}</td>
                        </tr>
                        {{/each}}
                    </tbody>
                </table>
                
                <div style="display: flex;">
                    <div style="flex: 1;">
                        <h3>EXPENDITURE DETAILS:</h3>
                        <ul>
                            {{#each expenditure_details}}
                            <li>{{this}}</li>
                            {{/each}}
                        </ul>
                    </div>
                    <div style="flex: 1;">
                        <h3>TOTALS:</h3>
                        <p>TOTAL: {{total}}</p>
                        <p>CARD + GPAY: {{card_gpay_total}}</p>
                        <p>EXPENSES: {{expenses}}</p>
                        <p>BALANCE: {{balance}}</p>
                        <p>TIP: {{tip}}</p>
                        <p>TOTAL CASH: {{total_cash}}</p>
                    </div>
                </div>
            </body>
            </html>
            """,
            "template_type": TemplateType.HTML
        },
        {
            "name": "Daily Sheet - Modern Design",
            "template_variant": "modern",
            "template_html": """
            <!DOCTYPE html>
            <html>
            <head>
                <title>Daily Sheet - Modern</title>
                <style>
                    /* Modern design with gradients and shadows */
                    body { 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        padding: 20px;
                    }
                    .container {
                        background: white;
                        border-radius: 10px;
                        padding: 30px;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    }
                    .header {
                        text-align: center;
                        color: #667eea;
                        margin-bottom: 30px;
                    }
                    /* ... more modern styles ... */
                </style>
            </head>
            <body>
                <div class="container">
                    <!-- Modern design HTML -->
                </div>
            </body>
            </html>
            """,
            "template_type": TemplateType.HTML
        },
        {
            "name": "Daily Sheet - Minimal Design",
            "template_variant": "minimal",
            "template_html": """
            <!DOCTYPE html>
            <html>
            <head>
                <title>Daily Sheet - Minimal</title>
                <style>
                    /* Minimal, clean design */
                    body { 
                        font-family: 'Helvetica Neue', Arial, sans-serif;
                        background: #f5f5f5;
                        padding: 40px;
                    }
                    .sheet {
                        background: white;
                        padding: 40px;
                        max-width: 1200px;
                        margin: 0 auto;
                    }
                    /* ... minimal styles ... */
                </style>
            </head>
            <body>
                <div class="sheet">
                    <!-- Minimal design HTML -->
                </div>
            </body>
            </html>
            """,
            "template_type": TemplateType.HTML
        }
    ],
    is_public=True,
    is_active=True
)
```

## Using the Templates

### Get All Variants for Daily Sheet

```bash
GET /api/certificates/templates/by-category/daily_sheet
```

Response:
```json
{
    "default": [/* templates without variant */],
    "classic": [/* classic design templates */],
    "modern": [/* modern design templates */],
    "minimal": [/* minimal design templates */]
}
```

### Filter by Variant

```bash
GET /api/certificates/templates?category=daily_sheet&variant=modern
```

## Data Structure

When creating a Daily Sheet certificate, provide data in this format:

```python
certificate_data = {
    "sheet_date": "2024-01-15",
    "location": "Main Branch",
    "client_entries": [
        {
            "sr_no": 1,
            "client_name": "John Doe",
            "client_contact": "1234567890",
            "duration": "60 min",
            "in_time": "10:00 AM",
            "staff_name": "Jane Smith",
            "cash": "500",
            "card_gpay": "0",
            "remark": "Regular client"
        },
        {
            "sr_no": 2,
            "client_name": "Jane Smith",
            "client_contact": "0987654321",
            "duration": "90 min",
            "in_time": "2:00 PM",
            "staff_name": "John Doe",
            "cash": "0",
            "card_gpay": "800",
            "remark": "New client"
        }
    ],
    "expenditure_details": [
        "Office supplies: ₹500",
        "Utilities: ₹2000",
        "Miscellaneous: ₹300"
    ],
    "total": "1300",
    "card_gpay_total": "800",
    "expenses": "2800",
    "balance": "-1500",
    "tip": "100",
    "total_cash": "600"
}
```

## Template Variables Available

In your HTML templates, you can use these variables:

- `{{sheet_date}}` - Date of the daily sheet
- `{{location}}` - Location name
- `{{#each client_entries}}...{{/each}}` - Loop through client entries
  - `{{sr_no}}`
  - `{{client_name}}`
  - `{{client_contact}}`
  - `{{duration}}`
  - `{{in_time}}`
  - `{{staff_name}}`
  - `{{cash}}`
  - `{{card_gpay}}`
  - `{{remark}}`
- `{{#each expenditure_details}}...{{/each}}` - Loop through expenses
  - `{{this}}` - The expense item
- `{{total}}`
- `{{card_gpay_total}}`
- `{{expenses}}`
- `{{balance}}`
- `{{tip}}`
- `{{total_cash}}`
- `{{spa.name}}` - SPA name (from spa relationship)
- `{{spa.address}}` - SPA address
- `{{spa.logo}}` - SPA logo URL
- All other SPA fields (city, state, phone, etc.)

## Notes

1. **SPA Required**: Daily Sheet certificates require a `spa_id` (spa_required: True)
2. **JSON Fields**: `client_entries` and `expenditure_details` are stored as JSON arrays
3. **Template Variants**: You can create as many variants as needed (v1, v2, modern, classic, etc.)
4. **Same Data**: All variants use the same data structure, only the HTML/CSS changes

## Next Steps

1. Create your HTML templates for different variants
2. Use `create_category_templates()` to add them to the database
3. Frontend can now show all variants and let users choose
4. Generate PDFs using the selected template variant
