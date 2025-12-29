import apiClient from '../../utils/apiConfig';

/**
 * Query / Support Ticket API endpoints
 * Handles query creation, retrieval, updates, and deletion
 */
export const queryApi = {
  /**
   * Get all query types
   * @param {boolean} activeOnly - Return only active types (default: true)
   * @returns {Promise}
   */
  getQueryTypes: (activeOnly = true) => {
    return apiClient.get('/queries/types', { params: { active_only: activeOnly } });
  },

  /**
   * Create a new query type (Admin only)
   * @param {Object} data - Query type data { name, description, is_active }
   * @returns {Promise}
   */
  createQueryType: (data) => {
    return apiClient.post('/queries/types', data);
  },

  /**
   * Update a query type (Admin only)
   * @param {number} id - Query type ID
   * @param {Object} data - Update data { name, description, is_active }
   * @returns {Promise}
   */
  updateQueryType: (id, data) => {
    return apiClient.put(`/queries/types/${id}`, data);
  },

  /**
   * Delete a query type (Admin only)
   * @param {number} id - Query type ID
   * @param {boolean} permanent - Whether to permanently delete (default: false)
   * @returns {Promise}
   */
  deleteQueryType: (id, permanent = false) => {
    return apiClient.delete(`/queries/types/${id}`, { 
      params: { permanent } 
    });
  },

  /**
   * Create a new query
   * @param {Object} data - Query data { spa_id, query_type_id, query, contact_number }
   * @returns {Promise}
   */
  createQuery: (data) => {
    return apiClient.post('/queries/', data);
  },

  /**
   * Get all queries (with filters)
   * @param {Object} params - Query parameters { status, spa_id, skip, limit }
   * @returns {Promise}
   */
  getQueries: (params = {}) => {
    return apiClient.get('/queries/', { params });
  },

  /**
   * Get a single query by ID
   * @param {number} id - Query ID
   * @returns {Promise}
   */
  getQuery: (id) => {
    return apiClient.get(`/queries/${id}`);
  },

  /**
   * Update a query (Admin only - status and admin_remark)
   * @param {number} id - Query ID
   * @param {Object} data - Update data { status, admin_remark }
   * @returns {Promise}
   */
  updateQuery: (id, data) => {
    return apiClient.put(`/queries/${id}`, data);
  },

  /**
   * Delete a query (Admin only)
   * @param {number} id - Query ID
   * @param {boolean} permanent - Whether to permanently delete (default: false)
   * @returns {Promise}
   */
  deleteQuery: (id, permanent = false) => {
    return apiClient.delete(`/queries/${id}`, { 
      params: { permanent } 
    });
  },
};
