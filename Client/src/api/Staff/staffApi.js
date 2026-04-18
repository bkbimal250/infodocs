import apiClient from '../../utils/apiConfig';

/**
 * Staff Management API endpoints
 */
export const staffApi = {
  /**
   * Get all staff (Admin can see all, Manager sees limited by backend if implemented, 
   * but here we pass spa_id if we want to filter on frontend)
   * @param {Object} params - Query parameters (spa_id)
   * @returns {Promise}
   */
  getAllStaff: (params = {}) => {
    return apiClient.get('/staff/', { params });
  },

  /**
   * Get unique cities of staff
   * @returns {Promise}
   */
  getCities: () => {
    return apiClient.get('/staff/cities');
  },

  /**
   * Get a single staff member
   * @param {number} id - Staff ID
   * @returns {Promise}
   */
  getStaff: (id) => {
    return apiClient.get(`/staff/${id}`);
  },

  /**
   * Search staff by phone
   * @param {string} phone - Staff phone
   * @returns {Promise}
   */
  getStaffByPhone: (phone) => {
    return apiClient.get(`/staff/phone/${phone}`);
  },

  /**
   * Create new staff
   * @param {Object} data - Staff data
   * @returns {Promise}
   */
  createStaff: (data) => {
    return apiClient.post('/staff/', data);
  },

  /**
   * Update staff details
   * @param {number} id - Staff ID
   * @param {Object} data - Update data
   * @returns {Promise}
   */
  updateStaff: (id, data) => {
    return apiClient.put(`/staff/${id}`, data);
  },

  /**
   * Mark staff as left
   * @param {number} id - Staff ID
   * @param {Object} data - { leave_date, notes }
   * @returns {Promise}
   */
  markLeft: (id, data) => {
    return apiClient.post(`/staff/${id}/leave`, data);
  },

  /**
   * Transfer staff to another SPA
   * @param {number} id - Staff ID
   * @param {Object} data - { to_spa_id, transfer_date, notes }
   * @returns {Promise}
   */
  transferStaff: (id, data) => {
    return apiClient.post(`/staff/${id}/transfer`, data);
  },

  /**
   * Get staff history
   * @param {number} id - Staff ID
   * @returns {Promise}
   */
  getHistory: (id) => {
    return apiClient.get(`/staff/${id}/history`);
  },

  /**
   * Get staff analytics
   * @param {Object} params - Query parameters (spa_id)
   * @returns {Promise}
   */
  getTodayAnalytics: (params = {}) => {
    return apiClient.get('/staff/analytics/today', { params });
  },

  getOverallAnalytics: (params = {}) => {
    return apiClient.get('/staff/analytics/overall', { params });
  },

  getConsolidatedAnalytics: (params = {}) => {
    return apiClient.get('/staff/analytics/consolidated', { params });
  },

  /**
   * Permanently delete staff
   * @param {number} id - Staff ID
   * @returns {Promise}
   */
  deleteStaff: (id) => {
    return apiClient.delete(`/staff/${id}`);
  },

  /**
   * Upload staff document/photo
   * @param {File} file - File object
   * @returns {Promise}
   */
  uploadStaffFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/staff/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};
