import { Link, useLocation } from 'react-router-dom';
import {
  HiOutlineChartBar,
  HiOutlineUser,
  HiOutlineDocumentText,
  HiOutlineBriefcase,
  HiOutlineSparkles,
  HiOutlineBell,
  HiOutlineClock,
  HiOutlineUserCircle,
  HiOutlineChatAlt,
  HiOutlineVideoCamera,
} from 'react-icons/hi';

/**
 * Manager Sidebar Navigation Component
 * Modern sidebar with gradient design and smooth animations
 */
const ManagerSidebar = ({ onLinkClick }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/manager/dashboard',
      icon: HiOutlineChartBar,
    },
    {
      name: 'Certificates',
      path: '/manager/certificates',
      icon: HiOutlineDocumentText,
    },
    {
      name: 'Candidates',
      path: '/manager/candidates',
      icon: HiOutlineUser,
    },
    {
      name: 'Hiring',
      path: '/manager/hiring',
      icon: HiOutlineBriefcase,
    },
    {
      name: 'Queries',
      path: '/manager/queries',
      icon: HiOutlineChatAlt,
    },
    {
      name: 'Tutorials',
      path: '/manager/tutorials',
      icon: HiOutlineVideoCamera,
    },
    {
      name: 'Notifications',
      path: '/manager/notifications',
      icon: HiOutlineBell,
    },
    {
      name: 'Recent Activity',
      path: '/manager/activities',
      icon: HiOutlineClock,
    },
    {
      name: 'Profile',
      path: '/manager/profile',
      icon: HiOutlineUserCircle,
    },
  ];

  return (
    <div className="w-64 h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-emerald-600/20 to-teal-600/20">
        <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
          Manager Panel
        </h2>
        <p className="text-xs text-gray-400 mt-1">Navigation Menu</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto mt-4 px-3 pb-6">
        <ul className="space-y-1.5">
          {menuItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => {
                    if (onLinkClick && window.innerWidth < 1024) {
                      onLinkClick();
                    }
                  }}
                  className={`group flex items-center px-4 py-3 rounded-xl transition-all duration-200 relative ${
                    active
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/50 scale-[1.02]'
                      : 'text-gray-300 hover:bg-gray-800/50 hover:text-white hover:translate-x-1'
                  }`}
                >
                  {/* Active indicator */}
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></span>
                  )}
                  
                  <Icon 
                    className={`mr-3 text-xl transition-transform duration-200 ${
                      active ? 'text-white' : 'text-gray-400 group-hover:text-emerald-400 group-hover:scale-110'
                    }`} 
                  />
                  <span className={`font-medium text-sm ${active ? 'text-white' : 'group-hover:text-white'}`}>
                    {item.name}
                  </span>
                  
                  {/* Hover effect glow */}
                  {!active && (
                    <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-600/0 via-teal-600/0 to-emerald-600/0 group-hover:from-emerald-600/10 group-hover:via-teal-600/10 group-hover:to-emerald-600/10 transition-all duration-200 -z-10"></span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700/50 bg-gray-900/50">
        <div className="text-xs text-gray-400 text-center">
          <p>© 2024 InfoDocs</p>
        </div>
      </div>
    </div>
  );
};

export default ManagerSidebar;
