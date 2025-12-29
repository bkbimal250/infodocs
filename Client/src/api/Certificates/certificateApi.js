import apiClient from '../../utils/apiConfig';

/**
 * Public Certificate API endpoints
 * These endpoints are publicly accessible (no authentication required)
 */
export const certificateApi = {
  /**
   * Get all public certificate templates
   * @param {string} category - Optional category filter
   * @param {string} variant - Optional variant filter
   * @returns {Promise}
   */
  getPublicTemplates: (category = null, variant = null) => {
    const params = {};
    if (category) params.category = category;
    if (variant) params.variant = variant;
    return apiClient.get('/certificates/templates', { params });
  },

  /**
   * Get templates by category grouped by variant
   * @param {string} category - Certificate category
   * @returns {Promise} - Returns { variantName: [templates] }
   */
  getTemplatesByCategory: (category) => {
    return apiClient.get(`/certificates/templates/by-category/${category}`);
  },

  /**
   * Get all active SPA locations (public)
   * @returns {Promise}
   */
  getSpas: () => {
    return apiClient.get('/forms/spas');
  },

  /**
   * Get a single certificate template (public)
   * @param {number} id - Template ID
   * @returns {Promise}
   */
  getTemplate: (id) => {
    return apiClient.get(`/certificates/templates/${id}`);
  },

  /**
   * Preview certificate HTML before generation
   * @param {Object} data - { template_id, name, email, certificate_data }
   * @returns {Promise}
   */
  previewCertificate: (data) => {
    return apiClient.post('/certificates/preview', data);
  },

  /**
   * Generate a public certificate and return PDF for download
   * @param {Object} data - { template_id, name, email, certificate_data }
   * @returns {Promise} - Returns blob for PDF download
   */
  generateCertificate: (data) => {
    return apiClient.post('/certificates/generate', data, {
      responseType: 'blob',
    });
  },

  /**
   * Get a single certificate (public)
   * @param {number} id - Certificate ID
   * @returns {Promise}
   */
  getCertificate: (id) => {
    return apiClient.get(`/certificates/generated/${id}`);
  },

  /**
   * Download certificate as PDF
   * @param {number} certificateId - Certificate ID
   * @returns {Promise}
   */
  downloadPDF: (certificateId) => {
    return apiClient.get(`/certificates/generated/${certificateId}/download/pdf`, {
      responseType: 'blob',
    });
  },

  /**
   * Download certificate as image (PNG)
   * @param {number} certificateId - Certificate ID
   * @returns {Promise}
   */
  downloadImage: (certificateId) => {
    return apiClient.get(`/certificates/generated/${certificateId}/download/image`, {
      responseType: 'blob',
    });
  },

  /**
   * Remove background from an image file
   * @param {File} file - Image file to remove background from
   * @param {string} outputFormat - Output format (PNG, JPEG, etc.). Default is PNG.
   * @returns {Promise} - Returns { success, image (base64 data URL), format }
   */
  removeBackground: (file, outputFormat = 'PNG') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('output_format', outputFormat);
    return apiClient.post('/certificates/remove-background', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Remove background from a base64-encoded image
   * @param {string} base64Image - Base64-encoded image string (with or without data URL prefix)
   * @param {string} outputFormat - Output format (PNG, JPEG, etc.). Default is PNG.
   * @returns {Promise} - Returns { success, image (base64 data URL), format }
   */
  removeBackgroundFromBase64: (base64Image, outputFormat = 'PNG') => {
    const formData = new FormData();
    formData.append('image', base64Image);
    formData.append('output_format', outputFormat);
    return apiClient.post('/certificates/remove-background-base64', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

