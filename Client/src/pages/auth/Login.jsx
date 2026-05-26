import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/Auth/authApi';

const Login = () => {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState('phone');
  const [formData, setFormData] = useState({
    phone_number: '',
    email: '',
    usernameOrEmail: '',
    password: '',
    otp: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [otpSent, setOtpSent] = useState(false);

  const cleanOtp = (value) => String(value || '').replace(/\D/g, '').slice(0, 6);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'otp' ? cleanOtp(value) : value,
    }));
    if (error) setError(null);
  };

  const switchMethod = (method) => {
    setLoginMethod(method);
    setOtpSent(false);
    setError(null);
    setFormData((prev) => ({ ...prev, otp: '', password: '' }));
  };

  const getActiveIdentifier = () => {
    return loginMethod === 'phone' ? formData.phone_number.trim() : formData.email.trim();
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

  const finishLogin = async (response, failureMessage = 'Login failed. Please try again.') => {
    if (response.data.message !== 'Login successful') {
      setError(failureMessage);
      return;
    }

    try {
      const userResponse = await authApi.getCurrentUser();
      const user = userResponse.data;

      if (!user) {
        setError('Could not retrieve user profile. Please try logging in again.');
        return;
      }

      localStorage.setItem(
        'user',
        JSON.stringify({
          role: user.role,
          username: user.first_name,
        })
      );

      navigate(getDashboardPath(user.role), { replace: true });
    } catch (profileErr) {
      console.error('Error fetching profile after login:', profileErr);
      setError('Verification failed. Please refresh and try again.');
    }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const identifier = formData.usernameOrEmail.trim();
    const password = formData.password;

    if (!identifier) {
      setError('Please enter your email or username');
      setLoading(false);
      return;
    }

    if (!password) {
      setError('Please enter your password');
      setLoading(false);
      return;
    }

    try {
      const response = identifier.includes('@')
        ? await authApi.loginWithEmail({ email: identifier, password })
        : await authApi.login({ username: identifier, password });

      await finishLogin(response, 'Login failed. Please check your email or username and password.');
    } catch (err) {
      setError(getErrorMessage(err, 'Login failed. Please check your email or username and password.'));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (err, fallback) => {
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
      return 'Unable to connect to server. Please check your connection.';
    }
    return err.response?.data?.detail || err.response?.data?.error || err.message || fallback;
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const identifier = getActiveIdentifier();
    if (!identifier) {
      setError(loginMethod === 'phone' ? 'Please enter your phone number' : 'Please enter your email address');
      setLoading(false);
      return;
    }

    try {
      if (loginMethod === 'phone') {
        await authApi.requestPhoneLoginOTP({ phone_number: identifier });
      } else {
        await authApi.requestLoginOTP({ email: identifier });
      }
      setOtpSent(true);
      setFormData((prev) => ({ ...prev, otp: '' }));
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to send OTP'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const otp = cleanOtp(formData.otp);

    if (!otp) {
      setError('Please enter the OTP');
      setLoading(false);
      return;
    }

    if (otp.length !== 6) {
      setError('Please enter the 6 digit OTP');
      setLoading(false);
      return;
    }

    try {
      const identifier = getActiveIdentifier();
      const response =
        loginMethod === 'phone'
          ? await authApi.loginWithPhoneOTP({
              phone_number: identifier,
              otp,
            })
          : await authApi.loginWithOTP({
              email: identifier,
              otp,
            });

      await finishLogin(response, 'Login failed. Please check the OTP and try again.');
    } catch (err) {
      setError(getErrorMessage(err, 'Login failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const activeLabel = loginMethod === 'phone' ? 'Phone Number' : 'Email Address';
  const activeName = loginMethod === 'phone' ? 'phone_number' : 'email';
  const activeValue = loginMethod === 'phone' ? formData.phone_number : formData.email;
  const activeType = loginMethod === 'phone' ? 'tel' : 'email';
  const activePlaceholder = loginMethod === 'phone' ? 'Enter phone number' : 'Enter email address';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-900">Welcome Back</h1>
            <p className="text-slate-500 mt-2 text-sm">Sign in securely to continue</p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => switchMethod('phone')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                loginMethod === 'phone' ? 'bg-white shadow text-slate-900' : 'text-slate-500'
              }`}
            >
              Phone OTP
            </button>

            <button
              type="button"
              onClick={() => switchMethod('email')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                loginMethod === 'email' ? 'bg-white shadow text-slate-900' : 'text-slate-500'
              }`}
            >
              Email OTP
            </button>

            <button
              type="button"
              onClick={() => switchMethod('password')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                loginMethod === 'password' ? 'bg-white shadow text-slate-900' : 'text-slate-500'
              }`}
            >
              Password
            </button>
          </div>

          <form
            onSubmit={loginMethod === 'password' ? handlePasswordLogin : otpSent ? handleLogin : handleRequestOTP}
            className="space-y-5"
          >
            {loginMethod === 'password' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email or Username</label>

                  <input
                    type="text"
                    name="usernameOrEmail"
                    value={formData.usernameOrEmail}
                    onChange={handleInputChange}
                    placeholder="Enter email or username"
                    required
                    autoComplete="username"
                    className="w-full h-12 px-4 rounded-xl border border-slate-300 focus:border-black focus:ring-0 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>

                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter password"
                    required
                    autoComplete="current-password"
                    className="w-full h-12 px-4 rounded-xl border border-slate-300 focus:border-black focus:ring-0 outline-none transition-all"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{activeLabel}</label>

                  <input
                    type={activeType}
                    name={activeName}
                    value={activeValue}
                    onChange={handleInputChange}
                    placeholder={activePlaceholder}
                    required
                    disabled={otpSent}
                    autoComplete={loginMethod === 'phone' ? 'tel' : 'email'}
                    className="w-full h-12 px-4 rounded-xl border border-slate-300 focus:border-black focus:ring-0 outline-none transition-all disabled:bg-slate-100"
                  />
                </div>

                {otpSent && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">OTP Code</label>

                    <input
                      type="text"
                      name="otp"
                      value={formData.otp}
                      onChange={handleInputChange}
                      placeholder="000000"
                      required
                      maxLength={8}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      className="w-full h-12 px-4 rounded-xl border border-slate-300 text-center tracking-[8px] text-lg font-semibold focus:border-black focus:ring-0 outline-none transition-all"
                    />

                    <p className="text-xs text-slate-500 mt-2">
                      OTP sent to {getActiveIdentifier()}
                    </p>
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-black text-white font-medium hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? 'Processing...' : loginMethod === 'password' ? 'Login' : otpSent ? 'Verify OTP' : 'Send OTP'}
            </button>

            {loginMethod !== 'password' && otpSent && (
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setFormData((prev) => ({ ...prev, otp: '' }));
                }}
                className="w-full text-sm text-slate-500 hover:text-black transition-all"
              >
                Change {loginMethod === 'phone' ? 'Phone Number' : 'Email'}
              </button>
            )}
          </form>

          <div className="mt-7 text-center">
            <Link
              to="/forgot-password"
              className="text-xs text-slate-400 hover:text-slate-700 transition-all"
            >
              Forgot password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
