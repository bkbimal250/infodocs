import { useState, useEffect } from 'react';
import { authApi } from '../../api/Auth/authApi';
import { usersApi } from '../../api/Users/usersApi';

/**
 * User Profile Page
 * View and edit user profile
 */
const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await authApi.getCurrentUser();
      setUser(response.data);
      setFormData({
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        email: response.data.email || '',
        phone_number: response.data.phone_number || '',
      });
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Update profile using usersApi
      await usersApi.updateProfile(user.id, formData);
      setSuccess('Profile updated successfully!');
      loadProfile();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-secondary)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto"></div>
          <p className="mt-4 text-[var(--color-text-secondary)]">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-8">My Profile</h1>

        {error && (
          <div className="mb-4 p-4 bg-[var(--color-error-light)] border border-[var(--color-error-light)] text-[var(--color-error-dark)] rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-[var(--color-success-light)] border border-[var(--color-success-light)] text-[var(--color-success-dark)] rounded">
            {success}
          </div>
        )}

        <div className="bg-[var(--color-bg-primary)] rounded-lg shadow p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                  {user?.first_name} {user?.last_name}
                </h2>
                <p className="text-[var(--color-text-secondary)]">@{user?.username}</p>
              </div>
              <span
                className={`px-3 py-1 text-sm rounded-full ${
                  user?.role === 'admin'
                    ? 'bg-[var(--color-error-light)] text-[var(--color-error-dark)]'
                    : user?.role === 'manager'
                    ? 'bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]'
                    : user?.role === 'hr'
                    ? 'bg-[var(--color-secondary-light)] text-[var(--color-secondary-dark)]'
                    : 'bg-[var(--color-success-light)] text-[var(--color-success-dark)]'
                }`}
              >
                {user?.role}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-[var(--color-border-primary)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-[var(--color-border-primary)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--color-primary)] text-[var(--color-text-inverse)] py-2 px-4 rounded-lg hover:bg-[var(--color-primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;

