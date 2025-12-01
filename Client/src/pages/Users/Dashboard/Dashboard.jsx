import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  HiOutlineDocumentText, 
  HiOutlineClipboardList, 
  HiOutlineBell,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiArrowRight
} from 'react-icons/hi';
import { authApi } from '../../../api/Auth/authApi';
import { usersApi } from '../../../api/Users/usersApi';

/**
 * User Dashboard
 * Shows user's own certificates, forms, notifications, and activity history
 */
const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [activities, setActivities] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get current user
      const userRes = await authApi.getCurrentUser();
      setUser(userRes.data);

      // Load user's data
      await Promise.allSettled([
        loadNotifications(),
        loadActivities(),
        loadCertificates()
      ]);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await usersApi.getNotifications({ limit: 10 });
      setNotifications(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.warn('Notifications endpoint not available:', error);
      setNotifications([]);
    }
  };

  const loadActivities = async () => {
    try {
      const response = await usersApi.getActivities({ limit: 10 });
      setActivities(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.warn('Activities endpoint not available:', error);
      setActivities([]);
    }
  };

  const loadCertificates = async () => {
    if (!user) return;
    
    try {
      const response = await usersApi.getMyCertificates({ limit: 5 });
      setCertificates(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading certificates:', error);
      setCertificates([]);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await usersApi.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const unreadNotifications = notifications.filter(n => !n.is_read).length;
  const recentActivities = activities.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's what's happening with your account
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">My Certificates</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{certificates.length}</p>
              </div>
              <HiOutlineDocumentText className="h-8 w-8 text-blue-600" />
            </div>
            <Link 
              to="/user/certificates" 
              className="text-sm text-blue-600 hover:text-blue-700 mt-4 inline-flex items-center"
            >
              View all <HiArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Notifications</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {unreadNotifications}
                  {unreadNotifications > 0 && (
                    <span className="text-sm font-normal text-gray-500"> unread</span>
                  )}
                </p>
              </div>
              <HiOutlineBell className="h-8 w-8 text-yellow-600" />
            </div>
            <Link 
              to="/user/notifications" 
              className="text-sm text-yellow-600 hover:text-yellow-700 mt-4 inline-flex items-center"
            >
              View all <HiArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Activities</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{activities.length}</p>
              </div>
              <HiOutlineClock className="h-8 w-8 text-green-600" />
            </div>
            <Link 
              to="/user/activities" 
              className="text-sm text-green-600 hover:text-green-700 mt-4 inline-flex items-center"
            >
              View all <HiArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Forms</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">-</p>
              </div>
              <HiOutlineClipboardList className="h-8 w-8 text-purple-600" />
            </div>
            <Link 
              to="/user/forms" 
              className="text-sm text-purple-600 hover:text-purple-700 mt-4 inline-flex items-center"
            >
              Submit form <HiArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Notifications */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Notifications</h2>
                <Link 
                  to="/user/notifications" 
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="p-6">
              {notifications.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No notifications yet</p>
              ) : (
                <div className="space-y-4">
                  {notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border ${
                        notification.is_read 
                          ? 'bg-gray-50 border-gray-200' 
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <button
                            onClick={() => markNotificationAsRead(notification.id)}
                            className="ml-4 text-blue-600 hover:text-blue-700"
                          >
                            <HiOutlineCheckCircle className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
                <Link 
                  to="/user/activities" 
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="p-6">
              {activities.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No activities yet</p>
              ) : (
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {activity.activity_type === 'certificate_created' ? (
                          <HiOutlineCheckCircle className="h-5 w-5 text-green-600" />
                        ) : activity.activity_type === 'form_submitted' ? (
                          <HiOutlineClipboardList className="h-5 w-5 text-blue-600" />
                        ) : (
                          <HiOutlineClock className="h-5 w-5 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          {activity.activity_description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/certificate-creation"
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <HiOutlineDocumentText className="h-6 w-6 text-gray-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">Create Certificate</span>
            </Link>
            <Link
              to="/candidate-form"
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <HiOutlineClipboardList className="h-6 w-6 text-gray-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">Submit Form</span>
            </Link>
            <Link
              to="/user/profile"
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
            >
              <HiOutlineCheckCircle className="h-6 w-6 text-gray-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">View Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

