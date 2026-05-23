import apiClient from '../../utils/apiConfig';

/**
 * Authentication API endpoints
 */
export const authApi = {
  /**
   * Register a new user
   * @param {Object} data - Registration data
   * @returns {Promise}
   */
  register: (data) => {
    return apiClient.post('/users/auth/register', data);
  },

  /**
   * Login with username/email and password.
   * Kept for manual/admin use, but not shown on the login page.
   * @param {Object} data - { username, password } or { email, password }
   * @returns {Promise}
   */
  login: (data) => {
    return apiClient.post('/users/auth/login', data);
  },

  /**
   * Login with email and password.
   * Kept for manual/admin use, but not shown on the login page.
   * @param {Object} data - { email, password }
   * @returns {Promise}
   */
  loginWithEmail: (data) => {
    return apiClient.post('/users/auth/login_with_email', data);
  },

  /**
   * Request OTP for email login
   * @param {Object} data - { email }
   * @returns {Promise}
   */
  requestLoginOTP: (data) => {
    return apiClient.post('/users/auth/request_login_otp', data);
  },

  /**
   * Login with email and OTP
   * @param {Object} data - { email, otp }
   * @returns {Promise}
   */
  loginWithOTP: (data) => {
    return apiClient.post('/users/auth/login_with_otp', data);
  },

  /**
   * Request OTP for phone login
   * @param {Object} data - { phone_number }
   * @returns {Promise}
   */
  requestPhoneLoginOTP: (data) => {
    return apiClient.post('/users/auth/request_phone_login_otp', data);
  },

  /**
   * Login with phone and OTP
   * @param {Object} data - { phone_number, otp }
   * @returns {Promise}
   */
  loginWithPhoneOTP: (data) => {
    return apiClient.post('/users/auth/login_with_phone_otp', data);
  },

  /**
   * Request password reset (sends OTP to email)
   * @param {Object} data - { email }
   * @returns {Promise}
   */
  requestPasswordReset: (data) => {
    return apiClient.post('/users/auth/request_password_reset', data);
  },

  /**
   * Reset password using email + OTP + new password
   * @param {Object} data - { email, otp, new_password }
   * @returns {Promise}
   */
  resetPassword: (data) => {
    return apiClient.post('/users/auth/reset_password', data);
  },

  /**
   * Get current authenticated user
   * @returns {Promise}
   */
  getCurrentUser: () => {
    return apiClient.get('/users/auth/user');
  },

  /**
   * Logout user and clear session cookie
   * @returns {Promise}
   */
  logout: () => {
    return apiClient.post('/users/auth/logout');
  },
};
