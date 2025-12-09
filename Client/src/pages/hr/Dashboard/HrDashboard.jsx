import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiArrowRight, HiLocationMarker, HiOutlineBell, HiOutlineClock } from 'react-icons/hi';
import {
  HiOutlineDocument,
  HiOutlineBriefcase,
  HiOutlineDocumentText,
} from 'react-icons/hi';
import DashboardStats from './DashboardStats';
import { hrApi } from '../../../api/hr/hrApi';
import { usersApi } from '../../../api/Users/usersApi';

/**
 * HR Dashboard
 * Main dashboard page for HR users showing overview and statistics
 */
const HrDashboard = () => {
  const [recentCertificates, setRecentCertificates] = useState([]);
  const [recentCandidateForms, setRecentCandidateForms] = useState([]);
  const [recentHiringForms, setRecentHiringForms] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activities, setActivities] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [certificatesRes, candidateFormsRes, hiringFormsRes, notificationsRes, activitiesRes, unreadRes] = await Promise.allSettled([
        hrApi.getCertificates({ skip: 0, limit: 5 }),
        hrApi.getCandidateForms({ skip: 0, limit: 5 }),
        hrApi.getHiringForms({ skip: 0, limit: 5 }),
        usersApi.getNotifications({ limit: 5 }),
        usersApi.getActivities({ limit: 5 }),
        usersApi.getUnreadCount(),
      ]);

      if (certificatesRes.status === 'fulfilled') {
        const certificates = certificatesRes.value.data?.results || certificatesRes.value.data || [];
        setRecentCertificates(Array.isArray(certificates) ? certificates : []);
      }

      if (candidateFormsRes.status === 'fulfilled') {
        const forms = candidateFormsRes.value.data || [];
        setRecentCandidateForms(Array.isArray(forms) ? forms : []);
      }

      if (hiringFormsRes.status === 'fulfilled') {
        const forms = hiringFormsRes.value.data || [];
        setRecentHiringForms(Array.isArray(forms) ? forms : []);
      }

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
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">HR Dashboard</h1>
          <p className="mt-2 text-[var(--color-text-secondary)]">Overview of candidates, hiring, and certificates</p>
        </div>

        {/* Statistics Cards */}
        <div className="mb-8">
          <DashboardStats />
        </div>

        {/* Notifications and Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Notifications */}
          <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Recent Notifications</h2>
              <Link
                to="/hr/notifications"
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
                to="/hr/activities"
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

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Certificates */}
          <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Recent Certificates</h2>
              <Link
                to="/hr/certificates"
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
            ) : recentCertificates.length > 0 ? (
              <div className="space-y-3">
                {recentCertificates.map((cert) => (
                  <Link
                    key={cert.id}
                    to={`/hr/certificates/${cert.id}`}
                    className="block border-b border-[var(--color-border-primary)] pb-3 last:border-0 hover:bg-[var(--color-bg-secondary)] -mx-2 px-2 rounded transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-[var(--color-text-primary)]">
                          {cert.candidate_name || cert.candidate_name_display || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {cert.category
                            ? String(cert.category)
                                .split('_')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(' ')
                            : cert.template_id
                            ? `Template #${cert.template_id}`
                            : 'Template'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {cert.generated_at
                            ? new Date(cert.generated_at).toLocaleDateString()
                            : 'Unknown date'}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No certificates yet</p>
            )}
          </div>

          {/* Recent Candidate Forms */}
          <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Recent Candidates</h2>
              <Link
                to="/hr/candidates"
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
            ) : recentCandidateForms.length > 0 ? (
              <div className="space-y-3">
                {recentCandidateForms.map((form) => (
                  <Link
                    key={form.id}
                    to={`/hr/candidates/${form.id}`}
                    className="block border-b border-[var(--color-border-primary)] pb-3 last:border-0 hover:bg-[var(--color-bg-secondary)] -mx-2 px-2 rounded transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-[var(--color-text-primary)]">
                          {form.first_name} {form.middle_name || ''} {form.last_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {form.position_applied_for || 'Position'}
                        </p>
                        {(form.spa?.name || form.spa_name_text) && (
                          <p className="text-xs text-gray-400 mt-1">
                            <HiLocationMarker className="inline mr-1" /> {form.spa?.name || form.spa_name_text}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {form.created_at
                            ? new Date(form.created_at).toLocaleDateString()
                            : 'Unknown date'}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No forms submitted yet</p>
            )}
          </div>

          {/* Recent Hiring Requirements */}
          <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Recent Hiring Requirements</h2>
              <Link
                to="/hr/hiring-data"
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
            ) : recentHiringForms.length > 0 ? (
              <div className="space-y-3">
                {recentHiringForms.map((form) => (
                  <Link
                    key={form.id}
                    to={`/hr/hiring-data/${form.id}`}
                    className="block border-b border-[var(--color-border-primary)] pb-3 last:border-0 hover:bg-[var(--color-bg-secondary)] -mx-2 px-2 rounded transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-[var(--color-text-primary)]">{form.for_role || 'Role'}</p>
                        <p className="text-sm text-gray-500">
                          {(form.spa?.name || form.spa_name_text) || 'SPA Location'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Exp: {form.required_experience || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {form.created_at
                            ? new Date(form.created_at).toLocaleDateString()
                            : 'Unknown date'}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No hiring requirements yet</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/hr/candidates"
              className="p-5 border-2 border-[var(--color-border-primary)] rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <HiOutlineDocument className="text-3xl mb-3 group-hover:scale-110 transition-transform" />
              <div className="font-semibold text-[var(--color-text-primary)] mb-1">View Candidates</div>
              <div className="text-sm text-[var(--color-text-secondary)]">Review candidate applications</div>
            </Link>
            <Link
              to="/hr/hiring-data"
              className="p-5 border-2 border-[var(--color-border-primary)] rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
            >
              <HiOutlineBriefcase className="text-3xl mb-3 group-hover:scale-110 transition-transform" />
              <div className="font-semibold text-[var(--color-text-primary)] mb-1">Hiring Requirements</div>
              <div className="text-sm text-[var(--color-text-secondary)]">View requirements from users/managers</div>
            </Link>
            <Link
              to="/hr/profile"
              className="p-5 border-2 border-[var(--color-border-primary)] rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group"
            >
              <HiOutlineDocumentText className="text-3xl mb-3 group-hover:scale-110 transition-transform" />
              <div className="font-semibold text-[var(--color-text-primary)] mb-1">Profiles</div>
              <div className="text-sm text-[var(--color-text-secondary)]">View your profile</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HrDashboard;

