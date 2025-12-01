import apiClient from '../../utils/apiConfig';

/**
 * Admin API endpoints
 * These endpoints are for admin role users
 */
export const adminApi = {
  /**
   * Certificate Template Management
   */
  certificates: {
    /**
     * Get all certificate templates (admin can see all)
     * @returns {Promise}
     */
    getTemplates: () => {
      return apiClient.get('/certificates/templates');
    },

    /**
     * Get a single certificate template
     * @param {number} id - Template ID
     * @returns {Promise}
     */
    getTemplate: (id) => {
      return apiClient.get(`/certificates/templates/${id}`);
    },

    /**
     * Create a new certificate template
     * @param {Object} data - Template data
     * @returns {Promise}
     */
    createTemplate: (data) => {
      return apiClient.post('/certificates/templates', data);
    },

    /**
     * Update a certificate template
     * @param {number} id - Template ID
     * @param {Object} data - Template data
     * @returns {Promise}
     */
    updateTemplate: (id, data) => {
      return apiClient.put(`/certificates/templates/${id}`, data);
    },

    /**
     * Partially update a certificate template
     * @param {number} id - Template ID
     * @param {Object} data - Template data
     * @returns {Promise}
     */
    patchTemplate: (id, data) => {
      return apiClient.patch(`/certificates/templates/${id}`, data);
    },

    /**
     * Delete a certificate template
     * @param {number} id - Template ID
     * @returns {Promise}
     */
    deleteTemplate: (id) => {
      return apiClient.delete(`/certificates/templates/${id}`);
    },

    /**
     * Get all certificate positions for a template
     * @param {number} templateId - Template ID
     * @returns {Promise}
     */
    getPositions: (templateId) => {
      return apiClient.get(`/certificates/positions/?template_id=${templateId}`);
    },

    /**
     * Create a certificate position
     * @param {Object} data - Position data
     * @returns {Promise}
     */
    createPosition: (data) => {
      return apiClient.post('/certificates/positions/', data);
    },

    /**
     * Update a certificate position
     * @param {number} id - Position ID
     * @param {Object} data - Position data
     * @returns {Promise}
     */
    updatePosition: (id, data) => {
      return apiClient.put(`/certificates/positions/${id}/`, data);
    },

    /**
     * Delete a certificate position
     * @param {number} id - Position ID
     * @returns {Promise}
     */
    deletePosition: (id) => {
      return apiClient.delete(`/certificates/positions/${id}/`);
    },

    /**
     * Get all generated certificates
     * @returns {Promise}
     */
    getGeneratedCertificates: () => {
      return apiClient.get('/certificates/generated');
    },

    /**
     * Get certificate statistics (admin only)
     * @returns {Promise}
     */
    getStatistics: () => {
      return apiClient.get('/certificates/admin/statistics');
    },

    /**
     * Get all certificates with user info (admin only)
     * @param {Object} params - Query parameters (skip, limit)
     * @returns {Promise}
     */
    getAllCertificates: (params = {}) => {
      return apiClient.get('/certificates/admin/all', { params });
    },

    /**
     * Generate a certificate for a candidate
     * @param {number} templateId - Template ID
     * @param {Object} data - { candidate_id, certificate_data }
     * @returns {Promise}
     */
    generateCertificate: (templateId, data) => {
      return apiClient.post(`/certificates/templates/${templateId}/generate`, data);
    },

    /**
     * Download a certificate
     * @param {number} certificateId - Certificate ID
     * @returns {Promise}
     */
    downloadCertificate: (certificateId) => {
      return apiClient.get(`/certificates/generated/${certificateId}/download`, {
        responseType: 'blob',
      });
    },
  },

  /**
   * User Management
   */
  users: {
    /**
     * Get all users
     * @returns {Promise}
     */
    getUsers: () => {
      return apiClient.get('/users');
    },

    /**
     * Get a single user
     * @param {number} id - User ID
     * @returns {Promise}
     */
    getUser: (id) => {
      return apiClient.get(`/users/${id}`);
    },

    /**
     * Create a new user
     * @param {Object} data - User data
     * @returns {Promise}
     */
    createUser: (data) => {
      return apiClient.post('/users', data);
    },

    /**
     * Update a user
     * @param {number} id - User ID
     * @param {Object} data - User data
     * @returns {Promise}
     */
    updateUser: (id, data) => {
      return apiClient.put(`/users/${id}`, data);
    },

    /**
     * Delete a user
     * @param {number} id - User ID
     * @returns {Promise}
     */
    deleteUser: (id) => {
      return apiClient.delete(`/users/${id}`);
    },
  },

  /**
   * Analytics
   */
  analytics: {
    /**
     * Get overall analytics
     * @returns {Promise}
     */
    getAnalytics: () => {
      return apiClient.get('/analytics');
    },

    /**
     * Get candidate analytics
     * @returns {Promise}
     */
    getCandidateAnalytics: () => {
      return apiClient.get('/analytics/candidates');
    },

    /**
     * Get certificate analytics
     * @returns {Promise}
     */
    getCertificateAnalytics: () => {
      return apiClient.get('/analytics/certificates');
    },
  },

  /**
   * Forms Management
   */
  forms: {
    /**
     * Get all SPAs (including inactive)
     * @returns {Promise}
     */
    getAllSpas: () => {
      return apiClient.get('/forms/spas/all');
    },

    /**
     * Get active SPAs only
     * @returns {Promise}
     */
    getSpas: () => {
      return apiClient.get('/forms/spas');
    },

    /**
     * Get a single SPA
     * @param {number} id - SPA ID
     * @returns {Promise}
     */
    getSpa: (id) => {
      return apiClient.get(`/forms/spas/${id}`);
    },

    /**
     * Create a new SPA
     * @param {Object} data - SPA data
     * @returns {Promise}
     */
    createSpa: (data) => {
      return apiClient.post('/forms/spas', data);
    },

    /**
     * Update a SPA
     * @param {number} id - SPA ID
     * @param {Object} data - SPA data
     * @returns {Promise}
     */
    updateSpa: (id, data) => {
      return apiClient.put(`/forms/spas/${id}`, data);
    },

    /**
     * Delete a SPA
     * @param {number} id - SPA ID
     * @returns {Promise}
     */
    deleteSpa: (id) => {
      return apiClient.delete(`/forms/spas/${id}`);
    },



    

    /**
     * Get all candidate forms
     * @param {number} skip - Skip records
     * @param {number} limit - Limit records
     * @returns {Promise}
     */
    getCandidateForms: (skip = 0, limit = 100) => {
      return apiClient.get(`/forms/candidate-forms?skip=${skip}&limit=${limit}`);
    },

    /**
     * Get a single candidate form
     * @param {number} id - Candidate form ID
     * @returns {Promise}
     */
    getCandidateForm: (id) => {
      return apiClient.get(`/forms/candidate-forms/${id}`);
    },

    /**
     * Get all hiring forms
     * @param {number} skip - Skip records
     * @param {number} limit - Limit records
     * @returns {Promise}
     */
    getHiringForms: (skip = 0, limit = 100) => {
      return apiClient.get(`/forms/hiring-forms?skip=${skip}&limit=${limit}`);
    },

    /**
     * Get a single hiring form
     * @param {number} id - Hiring form ID
     * @returns {Promise}
     */
    getHiringForm: (id) => {
      return apiClient.get(`/forms/hiring-forms/${id}`);
    },

    /**
     * Get forms statistics (admin only)
     * @returns {Promise}
     */
    getStatistics: () => {
      return apiClient.get('/forms/admin/statistics');
    },

    /**
     * Get all candidate forms with user info (admin only)
     * @param {Object} params - Query parameters (skip, limit)
     * @returns {Promise}
     */
    getAllCandidateForms: (params = {}) => {
      return apiClient.get('/forms/admin/candidate-forms', { params });
    },

    /**
     * Get all hiring forms with user info (admin only)
     * @param {Object} params - Query parameters (skip, limit)
     * @returns {Promise}
     */
    getAllHiringForms: (params = {}) => {
      return apiClient.get('/forms/admin/hiring-forms', { params });
    },

    /**
     * Update a candidate form
     * @param {number} id - Candidate form ID
     * @param {Object} data - Updated form data
     * @returns {Promise}
     */
    updateCandidateForm: (id, data) => {
      return apiClient.put(`/forms/candidate-forms/${id}`, data);
    },

    /**
     * Delete a candidate form
     * @param {number} id - Candidate form ID
     * @returns {Promise}
     */
    deleteCandidateForm: (id) => {
      return apiClient.delete(`/forms/candidate-forms/${id}`);
    },

    /**
     * Update a hiring form
     * @param {number} id - Hiring form ID
     * @param {Object} data - Updated form data
     * @returns {Promise}
     */
    updateHiringForm: (id, data) => {
      return apiClient.put(`/forms/hiring-forms/${id}`, data);
    },

    /**
     * Delete a hiring form
     * @param {number} id - Hiring form ID
     * @returns {Promise}
     */
    deleteHiringForm: (id) => {
      return apiClient.delete(`/forms/hiring-forms/${id}`);
    },
  },
};

