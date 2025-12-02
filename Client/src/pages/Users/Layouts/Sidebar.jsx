import { Link, useLocation } from 'react-router-dom';
import {
  HiOutlineChartBar,
  HiOutlineDocumentText,
  HiOutlineClipboardList,
  HiOutlineUser,
  HiOutlineBriefcase,
  HiOutlineBell,
  HiOutlineClock,
} from 'react-icons/hi';

/**
 * User Sidebar Navigation Component
 * Provides navigation for User panel
 */
const UserSidebar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/user/dashboard',
      icon: HiOutlineChartBar,
    },
    {
      name: 'My Certificates',
      path: '/user/certificates',
      icon: HiOutlineDocumentText,
    },
    {
      name: 'My Forms',
      path: '/user/forms',
      icon: HiOutlineClipboardList,
    },
    {
      name: 'My Hiring Forms',
      path: '/user/job-hirings',
      icon: HiOutlineBriefcase,
    },
    {
      name: 'Notifications',
      path: '/user/notifications',
      icon: HiOutlineBell,
    },
    {
      name: 'Recent Activity',
      path: '/user/activities',
      icon: HiOutlineClock,
    },
    {
      name: 'Profile',
      path: '/user/profile',
      icon: HiOutlineUser,
    },
  ];

  return (
    <div className="w-64 h-full bg-[var(--color-gray-900)] text-[var(--color-text-inverse)] flex flex-col">
      <div className="p-6 border-b border-[var(--color-gray-700)]">
        <h2 className="text-xl font-bold">User Panel</h2>
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

export default UserSidebar;

