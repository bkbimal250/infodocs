import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../../api/Admin/adminApi';
import { FaArrowLeft } from 'react-icons/fa';

/**
 * Add User Page
 * Create a new user account
 */
const AddUserPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    role: 'user',
    phone_number: '',
    is_active: true,
    is_verified: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.password) {
      setError('Password is required');
      setLoading(false);
      return;
    }

    try {
      await adminApi.users.createUser(formData);
      navigate('/admin/users');
    } catch (err) {
      setError(
        err.response?.data?.error || err.response?.data?.detail || 'Failed to create user'
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-bg-secondary)] to-[var(--color-gray-100)] py-8 px-4">
      <div className="max-w-4xl mx-auto bg-[var(--color-bg-primary)] rounded-xl shadow-lg p-8">
        <button
          onClick={() => navigate('/admin/users')}
          className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] mb-6 flex items-center gap-2 font-medium transition-colors"
        >
          <FaArrowLeft className="mr-1" /> Back to Users
        </button>

        <div className="flex justify-between items-center mb-6 pb-4 border-b border-[var(--color-border-primary)]">
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Create New User</h2>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">Fill in the details to create a new user account</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[var(--color-error-light)] border-l-4 border-[var(--color-error)] text-[var(--color-error-dark)] rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 border-1.5 border-[var(--color-border-primary)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 border-1.5 border-[var(--color-border-primary)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
                placeholder="Enter email"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 border-1.5 border-[var(--color-border-primary)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
                placeholder="Enter first name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 border-1.5 border-[var(--color-border-primary)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
                placeholder="Enter last name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 border-1.5 border-[var(--color-border-primary)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
                placeholder="Enter password"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border-1.5 border-[var(--color-border-primary)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 border-1.5 border-[var(--color-border-primary)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
              >
                <option value="user">User</option>
                <option value="hr">HR</option>
                <option value="spa_manager">SPA Manager</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
          </div>

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

          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-[var(--color-border-primary)]">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-[var(--color-text-inverse)] py-3 px-6 rounded-lg hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary-dark)] disabled:opacity-50 font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Create User
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/users')}
              className="px-6 py-3 border border-[var(--color-border-primary)] rounded-lg hover:bg-[var(--color-gray-50)] font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserPage;

