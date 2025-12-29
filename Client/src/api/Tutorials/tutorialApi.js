import apiClient from '../../utils/apiConfig';

/**
 * Tutorials API endpoints
 * Handles video tutorial operations
 */
export const tutorialApi = {
  /**
   * Get all tutorials
   * @param {Object} params - Query parameters (skip, limit, is_active, is_public)
   * @returns {Promise}
   */
  getTutorials: (params = {}) => {
    return apiClient.get('/tutorials', { params });
  },

  /**
   * Get a single tutorial by ID
   * @param {number} id - Tutorial ID
   * @returns {Promise}
   */
  getTutorial: (id) => {
    return apiClient.get(`/tutorials/${id}`);
  },

  /**
   * Create a new tutorial (Admin only)
   * @param {FormData} formData - Tutorial data with optional video file
   * @returns {Promise}
   */
  createTutorial: (formData) => {
    return apiClient.post('/tutorials', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Update a tutorial (Admin only)
   * @param {number} id - Tutorial ID
   * @param {FormData} formData - Updated tutorial data with optional video file
   * @returns {Promise}
   */
  updateTutorial: (id, formData) => {
    return apiClient.put(`/tutorials/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Delete a tutorial (Admin only)
   * @param {number} id - Tutorial ID
   * @param {boolean} permanent - Whether to permanently delete
   * @returns {Promise}
   */
  deleteTutorial: (id, permanent = false) => {
    return apiClient.delete(`/tutorials/${id}`, {
      params: { permanent },
    });
  },

  /**
   * Get video stream URL for viewing
   * @param {number} id - Tutorial ID
   * @returns {string} - Video stream URL
   */
  getVideoStreamUrl: (id) => {
    const baseURL = apiClient.defaults.baseURL || '';
    return `${baseURL}/tutorials/${id}/video/stream`;
  },

  /**
   * Download video file
   * @param {number} id - Tutorial ID
   * @returns {Promise} - Blob response
   */
  downloadVideo: (id) => {
    return apiClient.get(`/tutorials/${id}/video`, {
      responseType: 'blob',
    });
  },
};
