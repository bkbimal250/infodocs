import apiClient from '../../utils/apiConfig';

/**
 * HR API endpoints
 * HR can see ALL forms and hiring data from all users (users, manager, admin)
 */
export const hrApi = {
  /**
   * Get all candidate forms (from all users)
   * @param {Object} params - Query parameters (skip, limit)
   * @returns {Promise}
   */
  getCandidateForms: (params = {}) => {
    return apiClient.get('/forms/candidate-forms', { params });
  },

  /**
   * Get a single candidate form
   * @param {number} id - Form ID
   * @returns {Promise}
   */
  getCandidateForm: (id) => {
    return apiClient.get(`/forms/candidate-forms/${id}`);
  },

  /**
   * Update a candidate form
   * @param {number} id - Form ID
   * @param {Object} data - Updated form data
   * @returns {Promise}
   */
  updateCandidateForm: (id, data) => {
    return apiClient.put(`/forms/candidate-forms/${id}`, data);
  },

  /**
   * Delete a candidate form
   * @param {number} id - Form ID
   * @returns {Promise}
   */
  deleteCandidateForm: (id) => {
    return apiClient.delete(`/forms/candidate-forms/${id}`);
  },

  /**
   * Get all hiring forms (from all users)
   * @param {Object} params - Query parameters (skip, limit)
   * @returns {Promise}
   */
  getHiringForms: (params = {}) => {
    return apiClient.get('/forms/hiring-forms', { params });
  },

  /**
   * Get a single hiring form
   * @param {number} id - Form ID
   * @returns {Promise}
   */
  getHiringForm: (id) => {
    return apiClient.get(`/forms/hiring-forms/${id}`);
  },

  /**
   * Update a hiring form
   * @param {number} id - Form ID
   * @param {Object} data - Updated form data
   * @returns {Promise}
   */
  updateHiringForm: (id, data) => {
    return apiClient.put(`/forms/hiring-forms/${id}`, data);
  },

  /**
   * Delete a hiring form
   * @param {number} id - Form ID
   * @returns {Promise}
   */
  deleteHiringForm: (id) => {
    return apiClient.delete(`/forms/hiring-forms/${id}`);
  },

  /**
   * Get all certificates (from all users)
   * HR can see all certificates, not just public ones
   * @param {Object} params - Query parameters (skip, limit)
   * @returns {Promise}
   */
  getCertificates: (params = {}) => {
    // Use HR-specific endpoint to get all certificates
    return apiClient.get('/certificates/hr/all', { params });
  },

  /**
   * Get a single certificate
   * @param {number} id - Certificate ID
   * @returns {Promise}
   */
  getCertificate: (id) => {
    return apiClient.get(`/certificates/generated/${id}`);
  },

  /**
   * Get all SPAs
   * @returns {Promise}
   */
  getSpas: () => {
    return apiClient.get('/forms/spas/all');
  },

  /**
   * Get all certificate templates (public templates)
   * @returns {Promise}
   */
  getTemplates: () => {
    return apiClient.get('/certificates/templates');
  },

  /**
   * Generate a certificate
   * @param {Object} data - Certificate data { template_id, name, certificate_data, spa_id? }
   * @returns {Promise} - Returns blob for PDF download
   */
  generateCertificate: (data) => {
    return apiClient.post('/certificates/generate', data, {
      responseType: 'blob',
    });
  },

  /**
   * Download certificate PDF
   * @param {number} id - Certificate ID
   * @returns {Promise}
   */
  downloadCertificatePDF: (id) => {
    return apiClient.get(`/certificates/generated/${id}/download/pdf`, {
      responseType: 'blob'
    });
  },

  /**
   * Download certificate Image
   * @param {number} id - Certificate ID
   * @returns {Promise}
   */
  downloadCertificateImage: (id) => {
    return apiClient.get(`/certificates/generated/${id}/download/image`, {
      responseType: 'blob'
    });
  },
};

