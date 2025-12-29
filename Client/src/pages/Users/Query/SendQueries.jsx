import { useState, useEffect } from 'react';
import { queryApi } from '../../../api/Query/queryApi';
import { HiCheckCircle, HiXCircle, HiPaperAirplane, HiEye, HiX, HiClock } from 'react-icons/hi';
import SelectSpa from '../../common/Selectspa';

/**
 * User Query Page
 * Users can send queries to admin and view their own queries
 */
const SendQueries = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    spa_id: '',
    query_type_id: '',
    query: '',
    contact_number: '',
  });
  const [myQueries, setMyQueries] = useState([]);
  const [queryTypes, setQueryTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingQueries, setLoadingQueries] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('send'); // 'send' or 'my-queries'
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    loadQueryTypes();
    loadMyQueries();
  }, []);

  const loadQueryTypes = async () => {
    try {
      const response = await queryApi.getQueryTypes();
      setQueryTypes(response.data || []);
    } catch (err) {
      console.error('Error loading query types:', err);
    }
  };

  const loadMyQueries = async () => {
    try {
      setLoadingQueries(true);
      const response = await queryApi.getQueries();
      const data = response.data;
      const queries = Array.isArray(data) ? data : (data.queries || []);
      setMyQueries(queries);
    } catch (err) {
      console.error('Error loading my queries:', err);
    } finally {
      setLoadingQueries(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await queryApi.createQuery(formData);
      setSuccess('Query submitted successfully! Admin will review and respond soon.');
      setFormData({
        spa_id: '',
        query_type_id: '',
        query: '',
        contact_number: '',
      });
      // Reload queries
      loadMyQueries();
      // Call onSuccess callback if provided (when used in Query.jsx)
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        // Switch to my queries tab (when used standalone)
        setActiveTab('my-queries');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to submit query';
      setError(errorMessage);
      console.error('Submit query error:', err);
    } finally {
      setLoading(false);
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
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${config.color}`}>
        <Icon className="w-4 h-4" />
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

  const handleViewQuery = async (query) => {
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

  // If onSuccess is provided, we're being used in Query.jsx - show only send form
  // Otherwise, show tabs (standalone mode)
  const isStandalone = !onSuccess;

  return (
    <div className="max-w-5xl mx-auto">
        {/* Tabs - Only show if standalone mode */}
        {isStandalone && (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 mb-6 overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('send')}
                  className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
                    activeTab === 'send'
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Send Query
                </button>
                <button
                  onClick={() => setActiveTab('my-queries')}
                  className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
                    activeTab === 'my-queries'
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  My Queries <span className="ml-2 px-2 py-0.5 bg-gray-200 rounded-full text-xs">{myQueries.length}</span>
                </button>
              </nav>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 text-green-800 rounded-lg shadow-sm flex items-start gap-3">
            <HiCheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p className="flex-1">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-800 rounded-lg shadow-sm flex items-start gap-3">
            <HiXCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p className="flex-1">{error}</p>
          </div>
        )}

        {/* Tab Content */}
        {(activeTab === 'send' || !isStandalone) ? (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <SelectSpa
                value={formData.spa_id}
                onChange={handleChange}
                role="user"
                required
                label="SPA"
              />

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Query Type <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                </label>
                <select
                  name="query_type_id"
                  value={formData.query_type_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                >
                  <option value="">Select Query Type</option>
                  {queryTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Query <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="query"
                  value={formData.query}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="Describe your query or issue in detail..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleChange}
                  required
                  placeholder="Enter your contact number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow-md transition-all"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <HiPaperAirplane className="w-5 h-5" />
                      Submit Query
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            {loadingQueries ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto"></div>
                <p className="mt-4 text-gray-600 font-medium">Loading queries...</p>
              </div>
            ) : myQueries.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-600 text-lg">No queries submitted yet</p>
                <p className="text-gray-400 text-sm mt-2">Submit your first query using the "Send Query" tab</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                {myQueries.map((query) => (
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
                          onClick={() => handleViewQuery(query)}
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
                        </div>

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
          </div>
        )}

        {/* Info Section */}
        {(activeTab === 'send' || !isStandalone) && (
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <HiCheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">Important Information</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Your query will be reviewed by admin</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>You will receive updates on the status of your query</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Admin may contact you using the provided contact number</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* View Query Modal */}
        {showViewModal && selectedQuery && (
          <ViewQueryModal
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

// View Query Modal Component
const ViewQueryModal = ({ query, onClose }) => {
  const formatDateFull = (dateString) => {
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
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${config.color}`}>
        <Icon className="w-4 h-4" />
        {config.text}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"></div>
      <div className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-white">Query Details</h2>
            <p className="text-blue-100 text-sm mt-0.5">ID: #{query.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
          {/* Status Badge */}
          <div className="flex justify-center">
            {getStatusBadge(query.status)}
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">SPA</label>
              <p className="text-base font-semibold text-gray-900">{query.spa_name || 'N/A'}</p>
              {query.spa_address && (
                <p className="text-sm text-gray-600 mt-2">{query.spa_address}</p>
              )}
              {(query.spa_area || query.spa_city || query.spa_state) && (
                <p className="text-xs text-gray-500 mt-1">
                  {[query.spa_area, query.spa_city, query.spa_state].filter(Boolean).join(', ')}
                </p>
              )}
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Query Type</label>
              <p className="text-base font-semibold text-gray-900">{query.query_type_name || 'N/A'}</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Contact Number</label>
              <p className="text-base font-semibold text-gray-900">{query.contact_number || 'N/A'}</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Created At</label>
              <p className="text-sm text-gray-900">{formatDateFull(query.created_at)}</p>
            </div>

            {query.updated_at && (
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Updated At</label>
                <p className="text-sm text-gray-900">{formatDateFull(query.updated_at)}</p>
              </div>
            )}
          </div>

          {/* Query Content */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Query</label>
            <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">{query.query}</p>
          </div>

          {/* Admin Remark */}
          {query.admin_remark && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 p-5 shadow-sm">
              <label className="block text-xs font-semibold text-blue-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                <HiCheckCircle className="w-4 h-4" />
                Admin Remark
              </label>
              <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">{query.admin_remark}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendQueries;
