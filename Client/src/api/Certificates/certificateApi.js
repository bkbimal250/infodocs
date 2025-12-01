import apiClient from '../../utils/apiConfig';

/**
 * Public Certificate API endpoints
 * These endpoints are publicly accessible (no authentication required)
 */
export const certificateApi = {
  /**
   * Get all public certificate templates
   * @returns {Promise}
   */
  getPublicTemplates: () => {
    return apiClient.get('/certificates/templates');
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
};

