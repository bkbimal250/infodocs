import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { queryApi } from '../../../api/Query/queryApi';
import { HiPencil, HiTrash, HiCheckCircle, HiXCircle, HiFilter, HiX, HiPlus, HiEye } from 'react-icons/hi';

/**
 * Admin Query Type List Page
 * View, edit, and delete query types
 */
const QueryTypeList = () => {
  const navigate = useNavigate();
  const [queryTypes, setQueryTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQueryType, setSelectedQueryType] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePermanent, setDeletePermanent] = useState(false);
  const [filters, setFilters] = useState({
    status: '', // 'active', 'inactive', or ''
    search: '',
  });

  useEffect(() => {
    loadQueryTypes();
  }, []);

  const loadQueryTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load all query types (both active and inactive)
      const response = await queryApi.getQueryTypes(false);
      setQueryTypes(response.data || []);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to load query types';
      setError(errorMessage);
      console.error('Load query types error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter query types
  const filteredQueryTypes = useMemo(() => {
    let filtered = [...queryTypes];

    // Status filter
    if (filters.status === 'active') {
      filtered = filtered.filter(type => type.is_active === true);
    } else if (filters.status === 'inactive') {
      filtered = filtered.filter(type => type.is_active === false);
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(type => 
        type.name?.toLowerCase().includes(searchLower) ||
        type.description?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [queryTypes, filters]);

  const handleEdit = (queryType) => {
    setSelectedQueryType(queryType);
    setShowEditModal(true);
  };

  const handleDelete = (queryType) => {
    setSelectedQueryType(queryType);
    setDeletePermanent(false);
    setShowDeleteModal(true);
  };

  const handleUpdateQueryType = async (formData) => {
    try {
      await queryApi.updateQueryType(selectedQueryType.id, formData);
      await loadQueryTypes();
      setShowEditModal(false);
      setSelectedQueryType(null);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to update query type';
      setError(errorMessage);
      console.error('Update query type error:', err);
      throw err;
    }
  };

  const handleDeleteQueryType = async () => {
    try {
      await queryApi.deleteQueryType(selectedQueryType.id, deletePermanent);
      await loadQueryTypes();
      setShowDeleteModal(false);
      setSelectedQueryType(null);
      setDeletePermanent(false);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to delete query type';
      setError(errorMessage);
      console.error('Delete query type error:', err);
    }
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

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">Query Types</h1>
            <p className="text-[var(--color-text-secondary)]">Manage query type categories</p>
          </div>
          <button
            onClick={() => navigate('/admin/queries/add-query-type')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <HiPlus className="w-5 h-5" />
            Add Query Type
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
            <HiXCircle className="w-5 h-5" />
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
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => {
                  setFilters({ ...filters, search: e.target.value });
                }}
                placeholder="Search by name or description..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {(filters.status || filters.search) && (
              <button
                onClick={() => {
                  setFilters({ status: '', search: '' });
                }}
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 mt-6"
              >
                <HiX className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Query Types Table */}
        {loading ? (
          <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-[var(--color-text-secondary)]">Loading query types...</p>
          </div>
        ) : filteredQueryTypes.length === 0 ? (
          <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-sm p-12 text-center">
            <p className="text-[var(--color-text-secondary)]">No query types found</p>
          </div>
        ) : (
          <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredQueryTypes.map((queryType) => (
                    <tr key={queryType.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{queryType.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{queryType.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={queryType.description}>
                        {queryType.description || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {queryType.is_active ? (
                          <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(queryType.created_at)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(queryType)}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Edit Query Type"
                          >
                            <HiPencil className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(queryType)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Delete Query Type"
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

        {/* Edit Modal */}
        {showEditModal && selectedQueryType && (
          <EditQueryTypeModal
            queryType={selectedQueryType}
            onClose={() => {
              setShowEditModal(false);
              setSelectedQueryType(null);
            }}
            onSave={handleUpdateQueryType}
          />
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedQueryType && (
          <DeleteQueryTypeModal
            queryType={selectedQueryType}
            permanent={deletePermanent}
            onPermanentChange={setDeletePermanent}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedQueryType(null);
              setDeletePermanent(false);
            }}
            onConfirm={handleDeleteQueryType}
          />
        )}
      </div>
    </div>
  );
};

// Edit Query Type Modal Component
const EditQueryTypeModal = ({ queryType, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: queryType.name || '',
    description: queryType.description || '',
    is_active: queryType.is_active !== undefined ? queryType.is_active : true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSave(formData);
    } catch (err) {
      // Error is handled in parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Edit Query Type</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
              <HiXCircle className="w-5 h-5" />
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Active
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete Query Type Modal Component
const DeleteQueryTypeModal = ({ queryType, permanent, onPermanentChange, onClose, onConfirm }) => {
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
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Delete Query Type</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-gray-700">
            Are you sure you want to {permanent ? 'permanently delete' : 'deactivate'} the query type <strong>"{queryType.name}"</strong>?
          </p>
          {!permanent && (
            <p className="text-sm text-gray-500">
              Deactivating will hide this query type from the dropdown, but it can be reactivated later.
            </p>
          )}
          {permanent && (
            <p className="text-sm text-red-600 font-medium">
              ⚠️ Warning: Permanent deletion cannot be undone!
            </p>
          )}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="permanent_delete"
              checked={permanent}
              onChange={(e) => onPermanentChange(e.target.checked)}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <label htmlFor="permanent_delete" className="text-sm font-medium text-gray-700">
              Permanently delete (cannot be undone)
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-white ${
                permanent 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-orange-600 hover:bg-orange-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? 'Deleting...' : permanent ? 'Delete Permanently' : 'Deactivate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueryTypeList;
