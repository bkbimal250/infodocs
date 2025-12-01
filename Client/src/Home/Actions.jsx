import { Link } from 'react-router-dom';
import { 
  HiOutlineDocumentText, 
  HiOutlineClipboardList, 
  HiOutlineBriefcase,
  HiOutlineUser,
  HiOutlineChartBar
} from 'react-icons/hi';

/**
 * Actions Component
 * Action buttons for candidate form submission, certificate generation, and hiring forms
 * Shows different options based on user authentication and role
 */
const Actions = ({ user = null }) => {
  const isAuthenticated = !!user;

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {isAuthenticated ? `Welcome, ${user.first_name}!` : 'What You Can Do'}
          </h2>
          <p className="text-lg text-gray-600">
            {isAuthenticated 
              ? 'Choose an action to get started' 
              : 'Choose an action to get started'}
          </p>
        </div>

        {/* Main Action Buttons - Disabled if not logged in */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          {/* Submit Candidate Form */}
          {isAuthenticated ? (
            <Link
              to="/candidate-form"
              className="group relative bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-green-500 cursor-pointer"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-green-100 rounded-full p-4 w-16 h-16 mb-4 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <HiOutlineClipboardList className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Submit Candidate Form
                </h3>
                <p className="text-gray-600 mb-6 text-sm">
                  Submit your application with all required documents
                </p>
                <div className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors text-center">
                  Get Started
                </div>
              </div>
            </Link>
          ) : (
            <div className="relative bg-white rounded-xl shadow-lg p-8 border-t-4 border-green-500 opacity-60 cursor-not-allowed">
              <div className="flex flex-col items-center text-center">
                <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mb-4 flex items-center justify-center">
                  <HiOutlineClipboardList className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-500 mb-2">
                  Submit Candidate Form
                </h3>
                <p className="text-gray-500 mb-6 text-sm">
                  Submit your application with all required documents
                </p>
                <div className="w-full bg-gray-400 text-white py-3 px-6 rounded-lg font-semibold text-center">
                  Login Required
                </div>
                <Link
                  to="/login"
                  className="mt-3 text-sm text-blue-600 hover:text-blue-700 underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Login to continue
                </Link>
              </div>
            </div>
          )}

          {/* Generate Certificate */}
          {isAuthenticated ? (
            <Link
              to="/certificate-creation"
              className="group relative bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-blue-500 cursor-pointer"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mb-4 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <HiOutlineDocumentText className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Generate Certificate
                </h3>
                <p className="text-gray-600 mb-6 text-sm">
                  Create professional certificates instantly
                </p>
                <div className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center">
                  Create Now
                </div>
              </div>
            </Link>
          ) : (
            <div className="relative bg-white rounded-xl shadow-lg p-8 border-t-4 border-blue-500 opacity-60 cursor-not-allowed">
              <div className="flex flex-col items-center text-center">
                <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mb-4 flex items-center justify-center">
                  <HiOutlineDocumentText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-500 mb-2">
                  Generate Certificate
                </h3>
                <p className="text-gray-500 mb-6 text-sm">
                  Create professional certificates instantly
                </p>
                <div className="w-full bg-gray-400 text-white py-3 px-6 rounded-lg font-semibold text-center">
                  Login Required
                </div>
                <Link
                  to="/login"
                  className="mt-3 text-sm text-blue-600 hover:text-blue-700 underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Login to continue
                </Link>
              </div>
            </div>
          )}

          {/* Send Hiring Form */}
          {isAuthenticated ? (
            <Link
              to="/hiring-forms"
              className="group relative bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-purple-500 cursor-pointer"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mb-4 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <HiOutlineBriefcase className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Send Hiring Form
                </h3>
                <p className="text-gray-600 mb-6 text-sm">
                  Submit your hiring requirements
                </p>
                <div className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-center">
                  Submit Form
                </div>
              </div>
            </Link>
          ) : (
            <div className="relative bg-white rounded-xl shadow-lg p-8 border-t-4 border-purple-500 opacity-60 cursor-not-allowed">
              <div className="flex flex-col items-center text-center">
                <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mb-4 flex items-center justify-center">
                  <HiOutlineBriefcase className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-500 mb-2">
                  Send Hiring Form
                </h3>
                <p className="text-gray-500 mb-6 text-sm">
                  Submit your hiring requirements
                </p>
                <div className="w-full bg-gray-400 text-white py-3 px-6 rounded-lg font-semibold text-center">
                  Login Required
                </div>
                <Link
                  to="/login"
                  className="mt-3 text-sm text-blue-600 hover:text-blue-700 underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Login to continue
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Additional Options for Authenticated Users */}
        {isAuthenticated && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            <Link
              to="/user/dashboard"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center"
            >
              <HiOutlineChartBar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">My Dashboard</p>
            </Link>
            <Link
              to="/user/certificates"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center"
            >
              <HiOutlineDocumentText className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">My Certificates</p>
            </Link>
            <Link
              to="/user/forms"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center"
            >
              <HiOutlineClipboardList className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">My Forms</p>
            </Link>
            <Link
              to="/user/profile"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center"
            >
              <HiOutlineUser className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">My Profile</p>
            </Link>
          </div>
        )}

        {/* Role-based Quick Links */}
        {isAuthenticated && (user.role === 'admin' || user.role === 'super_admin') && (
          <div className="mt-12 text-center">
            <Link
              to="/admin/dashboard"
              className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Go to Admin Dashboard
            </Link>
          </div>
        )}

        {isAuthenticated && user.role === 'spa_manager' && (
          <div className="mt-12 text-center">
            <Link
              to="/manager/dashboard"
              className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Go to Manager Dashboard
            </Link>
          </div>
        )}

        {isAuthenticated && user.role === 'hr' && (
          <div className="mt-12 text-center">
            <Link
              to="/hr/dashboard"
              className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Go to HR Dashboard
            </Link>
          </div>
        )}

        {/* Proprietor Information */}
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            <span className="font-semibold">Proprietor:</span> Diisha Online Solution
          </p>
        </div>
      </div>
    </section>
  );
};

export default Actions;
