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
} from 'react-icons/hi';

/**
 * Admin Sidebar Navigation Component
 * Provides navigation for admin panel
 */
const AdminSidebar = () => {
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
    <div className="w-64 h-full bg-[var(--color-gray-900)] text-[var(--color-text-inverse)] flex flex-col">
      <div className="p-6 border-b border-[var(--color-gray-700)]">
        <h2 className="text-xl font-bold">Admin Panel</h2>
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

export default AdminSidebar;

