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
} from 'react-icons/hi';

/**
 * Manager Sidebar Navigation Component
 * Provides navigation for Manager panel
 */
const ManagerSidebar = () => {
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
    <div className="w-64 h-full bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-bold">Manager Panel</h2>
      </div>
      <nav className="flex-1 overflow-y-auto mt-6">
        <ul className="space-y-1 px-3 pb-6">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="mr-3 text-xl" />
                <span className="font-medium">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default ManagerSidebar;

