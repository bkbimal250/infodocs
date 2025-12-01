import { Link } from 'react-router-dom';
import { HiOutlineShieldCheck } from 'react-icons/hi';

/**
 * Hero Section Component
 * Main banner/hero section for the home page
 * Shows different content based on authentication status
 */
const HeroSection = ({ user = null }) => {
  const isAuthenticated = !!user;

  return (
    <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24 relative z-10">
        <div className="text-center">
          {isAuthenticated ? (
            <>
              <div className="flex items-center justify-center mb-4">
                <HiOutlineShieldCheck className="w-8 h-8 mr-2" />
                <span className="text-lg font-medium">Welcome back!</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Hello, {user.first_name}!
              </h1>
              <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-3xl mx-auto leading-relaxed">
                Manage your documents, certificates, and applications all in one place.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
                Professional Document Management
              </h1>
              <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-3xl mx-auto leading-relaxed">
                Streamline your certificate generation, candidate management, and document workflows with our comprehensive platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link
                  to="/login"
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 text-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-800 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-900 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 text-lg border-2 border-white/30"
                >
                  Get Started
                </Link>
              </div>
            </>
          )}
          
          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="text-4xl font-bold mb-3 text-white">100%</div>
              <div className="text-lg font-semibold mb-2 text-white">Secure & Reliable</div>
              <div className="text-blue-100 text-sm">Enterprise-grade security for all your documents</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="text-4xl font-bold mb-3 text-white">Fast</div>
              <div className="text-lg font-semibold mb-2 text-white">Instant Processing</div>
              <div className="text-blue-100 text-sm">Generate certificates and process forms in seconds</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="text-4xl font-bold mb-3 text-white">Easy</div>
              <div className="text-lg font-semibold mb-2 text-white">User-Friendly</div>
              <div className="text-blue-100 text-sm">Intuitive interface designed for efficiency</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
