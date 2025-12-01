import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

/**
 * Header Component
 * Main navigation header with public and authenticated user navigation
 */
const Header = ({ user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/login');
  };

  // Public navigation links
  const publicNavLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
  ];

  // Get role-based navigation links
  const getRoleNavLinks = () => {
    if (!user) return [];
    
    if (user.role === 'admin' || user.role === 'super_admin') {
      return [
        { path: '/admin/dashboard', label: 'Dashboard' },
        { path: '/admin/templates', label: 'Templates' },
        { path: '/admin/certificates', label: 'Certificates' },
        { path: '/admin/users', label: 'Users' },
      ];
    }
    
    if (user.role === 'spa_manager') {
      return [
        { path: '/manager/dashboard', label: 'Dashboard' },
        { path: '/manager/certificates', label: 'Certificates' },
        { path: '/manager/candidates', label: 'Candidates' },
      ];
    }
    
    if (user.role === 'hr') {
      return [
        { path: '/hr/dashboard', label: 'Dashboard' },
        { path: '/hr/candidates', label: 'Candidates' },
        { path: '/hr/hiring-data', label: 'Hiring Data' },
      ];
    }
    
    if (user.role === 'user') {
      return [
        { path: '/user/dashboard', label: 'Dashboard' },
        { path: '/user/certificates', label: 'My Certificates' },
        { path: '/user/forms', label: 'My Forms' },
      ];
    }
    
    return [];
  };

  const roleNavLinks = getRoleNavLinks();

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">infodocs</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1 items-center">
            {user ? (
              // Authenticated user navigation - show role-based links
              <>
                {/* Role-based navigation */}
                {roleNavLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActive(link.path)
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to={user.role === 'user' ? '/user/profile' : '/profile'}
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                >
                  {user.first_name} {user.last_name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium ml-2"
                >
                  Logout
                </button>
              </>
            ) : (
              // Public navigation - only Home, About, Login, Register
              <>
                {publicNavLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActive(link.path)
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium ml-2"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium ml-2"
                >
                  Register
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <nav className="flex flex-col space-y-1">
              {user ? (
                // Authenticated mobile menu
                <>
                  {/* Role-based navigation */}
                  {roleNavLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`px-4 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                        isActive(link.path)
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link
                    to={user.role === 'user' ? '/user/profile' : '/profile'}
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Profile: {user.first_name} {user.last_name}
                  </Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="px-4 py-2 rounded-md text-base font-medium text-white bg-red-600 hover:bg-red-700 text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                // Public mobile menu - only Home, About, Login, Register
                <>
                  {publicNavLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`px-4 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                        isActive(link.path)
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

