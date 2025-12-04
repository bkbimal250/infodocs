import { useState, useEffect } from 'react';
import {
  HiOutlineBell,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineUser,
  HiOutlineLockClosed,
  HiOutlineKey,
  HiOutlineDocumentText,
  HiOutlineMail,
  HiOutlineRefresh,
} from 'react-icons/hi';
import { usersApi } from '../../../api/Users/usersApi';
import Pagination from '../../common/Pagination';

/**
 * Admin Recent Notifications Page
 * Shows all notifications including OTP, password reset, login, certificate generation, etc.
 */
const RecentNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filter, setFilter] = useState('all'); // all, unread, login, otp, password_reset, certificate
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const itemsPerPage = 20;

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, [currentPage, filter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const skip = (currentPage - 1) * itemsPerPage;
      const params = {
        skip,
        limit: itemsPerPage,
        unread_only: filter === 'unread',
      };

      const response = await usersApi.getNotifications(params);
      const data = response.data || [];
      setNotifications(Array.isArray(data) ? data : []);
      setTotalItems(data.length >= itemsPerPage ? data.length + skip : data.length + skip);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await usersApi.getUnreadCount();
      setUnreadCount(response.data?.unread_count || 0);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await usersApi.markNotificationAsRead(notificationId);
      await loadNotifications();
      await loadUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await usersApi.markAllNotificationsAsRead();
      await loadNotifications();
      await loadUnreadCount();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Filter notifications - must be defined before functions that use it
  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.is_read;
    if (filter === 'login') return notif.notification_type === 'login';
    if (filter === 'otp') return notif.notification_type?.includes('otp');
    if (filter === 'password_reset') return notif.notification_type === 'password_reset';
    if (filter === 'certificate') return notif.notification_type === 'certificate_created';
    return true;
  });

  // Selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredNotifications.map(notif => notif.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (notificationId) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(notificationId)) {
      newSelected.delete(notificationId);
    } else {
      newSelected.add(notificationId);
    }
    setSelectedIds(newSelected);
  };

  const isAllSelected = filteredNotifications.length > 0 && 
    filteredNotifications.every(notif => selectedIds.has(notif.id));
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < filteredNotifications.length;

  const deleteNotification = async (notificationId) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }
    try {
      await usersApi.deleteNotification(notificationId);
      // Remove from selection if it was selected
      const newSelected = new Set(selectedIds);
      newSelected.delete(notificationId);
      setSelectedIds(newSelected);
      await loadNotifications();
      await loadUnreadCount();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) {
      alert('Please select at least one notification to delete');
      return;
    }

    const count = selectedIds.size;
    if (!window.confirm(`Are you sure you want to delete ${count} notification(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      setIsDeleting(true);
      const idsArray = Array.from(selectedIds);
      const response = await usersApi.bulkDelete({ notification_ids: idsArray });
      
      // Show result message
      if (response.data.deleted_notifications > 0) {
        alert(`Successfully deleted ${response.data.deleted_notifications} notification(s)`);
      }
      if (response.data.failed_notifications?.length > 0) {
        alert(`Failed to delete ${response.data.failed_notifications.length} notification(s)`);
      }
      
      // Clear selection
      setSelectedIds(new Set());
      
      // Refresh the list
      await loadNotifications();
      await loadUnreadCount();
    } catch (error) {
      console.error('Error deleting notifications:', error);
      alert(error.response?.data?.detail || 'Failed to delete notifications');
    } finally {
      setIsDeleting(false);
    }
  };

  const getNotificationIcon = (type) => {
    if (type?.includes('login')) return <HiOutlineUser className="text-blue-500" />;
    if (type?.includes('otp')) return <HiOutlineKey className="text-purple-500" />;
    if (type?.includes('password_reset')) return <HiOutlineLockClosed className="text-orange-500" />;
    if (type?.includes('certificate')) return <HiOutlineDocumentText className="text-green-500" />;
    return <HiOutlineBell className="text-gray-500" />;
  };

  const getNotificationColor = (type, isRead) => {
    if (isRead) return 'bg-gray-50 border-gray-200';
    
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

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <HiOutlineBell className="text-[var(--color-primary)]" />
              Recent Notifications
            </h1>
            <p className="mt-2 text-[var(--color-text-secondary)]">
              All system notifications including logins, OTP, password resets, and more
            </p>
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                {unreadCount} unread
              </span>
            )}
            {selectedIds.size > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isDeleting ? `Deleting ${selectedIds.size}...` : `Delete Selected (${selectedIds.size})`}
              </button>
            )}
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-dark)] transition-colors flex items-center gap-2"
            >
              <HiOutlineCheckCircle />
              Mark All Read
            </button>
            <button
              onClick={loadNotifications}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center gap-2"
            >
              <HiOutlineRefresh />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {[
            { value: 'all', label: 'All' },
            { value: 'unread', label: 'Unread' },
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

        {/* Notifications List */}
        <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto"></div>
              <p className="mt-4 text-[var(--color-text-secondary)]">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <HiOutlineBell className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-[var(--color-text-secondary)]">No notifications found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {/* Header with select all checkbox */}
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = isIndeterminate;
                  }}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">Select All</span>
              </div>
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${getNotificationColor(
                    notification.notification_type,
                    notification.is_read
                  )} ${selectedIds.has(notification.id) ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(notification.id)}
                        onChange={() => handleSelectOne(notification.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.notification_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                              {notification.title || 'Notification'}
                            </h3>
                            {!notification.is_read && (
                              <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                                New
                              </span>
                            )}
                            <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                              {notification.notification_type || 'system'}
                            </span>
                          </div>
                          <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <HiOutlineClock />
                              {formatDate(notification.created_at)}
                            </span>
                            {notification.meta_data?.ip_address && (
                              <span className="flex items-center gap-1">
                                <HiOutlineUser />
                                IP: {notification.meta_data.ip_address}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!notification.is_read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="Mark as read"
                            >
                              <HiOutlineCheckCircle />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete"
                          >
                            <HiOutlineXCircle />
                          </button>
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
        {!loading && filteredNotifications.length > 0 && (
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

export default RecentNotification;


