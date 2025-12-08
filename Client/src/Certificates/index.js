/**
 * Certificates Module
 * Public certificate creation and management components
 * 
 * Central entry point for all certificate-related modules
 * 
 * Usage:
 * import { certificateApi, prepareCertificateData } from '@/Certificates';
 * 
 * Note: Page components (Certifications, CreateCertifications, ViewCertificates) 
 * are lazy-loaded in the router for code splitting. Import them directly if needed:
 * import Certifications from '@/Certificates/Certifications';
 */

// Page Components - NOT exported here to avoid conflicts with lazy loading
// Import directly: import Certifications from '@/Certificates/Certifications';
// export { default as Certifications } from './Certifications';
// export { default as CreateCertifications } from './CreateCertifications';
// export { default as ViewCertificates } from './ViewCertificates';

// API Service
export { certificateApi } from '../api/Certificates/certificateApi';

// Constants
export {
  CERTIFICATE_CATEGORIES,
  CERTIFICATE_FIELDS,
  INVOICE_ITEM_TEMPLATE,
  TEMPLATE_TYPES,
  FORM_STATES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from '../utils/certificateConstants';

// Utilities
export {
  prepareCertificateData,
  generateSalaryBreakdown,
  calculateInvoiceTotal,
  numberToWords,
  formatDate,
  formatDateVerbose,
  formatCurrency,
  validateFormData,
  generateCertificateFilename,
  downloadFile,
  isValidEmail,
  isValidPhone,
  getCategoryDisplayName,
  getCategoryIcon,
} from '../utils/certificateUtils';


// Template Helpers
export { getCertificateFormComponent } from './components';
 

// Legacy Combined Component (for backward compatibility)
// export { CertificateFormFields } from './components';

/**
 * Quick Reference Guide
 * 
 * 1. GET TEMPLATES
 *    import { certificateApi } from '@/Certificates';
 *    const templates = await certificateApi.getPublicTemplates();
 * 
 * 2. PREPARE DATA
 *    import { prepareCertificateData } from '@/Certificates';
 *    const data = prepareCertificateData(category, formData);
 * 
 * 3. GENERATE CERTIFICATE
 *    const pdf = await certificateApi.generateCertificate({
 *      template_id: 1,
 *      name: 'John Doe',
 *      certificate_data: data
 *    });
 * 
 * 4. DOWNLOAD
 *    import { downloadFile } from '@/Certificates';
 *    downloadFile(pdf.data, 'certificate.pdf');
 * 
 * 5. VALIDATE
 *    import { validateFormData } from '@/Certificates';
 *    const { isValid, errors } = validateFormData(formData);
 * 
 * 6. FORMAT
 *    import { formatCurrency, formatDate, numberToWords } from '@/Certificates';
 *    formatCurrency(1250);           // ₹1250.00
 *    formatDate('2025-01-15');       // 15/01/2025
 *    numberToWords(1250);            // One Thousand Two Hundred Fifty Only
 * 
 * 7. USE FORM COMPONENT
 *    import { getCertificateFormComponent } from '@/Certificates';
 *    const FormComponent = getCertificateFormComponent('MANAGER_SALARY');
 *    <FormComponent formData={data} handleInputChange={handler} />
 * 
 * INDIVIDUAL FORM COMPONENTS
 * ===========================
 * - SpaTherapistCertificateForm      → Spa/Course completion certificates
 * - ManagerSalaryCertificateForm     → Salary verification certificates
 * - ExperienceLetterForm             → Work experience letters
 * - AppointmentLetterForm            → Appointment/Joining letters
 * - OfferLetterForm                  → Job offer letters
 * - InvoiceCertificateForm           → Service invoices/SPA bills
 * - getCertificateFormComponent()    → Helper to get component by type
 */

