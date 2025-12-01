# Individual Certificate Form Components

## Overview

Each certificate type now has its own dedicated form component. This separation provides:
- **Better maintainability** - Each form is focused on its specific certificate type
- **Customized UI** - Fields and styling tailored to each certificate type
- **Easier testing** - Isolated components are easier to test
- **Reusability** - Forms can be used independently in different parts of the application

## Components Structure

```
Client/src/Certificates/components/
├── SpaTherapistCertificateForm.jsx      (155 lines)
├── ManagerSalaryCertificateForm.jsx     (218 lines)
├── ExperienceLetterForm.jsx             (226 lines)
├── AppointmentLetterForm.jsx            (234 lines)
├── OfferLetterForm.jsx                  (284 lines)
├── InvoiceCertificateForm.jsx           (301 lines)
├── CertificateFormFields.jsx            (Legacy combined component)
└── index.js                             (Helper exports)
```

---

## Individual Components

### 1. SpaTherapistCertificateForm

**Purpose:** Course completion and spa therapist certification forms

**Props:**
```javascript
{
  formData: {
    recipientName: string,
    recipientEmail: string,
    courseName: string,
    courseDuration: string,
    completionDate: date,
    companyName: string,
    signingAuthority: string,
    additionalNotes: string
  },
  handleInputChange: function(event)
}
```

**Sections:**
- Recipient Information (Name, Email)
- Course Information (Course Name, Duration, Completion Date)
- Company Information (Company Name, Signing Authority)
- Additional Notes

**Example Usage:**
```jsx
import { SpaTherapistCertificateForm } from '@/Certificates';

<SpaTherapistCertificateForm 
  formData={formData} 
  handleInputChange={handleChange}
/>
```

---

### 2. ManagerSalaryCertificateForm

**Purpose:** Salary verification and manager approval forms

**Props:**
```javascript
{
  formData: {
    employeeName: string,
    position: string,
    employeeEmail: string,
    employeePhone: string,
    salary: number,
    salaryCurrency: string (default: 'USD'),
    salaryFrequency: string (Monthly|Yearly|Bi-weekly|Weekly),
    employmentDate: date,
    spaName: string,
    managerName: string,
    managerTitle: string,
    managerSignatureDate: date,
    remarks: string
  },
  handleInputChange: function(event)
}
```

**Sections:**
- Employee Information (Name, Position, Email, Phone)
- Salary Information (Salary amount, Currency, Frequency, Employment Date)
- SPA/Company Details (Company Name, Manager Info, Signature Date)
- Additional Remarks

**Color Theme:** Green indicators

**Example Usage:**
```jsx
import { ManagerSalaryCertificateForm } from '@/Certificates';

<ManagerSalaryCertificateForm 
  formData={formData} 
  handleInputChange={handleChange}
/>
```

---

### 3. ExperienceLetterForm

**Purpose:** Work experience verification and employment history

**Props:**
```javascript
{
  formData: {
    employeeName: string,
    position: string,
    employeeEmail: string,
    employeePhone: string,
    startDate: date,
    endDate: date,
    duration: string,
    performanceDescription: string,
    keySkills: string,
    companyName: string,
    managerName: string,
    managerTitle: string,
    managerEmail: string,
    managerSignatureDate: date
  },
  handleInputChange: function(event)
}
```

**Sections:**
- Employee Information (Name, Position, Email, Phone)
- Employment Period (Start Date, End Date, Duration)
- Performance & Responsibilities (Description, Key Skills)
- Company/Manager Information

**Color Theme:** Blue indicators

**Example Usage:**
```jsx
import { ExperienceLetterForm } from '@/Certificates';

<ExperienceLetterForm 
  formData={formData} 
  handleInputChange={handleChange}
/>
```

---

### 4. AppointmentLetterForm

**Purpose:** Job appointment and joining letters

**Props:**
```javascript
{
  formData: {
    candidateName: string,
    candidateEmail: string,
    candidateAddress: string,
    candidatePhone: string,
    position: string,
    department: string,
    joiningDate: date,
    employmentType: string (Full-Time|Part-Time|Contract|Permanent),
    salary: number,
    salaryCurrency: string,
    benefits: string,
    spaName: string,
    managerName: string,
    managerTitle: string,
    managerSignatureDate: date,
    terms: string
  },
  handleInputChange: function(event)
}
```

**Sections:**
- Candidate Information (Name, Email, Address, Phone)
- Position Details (Position, Department, Joining Date, Employment Type)
- Compensation & Benefits (Salary, Currency, Benefits Description)
- SPA/Company Information
- Terms & Conditions

**Color Theme:** Purple indicators

**Example Usage:**
```jsx
import { AppointmentLetterForm } from '@/Certificates';

<AppointmentLetterForm 
  formData={formData} 
  handleInputChange={handleChange}
/>
```

---

### 5. OfferLetterForm

**Purpose:** Job offer and offer letter forms

**Props:**
```javascript
{
  formData: {
    candidateName: string,
    candidateEmail: string,
    candidateAddress: string,
    candidatePhone: string,
    position: string,
    department: string,
    startDate: date,
    employmentType: string (Full-Time|Part-Time|Contract|Permanent),
    salary: number,
    salaryCurrency: string,
    benefits: string,
    offerExpiryDate: date,
    probationPeriod: string,
    terms: string,
    spaName: string,
    managerName: string,
    managerTitle: string,
    managerSignatureDate: date
  },
  handleInputChange: function(event)
}
```

**Sections:**
- Candidate Information (Name, Email, Address, Phone)
- Position Details (Position, Department, Start Date, Employment Type)
- Compensation Package (Salary, Currency, Benefits)
- Offer Terms (Expiry Date, Probation, Additional Terms)
- SPA/Company Information

**Color Theme:** Orange indicators

**Example Usage:**
```jsx
import { OfferLetterForm } from '@/Certificates';

<OfferLetterForm 
  formData={formData} 
  handleInputChange={handleChange}
/>
```

---

### 6. InvoiceCertificateForm

**Purpose:** Service invoices and SPA billing forms

**Props:**
```javascript
{
  formData: {
    invoiceNumber: string,
    invoiceDate: date,
    dueDate: date,
    clientName: string,
    clientEmail: string,
    clientAddress: string,
    clientPhone: string,
    invoiceItems: [
      {
        description: string,
        quantity: number,
        rate: number
      }
    ],
    taxRate: number,
    discountAmount: number,
    currency: string (default: 'USD'),
    spaName: string,
    contactPerson: string,
    paymentTerms: string,
    notes: string
  },
  handleInputChange: function(event),
  handleInvoiceItemChange: function(index, field, value),
  handleAddInvoiceItem: function(),
  handleRemoveInvoiceItem: function(index)
}
```

**Sections:**
- Invoice Information (Invoice Number, Invoice Date, Due Date)
- Client Information (Name, Email, Address, Phone)
- Services & Items (Editable table with Add/Remove buttons)
- Billing Summary (Tax Rate, Discount, Currency with auto-calculations)
- SPA/Company Information (Company Name, Contact Person, Payment Terms, Notes)

**Color Theme:** Red indicators

**Special Features:**
- Dynamic table for adding/removing line items
- Real-time total calculations
- Tax and discount calculations
- Visual summary of billing

**Example Usage:**
```jsx
import { InvoiceCertificateForm } from '@/Certificates';

const [formData, setFormData] = useState({ invoiceItems: [] });

const handleInvoiceItemChange = (index, field, value) => {
  const items = [...formData.invoiceItems];
  items[index] = { ...items[index], [field]: value };
  setFormData({ ...formData, invoiceItems: items });
};

const handleAddInvoiceItem = () => {
  setFormData({
    ...formData,
    invoiceItems: [...formData.invoiceItems, { description: '', quantity: 1, rate: 0 }]
  });
};

const handleRemoveInvoiceItem = (index) => {
  const items = formData.invoiceItems.filter((_, i) => i !== index);
  setFormData({ ...formData, invoiceItems: items });
};

<InvoiceCertificateForm 
  formData={formData} 
  handleInputChange={handleChange}
  handleInvoiceItemChange={handleInvoiceItemChange}
  handleAddInvoiceItem={handleAddInvoiceItem}
  handleRemoveInvoiceItem={handleRemoveInvoiceItem}
/>
```

---

## Using the Helper Function

The `getCertificateFormComponent()` helper simplifies component selection:

```javascript
import { getCertificateFormComponent } from '@/Certificates';

const certificateType = 'MANAGER_SALARY';
const FormComponent = getCertificateFormComponent(certificateType);

// Use it in JSX
<FormComponent formData={data} handleInputChange={handler} />
```

**Supported Types:**
- `SPA_THERAPIST` → SpaTherapistCertificateForm
- `MANAGER_SALARY` → ManagerSalaryCertificateForm
- `EXPERIENCE_LETTER` → ExperienceLetterForm
- `APPOINTMENT_LETTER` → AppointmentLetterForm
- `OFFER_LETTER` → OfferLetterForm
- `INVOICE_SPA_BILL` → InvoiceCertificateForm

---

## Styling

All components use **Tailwind CSS** with consistent patterns:

### Color Schemes by Type:
- **Spa Therapist:** Blue (`bg-blue-50`, `ring-blue-500`)
- **Manager Salary:** Green (`bg-green-50`, `ring-green-500`)
- **Experience Letter:** Blue (`bg-blue-50`, `ring-blue-600`)
- **Appointment Letter:** Purple (`bg-purple-50`, `ring-purple-600`)
- **Offer Letter:** Orange (`bg-orange-50`, `ring-orange-600`)
- **Invoice:** Red (`bg-red-50`, `ring-red-600`)

### Common Elements:
- **Section Headers:** Font size lg, semibold with colored dot indicator
- **Required Fields:** Red asterisk (*) marker
- **Input Fields:** Full width, border, focus ring with type-specific color
- **Responsive Layout:** `grid-cols-1 md:grid-cols-2` (mobile-first)
- **Spacing:** Consistent gap-4 between form sections

---

## Integration with Existing Code

### In CreateCertifications Component:

```jsx
import { 
  getCertificateFormComponent, 
  prepareCertificateData, 
  CERTIFICATE_CATEGORIES 
} from '@/Certificates';

function CreateCertifications() {
  const [certificateType, setCertificateType] = useState('SPA_THERAPIST');
  const [formData, setFormData] = useState({});

  const FormComponent = getCertificateFormComponent(certificateType);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const preparedData = prepareCertificateData(certificateType, formData);
    // Submit to API
  };

  return (
    <div>
      <select value={certificateType} onChange={(e) => setCertificateType(e.target.value)}>
        <option value="SPA_THERAPIST">Spa Therapist</option>
        <option value="MANAGER_SALARY">Manager Salary</option>
        {/* ... more options ... */}
      </select>

      <FormComponent 
        formData={formData} 
        handleInputChange={handleChange}
      />

      <button onClick={handleSubmit}>Generate Certificate</button>
    </div>
  );
}
```

---

## Backward Compatibility

The legacy `CertificateFormFields` component is still available for backward compatibility. It contains all the form components in one file but is no longer recommended for new code.

**Migration Path:**
```javascript
// Old way (legacy)
import { CertificateFormFields, SalaryCertificateForm } from '@/Certificates';

// New way (recommended)
import { getCertificateFormComponent, ManagerSalaryCertificateForm } from '@/Certificates';
```

---

## Form Data Validation

After collecting form data, validate using the utility function:

```javascript
import { validateFormData } from '@/Certificates';

const { isValid, errors } = validateFormData(formData, requiredFields);

if (!isValid) {
  console.error('Validation errors:', errors);
  // Show errors to user
} else {
  // Proceed with submission
}
```

---

## Tips & Best Practices

1. **Initialize formData** with empty values or defaults from `DEFAULT_FORM_DATA`
2. **Use handleInputChange** for simple text/date inputs
3. **For Invoice forms**, implement the additional handlers for line items
4. **Validate before submission** to catch errors early
5. **Use getCertificateFormComponent()** for dynamic form selection
6. **Keep formData in state** so you can access it in parent component
7. **Pass callbacks properly** to ensure data flows correctly

---

## File Locations

```
Client/
└── src/
    └── Certificates/
        ├── components/
        │   ├── SpaTherapistCertificateForm.jsx
        │   ├── ManagerSalaryCertificateForm.jsx
        │   ├── ExperienceLetterForm.jsx
        │   ├── AppointmentLetterForm.jsx
        │   ├── OfferLetterForm.jsx
        │   ├── InvoiceCertificateForm.jsx
        │   ├── CertificateFormFields.jsx (legacy)
        │   └── index.js
        ├── CreateCertifications.jsx (uses these forms)
        ├── Certifications.jsx
        ├── ViewCertificates.jsx
        └── index.js (exports all)
```

---

## Total Lines of Code

- **SpaTherapistCertificateForm:** 155 lines
- **ManagerSalaryCertificateForm:** 218 lines
- **ExperienceLetterForm:** 226 lines
- **AppointmentLetterForm:** 234 lines
- **OfferLetterForm:** 284 lines
- **InvoiceCertificateForm:** 301 lines
- **components/index.js:** 25 lines

**Total:** ~1,443 lines of well-structured, documented React code

All components are production-ready and fully integrated with the certificate system.
