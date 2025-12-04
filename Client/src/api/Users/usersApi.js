import apiClient from '../../utils/apiConfig';

/**
 * Users API endpoints
 * All endpoints for user-specific operations
 */
export const usersApi = {
  /**
   * Get user notifications
   * @param {Object} params - Query parameters (skip, limit, unread_only)
   * @returns {Promise}
   */
  getNotifications: (params = {}) => {
    return apiClient.get('/notifications', { params });
  },

  /**
   * Get unread notifications count
   * @returns {Promise}
   */
  getUnreadCount: () => {
    return apiClient.get('/notifications/unread-count');
  },

  /**
   * Mark notification as read
   * @param {number} notificationId - Notification ID
   * @returns {Promise}
   */
  markNotificationAsRead: (notificationId) => {
    return apiClient.patch(`/notifications/${notificationId}/read`);
  },

  /**
   * Mark all notifications as read
   * @returns {Promise}
   */
  markAllNotificationsAsRead: () => {
    return apiClient.patch('/notifications/read-all');
  },

  /**
   * Delete a notification
   * @param {number} notificationId - Notification ID
   * @returns {Promise}
   */
  deleteNotification: (notificationId) => {
    return apiClient.delete(`/notifications/${notificationId}`);
  },

  /**
   * Get user activities
   * @param {Object} params - Query parameters (skip, limit)
   * @returns {Promise}
   */
  getActivities: (params = {}) => {
    return apiClient.get('/notifications/activities', { params });
  },

  /**
   * Get user login history
   * @param {Object} params - Query parameters (skip, limit)
   * @returns {Promise}
   */
  getLoginHistory: (params = {}) => {
    return apiClient.get('/notifications/login-history', { params });
  },

  /**
   * Delete an activity
   * @param {number} activityId - Activity ID
   * @returns {Promise}
   */
  deleteActivity: (activityId) => {
    return apiClient.delete(`/notifications/activities/${activityId}`);
  },

  /**
   * Bulk delete notifications and/or activities
   * @param {Object} data - { notification_ids: [], activity_ids: [] }
   * @returns {Promise}
   */
  bulkDelete: (data) => {
    return apiClient.post('/notifications/bulk-delete', data);
  },

  /**
   * Get user's certificates (created by current user)
   * @param {Object} params - Query parameters (skip, limit)
   * @returns {Promise}
   */
  getMyCertificates: (params = {}) => {
    return apiClient.get('/certificates/generated/my-certificates', { params });
  },

  /**
   * Update user profile (for own profile - uses auth endpoint)
   * @param {number} userId - User ID (not used, but kept for compatibility)
   * @param {Object} data - User data
   * @returns {Promise}
   */
  updateProfile: (userId, data) => {
    // Use the auth endpoint for self-update which allows any authenticated user
    return apiClient.put(`/users/auth/user`, data);
  },

  /**
   * Get user's own candidate forms (submitted by current user)
   * @param {Object} params - Query parameters (skip, limit)
   * @returns {Promise}
   */
  getMyCandidateForms: (params = {}) => {
    // Backend will automatically filter by current_user.id for regular users
    return apiClient.get('/forms/candidate-forms', { params });
  },

  /**
   * Get a single candidate form (only if created by current user)
   * @param {number} id - Form ID
   * @returns {Promise}
   */
  getCandidateForm: (id) => {
    return apiClient.get(`/forms/candidate-forms/${id}`);
  },

  /**
   * Update a candidate form (only if created by current user)
   * @param {number} id - Candidate form ID
   * @param {Object} data - Updated form data
   * @returns {Promise}
   */
  updateCandidateForm: (id, data) => {
    return apiClient.put(`/forms/candidate-forms/${id}`, data);
  },

  /**
   * Delete a candidate form (only if created by current user)
   * @param {number} id - Candidate form ID
   * @returns {Promise}
   */
  deleteCandidateForm: (id) => {
    return apiClient.delete(`/forms/candidate-forms/${id}`);
  },

  /**
   * Get user's own hiring forms (submitted by current user)
   * @param {Object} params - Query parameters (skip, limit)
   * @returns {Promise}
   * Note: Backend should automatically filter by current_user.id for regular users
   */
  getHiringForms: (params = {}) => {
    // For regular users, the backend should filter by created_by automatically
    // If backend supports it, we can pass created_by parameter
    return apiClient.get('/forms/hiring-forms', { params });
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
   * Update a hiring form (only if created by current user)
   * @param {number} id - Hiring form ID
   * @param {Object} data - Updated form data
   * @returns {Promise}
   */
  updateHiringForm: (id, data) => {
    return apiClient.put(`/forms/hiring-forms/${id}`, data);
  },

  /**
   * Delete a hiring form (only if created by current user)
   * @param {number} id - Hiring form ID
   * @returns {Promise}
   */
  deleteHiringForm: (id) => {
    return apiClient.delete(`/forms/hiring-forms/${id}`);
  },
};
