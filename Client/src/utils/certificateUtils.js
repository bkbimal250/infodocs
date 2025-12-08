/**
 * Certificate Utilities
 * Helper functions for certificate data preparation and validation
 */

import {
  CERTIFICATE_CATEGORIES,
  CERTIFICATE_CATEGORY_METADATA,
  INVOICE_ITEM_TEMPLATE,
} from './certificateConstants';

/**
 * Convert blob URL to base64 data URL
 * Needed for PDF generation as blob URLs don't work server-side
 * @param {string} blobUrl - Blob URL (blob:http://...)
 * @returns {Promise<string>} Base64 data URL (data:image/...)
 */
export const blobToBase64 = async (blobUrl) => {
  if (!blobUrl || !blobUrl.startsWith('blob:')) {
    // Already base64 or other format, return as is
    return blobUrl;
  }

  try {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting blob URL to base64:', error);
    // Return empty string on error to avoid broken images
    return '';
  }
};

/**
 * Convert all blob URLs in certificate data to base64
 * Recursively processes nested objects and arrays
 * @param {Object|Array|string} data - Data to process
 * @param {boolean} convertForPDF - If true, convert blob URLs to base64 (for PDF generation)
 * @returns {Promise<Object|Array|string>} Data with blob URLs converted to base64
 */
export const convertBlobUrlsToBase64 = async (data, convertForPDF = false) => {
  if (!convertForPDF) {
    // For preview, keep blob URLs as they work in browsers
    return data;
  }

  if (typeof data === 'string' && data.startsWith('blob:')) {
    // Convert blob URL to base64
    return await blobToBase64(data);
  }

  if (Array.isArray(data)) {
    // Process array items
    return Promise.all(data.map(item => convertBlobUrlsToBase64(item, convertForPDF)));
  }

  if (data && typeof data === 'object') {
    // Process object properties
    const result = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = await convertBlobUrlsToBase64(value, convertForPDF);
    }
    return result;
  }

  // Primitive value, return as is
  return data;
};

/**
 * Convert blob URL to base64 data URL
 * Needed for PDF generation as blob URLs don't work server-side
 * @param {string} blobUrl - Blob URL (blob:http://...)
 * @returns {Promise<string>} Base64 data URL (data:image/...)
 */
export const blobToBase64 = async (blobUrl) => {
  if (!blobUrl || !blobUrl.startsWith('blob:')) {
    // Already base64 or other format, return as is
    return blobUrl;
  }

  try {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting blob URL to base64:', error);
    // Return empty string on error to avoid broken images
    return '';
  }
};

/**
 * Convert all blob URLs in an object to base64
 * Recursively processes nested objects
 * @param {Object} data - Data object to process
 * @returns {Promise<Object>} Data with blob URLs converted to base64
 */
export const convertBlobUrlsInData = async (data) => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const result = { ...data };
  
  for (const [key, value] of Object.entries(result)) {
    if (typeof value === 'string' && value.startsWith('blob:')) {
      // Convert blob URL to base64
      result[key] = await blobToBase64(value);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Recursively process nested objects
      result[key] = await convertBlobUrlsInData(value);
    } else if (Array.isArray(value)) {
      // Process array items
      result[key] = await Promise.all(
        value.map(item => 
          typeof item === 'string' && item.startsWith('blob:') 
            ? blobToBase64(item) 
            : (item && typeof item === 'object' ? convertBlobUrlsInData(item) : item)
        )
      );
    }
  }
  
  return result;
};

const buildSpaPayload = (formData = {}) => {
  const spaData = {
    id: formData.spa_id || '',
    name: formData.spa_name || '',
    address: formData.spa_address || '',
    city: formData.spa_city || '',
    area: formData.spa_area || '',
    state: formData.spa_state || '',
    country: formData.spa_country || '',
    pincode: formData.spa_pincode || '',
    phone_number: formData.spa_phone || '',
    alternate_number: formData.spa_phone1 || '',
    email: formData.spa_email || '',
    website: formData.spa_website || '',
    logo: formData.spa_logo || '', // Include logo if available
  };

  const hasValue = Object.values(spaData).some((value) => Boolean(value));
  return hasValue ? spaData : null;
};

/**
 * Prepare certificate data based on template category
 * Filters and structures data according to the certificate type
 * @param {string} category - Certificate category
 * @param {Object} formData - Form data object
 * @param {Array} invoiceItems - Invoice items (if applicable)
 * @returns {Object} Structured certificate data
 */
export const prepareCertificateData = (category, formData, invoiceItems = []) => {
  // Common fields for all certificates
  const spaPayload = buildSpaPayload(formData);
  const normalizedItems =
    invoiceItems && invoiceItems.length
      ? invoiceItems
      : formData.invoiceItems || [];

  // Base data - common fields for most certificates
  // Note: SPA_THERAPIST does NOT include signatory_name, signatory_title, or spa_id
  const baseData = {
    date: formData.date || new Date().toLocaleDateString('en-GB'),
  };
  
  // Add signatory and spa fields only for categories that need them
  if (category !== CERTIFICATE_CATEGORIES.SPA_THERAPIST) {
    baseData.signatory_name = formData.signatory_name || '';
    baseData.signatory_title = formData.signatory_title || 'Manager';
    baseData.spa_id = spaPayload?.id || formData.spa_id || '';
    if (spaPayload) {
      baseData.spa = spaPayload;
    }
  }

  // Category-specific data preparation
  switch (category) {
    case CERTIFICATE_CATEGORIES.SPA_THERAPIST:
      return {
        ...baseData,
        candidate_name: formData.candidate_name || '',
        course_name: formData.course_name || '',
        start_date: formData.start_date || '',
        end_date: formData.end_date || '',
        passport_size_photo: formData.passport_size_photo || '',
        candidate_signature: formData.candidate_signature || '',
      };

    case CERTIFICATE_CATEGORIES.MANAGER_SALARY: {
      // First, check if month_year_list and month_salary_list already exist in formData
      // This is the primary source from ManagerSalaryCertificateForm
      let monthYearList = formData.month_year_list;
      let monthSalaryList = formData.month_salary_list;
      
      // Ensure they are arrays
      if (!Array.isArray(monthYearList)) {
        monthYearList = [];
      }
      if (!Array.isArray(monthSalaryList)) {
        monthSalaryList = [];
      }
      
      // Filter out empty entries
      const validEntries = [];
      for (let i = 0; i < Math.max(monthYearList.length, monthSalaryList.length); i++) {
        const month = (monthYearList[i] || '').toString().trim();
        const salary = (monthSalaryList[i] || '').toString().trim();
        if (month || salary) {
          validEntries.push({ month, salary });
        }
      }
      
      // If we have valid entries from formData, use them
      let salaryBreakdown = validEntries.length > 0 
        ? validEntries 
        : null;
      
      // If not, try to get from salary_breakdown or month_salary_data
      if (!salaryBreakdown) {
        let breakdown = formData.salary_breakdown || formData.month_salary_data;
        if (typeof breakdown === 'string') {
          try {
            const parsed = JSON.parse(breakdown);
            breakdown = Array.isArray(parsed) ? parsed : [];
          } catch {
            breakdown = [];
          }
        }
        if (Array.isArray(breakdown) && breakdown.length > 0) {
          salaryBreakdown = breakdown;
        }
      }
      
      // If still no data, generate default breakdown
      if (!salaryBreakdown || salaryBreakdown.length === 0) {
        salaryBreakdown = generateSalaryBreakdown(formData);
      }
      
      // Extract month_year_list and month_salary_list from salaryBreakdown
      // This ensures they're always in sync
      const finalMonthYearList = salaryBreakdown.map((entry) => entry.month || entry.month_year || '');
      const finalMonthSalaryList = salaryBreakdown.map((entry) => entry.salary || entry.amount || '');

      return {
        ...baseData,
        manager_name: formData.manager_name || formData.employee_name || '',
        position: formData.position || 'Manager',
        joining_date: formData.joining_date || '',
        monthly_salary: formData.monthly_salary || '',
        monthly_salary_in_words: formData.monthly_salary_in_words || formData.salary_in_words || '',
        salary_breakdown: salaryBreakdown,
        month_year_list: finalMonthYearList,
        month_salary_list: finalMonthSalaryList,
      };
    }

    case CERTIFICATE_CATEGORIES.OFFER_LETTER:
      return {
        ...baseData,
        employee_name: formData.employee_name || formData.recipient_name || formData.name || '',
        position: formData.position || '',
        start_date: formData.start_date || '',
        salary: formData.salary || formData.monthly_salary || '',
        manager_signature: formData.manager_signature || '',
      };

    case CERTIFICATE_CATEGORIES.EXPERIENCE_LETTER:
      return {
        ...baseData,
        candidate_name: formData.candidate_name || formData.employee_name || formData.recipient_name || '',
        position: formData.position || '',
        joining_date: formData.joining_date || formData.start_date || '',
        end_date: formData.end_date || '',
        duration: formData.duration || '',
        salary: formData.salary || '',
        performance_description: formData.performance_description || 'He/She has been an excellent employee, fulfilling all duties professionally.',
      };

    case CERTIFICATE_CATEGORIES.APPOINTMENT_LETTER:
      return {
        ...baseData,
        employee_name: formData.employee_name || formData.name || '',
        position: formData.position || '',
        start_date: formData.start_date || '',
        salary: formData.salary || '',
        manager_signature: formData.manager_signature || '',
      };

    case CERTIFICATE_CATEGORIES.INVOICE_SPA_BILL:
      const validItems = (normalizedItems || []).filter(
        (item) => item.description && (item.rate || item.amount)
      );
      return {
        ...baseData,
        bill_number: formData.bill_number || formData.invoiceNumber || '',
        bill_date: formData.bill_date || formData.invoiceDate || formData.date || '',
        card_number: formData.card_number || formData.payment_reference || '',
        payment_mode: formData.payment_mode || 'Cash',
        customer_name: formData.customer_name || formData.clientName || formData.name || '',
        customer_address: formData.customer_address || formData.clientAddress || '',
        items: validItems,
        subtotal: formData.subtotal || '₹0.00',
        amount_in_words: formData.amount_in_words || '',
      };

    case CERTIFICATE_CATEGORIES.ID_CARD:
      return {
        ...baseData,
        candidate_name: formData.candidate_name || '',
        designation: formData.designation || '',
        date_of_joining: formData.date_of_joining || '',
        contact_number: formData.contact_number || '',
        issue_date: formData.issue_date || '',
        // cropped image comes from ImageUpload as a data URL
        candidate_photo: formData.candidate_photo || '',
      };

    default:
      return baseData;
  }
};

/**
 * Generate salary breakdown for the last 6 months
 * @param {Object} formData - Form data containing monthly_salary
 * @returns {Array} Array of monthly salary records
 */
export const generateSalaryBreakdown = (formData) => {
  const months = [];
  const currentDate = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthStr = date.toLocaleString('default', { month: 'short' }).toUpperCase();
    const year = date.getFullYear();
    
    months.push({
      month: `${monthStr}-${year}`,
      salary: formData.monthly_salary || '40,000',
    });
  }
  
  return months;
};

/**
 * Calculate invoice total and format in words
 * @param {Array} items - Invoice items
 * @returns {Object} { subtotal, total, totalInWords }
 */
export const calculateInvoiceTotal = (items) => {
  const subtotal = items.reduce((sum, item) => {
    const quantity = Number(item.quantity || 1);
    const rate = Number(item.rate || 0);
    return sum + quantity * rate;
  }, 0);

  return {
    subtotal: `₹${subtotal.toFixed(2)}`,
    total: subtotal,
    totalInWords: numberToWords(Math.floor(subtotal)),
  };
};

/**
 * Convert number to words (for amount in words)
 * @param {number} num - Number to convert
 * @returns {string} Number in words with "Only"
 */
export const numberToWords = (num) => {
  if (num === 0) {
    return 'Zero Only';
  }
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  
  const convert = (n) => {
    if (n === 0) return '';
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convert(n % 100) : '');
    if (n < 1000000) {
      return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    }
    return convert(Math.floor(n / 1000000)) + ' Million' + (n % 1000000 ? ' ' + convert(n % 1000000) : '');
  };
  
  return convert(num) + ' Only';
};

/**
 * Format date to DD/MM/YYYY format
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date
 */
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Format date to "DDth MMM, YYYY" format
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date
 */
export const formatDateVerbose = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const day = d.getDate();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  
  // Add suffix to day (st, nd, rd, th)
  let daySuffix = 'th';
  if (day === 1 || day === 21 || day === 31) daySuffix = 'st';
  else if (day === 2 || day === 22) daySuffix = 'nd';
  else if (day === 3 || day === 23) daySuffix = 'rd';
  
  return `${day}${daySuffix} ${month}, ${year}`;
};

/**
 * Format currency with Indian rupee symbol
 * @param {number} amount - Amount to format
 * @returns {string} Formatted amount
 */
export const formatCurrency = (amount) => {
  if (!amount) return '₹0.00';
  return `₹${parseFloat(amount).toFixed(2)}`;
};

/**
 * Validate form data based on required fields
 * @param {Object} formData - Form data to validate
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} { isValid, errors }
 */
export const validateFormData = (formData, requiredFields = []) => {
  const errors = [];
  requiredFields.forEach(field => {
    if (!formData[field] || formData[field].toString().trim() === '') {
      errors.push(`${field.replace(/_/g, ' ')} is required`);
    }
  });
  return { isValid: errors.length === 0, errors };
};

/**
 * Generate certificate filename based on template and recipient
 * @param {string} templateName - Template name
 * @param {string} recipientName - Recipient name
 * @returns {string} Generated filename
 */
export const generateCertificateFilename = (templateName, recipientName) => {
  const cleanName = recipientName.replace(/\s+/g, '_').toLowerCase();
  const cleanTemplate = templateName.replace(/\s+/g, '_').toLowerCase();
  const timestamp = new Date().getTime();
  return `certificate_${cleanTemplate}_${cleanName}_${timestamp}.pdf`;
};

/**
 * Handle certificate download
 * @param {Blob} blob - File blob
 * @param {string} filename - Filename for download
 */
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Indian format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone number
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$|^\+91[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Get certificate category display name
 * @param {string} category - Category key
 * @returns {string} Display name
 */
export const getCategoryDisplayName = (category) =>
  CERTIFICATE_CATEGORY_METADATA[category]?.title || category;

/**
 * Get certificate category icon
 * @param {string} category - Category key
 * @returns {string} Icon name
 */
export const getCategoryIcon = (category) => {
  const iconKey = CERTIFICATE_CATEGORY_METADATA[category]?.icon;
  const emojiFallback = {
    spa: '🏆',
    salary: '💰',
    offer: '📧',
    experience: '📄',
    appointment: '📋',
    invoice: '🧾',
  };
  return emojiFallback[iconKey] || '📜';
};

export default {
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
  blobToBase64,
  convertBlobUrlsInData,
};
