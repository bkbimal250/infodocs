import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/Auth/authApi';
import HeroSection from './Herosection';
import Features from './Features';
import Developer from './components/Developer';

/**
 * Home Page Component
 * Shows different content based on authentication status
 */
const Home = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await authApi.getCurrentUser();
      setUser(response.data);
      
      // Redirect to role-specific dashboard if logged in
      const role = response.data.role;
      if (role === 'admin' || role === 'super_admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (role === 'spa_manager') {
        navigate('/manager/dashboard', { replace: true });
      } else if (role === 'hr') {
        navigate('/hr/dashboard', { replace: true });
      } else if (role === 'user') {
        navigate('/user/dashboard', { replace: true });
      }
    } catch (err) {
      localStorage.removeItem('authToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is logged in, redirect to dashboard (handled in checkAuth)
  // This should not be reached, but keeping for safety
  if (user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeroSection user={user} />
      </div>
    );
  }

  // Public home page
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      <Features />
      <Developer />
    </div>
  );
};

export default Home;
