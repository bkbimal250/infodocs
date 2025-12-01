# Certificate System - Frontend Implementation Guide

## Overview

This document provides a comprehensive guide to the frontend certificate generation system. The system allows users to create, preview, and download various types of certificates (salary, appointment, experience, offer letters, invoices, and spa therapist certifications).

---

## 📁 File Structure

```
Client/src/
├── api/
│   ├── Certificates/
│   │   └── certificateApi.js          # Main API service
│   └── index.js                       # API exports
├── Certificates/
│   ├── components/
│   │   └── CertificateFormFields.jsx  # Reusable form components
│   ├── CreateCertifications.jsx       # Main certificate creation page
│   ├── Certifications.jsx             # Certificate listing
│   ├── ViewCertificates.jsx           # Certificate viewer
│   └── index.js                       # Exports
└── utils/
    ├── certificateConstants.js        # Constants & field definitions
    └── certificateUtils.js            # Helper functions
```

---

## 🔌 API Endpoints

### Public Endpoints (No Authentication Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/certificates/templates` | Get all public certificate templates |
| GET | `/api/certificates/templates/{id}` | Get a specific template |
| POST | `/api/certificates/preview` | Preview certificate HTML |
| POST | `/api/certificates/generate` | Generate certificate PDF |
| GET | `/api/certificates/generated/public` | List public certificates |
| GET | `/api/certificates/generated/{id}` | Get certificate details |
| GET | `/api/certificates/generated/{id}/download/pdf` | Download as PDF |
| GET | `/api/certificates/generated/{id}/download/image` | Download as PNG |

### Protected Endpoints (Admin/Manager/HR Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/certificates/templates` | Create new template |
| PUT | `/api/certificates/templates/{id}` | Update template |
| DELETE | `/api/certificates/templates/{id}` | Delete template |
| GET | `/api/certificates/generated` | List all certificates |

---

## 📚 API Service Methods

### `certificateApi` Module

#### Getting Templates

```javascript
import { certificateApi } from '@/api';

// Get all public templates
const response = await certificateApi.getPublicTemplates();

// Get single template
const template = await certificateApi.getTemplate(templateId);
```

#### Certificate Operations

```javascript
// Preview certificate (returns HTML)
const preview = await certificateApi.previewCertificate({
  template_id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  certificate_data: {
    position: 'Manager',
    salary: '₹40,000/-',
    // ... other fields
  }
});

// Generate certificate (returns PDF blob)
const pdf = await certificateApi.generateCertificate({
  template_id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  certificate_data: { /* ... */ }
});

// Download certificate
const pdfBlob = await certificateApi.downloadPDF(certificateId);
const imageBlob = await certificateApi.downloadImage(certificateId);

// Trigger file download
certificateApi.triggerDownload(blob, 'certificate.pdf');
```

#### Utility Methods

```javascript
// Number to words conversion
const words = certificateApi.numberToWords(1250); 
// Returns: "One Thousand Two Hundred Fifty Only"

// Format currency
const formatted = certificateApi.formatCurrency(1250.50);
// Returns: "₹1250.50"

// Format date
const date = certificateApi.formatDate('2025-01-15');
// Returns: "15/01/2025"
```

---

## 🎨 Certificate Categories

### 1. Spa Therapist & Beautician Certificate
**Category**: `Spa Therapist & Beautician`

Required Fields:
- Therapist Name
- Course Name
- Course Duration
- Completion Date

```javascript
const data = {
  therapist_name: 'Jane Smith',
  course_name: 'Professional Spa Therapy & Beautician Course',
  course_duration: '6 Months',
  completion_date: '15/10/2025',
  // ... common fields
};
```

### 2. Manager Salary Certificate
**Category**: `manager Salary Certificate`

Required Fields:
- Position
- Joining Date
- Monthly Salary
- SPA Details

```javascript
const data = {
  position: 'Manager',
  joining_date: '15th Oct, 2025',
  monthly_salary: 'Rs. 40,000/-',
  monthly_salary_in_words: 'Rupees Forty Thousand Only',
  spa_name: 'PALM ATLANTIS SPA',
  spa_address: 'Shop No 9, Mayuresh Square...',
  spa_phone: '9152422132',
  // ... common fields
};
```

### 3. Offer Letter
**Category**: `offer Letter`

Required Fields:
- Position
- Start Date
- Monthly Salary
- Manager Signature

```javascript
const data = {
  employee_name: 'John Doe',
  position: 'Manager',
  start_date: '01/11/2025',
  monthly_salary: 'Rs. 30,000/- per month',
  manager_signature: 'Authorized Manager',
  // ... common fields
};
```

### 4. Letter of Experience
**Category**: `Letter of Experience`

Required Fields:
- Position
- Duration
- Start/End Dates
- Performance Description

```javascript
const data = {
  position: 'Therapist',
  start_date: 'May 2, 2024',
  end_date: 'July 30, 2025',
  duration: '3 months',
  salary: 'Rs. 25,000/-',
  performance_description: 'Excellent employee...',
  // ... common fields
};
```

### 5. Appointment Letter
**Category**: `Appointment Letter`

Required Fields:
- Position
- Start Date
- Salary
- SPA Details

```javascript
const data = {
  employee_name: 'Jane Smith',
  position: 'Therapist',
  start_date: '15/01/2025',
  salary: '₹25,000.00 per Month',
  spa_name: 'PALM ATLANTIS SPA',
  spa_address: '...',
  spa_phone: '9152422132',
  // ... common fields
};
```

### 6. Invoice/SPA Bill
**Category**: `invoice spa bill`

Required Fields:
- Bill Number
- Payment Mode
- Customer Details
- Invoice Items

```javascript
const data = {
  bill_number: 'INV-2024-001',
  payment_mode: 'Cash',
  customer_name: 'Customer Name',
  items: [
    {
      description: 'Body Massage',
      hsn_code: '-',
      quantity: '1',
      rate: '500.00',
      amount: '500.00'
    }
  ],
  subtotal: '₹500.00',
  amount_in_words: 'Rupees Five Hundred Only',
  // ... common fields
};
```

---

## 🛠️ Utility Functions

### `certificateUtils.js` Functions

#### Data Preparation

```javascript
import { prepareCertificateData } from '@/utils/certificateUtils';

const certificateData = prepareCertificateData(
  'manager Salary Certificate',
  formData,
  invoiceItems
);
```

#### Validation

```javascript
import { validateFormData, isValidEmail, isValidPhone } from '@/utils/certificateUtils';

// Validate required fields
const { isValid, errors } = validateFormData(formData, ['name', 'company_name']);

// Email validation
if (isValidEmail('user@example.com')) { /* ... */ }

// Phone validation (Indian format)
if (isValidPhone('9876543210')) { /* ... */ }
```

#### Formatting

```javascript
import { 
  formatDate, 
  formatDateVerbose, 
  formatCurrency, 
  numberToWords 
} from '@/utils/certificateUtils';

formatDate('2025-01-15');        // "15/01/2025"
formatDateVerbose('2025-01-15'); // "15th Jan, 2025"
formatCurrency(1250);            // "₹1250.00"
numberToWords(1250);             // "One Thousand Two Hundred Fifty Only"
```

#### Certificate Management

```javascript
import { 
  generateCertificateFilename, 
  downloadFile,
  getCategoryDisplayName,
  getCategoryIcon
} from '@/utils/certificateUtils';

const filename = generateCertificateFilename('Salary Certificate', 'John Doe');
downloadFile(blob, filename);
```

---

## 📋 Constants & Configuration

### `certificateConstants.js`

```javascript
import {
  CERTIFICATE_CATEGORIES,
  CERTIFICATE_FIELDS,
  COMMON_FIELDS,
  INVOICE_ITEM_TEMPLATE,
  DEFAULT_FORM_DATA,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
} from '@/utils/certificateConstants';

// Access categories
console.log(CERTIFICATE_CATEGORIES.SPA_THERAPIST);
// Output: "Spa Therapist & Beautician"

// Get field definitions
console.log(CERTIFICATE_FIELDS[CERTIFICATE_CATEGORIES.MANAGER_SALARY]);
// Returns field structure for salary certificate

// Common fields structure
console.log(COMMON_FIELDS);
// Returns: [ { section: '...', fields: [...] }, ... ]
```

---

## 🎯 Component Usage Examples

### Using CreateCertifications Component

```javascript
import CreateCertifications from '@/Certificates/CreateCertifications';

export default function CertificatePage() {
  return <CreateCertifications />;
}
```

### Using Form Components

```javascript
import { 
  SalaryCertificateForm,
  ExperienceCertificateForm,
  AppointmentCertificateForm,
  OfferLetterForm,
  SpatherapistCertificateForm
} from '@/Certificates/components/CertificateFormFields';

function MyComponent({ formData, handleInputChange }) {
  return (
    <SalaryCertificateForm 
      formData={formData} 
      handleInputChange={handleInputChange}
    />
  );
}
```

---

## 🔄 Complete Workflow Example

```javascript
import { certificateApi } from '@/api';
import { prepareCertificateData, downloadFile } from '@/utils/certificateUtils';

async function generateCertificate() {
  try {
    // 1. Get template
    const template = await certificateApi.getTemplate(templateId);
    
    // 2. Prepare data
    const certData = prepareCertificateData(
      template.category,
      formData,
      invoiceItems
    );
    
    // 3. Preview (optional)
    const preview = await certificateApi.previewCertificate({
      template_id: template.id,
      name: formData.name,
      certificate_data: certData
    });
    
    // 4. Generate PDF
    const response = await certificateApi.generateCertificate({
      template_id: template.id,
      name: formData.name,
      certificate_data: certData
    });
    
    // 5. Download
    downloadFile(response.data, `certificate_${formData.name}.pdf`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}
```

---

## 📱 Form State Management

The system uses state management for:
- Template selection
- Form data
- Invoice items (for bill certificates)
- Preview HTML
- Loading states
- Error messages
- Success messages

---

## 🔒 Security Considerations

1. **Authentication**: Protected endpoints require JWT token in Authorization header
2. **CORS**: Configured in `.env` file
3. **File Uploads**: Validate file types and sizes
4. **XSS Prevention**: All user input is sanitized
5. **Data Validation**: Required fields are validated before API calls

---

## 🐛 Common Issues & Solutions

### Issue: CORS Error
**Solution**: Ensure `CORS_ORIGINS` in backend .env includes your frontend URL

### Issue: PDF Generation Fails
**Solution**: Check if HTML content is valid and all template variables are provided

### Issue: File Download Not Working
**Solution**: Ensure `responseType: 'blob'` is set for download endpoints

### Issue: Form Data Not Persisting
**Solution**: Use proper field names matching the backend schema

---

## 📖 Additional Resources

- Backend Certificate Documentation: `/fastapi-backend/apps/certificates/CERTIFICATE_FIELDS.md`
- API Endpoints: `/fastapi-backend/apps/certificates/routers.py`
- Certificate Models: `/fastapi-backend/apps/certificates/models.py`

---

## 🚀 Future Enhancements

1. Batch certificate generation
2. Email sending of certificates
3. Certificate templates customization UI
4. Digital signature support
5. Multi-language support
6. Watermark additions
7. Certificate revocation system
8. Template versioning

---

**Last Updated**: November 22, 2025
**Version**: 1.0.0
