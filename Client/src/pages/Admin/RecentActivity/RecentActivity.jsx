import { useState, useEffect } from 'react';
import {
  HiOutlineClock,
  HiOutlineUser,
  HiOutlineKey,
  HiOutlineLockClosed,
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineRefresh,
  HiOutlineGlobe,
} from 'react-icons/hi';
import { usersApi } from '../../../api/Users/usersApi';
import Pagination from '../../common/Pagination';

/**
 * Admin Recent Activity Page
 * Shows all user activities including OTP, password reset, login, certificate generation, etc.
 */
const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [activeTab, setActiveTab] = useState('activities'); // activities, login_history
  const [filter, setFilter] = useState('all'); // all, login, otp, password_reset, certificate
  const itemsPerPage = 20;

  useEffect(() => {
    if (activeTab === 'activities') {
      loadActivities();
    } else {
      loadLoginHistory();
    }
  }, [currentPage, activeTab, filter]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const skip = (currentPage - 1) * itemsPerPage;
      const params = {
        skip,
        limit: itemsPerPage,
      };

      const response = await usersApi.getActivities(params);
      const data = response.data || [];
      const filtered = filterActivities(data);
      setActivities(Array.isArray(filtered) ? filtered : []);
      setTotalItems(data.length >= itemsPerPage ? data.length + skip : data.length + skip);
    } catch (error) {
      console.error('Error loading activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const loadLoginHistory = async () => {
    try {
      setLoading(true);
      const skip = (currentPage - 1) * itemsPerPage;
      const params = {
        skip,
        limit: itemsPerPage,
      };

      const response = await usersApi.getLoginHistory(params);
      const data = response.data || [];
      setLoginHistory(Array.isArray(data) ? data : []);
      setTotalItems(data.length >= itemsPerPage ? data.length + skip : data.length + skip);
    } catch (error) {
      console.error('Error loading login history:', error);
      setLoginHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const filterActivities = (activities) => {
    if (filter === 'all') return activities;
    return activities.filter((activity) => {
      if (filter === 'login') return activity.activity_type?.includes('login');
      if (filter === 'otp') return activity.activity_type?.includes('otp');
      if (filter === 'password_reset') return activity.activity_type?.includes('password_reset');
      if (filter === 'certificate') return activity.activity_type?.includes('certificate');
      return true;
    });
  };

  const deleteActivity = async (activityId) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) {
      return;
    }
    try {
      await usersApi.deleteActivity(activityId);
      if (activeTab === 'activities') {
        await loadActivities();
      } else {
        await loadLoginHistory();
      }
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  const getActivityIcon = (type) => {
    if (type?.includes('login')) return <HiOutlineUser className="text-blue-500" />;
    if (type?.includes('otp')) return <HiOutlineKey className="text-purple-500" />;
    if (type?.includes('password_reset')) return <HiOutlineLockClosed className="text-orange-500" />;
    if (type?.includes('certificate')) return <HiOutlineDocumentText className="text-green-500" />;
    return <HiOutlineClock className="text-gray-500" />;
  };

  const getActivityColor = (type, status) => {
    if (status === 'failed' || type?.includes('failed')) return 'bg-red-50 border-red-200';
    if (status === 'success' || type?.includes('success')) return 'bg-green-50 border-green-200';
    if (type?.includes('login')) return 'bg-blue-50 border-blue-200';
    if (type?.includes('otp')) return 'bg-purple-50 border-purple-200';
    if (type?.includes('password_reset')) return 'bg-orange-50 border-orange-200';
    if (type?.includes('certificate')) return 'bg-green-50 border-green-200';
    return 'bg-gray-50 border-gray-200';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const currentData = activeTab === 'activities' ? activities : loginHistory;

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <HiOutlineClock className="text-[var(--color-primary)]" />
              Recent Activity
            </h1>
            <p className="mt-2 text-[var(--color-text-secondary)]">
              Track all user activities including logins, OTP, password resets, and certificate generation
            </p>
          </div>
          <button
            onClick={() => {
              if (activeTab === 'activities') {
                loadActivities();
              } else {
                loadLoginHistory();
              }
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center gap-2"
          >
            <HiOutlineRefresh />
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-gray-200">
          <button
            onClick={() => {
              setActiveTab('activities');
              setCurrentPage(1);
            }}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'activities'
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            All Activities
          </button>
          <button
            onClick={() => {
              setActiveTab('login_history');
              setCurrentPage(1);
            }}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'login_history'
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Login History
          </button>
        </div>

        {/* Filters (only for activities) */}
        {activeTab === 'activities' && (
          <div className="mb-6 flex gap-2 flex-wrap">
            {[
              { value: 'all', label: 'All' },
              { value: 'login', label: 'Login' },
              { value: 'otp', label: 'OTP' },
              { value: 'password_reset', label: 'Password Reset' },
              { value: 'certificate', label: 'Certificates' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => {
                  setFilter(f.value);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-md transition-colors ${
                  filter === f.value
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* Activities/Login History List */}
        <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto"></div>
              <p className="mt-4 text-[var(--color-text-secondary)]">Loading activities...</p>
            </div>
          ) : currentData.length === 0 ? (
            <div className="p-8 text-center">
              <HiOutlineClock className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-[var(--color-text-secondary)]">No activities found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {currentData.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${getActivityColor(
                    item.activity_type || item.login_status,
                    item.login_status
                  )}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {activeTab === 'activities' ? (
                        getActivityIcon(item.activity_type)
                      ) : (
                        <HiOutlineUser
                          className={item.login_status === 'success' ? 'text-green-500' : 'text-red-500'}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                              {activeTab === 'activities'
                                ? item.activity_description || item.activity_type
                                : `Login ${item.login_status === 'success' ? 'Successful' : 'Failed'}`}
                            </h3>
                            <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                              {activeTab === 'activities'
                                ? item.activity_type || 'activity'
                                : item.login_status || 'unknown'}
                            </span>
                            {activeTab === 'login_history' && item.login_status === 'failed' && (
                              <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
                                Failed
                              </span>
                            )}
                          </div>
                          {activeTab === 'activities' && (
                            <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                              {item.activity_description}
                            </p>
                          )}
                          {activeTab === 'login_history' && item.failure_reason && (
                            <p className="text-sm text-red-600 mb-2">Reason: {item.failure_reason}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                            <span className="flex items-center gap-1">
                              <HiOutlineClock />
                              {formatDate(item.created_at)}
                            </span>
                            {item.ip_address && (
                              <span className="flex items-center gap-1">
                                <HiOutlineGlobe />
                                IP: {item.ip_address}
                              </span>
                            )}
                            {item.user_agent && (
                              <span className="text-xs text-gray-400 truncate max-w-xs" title={item.user_agent}>
                                {item.user_agent.substring(0, 50)}...
                              </span>
                            )}
                            {item.entity_type && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                                {item.entity_type}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {activeTab === 'activities' && (
                            <button
                              onClick={() => deleteActivity(item.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Delete"
                            >
                              <HiOutlineXCircle />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && currentData.length > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;


