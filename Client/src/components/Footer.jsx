import { Link } from 'react-router-dom';
import { 
  HiOutlineMail, 
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineGlobe,
  HiOutlineDocumentText,
  HiOutlineUserGroup,
  HiOutlineShieldCheck,
  HiOutlineChartBar
} from 'react-icons/hi';

/**
 * Footer Component
 * Professional footer with comprehensive information and links
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/login', label: 'Login' },
    { path: '/register', label: 'Register' },
  ];

  const features = [
    { icon: HiOutlineDocumentText, label: 'Certificate Management' },
    { icon: HiOutlineUserGroup, label: 'Candidate Forms' },
    { icon: HiOutlineShieldCheck, label: 'Secure Platform' },
    { icon: HiOutlineChartBar, label: 'Analytics & Reports' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <h3 className="text-white text-xl font-bold mb-4">infodocs</h3>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              Professional document management platform for SPA and wellness centers. 
              Streamline your operations with our comprehensive solution.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <HiOutlineShieldCheck className="w-4 h-4" />
              <span>Secure & Reliable</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-base font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 bg-gray-600 rounded-full"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-white text-base font-semibold mb-4">Features</h4>
            <ul className="space-y-2">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-400">
                    <Icon className="w-4 h-4" />
                    <span>{feature.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-white text-base font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <HiOutlineMail className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-400">Email</p>
                  <a 
                    href="mailto:support@infodocs.com" 
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    support@infodocs.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <HiOutlinePhone className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-400">Phone</p>
                  <a 
                    href="tel:+1234567890" 
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    +1 (234) 567-8900
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <HiOutlineLocationMarker className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-400">Proprietor</p>
                  <p className="text-gray-300">Diisha Online Solution</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="text-sm text-gray-400 text-center md:text-left">
              <p>
                © {currentYear} <span className="text-white font-medium">infodocs</span>. All rights reserved.
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Proprietor: Diisha Online Solution
              </p>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                Cookie Policy
              </a>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
              <p>
                Built with modern web technologies for optimal performance and security.
              </p>
              <div className="flex items-center gap-2">
                <HiOutlineGlobe className="w-4 h-4" />
                <span>Available Worldwide</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
