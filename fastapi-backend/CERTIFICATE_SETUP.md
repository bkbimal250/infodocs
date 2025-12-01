# Certificate System Setup Guide

## Fixed Issues

### 1. SQLAlchemy Relationship Error
- **Problem**: `Hiring_Form` model had a relationship to `SPA` but `SPA` model was missing the `hiring_forms` relationship
- **Fix**: Added `hiring_forms = relationship("Hiring_Form", back_populates="spa")` to `SPA` model
- **Location**: `fastapi-backend/apps/forms_app/models.py`

### 2. Model Import
- **Fix**: Added `Hiring_Form` to model imports in `config/database.py`

## Certificate Tables Setup

### Step 1: Create Tables
Run the following command in your virtual environment:

```bash
cd fastapi-backend
.venv\Scripts\activate  # On Windows
python create_certificate_tables.py
```

This script will:
- Create all certificate tables (`certificate_templates`, `generated_certificates`)
- Seed 6 default certificate templates:
  1. Salary Certificate
  2. Appointment Letter
  3. Experience Certificate
  4. Invoice / Spa Bill
  5. Offer Letter
  6. Spa Therapist Certificate

### Step 2: Verify Tables
Check that tables are created in your MySQL database:
- `certificate_templates`
- `generated_certificates`

## Certificate API Endpoints

### Public Endpoints (No Authentication Required)

1. **GET `/api/certificates/templates`**
   - List all public certificate templates
   - Returns: Array of template objects

2. **GET `/api/certificates/templates/{template_id}`**
   - Get a single template by ID
   - Returns: Template object

3. **POST `/api/certificates/generated`**
   - Generate a new certificate
   - Body:
     ```json
     {
       "template_id": 1,
       "name": "Employee Name",
       "email": "employee@example.com",
       "certificate_data": {
         "company_name": "Company Name",
         "date": "15/10/2025",
         ...
       }
     }
     ```
   - Returns: `{ "message": "...", "certificate_id": 123 }`

4. **GET `/api/certificates/generated/{certificate_id}`**
   - Get certificate details
   - Returns: Certificate object with QR code

5. **GET `/api/certificates/generated/{certificate_id}/download/pdf`**
   - Download certificate as PDF
   - Returns: PDF file

6. **GET `/api/certificates/generated/{certificate_id}/download/image`**
   - Download certificate as PNG image
   - Returns: PNG file

## Certificate Templates

All templates are located in: `fastapi-backend/apps/certificates/templates/`

Available templates:
- `salary_certificate.html`
- `appointment_letter.html`
- `letter_of_experience.html`
- `experience_certificate.html`
- `invoice.html`
- `offer_letter.html`
- `completion_certificate.html`

## Common Fields for All Certificates

```json
{
  "company_name": "Disha Online Solution",
  "date": "15/10/2025",
  "company_address": "Full address here",
  "company_phone": "Phone number",
  "signatory_name": "Diisha Online Solution",
  "employee_name": "Employee Name"
}
```

See `fastapi-backend/apps/certificates/CERTIFICATE_FIELDS.md` for complete field documentation.

## Troubleshooting

### If tables don't exist:
1. Make sure database connection is working
2. Run `create_certificate_tables.py` script
3. Check database for `certificate_templates` and `generated_certificates` tables

### If PDF generation fails:
- On Windows: Uses `xhtml2pdf` (already installed)
- On Linux/Mac: Uses `WeasyPrint` if available, falls back to `xhtml2pdf`
- Check logs for specific error messages

### If relationship errors occur:
- Ensure all models are imported in `config/database.py`
- Check that all relationships have corresponding `back_populates`

## Testing

1. **Test Template Listing**:
   ```bash
   curl http://localhost:8000/api/certificates/templates
   ```

2. **Test Certificate Generation**:
   ```bash
   curl -X POST http://localhost:8000/api/certificates/generated \
     -H "Content-Type: application/json" \
     -d '{
       "template_id": 1,
       "name": "Test User",
       "certificate_data": {
         "company_name": "Test Company",
         "date": "15/10/2025"
       }
     }'
   ```

3. **Test Download**:
   - Visit: `http://localhost:8000/api/certificates/generated/{id}/download/pdf`

