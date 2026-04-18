import React from 'react';
import SearchSelect from '../../../ui/SearchSelect';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';

/**
 * Filter component for SPAs
 * @param {Object} props
 * @param {Object} props.filters - Current filter values
 * @param {Function} props.onFilterChange - Callback when filters change
 * @param {Array} props.cities - Unique list of cities
 * @param {Array} props.states - Unique list of states
 * @param {Function} props.onClear - Callback to clear all filters
 */
const SpasFilter = ({ 
    filters, 
    onFilterChange, 
    cities = [], 
    states = [], 
    onClear 
}) => {
    
    const handleChange = (name, value) => {
        onFilterChange({ ...filters, [name]: value });
    };

    const cityOptions = cities.map(city => ({ label: city, value: city }));
    const stateOptions = states.map(state => ({ label: state, value: state }));
    const statusOptions = [
        { label: 'All Status', value: '' },
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' }
    ];

    const hasFilters = filters.search || filters.city || filters.state || filters.status;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6 transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-50">
                <div className="flex items-center gap-2 text-gray-700 font-semibold">
                    <FaFilter className="text-blue-500" />
                    <span>Filter SPAs</span>
                </div>
                {hasFilters && (
                    <button 
                        onClick={onClear}
                        className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 transition-colors"
                    >
                        <FaTimes size={10} />
                        Clear All
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Global Search */}
                <div className="relative">
                    <label className="block text-xs font-medium text-gray-500 mb-1 ml-1 uppercase tracking-wider">
                        Quick Search
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => handleChange('search', e.target.value)}
                            placeholder="Name, Code, Contact..."
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                        />
                    </div>
                </div>

                {/* City Filter */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 ml-1 uppercase tracking-wider">
                        City
                    </label>
                    <SearchSelect
                        options={cityOptions}
                        value={filters.city}
                        onChange={(val) => handleChange('city', val)}
                        placeholder="Select City"
                        className="text-sm"
                    />
                </div>

                {/* State Filter */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 ml-1 uppercase tracking-wider">
                        State
                    </label>
                    <SearchSelect
                        options={stateOptions}
                        value={filters.state}
                        onChange={(val) => handleChange('state', val)}
                        placeholder="Select State"
                        className="text-sm"
                    />
                </div>

                {/* Status Filter */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 ml-1 uppercase tracking-wider">
                        Status
                    </label>
                    <select
                        value={filters.status}
                        onChange={(e) => handleChange('status', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none appearance-none cursor-pointer"
                    >
                        {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default SpasFilter;
