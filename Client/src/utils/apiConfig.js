import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://infodocs.api.d0s369.co.in/api';

if (import.meta.env.DEV) {
  console.log('API Base URL:', API_BASE_URL);
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  withCredentials: true, // Required for sending cookies across origins
});

apiClient.interceptors.request.use(
  (config) => {
    // No longer need to manually set Authorization header as the browser
    // will automatically include the 'access_token' cookie.
    
    if (config.data instanceof FormData) {
      if (config.headers && 'Content-Type' in config.headers) {
        delete config.headers['Content-Type'];
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (import.meta.env.DEV) {
      console.error('API Error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
      });
    }

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      console.error('Request Timeout - Check if backend is running on:', API_BASE_URL);
      return Promise.reject({
        ...error,
        message: `Request timed out. Please check if the backend server is running on ${API_BASE_URL}`,
      });
    }

    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error('Network Error - Check if backend is running on:', API_BASE_URL);
      return Promise.reject({
        ...error,
        message: `Unable to connect to server. Please check if the backend is running on ${API_BASE_URL}`,
      });
    }

    if (error.code === 'ERR_SSL_PROTOCOL_ERROR') {
      console.error('SSL Error - Make sure backend is using http:// not https://');
      return Promise.reject({
        ...error,
        message: 'SSL Protocol Error. Please ensure the backend is running on http://localhost:8009',
      });
    }

    if (error.response?.status === 401) {
      // Session has expired or cookie is invalid
      localStorage.removeItem('user'); // Only keep preference-related items
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

