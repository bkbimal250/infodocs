import { useState, useEffect } from 'react';
import { queryApi } from '../../../api/Query/queryApi';
import { HiEye, HiClock, HiCheckCircle, HiXCircle, HiX } from 'react-icons/hi';
import ViewQuery from './ViewQuery';

/**
 * HR Query List Component
 * Displays list of HR's queries
 */
const QueryList = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    state: '',
    city: '',
    area: '',
    search: '',
  });

  useEffect(() => {
    loadQueries();
  }, [filters]);

  const loadQueries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (filters.status) params.status = filters.status;
      
      const response = await queryApi.getQueries(params);
      const data = response.data;
      const queriesList = Array.isArray(data) ? data : (data.queries || []);
      setQueries(queriesList);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to load queries';
      setError(errorMessage);
      console.error('Load queries error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (query) => {
    try {
      // Fetch full query details
      const response = await queryApi.getQuery(query.id);
      setSelectedQuery(response.data);
      setShowViewModal(true);
    } catch (err) {
      console.error('Error loading query details:', err);
      // Fallback to using the query data we already have
      setSelectedQuery(query);
      setShowViewModal(true);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: HiClock, text: 'Pending' },
      processing: { color: 'bg-blue-100 text-blue-800', icon: HiClock, text: 'Processing' },
      resolved: { color: 'bg-green-100 text-green-800', icon: HiCheckCircle, text: 'Resolved' },
      closed: { color: 'bg-gray-100 text-gray-800', icon: HiXCircle, text: 'Closed' },
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
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

  // Get unique values for filters
  const uniqueStates = [...new Set(queries.map(q => q.spa_state).filter(Boolean))].sort();
  const uniqueCities = [...new Set(queries.map(q => q.spa_city).filter(Boolean))].sort();
  const uniqueAreas = [...new Set(queries.map(q => q.spa_area).filter(Boolean))].sort();

  // Filter queries based on all filters
  const filteredQueries = queries.filter((query) => {
    // Status filter
    if (filters.status && query.status !== filters.status) return false;
    
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
        query.spa_state?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
            <select
              value={filters.state}
              onChange={(e) => setFilters({ ...filters, state: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
            >
              <option value="">All States</option>
              {uniqueStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
            <select
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
            >
              <option value="">All Cities</option>
              {uniqueCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Area</label>
            <select
              value={filters.area}
              onChange={(e) => setFilters({ ...filters, area: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
            >
              <option value="">All Areas</option>
              {uniqueAreas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          <div className="xl:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search queries, address, contact..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {(filters.status || filters.state || filters.city || filters.area || filters.search) && (
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ status: '', state: '', city: '', area: '', search: '' })}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <HiX className="w-4 h-4" />
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Queries List */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading queries...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl shadow-md border border-red-200 p-6">
          <div className="text-red-600 font-medium">{error}</div>
        </div>
      ) : filteredQueries.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
          <p className="text-gray-600 text-lg">No queries found</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredQueries.map((query) => (
            <div key={query.id} className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-bold text-gray-900">#{query.id}</span>
                      {getStatusBadge(query.status)}
                    </div>
                    <p className="text-xs text-gray-500">{formatDate(query.created_at)}</p>
                  </div>
                  <button
                    onClick={() => handleView(query)}
                    className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <HiEye className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">SPA</h3>
                    <p className="text-sm text-gray-900 font-medium">{query.spa_name || 'N/A'}</p>
                    {(query.spa_city || query.spa_area || query.spa_state) && (
                      <p className="text-xs text-gray-500 mt-1">
                        {[query.spa_area, query.spa_city, query.spa_state].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>

                  {query.spa_address && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-1">Address</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{query.spa_address}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Query</h3>
                    <p className="text-sm text-gray-600 line-clamp-3">{query.query}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedQuery && (
        <ViewQuery
          query={selectedQuery}
          onClose={() => {
            setShowViewModal(false);
            setSelectedQuery(null);
          }}
        />
      )}
    </div>
  );
};

export default QueryList;
