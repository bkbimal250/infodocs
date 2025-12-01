import { Link } from 'react-router-dom';
import { 
  HiOutlineDocumentText, 
  HiOutlineUserGroup,
  HiOutlineShieldCheck,
  HiOutlineChartBar
} from 'react-icons/hi';

/**
 * About Page
 * Simple page describing the project
 */
export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">About infodocs</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A comprehensive document management platform designed for SPA and wellness centers
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Project Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Project Overview</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>infodocs</strong> is a modern, web-based document management system specifically built for 
            SPA and wellness centers. Our platform streamlines certificate generation, candidate management, 
            hiring processes, and document workflows, making it easier for organizations to manage their 
            operations efficiently.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Whether you're an administrator managing multiple locations, an HR professional handling 
            recruitment, a manager overseeing daily operations, or a user submitting forms and certificates, 
            infodocs provides the tools you need to work seamlessly.
          </p>
        </div>

        {/* Key Features */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 rounded-lg p-3">
                <HiOutlineDocumentText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Certificate Management</h3>
                <p className="text-gray-600 text-sm">
                  Generate professional certificates with customizable templates for various purposes including 
                  appointment letters, experience certificates, salary certificates, and more.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-green-100 rounded-lg p-3">
                <HiOutlineUserGroup className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Candidate & Hiring Forms</h3>
                <p className="text-gray-600 text-sm">
                  Streamlined form submission system for candidates and hiring requirements. Track applications 
                  and manage recruitment processes efficiently.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-purple-100 rounded-lg p-3">
                <HiOutlineShieldCheck className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Role-Based Access Control</h3>
                <p className="text-gray-600 text-sm">
                  Secure access management with different permission levels for administrators, HR managers, 
                  SPA managers, and regular users.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-orange-100 rounded-lg p-3">
                <HiOutlineChartBar className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Analytics & Dashboards</h3>
                <p className="text-gray-600 text-sm">
                  Comprehensive dashboards and analytics to track operations, view statistics, and gain insights 
                  into your organization's performance.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Technology Stack</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Frontend</h3>
              <ul className="text-gray-600 text-sm space-y-1">
                <li>• React.js</li>
                <li>• Tailwind CSS</li>
                <li>• React Router</li>
                <li>• Axios for API calls</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Backend</h3>
              <ul className="text-gray-600 text-sm space-y-1">
                <li>• FastAPI (Python)</li>
                <li>• SQLAlchemy (ORM)</li>
                <li>• PostgreSQL Database</li>
                <li>• JWT Authentication</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact/CTA Section */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Get Started</h2>
          <p className="text-gray-700 mb-6">
            Ready to streamline your document management? Create an account and start using infodocs today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors"
            >
              Create Account
            </Link>
            <Link
              to="/login"
              className="bg-white text-blue-600 px-6 py-3 rounded-md font-semibold hover:bg-gray-50 border border-blue-600 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Proprietor: Diisha Online Solution</p>
        </div>
      </div>
    </div>
  );
}
