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
   * @param {Object} params - Query parameters (skip, limit)
   * @returns {Promise}
   */
  getCertificates: (params = {}) => {
    // Use public generated certificates endpoint
    return apiClient.get('/certificates/generated/public', { params });
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
};

