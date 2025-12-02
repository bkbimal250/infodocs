import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const backgroundImage = '/bgimages/background.jpg';

const VerityOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const stateEmail = location.state?.email;
    const storedEmail = sessionStorage.getItem('reset_email');
    const storedOtp = sessionStorage.getItem('reset_otp');

    if (stateEmail) {
      setEmail(stateEmail);
    } else if (storedEmail) {
      setEmail(storedEmail);
    }

    if (storedOtp) {
      setOtp(storedOtp);
    }
  }, [location.state]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (!otp || otp.length < 4) {
      setError('Please enter the OTP code from your email');
      return;
    }

    // Persist OTP so it survives navigation / back
    sessionStorage.setItem('reset_otp', otp);
    // Step 2: only verify format here and move to step 3 with email + otp
    navigate('/create-new-password', { state: { email, otp } });
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
            Verify Code
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6 text-center">
            Enter the verification code (OTP) sent to your email.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-[var(--color-error-light)] border border-[var(--color-error-light)] rounded text-sm text-[var(--color-error-dark)]">
              {error}
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
                Verification code (OTP)
              </label>
              <input
                type="text"
                name="otp"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value;
                  setOtp(value);
                  sessionStorage.setItem('reset_otp', value);
                  if (error) setError(null);
                }}
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
                className="w-full px-4 py-2.5 border border-[var(--color-border-primary)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] text-center tracking-widest"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[var(--color-primary)] text-[var(--color-text-inverse)] py-2.5 px-4 rounded-md font-semibold hover:bg-[var(--color-primary-dark)] transition-colors"
            >
              Continue
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[var(--color-border-primary)] text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Wrong email?{' '}
              <Link to="/forgot-password" className="text-[var(--color-primary)] hover:underline font-medium">
                Go back
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerityOtp;


