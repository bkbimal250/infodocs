# Certificate Generation Guide

This guide explains how to set up and generate certificates using the certificate system.

## Prerequisites

1. **Python Dependencies**: Make sure you have the required packages installed:
   ```bash
   pip install weasyprint  # Recommended for PDF generation
   # OR
   pip install xhtml2pdf  # Alternative for Windows
   pip install qrcode[pil]  # For QR code generation
   pip install pillow  # For image processing
   ```

2. **Database**: Ensure your database is set up and tables are created.

## Setup Steps

### Step 1: Create Certificate Templates

First, create the certificate template records in the database:

```bash
cd fastapi-backend
python create_certificate_tables.py
```

This will create:
- `certificate_templates` table
- `generated_certificates` table
- Initial template records (without HTML content)

### Step 2: Seed Templates with HTML Content

Load HTML templates from files into the database:

```bash
python seed_certificate_templates.py
```

This script:
- Loads HTML templates from `apps/certificates/templates/` directory
- Updates existing templates with HTML content
- Creates new templates if they don't exist
- Maps each category to its corresponding HTML template file

### Step 3: Generate Test Certificates

Generate test certificates with dummy data to verify everything works:

```bash
python test_certificate_generation.py
```

This will:
- Generate a certificate for each active template
- Use realistic dummy data for each certificate type
- Save PDFs to `media/certificates/` directory
- Generate QR codes for verification

## Certificate Templates

The system supports 6 certificate types:

1. **Salary Certificate** (`manager Salary Certificate`)
   - Template: `salary_certificate.html`
   - Fields: position, joining_date, monthly_salary, salary_in_words, salary_breakdown

2. **Appointment Letter** (`Appointment Letter`)
   - Template: `appointment_letter.html`
   - Fields: position, start_date, salary, additional_terms

3. **Experience Certificate** (`Letter of Experience`)
   - Template: `letter_of_experience.html`
   - Fields: position, start_date, end_date, duration, salary, performance_description

4. **Invoice / Spa Bill** (`invoice spa bill`)
   - Template: `invoice.html`
   - Fields: bill_number, payment_mode, customer_name, items, subtotal, amount_in_words, terms

5. **Offer Letter** (`offer Letter`)
   - Template: `offer_letter.html`
   - Fields: recipient_name, position, start_date, starting_salary, additional_benefits

6. **Spa Therapist Certificate** (`Spa Therapist & Beautician`)
   - Template: `completion_certificate.html`
   - Fields: course_name, course_duration, completion_date, institute_name

## API Endpoints

### Public Endpoints (No Authentication)

1. **Get Public Templates**
   ```
   GET /api/certificates/templates
   ```

2. **Get Template by ID**
   ```
   GET /api/certificates/templates/{template_id}
   ```

3. **Generate Certificate**
   ```
   POST /api/certificates/generated
   Body: {
     "template_id": 1,
     "name": "John Doe",
     "email": "john@example.com",
     "certificate_data": {
       "company_name": "Diisha Online Solution",
       "position": "Spa Therapist",
       ...
     }
   }
   ```

4. **Get Generated Certificate**
   ```
   GET /api/certificates/generated/{certificate_id}
   ```

5. **Download PDF**
   ```
   GET /api/certificates/generated/{certificate_id}/download/pdf
   ```

6. **Download Image**
   ```
   GET /api/certificates/generated/{certificate_id}/download/image
   ```

## Example: Generate Salary Certificate

```python
import requests

# Generate certificate
response = requests.post("https://infodocs.api.d0s369.co.in/api/certificates/generated", json={
    "template_id": 1,  # Salary Certificate
    "name": "John Doe",
    "email": "john@example.com",
    "certificate_data": {
        "company_name": "Diisha Online Solution",
        "company_address": "123 Business Street, City, State 12345",
        "company_phone": "+91 9876543210",
        "signatory_name": "Diisha Online Solution",
        "date": "22/11/2024",
        "position": "Spa Manager",
        "joining_date": "15th Oct, 2023",
        "monthly_salary": "Rs. 40,000/-",
        "salary_in_words": "Rupees Forty Thousand Only",
        "salary_breakdown": [
            {"month": "OCT-2023", "salary": "Rs. 40,000/-"},
            {"month": "NOV-2023", "salary": "Rs. 40,000/-"},
            {"month": "DEC-2023", "salary": "Rs. 40,000/-"},
        ]
    }
})

certificate = response.json()
certificate_id = certificate["certificate_id"]

# Download PDF
pdf_response = requests.get(
    f"https://infodocs.api.d0s369.co.in/api/certificates/generated/{certificate_id}/download/pdf"
)
with open("certificate.pdf", "wb") as f:
    f.write(pdf_response.content)
```

## File Structure

```
fastapi-backend/
├── apps/
│   └── certificates/
│       ├── models.py              # Database models
│       ├── routers.py             # API endpoints
│       ├── services/
│       │   ├── certificate_service.py  # Business logic
│       │   └── pdf_generator.py        # PDF/Image generation
│       └── templates/             # HTML templates
│           ├── salary_certificate.html
│           ├── appointment_letter.html
│           ├── letter_of_experience.html
│           ├── invoice.html
│           ├── offer_letter.html
│           └── completion_certificate.html
├── seed_certificate_templates.py  # Seed templates with HTML
├── test_certificate_generation.py # Generate test certificates
└── create_certificate_tables.py   # Create tables and initial templates
```

## Troubleshooting

### PDF Generation Fails

1. **WeasyPrint not available**: Install WeasyPrint or use xhtml2pdf
   ```bash
   pip install weasyprint
   # OR
   pip install xhtml2pdf
   ```

2. **Missing fonts**: WeasyPrint may need system fonts. On Windows, ensure fonts are installed.

3. **Template errors**: Check that all required fields are provided in `certificate_data`.

### Templates Not Loading

1. Ensure template files exist in `apps/certificates/templates/`
2. Run `seed_certificate_templates.py` to load HTML into database
3. Check that templates are marked as `is_active=True` and `is_public=True`

### QR Code Not Generating

1. Install qrcode and pillow:
   ```bash
   pip install qrcode[pil] pillow
   ```

## Notes

- PDFs are saved to `media/certificates/` directory
- QR codes are generated as base64-encoded images
- All certificates are public by default (can be changed)
- Templates use `{{variable}}` syntax for placeholders
- The system automatically handles missing fields with defaults

