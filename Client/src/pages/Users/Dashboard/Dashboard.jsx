import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineDocumentText,
  HiOutlineClipboardList,
  HiOutlineBell,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiArrowRight,
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
      const userRes = await authApi.getCurrentUser();
      setUser(userRes.data);

      await Promise.allSettled([
        loadNotifications(),
        loadActivities(),
        loadCertificates(),
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
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-secondary)] flex items-center justify-center px-4">
        <div className="bg-[var(--color-bg-primary)] rounded-2xl shadow-lg px-8 py-6 flex flex-col items-center max-w-sm w-full">
          <div className="w-12 h-12 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin mb-4" />
          <p className="text-[var(--color-text-primary)] font-medium">
            Loading your dashboard...
          </p>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Please wait a moment.
          </p>
        </div>
      </div>
    );
  }

  const unreadNotifications = notifications.filter((n) => !n.is_read).length;
  const recentActivities = activities.slice(0, 5);

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header / Hero */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-lg p-[1px]">
          <div className="bg-[var(--color-bg-primary)] rounded-2xl px-6 py-5 md:px-8 md:py-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--color-text-secondary)] mb-1">
                Dashboard
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">
                Welcome back, {user?.first_name} 👋
              </h1>
              <p className="mt-1 text-sm md:text-[15px] text-[var(--color-text-secondary)]">
                Here&apos;s a quick overview of your account activity and updates.
              </p>
            </div>
            <div className="flex flex-col items-stretch md:items-end gap-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-bg-secondary)] px-3 py-1 text-xs text-[var(--color-text-secondary)]">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100">
                  <HiOutlineBell className="w-3.5 h-3.5 text-blue-600" />
                </span>
                {unreadNotifications > 0 ? (
                  <>
                    You have{' '}
                    <span className="font-semibold text-[var(--color-text-primary)]">
                      {unreadNotifications} unread
                    </span>{' '}
                    notification{unreadNotifications > 1 ? 's' : ''}
                  </>
                ) : (
                  'You are all caught up 🎉'
                )}
              </div>
              <Link
                to="/user/profile"
                className="text-xs md:text-sm text-[var(--color-primary)] hover:text-blue-700 inline-flex items-center gap-1"
              >
                View profile
                <HiArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* Certificates */}
          <div className="bg-[var(--color-bg-primary)] rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
                  My Certificates
                </p>
                <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-2">
                  {certificates.length}
                </p>
              </div>
              <div className="rounded-full p-3 bg-blue-50">
                <HiOutlineDocumentText className="h-7 w-7 text-blue-600" />
              </div>
            </div>
            <Link
              to="/user/certificates"
              className="mt-4 text-sm text-[var(--color-primary)] hover:text-blue-700 inline-flex items-center"
            >
              View all <HiArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {/* Notifications */}
          <div className="bg-[var(--color-bg-primary)] rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
                  Notifications
                </p>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                    {unreadNotifications}
                  </p>
                  <span className="text-xs text-gray-500">
                    {unreadNotifications > 0 ? 'unread' : 'no new alerts'}
                  </span>
                </div>
              </div>
              <div className="rounded-full p-3 bg-yellow-50">
                <HiOutlineBell className="h-7 w-7 text-yellow-600" />
              </div>
            </div>
            <Link
              to="/user/notifications"
              className="mt-4 text-sm text-yellow-700 hover:text-yellow-800 inline-flex items-center"
            >
              View all <HiArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {/* Activities */}
          <div className="bg-[var(--color-bg-primary)] rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
                  Activities
                </p>
                <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-2">
                  {activities.length}
                </p>
              </div>
              <div className="rounded-full p-3 bg-green-50">
                <HiOutlineClock className="h-7 w-7 text-green-600" />
              </div>
            </div>
            <Link
              to="/user/activities"
              className="mt-4 text-sm text-green-700 hover:text-green-800 inline-flex items-center"
            >
              View all <HiArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {/* Forms */}
          <div className="bg-[var(--color-bg-primary)] rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
                  Forms
                </p>
                <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-2">
                  —
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Submit or review candidate forms
                </p>
              </div>
              <div className="rounded-full p-3 bg-purple-50">
                <HiOutlineClipboardList className="h-7 w-7 text-purple-600" />
              </div>
            </div>
            <Link
              to="/user/forms"
              className="mt-4 text-sm text-purple-700 hover:text-purple-800 inline-flex items-center"
            >
              Go to forms <HiArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Notifications & Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Notifications */}
          <div className="bg-[var(--color-bg-primary)] rounded-xl border border-gray-100 shadow-sm">
            <div className="p-5 border-b border-[var(--color-border-primary)] flex items-center justify-between">
              <h2 className="text-base md:text-lg font-semibold text-[var(--color-text-primary)]">
                Recent Notifications
              </h2>
              <Link
                to="/user/notifications"
                className="text-xs md:text-sm text-[var(--color-primary)] hover:text-blue-700"
              >
                View all
              </Link>
            </div>
            <div className="p-5">
              {notifications.length === 0 ? (
                <p className="text-gray-500 text-center py-4 text-sm">
                  No notifications yet
                </p>
              ) : (
                <div className="space-y-3">
                  {notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border text-sm ${
                        notification.is_read
                          ? 'bg-[var(--color-bg-secondary)] border-[var(--color-border-primary)]'
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                            {notification.title}
                          </h3>
                          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <button
                            onClick={() =>
                              markNotificationAsRead(notification.id)
                            }
                            className="ml-2 text-[var(--color-primary)] hover:text-blue-700"
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
          <div className="bg-[var(--color-bg-primary)] rounded-xl border border-gray-100 shadow-sm">
            <div className="p-5 border-b border-[var(--color-border-primary)] flex items-center justify-between">
              <h2 className="text-base md:text-lg font-semibold text-[var(--color-text-primary)]">
                Recent Activities
              </h2>
              <Link
                to="/user/activities"
                className="text-xs md:text-sm text-[var(--color-primary)] hover:text-blue-700"
              >
                View all
              </Link>
            </div>
            <div className="p-5">
              {activities.length === 0 ? (
                <p className="text-gray-500 text-center py-4 text-sm">
                  No activities yet
                </p>
              ) : (
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3 text-sm"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {activity.activity_type === 'certificate_created' ? (
                          <HiOutlineCheckCircle className="h-5 w-5 text-green-600" />
                        ) : activity.activity_type === 'form_submitted' ? (
                          <HiOutlineClipboardList className="h-5 w-5 text-[var(--color-primary)]" />
                        ) : (
                          <HiOutlineClock className="h-5 w-5 text-[var(--color-text-secondary)]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[var(--color-text-primary)]">
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
        <div className="bg-[var(--color-bg-primary)] rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base md:text-lg font-semibold text-[var(--color-text-primary)] mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/certificate-creation"
              className="group flex items-center justify-between p-4 rounded-xl border border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
                  <HiOutlineDocumentText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Create Certificate
                  </p>
                  <p className="text-xs text-gray-500">
                    Generate a new certificate for staff
                  </p>
                </div>
              </div>
              <HiArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
            </Link>

            <Link
              to="/candidate-form"
              className="group flex items-center justify-between p-4 rounded-xl border border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center">
                  <HiOutlineClipboardList className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Submit Candidate Form
                  </p>
                  <p className="text-xs text-gray-500">
                    Add a new candidate to the system
                  </p>
                </div>
              </div>
              <HiArrowRight className="h-4 w-4 text-gray-400 group-hover:text-green-600" />
            </Link>

            <Link
              to="/user/profile"
              className="group flex items-center justify-between p-4 rounded-xl border border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-purple-100 flex items-center justify-center">
                  <HiOutlineCheckCircle className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Manage Profile
                  </p>
                  <p className="text-xs text-gray-500">
                    Update your personal information
                  </p>
                </div>
              </div>
              <HiArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
