/**
 * Application Constants
 */

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/users/auth/login/',
    REGISTER: '/users/auth/register/',
    LOGIN_WITH_EMAIL: '/users/auth/login_with_email/',
    LOGIN_WITH_OTP: '/users/auth/login_with_otp/',
    REQUEST_OTP: '/users/auth/request_login_otp/',
    CURRENT_USER: '/users/auth/user/',
  },

  CERTIFICATES: {
    TEMPLATES: '/certificates/templates/',
    GENERATED: '/certificates/generated/',
    SPA: '/certificates/spa/',
  },
  
  FORMS: {
    CANDIDATE_FORMS: '/forms/candidate-forms/',
    SPAS: '/forms/spas/',
  },
  ANALYTICS: {
    MAIN: '/analytics/',
    CANDIDATES: '/analytics/candidates/',
    CERTIFICATES: '/analytics/certificates/',
  },
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  HR: 'hr',
  MANAGER: 'manager',
  CANDIDATE: 'candidate',
};

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  CERTIFICATE_CREATION: '/certificate-creation',
  FORMS: '/forms',
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    TEMPLATES: '/admin/templates',
    CERTIFICATES: '/admin/certificates',
    USERS: '/admin/users',
    CERTIFICATE_CREATION: '/admin/certificate-creation',
  },
  MANAGER: {
    DASHBOARD: '/manager/dashboard',
    CERTIFICATES: '/manager/certificates',
    CANDIDATES: '/manager/candidates',
    CERTIFICATE_CREATION: '/manager/certificate-creation',
  },
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
};

