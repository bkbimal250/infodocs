import React from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

const StaffFilter = ({ filters, setFilters }) => {
  return (
    <div className="p-4 border-b flex flex-col md:flex-row items-center gap-4">

      {/* Search */}
      <div className="relative flex-1 w-full md:max-w-sm">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
        <input
          type="text"
          placeholder="Search by name or phone..."
          className="w-full pl-8 pr-3 py-2 border rounded-md text-sm outline-none focus:border-gray-400 transition-colors"
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
        />
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-1 bg-gray-50 rounded-md p-1 w-full md:w-auto">
        {[
          { id: '', label: 'All' },
          { id: 'active', label: 'Active' },
          { id: 'inactive', label: 'Inactive' },
          { id: 'left', label: 'Left' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilters(prev => ({ ...prev, status: tab.id }))}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex-shrink-0 ${
              filters.status === tab.id
                ? 'bg-white text-gray-900 shadow-sm border'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reset */}
      {(filters.search || filters.status) && (
        <button
          onClick={() => setFilters({ search: '', status: '' })}
          className="flex items-center gap-1 px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-md text-xs font-medium transition-colors"
        >
          <FaTimes /> Reset
        </button>
      )}
    </div>
  );
};

export default StaffFilter;