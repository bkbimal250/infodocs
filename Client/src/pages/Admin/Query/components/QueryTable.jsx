import { HiEye, HiPencil, HiTrash } from 'react-icons/hi';
import StatusBadge from './StatusBadge';
import { formatDate } from '../utils/queryUtils';

/**
 * Query Table Component
 * Displays queries in a table format with actions
 */
const QueryTable = ({ queries, onView, onEdit, onDelete }) => {
  if (queries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <p className="text-gray-600">No queries found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SPA</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Query Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Query</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created By</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {queries.map((query) => (
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
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={query.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(query.created_at)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onView(query)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                      title="View Details"
                    >
                      <HiEye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onEdit(query)}
                      className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                      title="Update Status/Remarks"
                    >
                      <HiPencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onDelete(query)}
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
  );
};

export default QueryTable;
