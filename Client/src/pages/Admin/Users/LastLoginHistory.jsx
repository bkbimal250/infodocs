import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  HiOutlineClock, 
  HiOutlineCheckCircle, 
  HiOutlineXCircle,
  HiOutlineGlobe
} from 'react-icons/hi';
import { adminApi } from '../../../api/Admin/adminApi';
import apiClient from '../../../utils/apiConfig';

/**
 * Last Login History Component
 * Shows login history for a specific user or all users
 */
const LastLoginHistory = () => {
  const { userId } = useParams();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLoginHistory();
  }, [userId]);

  const loadLoginHistory = async () => {
    try {
      setLoading(true);
      // If userId is provided, get that user's login history
      // Otherwise, get all login history (admin only)
      if (userId) {
        const response = await apiClient.get(`/notifications/login-history`, {
          params: { user_id: userId, limit: 100 }
        });
        setHistory(Array.isArray(response.data) ? response.data : []);
      } else {
        // For admin view, we might need a different endpoint
        // For now, use the same endpoint
        const response = await apiClient.get(`/notifications/login-history`, {
          params: { limit: 200 }
        });
        setHistory(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      setError('Failed to load login history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Login History</h1>
          <p className="mt-2 text-gray-600">
            {userId ? 'User login history' : 'All users login history'}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {history.length === 0 ? (
            <div className="text-center py-12">
              <HiOutlineClock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No login history found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User Agent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Failure Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {history.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {entry.login_status === 'success' ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <HiOutlineCheckCircle className="mr-1 h-4 w-4" />
                            Success
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <HiOutlineXCircle className="mr-1 h-4 w-4" />
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <HiOutlineGlobe className="mr-2 h-4 w-4 text-gray-400" />
                          {entry.ip_address || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-md truncate">
                          {entry.user_agent || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {entry.failure_reason || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.created_at 
                          ? new Date(entry.created_at).toLocaleString()
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LastLoginHistory;

