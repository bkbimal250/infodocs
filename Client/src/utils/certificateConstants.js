/**
 * Certificate Constants
 * Defines all certificate categories, field definitions, and form configurations
 */

// ========================
// CERTIFICATE CATEGORIES
// ========================

export const CERTIFICATE_CATEGORIES = {
  SPA_THERAPIST: 'spa_therapist',
  MANAGER_SALARY: 'manager_salary',
  OFFER_LETTER: 'offer_letter',
  EXPERIENCE_LETTER: 'experience_letter',
  APPOINTMENT_LETTER: 'appointment_letter',
  INVOICE_SPA_BILL: 'invoice_spa_bill',
  ID_CARD: 'id_card',
};

export const CERTIFICATE_CATEGORY_METADATA = {
  [CERTIFICATE_CATEGORIES.SPA_THERAPIST]: {
    title: 'Spa Therapist & Beautician',
    icon: 'spa',
    description: 'Professional therapist training completion',
  },
  [CERTIFICATE_CATEGORIES.MANAGER_SALARY]: {
    title: 'Manager Salary Certificate',
    icon: 'salary',
    description: 'Income verification for spa managers',
  },
  [CERTIFICATE_CATEGORIES.OFFER_LETTER]: {
    title: 'Offer Letter',
    icon: 'offer',
    description: 'Official job offer package',
  },
  [CERTIFICATE_CATEGORIES.EXPERIENCE_LETTER]: {
    title: 'Experience Letter',
    icon: 'experience',
    description: 'Employment history verification',
  },
  [CERTIFICATE_CATEGORIES.APPOINTMENT_LETTER]: {
    title: 'Appointment Letter',
    icon: 'appointment',
    description: 'Joining confirmation with salary details',
  },
  [CERTIFICATE_CATEGORIES.INVOICE_SPA_BILL]: {
    title: 'SPA Invoice/Bill',
    icon: 'invoice',
    description: 'Itemised invoice for spa services',
  },
  [CERTIFICATE_CATEGORIES.ID_CARD]: {
    title: 'Employee ID Card',
    icon: 'id-card',
    description: 'Photo identity card for employees',
  },
};

export const SPA_REQUIRED_CATEGORIES = [
  CERTIFICATE_CATEGORIES.MANAGER_SALARY,
  CERTIFICATE_CATEGORIES.EXPERIENCE_LETTER,
  CERTIFICATE_CATEGORIES.APPOINTMENT_LETTER,
  CERTIFICATE_CATEGORIES.INVOICE_SPA_BILL,
  CERTIFICATE_CATEGORIES.ID_CARD,
];

// ========================
// CERTIFICATE FIELDS BY CATEGORY
// ========================

export const CERTIFICATE_FIELDS = {
  
  [CERTIFICATE_CATEGORIES.SPA_THERAPIST]: {
    title: 'Spa Therapist & Beautician Certificate',
    icon: 'spa',
    description: 'Fields stored in SpaTherapistCertificate model',
    requiredFields: ['candidate_name', 'course_name', 'start_date', 'end_date'],
    fields: [
      { name: 'candidate_name', label: 'Candidate Name', type: 'text', placeholder: 'Full Name' },
      { name: 'course_name', label: 'Course Name', type: 'text', placeholder: 'Professional Spa Therapy & Beautician Course' },
      { name: 'start_date', label: 'Start Date', type: 'date' },
      { name: 'end_date', label: 'End Date', type: 'date' },
      { name: 'passport_size_photo', label: 'Passport Photo URL', type: 'file', placeholder: 'https://example.com/photo.jpg' },
      { name: 'candidate_signature', label: 'Candidate Signature URL', type: 'file', placeholder: 'https://example.com/signature.png' },
    ],
  },

  [CERTIFICATE_CATEGORIES.MANAGER_SALARY]: {
    title: 'Manager Salary Certificate',
    icon: 'salary',
    description: 'Matches ManagerSalaryCertificate model',
    requiredFields: ['manager_name', 'position', 'joining_date', 'monthly_salary', 'spa_id'],
    fields: [
      { name: 'manager_name', label: 'Manager Name', type: 'text', placeholder: 'Full Name' },
      { name: 'position', label: 'Position', type: 'text', placeholder: 'Manager', defaultValue: 'Manager' },
      { name: 'joining_date', label: 'Joining Date', type: 'date', placeholder: '15th Oct, 2025' },
      { name: 'monthly_salary', label: 'Monthly Salary', type: 'text', placeholder: 'Rs. 40,000/-' },
      { name: 'monthly_salary_in_words', label: 'Salary (in words)', type: 'text', placeholder: 'Rupees Forty Thousand Only' },
      { name: 'salary_breakdown', label: 'Salary Breakdown (JSON)', type: 'textarea', placeholder: '[{"month":"Jan 2025","salary":"40,000"}]' },
    ],
  },
  

  [CERTIFICATE_CATEGORIES.OFFER_LETTER]: {
    title: 'Offer Letter',
    icon: 'offer',
    description: 'Official job offer letter for new employees',
    requiredFields: ['employee_name', 'position', 'start_date', 'salary'],
    fields: [
      { name: 'employee_name', label: 'Employee Name', type: 'text', placeholder: 'Full Name' },
      { name: 'position', label: 'Position', type: 'text', placeholder: 'Job Position' },
      { name: 'start_date', label: 'Start Date', type: 'date', placeholder: 'DD/MM/YYYY' },
      { name: 'salary', label: 'Salary', type: 'text', placeholder: 'Rs. 30,000/- per month' },
      { name: 'manager_signature', label: 'Manager Signature', type: 'text', placeholder: 'Manager Name' },
    ],
  },

  [CERTIFICATE_CATEGORIES.EXPERIENCE_LETTER]: {
    title: 'Letter of Experience',
    icon: 'experience',
    description: 'Work experience verification letter',
    requiredFields: ['candidate_name', 'position', 'joining_date', 'end_date', 'spa_id'],
    fields: [
      { name: 'candidate_name', label: 'Employee Name', type: 'text', placeholder: 'Full Name' },
      { name: 'position', label: 'Position', type: 'text', placeholder: 'Job Position' },
      { name: 'joining_date', label: 'Joining Date', type: 'date', placeholder: 'May 2, 2024' },
      { name: 'end_date', label: 'End Date', type: 'date', placeholder: 'July 30, 2025' },
      { name: 'duration', label: 'Duration', type: 'text', placeholder: '3 months' },
      { name: 'salary', label: 'Salary', type: 'text', placeholder: 'Rs. 25,000/-' },
      
    ],
  },

  [CERTIFICATE_CATEGORIES.APPOINTMENT_LETTER]: {
    title: 'Appointment Letter',
    icon: 'appointment',
    description: 'Official appointment letter for new positions',
    requiredFields: ['employee_name', 'position', 'start_date', 'salary', 'manager_signature', 'spa_id'],
    fields: [
      { name: 'employee_name', label: 'Employee Name', type: 'text', placeholder: 'Full Name' },
      { name: 'position', label: 'Position', type: 'text', placeholder: 'Job Position' },
      { name: 'start_date', label: 'Start Date', type: 'date', placeholder: 'DD/MM/YYYY' },
      { name: 'salary', label: 'Monthly Salary', type: 'text', placeholder: '₹30,000.00 per Month' },
      { name: 'manager_signature', label: 'Manager Signature', type: 'text', placeholder: 'Manager Full Name' },
    ],
  },

  [CERTIFICATE_CATEGORIES.INVOICE_SPA_BILL]: {
    title: 'SPA Invoice/Bill',
    icon: 'invoice',
    description: 'Professional invoice or bill for SPA services',
    requiredFields: ['bill_number', 'bill_date', 'payment_mode', 'customer_name', 'spa_id'],
    fields: [
      { name: 'bill_number', label: 'Bill Number', type: 'text', placeholder: 'INV-2024-001' },
      { name: 'bill_date', label: 'Bill Date', type: 'date' },
      { name: 'card_number', label: 'Card / Reference Number', type: 'text', placeholder: 'Last 4 digits or ref #' },
      { name: 'payment_mode', label: 'Payment Mode', type: 'select', options: ['Cash', 'Card', 'UPI', 'Bank Transfer'] },
      { name: 'customer_name', label: 'Customer Name', type: 'text', placeholder: 'Customer Name' },
      { name: 'customer_address', label: 'Customer Address', type: 'textarea', placeholder: 'Customer Address (Optional)' },
      { name: 'subtotal', label: 'Subtotal', type: 'text', placeholder: '₹0.00', readOnly: true },
      { name: 'amount_in_words', label: 'Amount in Words', type: 'text', placeholder: 'Rupees Three Thousand Five Hundred Only' },
    ],
  },

  [CERTIFICATE_CATEGORIES.ID_CARD]: {
    title: 'Employee ID Card',
    icon: 'id-card',
    description: 'Matches IDCardCertificate model',
    requiredFields: ['candidate_name', 'designation', 'date_of_joining', 'contact_number'],
    fields: [
      { name: 'candidate_name', label: 'Candidate Name', type: 'text', placeholder: 'Full Name' },
      { name: 'designation', label: 'Designation', type: 'text', placeholder: 'Spa Therapist / Manager' },
      { name: 'date_of_joining', label: 'Date of Joining', type: 'date' },
      { name: 'contact_number', label: 'Contact Number', type: 'text', placeholder: 'Mobile Number' },
      { name: 'issue_date', label: 'Issue Date', type: 'date' },
      { name: 'candidate_photo', label: 'Candidate Photo', type: 'file' },
    ],
  },
};




// ========================
// INVOICE ITEM TEMPLATE
// ========================

export const INVOICE_ITEM_TEMPLATE = {
  description: '',
  hsn_code: '',
  quantity: '1',
  rate: '',
  amount: '',
};

// ========================
// TEMPLATE TYPES
// ========================

export const TEMPLATE_TYPES = {
  IMAGE: 'image',
  HTML: 'html',
};

// ========================
// FORM STATES
// ========================

export const FORM_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  PREVIEW: 'preview',
  GENERATING: 'generating',
  SUCCESS: 'success',
  ERROR: 'error',
};

// ========================
// ERROR MESSAGES
// ========================

export const ERROR_MESSAGES = {
  TEMPLATE_NOT_SELECTED: 'Please select a certificate template',
  LOAD_TEMPLATES_FAILED: 'Failed to load certificate templates',
  LOAD_TEMPLATE_FAILED: 'Failed to load template details',
  PREVIEW_FAILED: 'Failed to preview certificate',
  GENERATE_FAILED: 'Failed to generate certificate',
  DOWNLOAD_FAILED: 'Failed to download certificate',
  NAME_REQUIRED: 'Please enter a name before preview or generate',
  SPA_REQUIRED: 'Please select an SPA location for this certificate',
};

// ========================
// SUCCESS MESSAGES
// ========================

export const SUCCESS_MESSAGES = {
  PREVIEW_SUCCESS: 'Certificate preview generated successfully',
  GENERATE_SUCCESS: 'Certificate generated and downloaded successfully',
  CREATE_TEMPLATE_SUCCESS: 'Template created successfully',
  UPDATE_TEMPLATE_SUCCESS: 'Template updated successfully',
  DELETE_TEMPLATE_SUCCESS: 'Template deleted successfully',
};

// ========================
// DEFAULT FORM DATA
// ========================



export default {
  CERTIFICATE_CATEGORIES,
  CERTIFICATE_CATEGORY_METADATA,
  CERTIFICATE_FIELDS,
  INVOICE_ITEM_TEMPLATE,
  TEMPLATE_TYPES,
  FORM_STATES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  SPA_REQUIRED_CATEGORIES,
};
