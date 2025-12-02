import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  HiArrowLeft, 
  HiOutlineUser, 
  HiOutlineMail, 
  HiOutlinePhone,
  HiOutlineCalendar,
  HiOutlineShieldCheck,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineGlobe
} from 'react-icons/hi';
import { adminApi } from '../../../api/Admin/adminApi';
import apiClient from '../../../utils/apiConfig';

/**
 * User Details Page
 * View and edit user details
 */
const UsersDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loginHistory, setLoginHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    role: 'user',
    password: '',
    is_active: true,
    is_verified: false,
  });

  useEffect(() => {
    loadUser();
    loadLoginHistory();
  }, [id]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const response = await adminApi.users.getUser(id);
      const userData = response.data;
      setUser(userData);
      setFormData({
        username: userData.username || '',
        email: userData.email || '',
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        phone_number: userData.phone_number || '',
        role: userData.role || 'user',
        password: '', // Don't pre-fill password
        is_active: userData.is_active !== undefined ? userData.is_active : true,
        is_verified: userData.is_verified !== undefined ? userData.is_verified : false,
      });
    } catch (err) {
      setError('Failed to load user details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadLoginHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await apiClient.get(`/notifications/login-history`, {
        params: { user_id: id, limit: 50 }
      });
      setLoginHistory(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Failed to load login history:', err);
      setLoginHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const updateData = { ...formData };
      // Don't send password if it's empty
      if (!updateData.password) {
        delete updateData.password;
      }

      await adminApi.users.updateUser(id, updateData);
      setSuccess('User updated successfully');
      setEditing(false);
      await loadUser();
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || 'Failed to update user');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await adminApi.users.deleteUser(id);
      navigate('/admin/users');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete user');
      console.error(err);
    }
  };

  const getRoleDisplay = (role) => {
    const roleMap = {
      'super_admin': 'Super Admin',
      'admin': 'Admin',
      'spa_manager': 'SPA Manager',
      'hr': 'HR',
      'user': 'User'
    };
    return roleMap[role] || role;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-secondary)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-secondary)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--color-text-secondary)] mb-4">User not found</p>
          <Link to="/admin/users" className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]">
            Back to Users
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/admin/users"
            className="inline-flex items-center text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] mb-4"
          >
            <HiArrowLeft className="mr-2" /> Back to Users
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
                {user.first_name} {user.last_name}
              </h1>
              <p className="mt-2 text-[var(--color-text-secondary)]">User Details and Management</p>
            </div>
            {!editing && (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-text-inverse)] rounded-lg hover:bg-[var(--color-primary-dark)] flex items-center"
                >
                  <HiOutlinePencil className="mr-2" /> Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-[var(--color-error)] text-[var(--color-text-inverse)] rounded-lg hover:bg-[var(--color-error-dark)] flex items-center"
                >
                  <HiOutlineTrash className="mr-2" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        {success && (
          <div className="mb-6 bg-[var(--color-success-light)] border border-[var(--color-success-light)] text-[var(--color-success-dark)] px-4 py-3 rounded-lg">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 bg-[var(--color-error-light)] border border-[var(--color-error-light)] text-[var(--color-error-dark)] px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* User Details Card */}
        <div className="bg-[var(--color-bg-primary)] rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)]">
            <div className="flex items-center">
              <div className="h-16 w-16 bg-[var(--color-bg-primary)] rounded-full flex items-center justify-center">
                <HiOutlineUser className="h-8 w-8 text-[var(--color-primary)]" />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-bold text-[var(--color-text-inverse)]">
                  {user.first_name} {user.last_name}
                </h2>
                <p className="text-[var(--color-primary-light)]">{getRoleDisplay(user.role)}</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  <HiOutlineUser className="inline h-4 w-4 mr-1" />
                  Username
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[var(--color-border-primary)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                ) : (
                  <p className="text-[var(--color-text-primary)]">{user.username}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  <HiOutlineMail className="inline h-4 w-4 mr-1" />
                  Email
                </label>
                {editing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[var(--color-border-primary)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                ) : (
                  <p className="text-gray-900">{user.email}</p>
                )}
              </div>

              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  First Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[var(--color-border-primary)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                ) : (
                  <p className="text-gray-900">{user.first_name}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Last Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[var(--color-border-primary)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                ) : (
                  <p className="text-gray-900">{user.last_name}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  <HiOutlinePhone className="inline h-4 w-4 mr-1" />
                  Phone Number
                </label>
                {editing ? (
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[var(--color-border-primary)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                ) : (
                  <p className="text-gray-900">{user.phone_number || 'Not provided'}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  <HiOutlineShieldCheck className="inline h-4 w-4 mr-1" />
                  Role
                </label>
                {editing ? (
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[var(--color-border-primary)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  >
                    <option value="user">User</option>
                    <option value="hr">HR</option>
                    <option value="spa_manager">SPA Manager</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                ) : (
                  <p className="text-gray-900">
                      <span className="px-2 py-1 bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] rounded-full text-sm font-medium">
                        {getRoleDisplay(user.role)}
                      </span>
                  </p>
                )}
              </div>

              {/* Password (only when editing) */}
              {editing && (
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Password (leave blank to keep current)
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[var(--color-border-primary)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>
              )}

              {/* Account Status */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Account Status
                </label>
                {editing ? (
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                        className="rounded border-[var(--color-border-primary)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                      />
                      <span className="ml-2 text-sm text-gray-700">Active</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_verified"
                        checked={formData.is_verified}
                        onChange={handleInputChange}
                        className="rounded border-[var(--color-border-primary)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                      />
                      <span className="ml-2 text-sm text-[var(--color-text-primary)]">Verified</span>
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                      user.is_active 
                        ? 'bg-[var(--color-success-light)] text-[var(--color-success-dark)]' 
                        : 'bg-[var(--color-error-light)] text-[var(--color-error-dark)]'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {user.is_verified && (
                      <span className="px-2 py-1 bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] rounded-full text-sm font-medium">
                        Verified
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Last Login */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  <HiOutlineCalendar className="inline h-4 w-4 mr-1" />
                  Last Login
                </label>
                <p className="text-[var(--color-text-primary)]">
                  {user.last_login_at 
                    ? new Date(user.last_login_at).toLocaleString()
                    : 'Never'}
                </p>
              </div>

              {/* Created At */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  <HiOutlineCalendar className="inline h-4 w-4 mr-1" />
                  Member Since
                </label>
                <p className="text-[var(--color-text-primary)]">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            {editing && (
              <div className="mt-6 flex items-center justify-end space-x-4">
                <button
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      username: user.username || '',
                      email: user.email || '',
                      first_name: user.first_name || '',
                      last_name: user.last_name || '',
                      phone_number: user.phone_number || '',
                      role: user.role || 'user',
                      password: '',
                      is_active: user.is_active !== undefined ? user.is_active : true,
                      is_verified: user.is_verified !== undefined ? user.is_verified : false,
                    });
                    setError('');
                    setSuccess('');
                  }}
                  className="px-4 py-2 border border-[var(--color-border-primary)] rounded-lg text-[var(--color-text-primary)] hover:bg-[var(--color-gray-50)]"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-text-inverse)] rounded-lg hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Login History Section */}
        <div className="mt-8 bg-[var(--color-bg-primary)] rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)]">
            <h2 className="text-xl font-bold text-[var(--color-text-inverse)] flex items-center">
              <HiOutlineClock className="mr-2" />
              Login History
            </h2>
          </div>
          <div className="px-6 py-4">
            {loadingHistory ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)] mx-auto"></div>
                <p className="mt-2 text-[var(--color-text-secondary)] text-sm">Loading login history...</p>
              </div>
            ) : loginHistory.length === 0 ? (
              <div className="text-center py-8">
                <HiOutlineClock className="h-12 w-12 text-[var(--color-text-tertiary)] mx-auto mb-4" />
                <p className="text-[var(--color-text-secondary)]">No login history found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[var(--color-border-primary)]">
                  <thead className="bg-[var(--color-gray-50)]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IP Address
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User Agent
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Failure Reason
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-[var(--color-bg-primary)] divide-y divide-[var(--color-border-primary)]">
                    {loginHistory.map((entry) => (
                      <tr key={entry.id} className="hover:bg-[var(--color-gray-50)]">
                        <td className="px-4 py-3 whitespace-nowrap">
                          {entry.login_status === 'success' ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[var(--color-success-light)] text-[var(--color-success-dark)]">
                              <HiOutlineCheckCircle className="mr-1 h-4 w-4" />
                              Success
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[var(--color-error-light)] text-[var(--color-error-dark)]">
                              <HiOutlineXCircle className="mr-1 h-4 w-4" />
                              Failed
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center text-sm text-[var(--color-text-primary)]">
                            <HiOutlineGlobe className="mr-2 h-4 w-4 text-[var(--color-text-tertiary)]" />
                            {entry.ip_address || 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-[var(--color-text-primary)] max-w-md truncate" title={entry.user_agent}>
                            {entry.user_agent || 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-[var(--color-text-secondary)]">
                            {entry.failure_reason || '-'}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-[var(--color-text-secondary)]">
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
    </div>
  );
};

export default UsersDetails;

