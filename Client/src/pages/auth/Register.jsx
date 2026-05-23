import { Link } from 'react-router-dom';

/**
 * Register Page
 * Registration is temporarily disabled. Use provided credentials to login.
 */
const backgroundImage = '/bgimages/background.jpg';
const Register = () => {
  return (
    <div
      className="min-h-screen bg-[var(--color-bg-secondary)] flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md">
        <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-sm border border-[var(--color-border-primary)] p-8 text-center">
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-4">
            Registration Disabled
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">
            New user registration is temporarily disabled. Please use the credentials provided to you for login.
          </p>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">
            If you need access, contact your administrator or support team.
          </p>
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-[var(--color-primary)] text-[var(--color-text-inverse)] rounded-md font-semibold hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
