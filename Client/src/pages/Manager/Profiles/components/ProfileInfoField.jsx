import React from 'react';

const ProfileInfoField = ({ label, name, value, onChange, icon, editing, type = 'text', placeholder = '' }) => {
  return (
    <div className="space-y-1">
      <label className="flex items-center gap-2 text-[10px] font-black text-gray-400  tracking-widest ml-1 mb-1">
        {icon && <span className="text-blue-500 text-xs">{icon}</span>}
        {label}
      </label>

      {editing ? (
        <input
          type={type}
          name={name}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all text-sm font-bold text-gray-900 shadow-sm shadow-black/5"
        />
      ) : (
        <div className="px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl min-h-[46px] flex items-center">
          <p className="text-sm font-extrabold text-gray-900">
            {value || <span className="text-gray-400 italic font-normal text-xs  tracking-tighter">Not provided</span>}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfileInfoField;
