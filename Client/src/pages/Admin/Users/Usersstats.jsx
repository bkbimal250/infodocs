import React from 'react';
import {
  HiOutlineUsers,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineOfficeBuilding,
} from 'react-icons/hi';

const UsersStats = ({ users = [], spaCounts = [] }) => {
  const stats = {
    total: users.length,
    active: users.filter((u) => u.is_active).length,
    inactive: users.filter((u) => !u.is_active).length,
    linked: users.filter((u) => u.spa_id).length,
    spasWithUsers: spaCounts.filter((s) => s.user_count > 0).length,
  };

  const cards = [
    {
      title: 'Total Users',
      value: stats.total,
      icon: HiOutlineUsers,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Active',
      value: stats.active,
      icon: HiOutlineCheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Inactive',
      value: stats.inactive,
      icon: HiOutlineXCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      title: 'SPA Linked',
      value: stats.linked,
      icon: HiOutlineOfficeBuilding,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      sub: `${stats.spasWithUsers} spas`,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((item, index) => {
        const Icon = item.icon;

        return (
          <div
            key={index}
            className="bg-white border rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{item.title}</p>

                <h2 className="text-2xl font-bold text-gray-900 mt-1">
                  {item.value}
                </h2>

                {item.sub && (
                  <p className="text-xs text-gray-400 mt-1">
                    {item.sub}
                  </p>
                )}
              </div>

              <div
                className={`w-11 h-11 rounded-lg flex items-center justify-center ${item.bg}`}
              >
                <Icon className={item.color} size={22} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UsersStats;