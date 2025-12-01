import apiClient from '../../utils/apiConfig';

/**
 * Manager API endpoints
 * Manager can see ONLY their own forms and certificates (what they created)
 */
export const managerApi = {
  /**
   * Get manager's own candidate forms
   * @param {Object} params - Query parameters (skip, limit)
   * @returns {Promise}
   */
  getMyCandidateForms: (params = {}) => {
    // Backend will automatically filter by current_user.id for managers
    return apiClient.get('/forms/candidate-forms', { params });
  },

  /**
   * Get a single candidate form (only if created by manager)
   * @param {number} id - Form ID
   * @returns {Promise}
   */
  getCandidateForm: (id) => {
    return apiClient.get(`/forms/candidate-forms/${id}`);
  },

  /**
   * Update a candidate form (only if created by manager)
   * @param {number} id - Form ID
   * @param {Object} data - Updated form data
   * @returns {Promise}
   */
  updateCandidateForm: (id, data) => {
    return apiClient.put(`/forms/candidate-forms/${id}`, data);
  },

  /**
   * Delete a candidate form (only if created by manager)
   * @param {number} id - Form ID
   * @returns {Promise}
   */
  deleteCandidateForm: (id) => {
    return apiClient.delete(`/forms/candidate-forms/${id}`);
  },

  /**
   * Get manager's own hiring forms
   * @param {Object} params - Query parameters (skip, limit)
   * @returns {Promise}
   */
  getMyHiringForms: (params = {}) => {
    // Backend will automatically filter by current_user.id for managers
    return apiClient.get('/forms/hiring-forms', { params });
  },

  /**
   * Get a single hiring form (only if created by manager)
   * @param {number} id - Form ID
   * @returns {Promise}
   */
  getHiringForm: (id) => {
    return apiClient.get(`/forms/hiring-forms/${id}`);
  },

  /**
   * Update a hiring form (only if created by manager)
   * @param {number} id - Form ID
   * @param {Object} data - Updated form data
   * @returns {Promise}
   */
  updateHiringForm: (id, data) => {
    return apiClient.put(`/forms/hiring-forms/${id}`, data);
  },

  /**
   * Delete a hiring form (only if created by manager)
   * @param {number} id - Form ID
   * @returns {Promise}
   */
  deleteHiringForm: (id) => {
    return apiClient.delete(`/forms/hiring-forms/${id}`);
  },

  /**
   * Get manager's own certificates
   * @param {Object} params - Query parameters (skip, limit)
   * @returns {Promise}
   */
  getMyCertificates: (params = {}) => {
    return apiClient.get('/certificates/generated/my-certificates', { params });
  },

  /**
   * Get a single certificate (only if created by manager)
   * @param {number} id - Certificate ID
   * @returns {Promise}
   */
  getCertificate: (id) => {
    return apiClient.get(`/certificates/generated/${id}`);
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
   * Get all SPAs (for form creation)
   * @returns {Promise}
   */
  getSpas: () => {
    return apiClient.get('/forms/spas');
  },

  /**
   * Get certificate templates
   * @returns {Promise}
   */
  getTemplates: () => {
    return apiClient.get('/certificates/templates');
  },

  /**
   * Generate a certificate
   * @param {number} templateId - Template ID
   * @param {Object} data - Certificate data
   * @returns {Promise}
   */
  generateCertificate: (templateId, data) => {
    return apiClient.post(`/certificates/templates/${templateId}/generate`, data);
  },
};

