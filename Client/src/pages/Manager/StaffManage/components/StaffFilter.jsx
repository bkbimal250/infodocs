import React from 'react';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';

/**
 * Premium Filter Component for Staff Management
 */
const StaffFilter = ({ searchQuery, setSearchQuery, statusFilter, setStatusFilter }) => {
  return (
    <div className="p-4 bg-white/50 border-b border-gray-100 flex flex-col md:flex-row items-center gap-4">
      {/* Search Input */}
      <div className="relative flex-grow w-full md:max-w-md group">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
        <input
          type="text"
          placeholder="Search by name or phone..."
          className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all text-sm font-semibold text-gray-700 shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-300 hover:text-gray-500"
          >
            <FaTimes size={12} />
          </button>
        )}
      </div>

      {/* Filter Tabs / Quick Select */}
      <div className="flex items-center gap-2 p-1 bg-gray-100/50 rounded-2xl w-full md:w-auto overflow-x-auto scrollbar-hide">
        {[
          { id: 'all', label: 'All Staff' },
          { id: 'active', label: 'Active' },
          { id: 'inactive', label: 'Inactive' },
          { id: 'left', label: 'Left' }
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => setStatusFilter(filter.id)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black  tracking-widest flex-shrink-0 transition-all ${statusFilter === filter.id
                ? 'bg-white text-blue-600 shadow-sm border border-gray-100'
                : 'text-gray-400 hover:text-gray-600 hover:bg-white/30'
              }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Stats / Indicator */}
      {(searchQuery || statusFilter !== 'all') && (
        <button
          onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
          className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-all text-[10px] font-black  tracking-[0.2em]"
        >
          <FaTimes /> Reset
        </button>
      )}
    </div>
  );
};

export default StaffFilter;