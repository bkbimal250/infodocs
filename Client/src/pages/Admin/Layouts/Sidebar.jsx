import { Link, useLocation } from 'react-router-dom';
import {
  HiOutlineChartBar,
  HiOutlineUsers,
  HiOutlineDocumentText,
  HiOutlineClipboardList,
  HiOutlineBriefcase,
  HiOutlineUser,
  HiOutlineDocument,
  HiOutlineLocationMarker,
  HiOutlineBell,
  HiOutlineClock,
  HiOutlineChatAlt,
  HiOutlineVideoCamera,
} from 'react-icons/hi';

/**
 * Admin Sidebar Navigation Component
 * Modern sidebar with gradient design and smooth animations
 */
const AdminSidebar = ({ onLinkClick }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: HiOutlineChartBar,
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: HiOutlineUsers,
    },
    {
      name: 'Certificates',
      path: '/admin/certificates',
      icon: HiOutlineDocumentText,
    },
    {
      name: 'Templates',
      path: '/admin/templates',
      icon: HiOutlineClipboardList,
    },
    {
      name: 'Hiring',
      path: '/admin/hiring',
      icon: HiOutlineBriefcase,
    },
    {
      name: 'Candidates',
      path: '/admin/forms-data/candidates',
      icon: HiOutlineUser,
    },
    {
      name: 'SPAs',
      path: '/admin/spas',
      icon: HiOutlineLocationMarker,
    },
    {
      name: 'Queries',
      path: '/admin/queries',
      icon: HiOutlineChatAlt,
    },
    {
      name: 'Tutorials',
      path: '/admin/tutorials',
      icon: HiOutlineVideoCamera,
    },
    {
      name: 'Notifications',
      path: '/admin/notifications',
      icon: HiOutlineBell,
    },
    {
      name: 'Recent Activity',
      path: '/admin/activities',
      icon: HiOutlineClock,
    },
  ];

  return (
    <div className="w-64 h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-amber-600/20 to-orange-600/20">
        <h2 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
          Admin Panel
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
                      ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/50 scale-[1.02]'
                      : 'text-gray-300 hover:bg-gray-800/50 hover:text-white hover:translate-x-1'
                  }`}
                >
                  {/* Active indicator */}
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></span>
                  )}
                  
                  <Icon 
                    className={`mr-3 text-xl transition-transform duration-200 ${
                      active ? 'text-white' : 'text-gray-400 group-hover:text-amber-400 group-hover:scale-110'
                    }`} 
                  />
                  <span className={`font-medium text-sm ${active ? 'text-white' : 'group-hover:text-white'}`}>
                    {item.name}
                  </span>
                  
                  {/* Hover effect glow */}
                  {!active && (
                    <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-600/0 via-orange-600/0 to-amber-600/0 group-hover:from-amber-600/10 group-hover:via-orange-600/10 group-hover:to-amber-600/10 transition-all duration-200 -z-10"></span>
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

export default AdminSidebar;
