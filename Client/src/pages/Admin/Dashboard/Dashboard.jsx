import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiArrowRight, HiLocationMarker, HiOutlineBell, HiOutlineClock, HiOutlineCheckCircle } from 'react-icons/hi';
import {
  HiOutlineClipboardList,
  HiOutlineUsers,
  HiSparkles,
  HiOutlineOfficeBuilding,
  HiOutlineDocument,
  HiOutlineBriefcase,
  HiOutlineChartBar,
  HiOutlineDocumentText,
} from 'react-icons/hi';
import DashboardStats from './DashboardStats';
import { adminApi } from '../../../api/Admin/adminApi';
import { usersApi } from '../../../api/Users/usersApi';

/**
 * Admin Dashboard
 * Main dashboard page for admin users showing overview and statistics
 */
const AdminDashboard = () => {
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
        adminApi.certificates.getAllCertificates({ skip: 0, limit: 5 }),
        adminApi.forms.getCandidateForms(0, 5),
        adminApi.forms.getHiringForms(0, 5),
        usersApi.getNotifications({ limit: 5 }),
        usersApi.getActivities({ limit: 5 }),
        usersApi.getUnreadCount(),
      ]);

      if (certificatesRes.status === 'fulfilled') {
        // Admin endpoint returns array directly, not wrapped in results
        const certificates = certificatesRes.value.data || [];
        setRecentCertificates(Array.isArray(certificates) ? certificates.slice(0, 5) : []);
      }

      if (candidateFormsRes.status === 'fulfilled') {
        const forms = candidateFormsRes.value.data || [];
        setRecentCandidateForms(Array.isArray(forms) ? forms.slice(0, 5) : []);
      }

      if (hiringFormsRes.status === 'fulfilled') {
        const forms = hiringFormsRes.value.data || [];
        setRecentHiringForms(Array.isArray(forms) ? forms.slice(0, 5) : []);
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
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Admin Dashboard</h1>
          <p className="mt-2 text-[var(--color-text-secondary)]">Overview of your system statistics and recent activity</p>
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
                to="/admin/notifications"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
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
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-medium text-gray-900">
                            {notification.title || 'Notification'}
                          </h3>
                          {!notification.is_read && (
                            <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
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
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <HiOutlineBell className="inline mr-1 text-yellow-600" />
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activities</h2>
              <Link
                to="/admin/activities"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
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
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                    <div className="flex-shrink-0 mt-1">
                      <HiOutlineClock className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
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
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Certificates</h2>
              <Link
                to="/admin/certificates"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
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
                    to={`/admin/certificates/${cert.id}`}
                    className="block border-b border-gray-200 pb-3 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {cert.candidate_name || cert.candidate_name_display || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(() => {
                            // Get template name - try multiple possible fields
                            if (cert.template_name) return cert.template_name;
                            if (cert.template?.name) return cert.template.name;
                            // Format category as fallback
                            if (cert.category) {
                              const categoryStr = String(cert.category);
                              return categoryStr
                                .split('_')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(' ');
                            }
                            if (cert.template_id) return `Template #${cert.template_id}`;
                            return 'Template';
                          })()}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(cert.generated_at || cert.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ml-2 ${
                          cert.is_verified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {cert.is_verified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No certificates yet</p>
            )}
          </div>

          {/* Recent Candidate Forms */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Candidates</h2>
              <Link
                to="/admin/forms-data/candidates"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
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
                    to={`/admin/forms-data/candidates/${form.id}`}
                    className="block border-b border-gray-200 pb-3 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
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
                          {new Date(form.created_at).toLocaleDateString()}
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

          {/* Recent Hiring Forms */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Hiring Forms</h2>
              <Link
                to="/admin/forms-data/hiring-forms"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
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
                    to={`/admin/hiring/${form.id}`}
                    className="block border-b border-gray-200 pb-3 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{form.for_role || 'Role'}</p>
                        <p className="text-sm text-gray-500">
                          {(form.spa?.name || form.spa_name_text) || 'SPA Location'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Exp: {form.required_experience || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(form.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No hiring forms yet</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/certificates/templates"
              className="p-5 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <HiOutlineClipboardList className="text-3xl mb-3 group-hover:scale-110 transition-transform" />
              <div className="font-semibold text-gray-900 mb-1">Manage Templates</div>
              <div className="text-sm text-gray-600">Create and edit certificate templates</div>
            </Link>
            <Link
              to="/admin/users"
              className="p-5 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
            >
              <HiOutlineUsers className="text-3xl mb-3 group-hover:scale-110 transition-transform" />
              <div className="font-semibold text-gray-900 mb-1">Manage Users</div>
              <div className="text-sm text-gray-600">View and manage user accounts</div>
            </Link>
            <Link
              to="/admin/certificates/create"
              className="p-5 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group"
            >
              <HiSparkles className="text-3xl mb-3 group-hover:scale-110 transition-transform" />
              <div className="font-semibold text-gray-900 mb-1">Create Certificate</div>
              <div className="text-sm text-gray-600">Generate a new certificate</div>
            </Link>
            <Link
              to="/admin/spas"
              className="p-5 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all group"
            >
              <HiOutlineOfficeBuilding className="text-3xl mb-3 group-hover:scale-110 transition-transform" />
              <div className="font-semibold text-gray-900 mb-1">Manage SPAs</div>
              <div className="text-sm text-gray-600">Add and manage SPA locations</div>
            </Link>
            <Link
              to="/admin/forms-data/candidates"
              className="p-5 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
            >
              <HiOutlineDocument className="text-3xl mb-3 group-hover:scale-110 transition-transform" />
              <div className="font-semibold text-gray-900 mb-1">Candidate Forms</div>
              <div className="text-sm text-gray-600">View candidate applications</div>
            </Link>
            <Link
              to="/admin/forms-data/hiring-forms"
              className="p-5 border-2 border-gray-200 rounded-lg hover:border-pink-500 hover:bg-pink-50 transition-all group"
            >
              <HiOutlineBriefcase className="text-3xl mb-3 group-hover:scale-110 transition-transform" />
              <div className="font-semibold text-gray-900 mb-1">Hiring Forms</div>
              <div className="text-sm text-gray-600">Manage hiring requirements</div>
            </Link>
            <Link
              to="/admin/hiring"
              className="p-5 border-2 border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-all group"
            >
              <HiOutlineChartBar className="text-3xl mb-3 group-hover:scale-110 transition-transform" />
              <div className="font-semibold text-gray-900 mb-1">Hiring Management</div>
              <div className="text-sm text-gray-600">View and manage hiring posts</div>
            </Link>
            <Link
              to="/admin/certificates"
              className="p-5 border-2 border-gray-200 rounded-lg hover:border-cyan-500 hover:bg-cyan-50 transition-all group"
            >
              <HiOutlineDocumentText className="text-3xl mb-3 group-hover:scale-110 transition-transform" />
              <div className="font-semibold text-gray-900 mb-1">View Certificates</div>
              <div className="text-sm text-gray-600">Browse all generated certificates</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

