import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { queryApi } from '../../../api/Query/queryApi';
import { adminApi } from '../../../api/Admin/adminApi';
import { HiEye, HiPencil, HiTrash, HiCheckCircle, HiXCircle, HiClock, HiFilter, HiX, HiPlus } from 'react-icons/hi';

/**
 * Admin Query Management Page
 * View all queries, update status, add remarks, and delete queries
 */
const Queries = () => {
  const navigate = useNavigate();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePermanent, setDeletePermanent] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    spa_id: '',
    state: '',
    city: '',
    area: '',
    search: '',
  });
  const [spas, setSpas] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    loadSpas();
    loadQueries();
  }, []);

  useEffect(() => {
    loadQueries();
  }, [filters, currentPage]);

  const loadSpas = async () => {
    try {
      const response = await adminApi.forms.getSpas();
      setSpas(response.data || []);
    } catch (err) {
      console.error('Error loading SPAs:', err);
    }
  };

  const loadQueries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        skip: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
      };
      
      if (filters.status) params.status = filters.status;
      if (filters.spa_id) params.spa_id = filters.spa_id;
      
      const response = await queryApi.getQueries(params);
      const data = response.data;
      
      // Handle both array and paginated response
      if (Array.isArray(data)) {
        setQueries(data);
      } else if (data.queries) {
        setQueries(data.queries);
      } else {
        setQueries([]);
      }
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
      const response = await queryApi.getQuery(query.id);
      setSelectedQuery(response.data);
      setShowViewModal(true);
    } catch (err) {
      console.error('Error loading query details:', err);
      setSelectedQuery(query);
      setShowViewModal(true);
    }
  };

  const handleEdit = (query) => {
    setSelectedQuery(query);
    setShowEditModal(true);
  };

  const handleDelete = (query) => {
    setSelectedQuery(query);
    setDeletePermanent(false);
    setShowDeleteModal(true);
  };

  const handleUpdateQuery = async (updateData) => {
    try {
      await queryApi.updateQuery(selectedQuery.id, updateData);
      setShowEditModal(false);
      setSelectedQuery(null);
      loadQueries();
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to update query';
      alert(errorMessage);
      console.error('Update query error:', err);
    }
  };

  const handleDeleteQuery = async () => {
    try {
      await queryApi.deleteQuery(selectedQuery.id, deletePermanent);
      setShowDeleteModal(false);
      setSelectedQuery(null);
      setDeletePermanent(false);
      loadQueries();
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to delete query';
      alert(errorMessage);
      console.error('Delete query error:', err);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: HiClock },
      processing: { color: 'bg-blue-100 text-blue-800', icon: HiClock },
      resolved: { color: 'bg-green-100 text-green-800', icon: HiCheckCircle },
      closed: { color: 'bg-gray-100 text-gray-800', icon: HiXCircle },
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
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
        query.spa_state?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">Query Management</h1>
            <p className="text-[var(--color-text-secondary)]">View and manage all support queries</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/queries/query-types')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <HiEye className="w-5 h-5" />
              View Query Types
            </button>
            <button
              onClick={() => navigate('/admin/queries/add-query-type')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <HiPlus className="w-5 h-5" />
              Add Query Type
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <HiFilter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => {
                  setFilters({ ...filters, status: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-700 mb-1">SPA</label>
              <select
                value={filters.spa_id}
                onChange={(e) => {
                  setFilters({ ...filters, spa_id: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All SPAs</option>
                {spas.map((spa) => (
                  <option key={spa.id} value={spa.id}>
                    {spa.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
              <select
                value={filters.state}
                onChange={(e) => {
                  setFilters({ ...filters, state: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All States</option>
                {uniqueStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
              <select
                value={filters.city}
                onChange={(e) => {
                  setFilters({ ...filters, city: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Cities</option>
                {uniqueCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-700 mb-1">Area</label>
              <select
                value={filters.area}
                onChange={(e) => {
                  setFilters({ ...filters, area: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Areas</option>
                {uniqueAreas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => {
                  setFilters({ ...filters, search: e.target.value });
                  setCurrentPage(1);
                }}
                placeholder="Search queries, contact, address..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {(filters.status || filters.spa_id || filters.state || filters.city || filters.area || filters.search) && (
              <button
                onClick={() => {
                  setFilters({ status: '', spa_id: '', state: '', city: '', area: '', search: '' });
                  setCurrentPage(1);
                }}
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 mt-6"
              >
                <HiX className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Queries Table */}
        {loading ? (
          <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-[var(--color-text-secondary)]">Loading queries...</p>
          </div>
        ) : filteredQueries.length === 0 ? (
          <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-sm p-12 text-center">
            <p className="text-[var(--color-text-secondary)]">No queries found</p>
          </div>
        ) : (
          <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SPA</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Query Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Query</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredQueries.map((query) => (
                    <tr key={query.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{query.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="font-medium">{query.spa_name || 'N/A'}</div>
                        {(query.spa_city || query.spa_area || query.spa_state) && (
                          <div className="text-xs text-gray-500 mt-1">
                            {[query.spa_area, query.spa_city, query.spa_state].filter(Boolean).join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{query.query_type_name || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={query.query}>
                        {query.query?.substring(0, 50)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="font-medium">{query.created_by_name || 'N/A'}</div>
                        {query.created_by && (
                          <div className="text-xs text-gray-500">ID: {query.created_by}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(query.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(query.created_at)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleView(query)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="View Details"
                          >
                            <HiEye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(query)}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Update Status/Remarks"
                          >
                            <HiPencil className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(query)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Delete Query"
                          >
                            <HiTrash className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* View Modal */}
        {showViewModal && selectedQuery && (
          <ViewQueryModal
            query={selectedQuery}
            onClose={() => {
              setShowViewModal(false);
              setSelectedQuery(null);
            }}
          />
        )}

        {/* Edit Modal */}
        {showEditModal && selectedQuery && (
          <EditQueryModal
            query={selectedQuery}
            onClose={() => {
              setShowEditModal(false);
              setSelectedQuery(null);
            }}
            onSave={handleUpdateQuery}
          />
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedQuery && (
          <DeleteQueryModal
            query={selectedQuery}
            permanent={deletePermanent}
            onPermanentChange={setDeletePermanent}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedQuery(null);
              setDeletePermanent(false);
            }}
            onConfirm={handleDeleteQuery}
          />
        )}
      </div>
    </div>
  );
};

// View Query Modal Component
const ViewQueryModal = ({ query, onClose }) => {
  const formatDate = (dateString) => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Query Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Query ID</label>
              <p className="text-sm text-gray-900">#{query.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                query.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                query.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                query.status === 'resolved' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {query.status?.charAt(0).toUpperCase() + query.status?.slice(1)}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SPA</label>
              <p className="text-sm text-gray-900">{query.spa_name || 'N/A'}</p>
              {query.spa_address && (
                <p className="text-xs text-gray-600 mt-1">{query.spa_address}</p>
              )}
              {(query.spa_area || query.spa_city || query.spa_state) && (
                <p className="text-xs text-gray-500 mt-1">
                  {[query.spa_area, query.spa_city, query.spa_state].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Query Type</label>
              <p className="text-sm text-gray-900">{query.query_type_name || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
              <p className="text-sm text-gray-900">{query.contact_number}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
              <p className="text-sm text-gray-900">{formatDate(query.created_at)}</p>
            </div>
            {query.updated_at && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Updated At</label>
                <p className="text-sm text-gray-900">{formatDate(query.updated_at)}</p>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Query</label>
            <p className="text-sm text-gray-900 whitespace-pre-wrap">{query.query}</p>
          </div>
          {query.admin_remark && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Remark</label>
              <p className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded">{query.admin_remark}</p>
            </div>
          )}
        </div>
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Edit Query Modal Component
const EditQueryModal = ({ query, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    status: query.status || 'pending',
    admin_remark: query.admin_remark || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Update Query</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Remark</label>
            <textarea
              value={formData.admin_remark}
              onChange={(e) => setFormData({ ...formData, admin_remark: e.target.value })}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add your remarks or response here..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete Query Modal Component
const DeleteQueryModal = ({ query, permanent, onPermanentChange, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Delete Query</h2>
          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to {permanent ? 'permanently delete' : 'delete'} query #{query.id}?
          </p>
          {!permanent && (
            <p className="text-xs text-gray-500 mb-4">
              This will soft delete the query. It can be restored later.
            </p>
          )}
          {permanent && (
            <p className="text-xs text-red-600 mb-4">
              ⚠️ Warning: This will permanently delete the query. This action cannot be undone.
            </p>
          )}
          <div className="mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={permanent}
                onChange={(e) => onPermanentChange(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Permanently delete</span>
            </label>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Queries;
