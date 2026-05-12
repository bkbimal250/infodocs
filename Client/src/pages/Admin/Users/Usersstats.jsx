import React from 'react';
import { 
  HiOutlineUsers, 
  HiOutlineUserGroup, 
  HiOutlineShieldCheck, 
  HiOutlineBadgeCheck,
  HiOutlineUserCircle,
  HiOutlineUser,
  HiOutlineLockClosed
} from 'react-icons/hi';

/**
 * Premium Users Statistics Component
 * Displays key metrics for user management with a clean, high-fidelity interface.
 */
const UsersStats = ({ users = [] }) => {
  // Calculate statistics
  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    inactive: users.filter(u => !u.is_active).length,
    admin: users.filter(u => ['admin', 'super_admin'].includes(u.role?.toLowerCase())).length,
    spa_manager: users.filter(u => u.role?.toLowerCase() === 'spa_manager').length,
    hr: users.filter(u => u.role?.toLowerCase() === 'hr').length,
    user: users.filter(u => u.role?.toLowerCase() === 'user').length,
  };

  const statCards = [
    {
      label: 'Total Users',
      value: stats.total,
      icon: HiOutlineUsers,
      color: '#6366f1', // Indigo
      bg: 'rgba(99, 102, 241, 0.1)',
      description: 'Total registered accounts'
    },
    {
      label: 'Active Accounts',
      value: stats.active,
      icon: HiOutlineBadgeCheck,
      color: '#10b981', // Emerald
      bg: 'rgba(16, 185, 129, 0.1)',
      description: 'Currently enabled'
    },
    {
      label: 'Inactive',
      value: stats.inactive,
      icon: HiOutlineLockClosed,
      color: '#f43f5e', // Rose
      bg: 'rgba(244, 63, 94, 0.1)',
      description: 'Disabled or locked'
    },
    {
      label: 'Admins',
      value: stats.admin,
      icon: HiOutlineShieldCheck,
      color: '#8b5cf6', // Violet
      bg: 'rgba(139, 92, 246, 0.1)',
      description: 'System administrators'
    },
    {
      label: 'Spa Managers',
      value: stats.spa_manager,
      icon: HiOutlineUserGroup,
      color: '#06b6d4', // Cyan
      bg: 'rgba(6, 182, 212, 0.1)',
      description: 'Branch supervisors'
    },
    {
      label: 'HR Team',
      value: stats.hr,
      icon: HiOutlineUser,
      color: '#f59e0b', // Amber
      bg: 'rgba(245, 158, 11, 0.1)',
      description: 'Staff & recruitment'
    },
    {
      label: 'Users/Staff',
      value: stats.user,
      icon: HiOutlineUserCircle,
      color: '#14b8a6', // Teal
      bg: 'rgba(20, 184, 166, 0.1)',
      description: 'Standard accounts'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-8">
      {statCards.map((stat, index) => (
        <div 
          key={index}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
        >
          {/* Subtle gradient overlay */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500"
            style={{ background: `linear-gradient(135deg, ${stat.color}, transparent)` }}
          />
          
          <div className="relative flex flex-col gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-3 duration-300 shadow-sm"
              style={{ backgroundColor: stat.bg, color: stat.color }}
            >
              <stat.icon size={24} />
            </div>
            
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                {stat.label}
              </p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-black text-gray-900 leading-none">
                  {stat.value.toLocaleString()}
                </h3>
              </div>
              <p className="text-[9px] text-gray-400 mt-2 font-medium">
                {stat.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UsersStats;

