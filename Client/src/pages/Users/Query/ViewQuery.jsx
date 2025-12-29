import { HiX, HiClock, HiCheckCircle, HiXCircle } from 'react-icons/hi';

/**
 * View Query Modal Component for Users
 * Displays full query details in a modal
 */
const ViewQuery = ({ query, onClose }) => {
  if (!query) return null;

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

export default ViewQuery;
