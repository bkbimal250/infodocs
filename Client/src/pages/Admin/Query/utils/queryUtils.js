/**
 * Utility functions for Query components
 */

/**
 * Format date string to readable format
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format date string to full readable format (for modals)
 */
export const formatDateFull = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Filter queries based on filter criteria
 */
export const filterQueries = (queries, filters) => {
  return queries.filter((query) => {
    // Status filter
    if (filters.status && query.status !== filters.status) return false;
    
    // SPA filter
    if (filters.spa_id && String(query.spa_id) !== filters.spa_id) return false;
    
    // State filter
    if (filters.state && query.spa_state !== filters.state) return false;
    
    // City filter
    if (filters.city && query.spa_city !== filters.city) return false;
    
    // Area filter
    if (filters.area && query.spa_area !== filters.area) return false;
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        query.query?.toLowerCase().includes(searchLower) ||
        query.contact_number?.toLowerCase().includes(searchLower) ||
        query.spa_name?.toLowerCase().includes(searchLower) ||
        query.query_type_name?.toLowerCase().includes(searchLower) ||
        query.spa_address?.toLowerCase().includes(searchLower) ||
        query.spa_city?.toLowerCase().includes(searchLower) ||
        query.spa_area?.toLowerCase().includes(searchLower) ||
        query.spa_state?.toLowerCase().includes(searchLower) ||
        query.created_by_name?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });
};

/**
 * Get unique values from queries for filter dropdowns
 */
export const getUniqueFilterValues = (queries) => {
  return {
    states: [...new Set(queries.map(q => q.spa_state).filter(Boolean))].sort(),
    cities: [...new Set(queries.map(q => q.spa_city).filter(Boolean))].sort(),
    areas: [...new Set(queries.map(q => q.spa_area).filter(Boolean))].sort(),
  };
};
