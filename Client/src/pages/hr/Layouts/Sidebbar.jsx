import { Link, useLocation } from 'react-router-dom';
import {
  HiOutlineChartBar,
  HiOutlineUser,
  HiOutlineBriefcase,
  HiOutlineDocumentText,
  HiOutlineBell,
  HiOutlineClock,
  HiOutlineUserCircle,
} from 'react-icons/hi';

/**
 * HR Sidebar Navigation Component
 * Provides navigation for HR panel
 */
const HrSidebar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/hr/dashboard',
      icon: HiOutlineChartBar,
    },
    {
      name: 'Candidates',
      path: '/hr/candidates',
      icon: HiOutlineUser,
    },
    {
      name: 'Hiring Data',
      path: '/hr/hiring-data',
      icon: HiOutlineBriefcase,
    },

    {
      name: 'Notifications',
      path: '/hr/notifications',
      icon: HiOutlineBell,
    },
    {
      name: 'Recent Activity',
      path: '/hr/activities',
      icon: HiOutlineClock,
    },
    {
      name: 'Profile',
      path: '/hr/profile',
      icon: HiOutlineUserCircle,
    },
  ];

  return (
    <div className="w-64 h-full bg-[var(--color-gray-900)] text-[var(--color-text-inverse)] flex flex-col">
      <div className="p-6 border-b border-[var(--color-gray-700)]">
        <h2 className="text-xl font-bold">HR Panel</h2>
      </div>
      <nav className="flex-1 overflow-y-auto mt-6">
        <ul className="space-y-1 px-3 pb-6">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-[var(--color-primary)] text-[var(--color-text-inverse)]'
                    : 'text-[var(--color-gray-300)] hover:bg-[var(--color-gray-800)] hover:text-[var(--color-text-inverse)]'
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

export default HrSidebar;
