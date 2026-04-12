import React from 'react';
import { HiOutlineUser } from 'react-icons/hi';

const ProfileHeader = ({ firstName, lastName, role, editing, onEditStart }) => {
  const getRoleDisplay = (role) => {
    const roleMap = {
      'super_admin': 'Super Admin',
      'admin': 'Admin',
      'spa_manager': 'SPA Manager',
      'hr': 'HR',
      'user': 'User'
    };
    return roleMap[role] || role;
  };

  return (
    <div className="px-6 py-6 bg-gradient-to-r from-blue-600 to-blue-800">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4">
          <div className="h-20 w-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/30 shadow-xl">
            <HiOutlineUser className="h-10 w-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {firstName} {lastName}
            </h2>
            <div className="flex items-center justify-center sm:justify-start mt-1">
              <span className="px-3 py-1 bg-white/10 backdrop-blur-sm text-blue-100 rounded-full text-[10px] font-black  tracking-widest border border-white/10">
                {getRoleDisplay(role)}
              </span>
            </div>
          </div>
        </div>

        {!editing && (
          <button
            onClick={onEditStart}
            className="w-full sm:w-auto px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 font-black text-xs  tracking-widest transition-all active:scale-95 shadow-lg shadow-black/10"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
