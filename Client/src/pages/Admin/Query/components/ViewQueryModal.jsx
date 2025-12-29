import { HiXCircle } from 'react-icons/hi';
import StatusBadge from './StatusBadge';
import { formatDate } from '../utils/queryUtils';

/**
 * View Query Modal Component
 * Displays full query details in a modal
 */
const ViewQueryModal = ({ query, onClose }) => {
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
            <HiXCircle className="w-6 h-6" />
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
              <StatusBadge status={query.status} />
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
              <p className="text-sm text-gray-900 font-medium">{query.created_by_name || 'N/A'}</p>
              {query.created_by && (
                <p className="text-xs text-gray-500 mt-1">User ID: {query.created_by}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
              <p className="text-sm text-gray-900">{formatDateFull(query.created_at)}</p>
            </div>
            {query.updated_at && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Updated At</label>
                <p className="text-sm text-gray-900">{formatDateFull(query.updated_at)}</p>
              </div>
            )}
            {query.updated_by_name && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Updated By</label>
                <p className="text-sm text-gray-900 font-medium">{query.updated_by_name}</p>
                {query.updated_by && (
                  <p className="text-xs text-gray-500 mt-1">User ID: {query.updated_by}</p>
                )}
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

export default ViewQueryModal;
