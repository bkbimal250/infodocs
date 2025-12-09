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
    <footer className="mt-16 border-t bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-8">
          {/* Brand */}
               {/* Logo + Brand */}
          <Link to="/" className="flex items-center">
            <img
              className="h-12 w-auto object-contain"
              src="/infodocs.png"
              alt="Infodocs Logo"
            />
          </Link>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-gray-600 hover:text-blue-700 flex items-center gap-2 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">
              Platform Highlights
            </h4>
            <ul className="space-y-2">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50">
                      <Icon className="w-4 h-4 text-blue-600" />
                    </span>
                    <span>{feature.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">
              Contact
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <HiOutlineMail className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-500">Email</p>
                  <a
                    href="mailto:conatact.dishaonlinesolution@gmail.com"
                    className="text-gray-700 hover:text-blue-700 transition-colors"
                  >
                    conatact.dishaonlinesolution@gmail.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <HiOutlinePhone className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-500">Phone</p>
                  <a
                    href="tel:+1234567890"
                    className="text-gray-700 hover:text-blue-700 transition-colors"
                  >
                    +91 9116458453
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <HiOutlineLocationMarker className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-500">Developed by:</p>
                  <p className="text-gray-700"><a href="https://www.dishaonlinesolution.in">Disha Online Solution Team</a></p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="text-sm text-gray-500 text-center md:text-left">
              <p>
                © {currentYear}{' '}
                <span className="font-medium text-gray-800">Infodocs</span>. All rights reserved.
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Developed by:: <a className='hover:text-blue-700' href="https://dishaonlinesolution.in">Disha Online Solution</a>
              </p>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center gap-4 text-xs">
              <button className="text-gray-500 hover:text-blue-700 transition-colors">
                Privacy Policy
              </button>
              <button className="text-gray-500 hover:text-blue-700 transition-colors">
                Terms of Service
              </button>
              <button className="text-gray-500 hover:text-blue-700 transition-colors">
                Cookie Policy
              </button>
            </div>
          </div>

          {/* Bottom strip */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-gray-400">
              <p>
                Built with modern web technologies for performance, security, and ease of use.
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
