import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { authApi } from '../api/Auth/authApi';
import Header from './Header';
import Footer from './Footer';
import HrSidebar from '../pages/hr/Layouts/Sidebbar';

/**
 * HR Layout Component
 * Provides layout structure with Sidebar, Header and Footer for HR pages
 */
const HrLayout = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await authApi.getCurrentUser();
      setUser(response.data);
    } catch (err) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  // Only show sidebar on HR routes
  const isHrRoute = location.pathname.startsWith('/hr');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header user={user} onLogout={handleLogout} />

      {/* Main Content Area with Sidebar */}
      <div className="flex flex-grow">
        {/* Sidebar - Only show on HR routes */}
        {isHrRoute && (
          <>
            {/* Mobile Sidebar Toggle Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden fixed top-20 left-4 z-50 bg-gray-900 text-white p-2 rounded-md"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {sidebarOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>

            {/* Sidebar */}
            <div
              className={`${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              } fixed lg:static lg:translate-x-0 top-16 bottom-0 left-0 z-40 w-64 transition-transform duration-300 ease-in-out lg:transition-none`}
            >
              <HrSidebar />
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
              <div
                className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                onClick={() => setSidebarOpen(false)}
              />
            )}
          </>
        )}

        {/* Main Content */}
        <main className={`flex-grow ${isHrRoute ? 'lg:ml-0' : ''}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default HrLayout;

