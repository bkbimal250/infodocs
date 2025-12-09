import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/Auth/authApi';

const backgroundImage = '/bgimages/background.jpg';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState(
    () => sessionStorage.getItem('reset_email') || ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      await authApi.requestPasswordReset({ email });
      setSuccess('If an account with that email exists, a reset code has been sent.');
      // Persist email for later steps
      sessionStorage.setItem('reset_email', email);
      sessionStorage.removeItem('reset_otp');
      // Go to step 2: verify OTP, pass email in route state
      navigate('/verify-otp', { state: { email } });
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        'Failed to send reset code. Please try again.';
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
            Forgot Password
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6 text-center">
            Enter your email address and we will send you a verification code.
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
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                  if (success) setSuccess(null);
                }}
                placeholder="youremail@gmail.com"
                required
                className="w-full px-4 py-2.5 border border-[var(--color-border-primary)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--color-primary)] text-[var(--color-text-inverse)] py-2.5 px-4 rounded-md font-semibold hover:bg-[var(--color-primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Sending code...' : 'Send reset code'}
            </button>
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

export default ForgotPassword;
