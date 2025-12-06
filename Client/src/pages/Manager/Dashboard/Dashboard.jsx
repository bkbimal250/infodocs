import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiArrowRight, HiOutlineBell, HiOutlineClock, HiOutlineBriefcase } from 'react-icons/hi';
import { managerApi } from '../../../api/Manager/managerApi';
import { usersApi } from '../../../api/Users/usersApi';

/**
 * Manager Dashboard Page
 * Shows overview for managers
 */
const ManagerDashboard = () => {
  const [stats, setStats] = useState({
    totalCertificates: 0,
    totalCandidates: 0,
    totalHiringForms: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentCertificates, setRecentCertificates] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activities, setActivities] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [certsRes, candidatesRes, hiringRes, notificationsRes, activitiesRes, unreadRes] = await Promise.allSettled([
        managerApi.getMyCertificates({ skip: 0, limit: 1000 }),
        managerApi.getMyCandidateForms({ skip: 0, limit: 1000 }),
        managerApi.getMyHiringForms({ skip: 0, limit: 1000 }),
        usersApi.getNotifications({ limit: 5 }),
        usersApi.getActivities({ limit: 5 }),
        usersApi.getUnreadCount(),
      ]);

      const certificates = certsRes.status === 'fulfilled' ? (certsRes.value.data || []) : [];
      const candidates = candidatesRes.status === 'fulfilled' ? (candidatesRes.value.data || []) : [];
      const hiringForms = hiringRes.status === 'fulfilled' ? (hiringRes.value.data || []) : [];

      setStats({
        totalCertificates: certificates.length,
        totalCandidates: candidates.length,
        totalHiringForms: hiringForms.length,
      });
      setRecentCertificates(certificates.slice(0, 5));

      if (notificationsRes.status === 'fulfilled') {
        const notifs = notificationsRes.value.data || [];
        setNotifications(Array.isArray(notifs) ? notifs : []);
      }

      if (activitiesRes.status === 'fulfilled') {
        const acts = activitiesRes.value.data || [];
        setActivities(Array.isArray(acts) ? acts : []);
      }

      if (unreadRes.status === 'fulfilled') {
        setUnreadCount(unreadRes.value.data?.unread_count || 0);
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-secondary)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-[var(--color-text-secondary)]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-8">Manager Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[var(--color-bg-primary)] rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)]">Total Certificates</p>
                <p className="text-3xl font-bold text-[var(--color-text-primary)] mt-2">
                  {stats.totalCertificates}
                </p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <svg
                  className="w-6 h-6 text-[var(--color-primary)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-[var(--color-bg-primary)] rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)]">Total Candidates</p>
                <p className="text-3xl font-bold text-[var(--color-text-primary)] mt-2">{stats.totalCandidates}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-[var(--color-bg-primary)] rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)]">Total Hiring Forms</p>
                <p className="text-3xl font-bold text-[var(--color-text-primary)] mt-2">
                  {stats.totalHiringForms}
                </p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <HiOutlineBriefcase className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications and Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Notifications */}
          <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Recent Notifications</h2>
              <Link
                to="/manager/notifications"
                className="text-sm text-[var(--color-primary)] hover:text-blue-800 font-medium"
              >
                View All <HiArrowRight className="inline ml-1" />
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border ${
                      notification.is_read
                        ? 'bg-[var(--color-bg-secondary)] border-[var(--color-border-primary)]'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                            {notification.title || 'Notification'}
                          </h3>
                          {!notification.is_read && (
                            <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[var(--color-text-secondary)] mb-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400">
                          {notification.created_at
                            ? new Date(notification.created_at).toLocaleString()
                            : 'Unknown date'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No notifications yet</p>
            )}
            {unreadCount > 0 && (
              <div className="mt-4 pt-4 border-t border-[var(--color-border-primary)]">
                <p className="text-sm text-[var(--color-text-secondary)]">
                  <HiOutlineBell className="inline mr-1 text-yellow-600" />
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>

          {/* Recent Activities */}
          <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Recent Activities</h2>
              <Link
                to="/manager/activities"
                className="text-sm text-[var(--color-primary)] hover:text-blue-800 font-medium"
              >
                View All <HiArrowRight className="inline ml-1" />
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : activities.length > 0 ? (
              <div className="space-y-3">
                {activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-[var(--color-bg-secondary)]">
                    <div className="flex-shrink-0 mt-1">
                      <HiOutlineClock className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--color-text-primary)]">
                        {activity.activity_description || 'Activity'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.created_at
                          ? new Date(activity.created_at).toLocaleString()
                          : 'Unknown date'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No activities yet</p>
            )}
          </div>
        </div>

        {/* Recent Certificates */}
        <div className="bg-[var(--color-bg-primary)] rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">Recent Certificates</h2>
          {recentCertificates.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[var(--color-bg-secondary)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Candidate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Template
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[var(--color-bg-primary)] divide-y divide-gray-200">
                  {recentCertificates.map((cert) => (
                    <tr key={cert.id} className="hover:bg-[var(--color-bg-secondary)]">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--color-text-primary)]">
                        {cert.candidate_name_display || cert.candidate_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cert.template_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(cert.generated_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No certificates yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;

