import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api/Auth/authApi';


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

      // Backend now sets the 'access_token' cookie and returns a minimal message
      if (response.data.message === 'Login successful') {
        // Since the login response is minimal for security, fetch user profile separately
        try {
          const userResponse = await authApi.getCurrentUser();
          const user = userResponse.data;

          if (user) {
            // Store non-sensitive UI preferences in localStorage
            localStorage.setItem('user', JSON.stringify({
              role: user.role,
              username: user.first_name,
            }));
            
            const dashboardPath = getDashboardPath(user.role);
            navigate(dashboardPath, { replace: true });
          } else {
            setError('Could not retrieve user profile. Please try logging in again.');
          }
        } catch (profileErr) {
          console.error('Error fetching profile after login:', profileErr);
          setError('Verification failed. Please refresh and try again.');
        }
      } else {
        setError('Login failed. Please check your credentials.');
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
    <div className="min-h-screen bg-background flex flex-col sm:items-center sm:justify-center">
      <div className="w-full sm:max-w-[440px]">
        {/* Login Card */}
        <div className="bg-card min-h-[100dvh] sm:min-h-0 sm:rounded-[2rem] sm:shadow-card sm:border border-border/50 p-8 sm:p-10 flex flex-col justify-center transition-all duration-300">

          <div className="mb-8 text-center sm:text-left">
            <h1 className="text-3xl font-black text-text-primary tracking-tight mb-2">Welcome Back</h1>
            <p className="text-sm font-medium text-text-secondary tracking-tight">Login to your workspace to continue.</p>
          </div>

          {error && (
            <div className="alert alert-danger mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
              {error}
            </div>
          )}

          {/* Login Method Toggle */}
          <div className="flex gap-4 mb-8 border-b border-border/50 pb-2">
            <button
              onClick={() => {
                setLoginMethod('password');
                setOtpSent(false);
                setError(null);
                setFormData({ ...formData, otp: '' });
              }}
              className={`pb-2 text-sm font-black uppercase tracking-widest transition-all ${loginMethod === 'password'
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-muted hover:text-text-secondary'
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
              className={`pb-2 text-sm font-black uppercase tracking-widest transition-all ${loginMethod === 'otp'
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-muted hover:text-text-secondary'
                }`}
            >
              OTP Login
            </button>
          </div>

          {loginMethod === 'password' ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Identity</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Username or Email"
                  required
                  className="input"
                />
              </div>
              <div className="space-y-1 relative">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Pass-key</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                  className="input pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[34px] text-text-muted hover:text-primary transition-colors text-[10px] font-black uppercase"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full py-4 text-[11px] shadow-xl shadow-primary/20"
              >
                {loading ? 'Authenticating...' : 'Sign In Now'}
              </button>
            </form>
          ) : (
            <form onSubmit={otpSent ? handleLogin : handleRequestOTP} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                  disabled={otpSent}
                  className="input disabled:opacity-60"
                />
              </div>
              {otpSent && (
                <div className="space-y-1 animate-in zoom-in-95 duration-300">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 text-center block w-full">Verification Code</label>
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleInputChange}
                    placeholder="000000"
                    required
                    maxLength={6}
                    className="input text-center text-xl tracking-[0.5em] font-black py-4"
                  />
                  <p className="mt-2 text-[10px] font-bold text-text-secondary text-center">
                    Code sent to <span className="text-primary">{formData.email}</span>
                  </p>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full py-4 text-[11px] shadow-xl shadow-primary/20"
              >
                {loading ? 'Processing...' : otpSent ? 'Verify & Access' : 'Request Secure OTP'}
              </button>
              {otpSent && (
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setFormData({ ...formData, otp: '' });
                  }}
                  className="w-full text-[10px] font-black text-text-muted hover:text-primary uppercase tracking-widest transition-colors py-2"
                >
                  Change Email Alias
                </button>
              )}
            </form>
          )}

          {/* Links */}
          <div className="mt-10 pt-8 border-t border-border/50 flex flex-col gap-4 text-center">
            <Link to="/forgot-password" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
              Reset Pass-key
            </Link>
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">
              No account?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Register Platform
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
