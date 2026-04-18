import React from 'react';
import { HiOutlineSearch, HiOutlineX, HiOutlineCalendar, HiOutlineFilter } from 'react-icons/hi';

const CertificateFilter = ({ filters, setFilters, onClear }) => {
  const categories = [
    { value: 'spa_therapist', label: 'Spa Therapist' },
    { value: 'manager_salary', label: 'Manager Salary' },
    { value: 'experience_letter', label: 'Experience Letter' },
    { value: 'appointment_letter', label: 'Appointment Letter' },
    { value: 'invoice_spa_bill', label: 'Invoice/SPA Bill' },
    { value: 'id_card', label: 'ID Card' },
    { value: 'offer_letter', label: 'Offer Letter' },
    { value: 'daily_sheet', label: 'Daily Sheet' }
  ];

  const hasActiveFilters = filters.search || filters.category || filters.dateFrom || filters.dateTo;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
      <div className="flex flex-col lg:flex-row items-center gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by candidate name..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
          />
        </div>

        {/* Filter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full lg:w-auto">
          
          {/* Category Select */}
          <div className="relative min-w-[200px]">
            <HiOutlineFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full pl-9 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none appearance-none cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Date Range Group */}
          <div className="flex items-center gap-2 md:col-span-2">
            <div className="relative flex-1">
              <HiOutlineCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full pl-9 pr-3 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                title="From Date"
              />
            </div>
            <span className="text-gray-300">to</span>
            <div className="relative flex-1">
              <HiOutlineCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full pl-9 pr-3 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                title="To Date"
              />
            </div>
          </div>
        </div>

        {/* Clear Button */}
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="flex items-center justify-center gap-2 px-6 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium whitespace-nowrap"
          >
            <HiOutlineX className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default CertificateFilter;
