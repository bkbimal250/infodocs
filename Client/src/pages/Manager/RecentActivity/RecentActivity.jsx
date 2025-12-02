import { useState, useEffect } from 'react';
import { HiClock, HiLocationMarker, HiDesktopComputer, HiCheckCircle, HiXCircle, HiTrash } from 'react-icons/hi';
import { usersApi } from '../../../api/Users/usersApi';
import toast from 'react-hot-toast';
import Pagination from '../../common/Pagination';

/**
 * Manager Recent Activity Component
 * Display manager's activity history and login history
 */
const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('activities'); // 'activities' or 'login'
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 15;

  useEffect(() => {
    if (activeTab === 'activities') {
      loadActivities();
    } else {
      loadLoginHistory();
    }
  }, [currentPage, activeTab]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        skip: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
      };

      const response = await usersApi.getActivities(params);
      const data = response.data || [];
      setActivities(data);
      setTotalItems(data.length); // Note: Backend should return total count
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to load activities';
      setError(errorMessage);
      console.error('Load activities error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadLoginHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        skip: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
      };

      const response = await usersApi.getLoginHistory(params);
      const data = response.data || [];
      setLoginHistory(data);
      setTotalItems(data.length); // Note: Backend should return total count
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to load login history';
      setError(errorMessage);
      console.error('Load login history error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteActivity = async (activityId) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) {
      return;
    }

    try {
      await usersApi.deleteActivity(activityId);
      toast.success('Activity deleted successfully');
      if (activeTab === 'activities') {
        loadActivities();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to delete activity';
      toast.error(errorMessage);
      console.error('Delete activity error:', err);
    }
  };

  const formatActivityType = (type) => {
    if (!type) return 'Activity';
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getActivityIcon = (type) => {
    if (type?.includes('login') || type?.includes('logout')) {
      return <HiDesktopComputer className="w-5 h-5 text-blue-500" />;
    }
    if (type?.includes('form') || type?.includes('submit')) {
      return <HiCheckCircle className="w-5 h-5 text-green-500" />;
    }
    return <HiClock className="w-5 h-5 text-gray-500" />;
  };

  if (loading && activities.length === 0 && loginHistory.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-secondary)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-[var(--color-text-secondary)]">Loading activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <HiClock className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Recent Activity</h1>
              <p className="mt-2 text-[var(--color-text-secondary)]">View your activity history and login records</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-md mb-6">
          <div className="border-b border-[var(--color-border-primary)]">
            <nav className="flex -mb-px">
              <button
                onClick={() => {
                  setActiveTab('activities');
                  setCurrentPage(1);
                }}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'activities'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Activities ({activities.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab('login');
                  setCurrentPage(1);
                }}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'login'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Login History ({loginHistory.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <div className="flex items-start">
              <HiXCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-semibold text-red-900 mb-1">Error Loading Data</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Activities Tab */}
        {activeTab === 'activities' && (
          <>
            {activities.length === 0 ? (
              <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-md p-12 text-center">
                <HiClock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">No Activities</h3>
                <p className="text-gray-500">You have no activity records yet.</p>
              </div>
            ) : (
              <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-md overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="p-6 hover:bg-[var(--color-bg-secondary)] transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          {getActivityIcon(activity.activity_type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                              {formatActivityType(activity.activity_type)}
                            </h3>
                            {activity.entity_type && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-[var(--color-text-secondary)] rounded">
                                {activity.entity_type}
                              </span>
                            )}
                            {activity.is_deleted && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600 rounded">
                                Deleted
                              </span>
                            )}
                          </div>
                          <p className="text-gray-700 mb-2">{activity.activity_description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <HiClock className="w-4 h-4" />
                              {activity.created_at
                                ? new Date(activity.created_at).toLocaleString()
                                : 'Unknown date'}
                            </span>
                            {activity.ip_address && (
                              <span className="flex items-center gap-1">
                                <HiLocationMarker className="w-4 h-4" />
                                {activity.ip_address}
                              </span>
                            )}
                          </div>
                          {activity.meta_data && Object.keys(activity.meta_data).length > 0 && (
                            <div className="mt-2 text-xs text-gray-500">
                              <details>
                                <summary className="cursor-pointer hover:text-gray-700">View Metadata</summary>
                                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                                  {JSON.stringify(activity.meta_data, null, 2)}
                                </pre>
                              </details>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteActivity(activity.id)}
                          className="ml-4 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                          title="Delete activity"
                        >
                          <HiTrash className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalItems > itemsPerPage && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(totalItems / itemsPerPage)}
                    onPageChange={setCurrentPage}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                  />
                )}
              </div>
            )}
          </>
        )}

        {/* Login History Tab */}
        {activeTab === 'login' && (
          <>
            {loginHistory.length === 0 ? (
              <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-md p-12 text-center">
                <HiDesktopComputer className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">No Login History</h3>
                <p className="text-gray-500">You have no login history records yet.</p>
              </div>
            ) : (
              <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[var(--color-bg-secondary)]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          IP Address
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User Agent
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Failure Reason
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-[var(--color-bg-primary)] divide-y divide-gray-200">
                      {loginHistory.map((login) => (
                        <tr key={login.id} className="hover:bg-[var(--color-bg-secondary)]">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-primary)]">
                            {login.created_at
                              ? new Date(login.created_at).toLocaleString()
                              : 'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <HiLocationMarker className="w-4 h-4" />
                              {login.ip_address || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={login.user_agent}>
                            {login.user_agent || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                login.login_status === 'success'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {login.login_status === 'success' ? (
                                <HiCheckCircle className="w-4 h-4 mr-1" />
                              ) : (
                                <HiXCircle className="w-4 h-4 mr-1" />
                              )}
                              {login.login_status || 'Unknown'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {login.failure_reason || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalItems > itemsPerPage && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(totalItems / itemsPerPage)}
                    onPageChange={setCurrentPage}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;

