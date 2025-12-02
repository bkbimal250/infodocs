import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api/Auth/authApi';

/**
 * Login Page
 * Simple, clean Facebook-style login page
 */
const backgroundImage = '/bgimages/background.jpg';
const Login = () => {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState('password');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    otp: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError(null);
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    try {
      await authApi.requestLoginOTP({ email: formData.email });
      setOtpSent(true);
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Failed to send OTP email';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getDashboardPath = (role) => {
    switch (role) {
      case 'super_admin':
      case 'admin':
        return '/admin/dashboard';
      case 'spa_manager':
        return '/manager/dashboard';
      case 'hr':
        return '/hr/dashboard';
      case 'user':
        return '/user/dashboard';
      default:
        return '/';
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let response;
      if (loginMethod === 'password') {
        const isEmail = formData.username.includes('@');
        if (isEmail) {
          response = await authApi.loginWithEmail({
            email: formData.username,
            password: formData.password,
          });
        } else {
          response = await authApi.login({
            username: formData.username || formData.email,
            password: formData.password,
          });
        }
      } else {
        response = await authApi.loginWithOTP({
          email: formData.email,
          otp: formData.otp,
        });
      }

      if (response.data.access_token) {
        localStorage.setItem('authToken', response.data.access_token);
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        const user = response.data.user;
        const dashboardPath = getDashboardPath(user.role);
        navigate(dashboardPath, { replace: true });
      }
    } catch (err) {
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        errorMessage = 'Request timed out. Please ensure the backend server is running.';
      } else if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        errorMessage = 'Unable to connect to server. Please check if the backend is running.';
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] flex items-center justify-center py-8 px-4"
    
    style={{
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <div className="w-full max-w-md">


        {/* Login Card */}
        <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-sm border border-[var(--color-border-primary)] p-6">
          {error && (
            <div className="mb-4 p-3 bg-[var(--color-error-light)] border border-[var(--color-error-light)] rounded text-sm text-[var(--color-error-dark)]">
              {error}
            </div>
          )}

          {/* Login Method Toggle */}
          <div className="flex gap-2 mb-4 border-b border-[var(--color-border-primary)] pb-4">
            <button
              onClick={() => {
                setLoginMethod('password');
                setOtpSent(false);
                setError(null);
                setFormData({ ...formData, otp: '' });
              }}
              className={`flex-1 py-2 text-sm font-medium ${
                loginMethod === 'password'
                  ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              Password
            </button>
            <button
              onClick={() => {
                setLoginMethod('otp');
                setOtpSent(false);
                setError(null);
                setFormData({ ...formData, otp: '' });
              }}
              className={`flex-1 py-2 text-sm font-medium ${
                loginMethod === 'otp'
                  ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              OTP
            </button>
          </div>

          {loginMethod === 'password' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Username or email"
                  required
                  className="w-full px-4 py-2.5 border border-[var(--color-border-primary)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                />
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-secondary)] text-sm"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--color-primary)] text-[var(--color-text-inverse)] py-2.5 px-4 rounded-md font-semibold hover:bg-[var(--color-primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Signing in...' : 'Log In'}
              </button>
            </form>
          ) : (
            <form onSubmit={otpSent ? handleLogin : handleRequestOTP} className="space-y-4">
              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email address"
                  required
                  disabled={otpSent}
                  className="w-full px-4 py-2.5 border border-[var(--color-border-primary)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] disabled:bg-[var(--color-gray-50)]"
                />
              </div>
              {otpSent && (
                <div>
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleInputChange}
                    placeholder="Enter OTP"
                    required
                    maxLength={6}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-widest"
                  />
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)] text-center">
                    OTP sent to {formData.email}
                  </p>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--color-primary)] text-[var(--color-text-inverse)] py-2.5 px-4 rounded-md font-semibold hover:bg-[var(--color-primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Processing...' : otpSent ? 'Verify & Sign In' : 'Send OTP'}
              </button>
              {otpSent && (
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setFormData({ ...formData, otp: '' });
                  }}
                  className="w-full text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] py-2"
                >
                  Use different email
                </button>
              )}
            </form>
          )}

          {/* Links */}
          <div className="mt-6 pt-6 border-t border-[var(--color-border-primary)] text-center space-y-2">
            <p className="text-sm text-[var(--color-text-secondary)]">
              <Link to="/forgot-password" className="text-[var(--color-primary)] hover:underline font-medium">
                Forgot password?
              </Link>
            </p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Don't have an account?{' '}
              <Link to="/register" className="text-[var(--color-primary)] hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
