import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

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

  const publicNavLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
  ];

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
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo + Brand */}
          <Link to="/" className="flex items-center">
            <img
              className="h-12 w-auto object-contain"
              src="/infodocs.png"
              alt="Infodocs Logo"
            />
          </Link>


          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                {/* Role-based navigation */}
                <div className="flex items-center gap-1">
                  {roleNavLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`relative px-3 py-2 rounded-full text-sm font-medium transition-all duration-200
                        ${isActive(link.path)
                          ? 'text-blue-700 bg-blue-50 shadow-sm'
                          : 'text-gray-600 hover:text-blue-700 hover:bg-gray-50'
                        }`}
                    >
                      {link.label}
                      {isActive(link.path) && (
                        <span className="absolute inset-x-3 -bottom-[3px] h-[2px] rounded-full bg-blue-500" />
                      )}
                    </Link>
                  ))}
                </div>

                {/* User info + actions */}
                <div className="flex items-center gap-3 pl-4 ml-4 border-l border-gray-200">
                  <Link
                    to={user.role === 'user' ? '/user/profile' : '/profile'}
                    className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-blue-500 hover:text-blue-700 transition-colors"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600/10 text-[11px] font-semibold text-blue-700 uppercase">
                      {user.first_name?.[0]}
                      {user.last_name?.[0]}
                    </span>
                    <span className="flex flex-col leading-tight">
                      <span className="text-xs">
                        {user.first_name} {user.last_name}
                      </span>
                      <span className="text-[10px] text-gray-500 capitalize">
                        {user.role?.replace('_', ' ')}
                      </span>
                    </span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center rounded-full bg-red-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1">
                  {publicNavLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`relative px-3 py-2 rounded-full text-sm font-medium transition-all duration-200
                        ${isActive(link.path)
                          ? 'text-blue-700 bg-blue-50 shadow-sm'
                          : 'text-gray-600 hover:text-blue-700 hover:bg-gray-50'
                        }`}
                    >
                      {link.label}
                      {isActive(link.path) && (
                        <span className="absolute inset-x-3 -bottom-[3px] h-[2px] rounded-full bg-blue-500" />
                      )}
                    </Link>
                  ))}
                </div>

                <div className="flex items-center gap-3 pl-4 ml-4 border-l border-gray-200">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-gray-600 hover:text-blue-700"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                  >
                    Get Started
                  </Link>
                </div>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center rounded-lg border border-gray-200 p-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            aria-label="Toggle menu"
          >
            <svg
              className="h-5 w-5"
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
                <path d="M4 7h16M4 12h16M4 17h10" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <nav className="mt-2 rounded-2xl border border-gray-100 bg-white shadow-lg p-2 space-y-1">
              {user ? (
                <>
                  {roleNavLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${isActive(link.path)
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-blue-700'
                        }`}
                    >
                      {link.label}
                    </Link>
                  ))}

                  <Link
                    to={user.role === 'user' ? '/user/profile' : '/profile'}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-50"
                  >
                    <span>
                      {user.first_name} {user.last_name}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">
                      {user.role?.replace('_', ' ')}
                    </span>
                  </Link>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full mt-1 px-3 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  {publicNavLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${isActive(link.path)
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-blue-700'
                        }`}
                    >
                      {link.label}
                    </Link>
                  ))}

                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 text-center"
                  >
                    Get Started
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
