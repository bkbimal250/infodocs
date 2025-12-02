import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/Auth/authApi';

const backgroundImage = '/bgimages/background.jpg';

const CreateNewpassord = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const stateEmail = location.state?.email;
    const stateOtp = location.state?.otp;
    const storedEmail = sessionStorage.getItem('reset_email');
    const storedOtp = sessionStorage.getItem('reset_otp');

    if (stateEmail) {
      setEmail(stateEmail);
    } else if (storedEmail) {
      setEmail(storedEmail);
    }

    if (stateOtp) {
      setOtp(stateOtp);
    } else if (storedOtp) {
      setOtp(storedOtp);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await authApi.resetPassword({
        email,
        otp,
        new_password: newPassword,
      });
      setSuccess('Password reset successful. Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        'Failed to reset password. Please check the code and try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[var(--color-bg-secondary)] flex items-center justify-center py-8 px-4"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="w-full max-w-md">
        <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-sm border border-[var(--color-border-primary)] p-6">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2 text-center">
            Create New Password
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6 text-center">
            Enter your new password below.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-[var(--color-error-light)] border border-[var(--color-error-light)] rounded text-sm text-[var(--color-error-dark)]">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-[var(--color-success-light)] border border-[var(--color-success-light)] rounded text-sm text-[var(--color-success-dark)]">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                Email address
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-2.5 border border-[var(--color-border-primary)] rounded-md bg-[var(--color-gray-50)] text-[var(--color-text-secondary)] cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                New password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="New password"
                required
                minLength={6}
                className="w-full px-4 py-2.5 border border-[var(--color-border-primary)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                Confirm new password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Confirm new password"
                required
                minLength={6}
                className="w-full px-4 py-2.5 border border-[var(--color-border-primary)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  // Go back to OTP step, preserving state
                  navigate('/verify-otp', { state: { email, otp } });
                }}
                className="w-1/3 bg-[var(--color-gray-100)] text-[var(--color-text-primary)] py-2.5 px-4 rounded-md font-semibold hover:bg-[var(--color-gray-200)] transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 bg-[var(--color-primary)] text-[var(--color-text-inverse)] py-2.5 px-4 rounded-md font-semibold hover:bg-[var(--color-primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Saving...' : 'Save new password'}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-[var(--color-border-primary)] text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Remember your password?{' '}
              <Link to="/login" className="text-[var(--color-primary)] hover:underline font-medium">
                Back to login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNewpassord;


