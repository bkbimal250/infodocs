import React from 'react';
import { FaSearch, FaSyncAlt } from 'react-icons/fa';
import { SearchSelect } from '../../../../ui';

const StaffManageFilter = ({ filters, setFilters, onRefresh, spas, cities = [] }) => {

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // Prepare options for SearchSelect
    const spaOptions = [
        { value: '', label: 'All Spas' },
        ...spas.map(s => {
            // Build a descriptive label that handles missing fields gracefully
            const parts = [s.name];
            if (s.code) parts.push(`(${s.code})`);
            if (s.area) parts.push(`- ${s.area}`);

            return {
                value: s.id,
                label: parts.join(' ')
            };
        })
    ];

    // City options from staff records passed by parent
    const CityOptions = [
        { value: '', label: 'All Cities' },
        ...cities.sort().map(city => ({ value: city, label: city }))
    ];


    // Quick date handlers
    const setQuickDate = (type) => {
        const today = new Date();
        let from = '', to = '';

        if (type === 'today') {
            from = to = today.toISOString().split('T')[0];
        }

        if (type === 'yesterday') {
            const y = new Date();
            y.setDate(y.getDate() - 1);
            from = to = y.toISOString().split('T')[0];
        }

        if (type === 'last7') {
            const past = new Date();
            past.setDate(today.getDate() - 6);
            from = past.toISOString().split('T')[0];
            to = today.toISOString().split('T')[0];
        }

        if (type === 'month') {
            const first = new Date(today.getFullYear(), today.getMonth(), 1);
            from = first.toISOString().split('T')[0];
            to = today.toISOString().split('T')[0];
        }

        setFilters(prev => ({
            ...prev,
            from_date: from,
            to_date: to,
            date_type: type
        }));
    };

    return (
        <div className="bg-white border rounded-lg p-4 space-y-4">

            {/* Top Row */}
            <div className="flex flex-col md:flex-row gap-4">

                {/* Search */}
                <div className="w-full md:w-72">
                    <label className="text-sm text-gray-600 mb-1 block">Search</label>
                    <div className="relative">
                        <FaSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                        <input
                            type="text"
                            name="search"
                            value={filters.search}
                            onChange={handleChange}
                            placeholder="Name or phone..."
                            className="w-full pl-7 pr-3 py-2 border rounded-md text-sm"
                        />
                    </div>
                </div>

                {/* City */}
                <div className="w-full md:w-64">
                    <SearchSelect
                        label="City"
                        options={CityOptions}
                        value={filters.city}
                        onChange={(val) => setFilters(prev => ({ ...prev, city: val }))}
                        placeholder="Select City"
                    />
                </div>

                {/* SPA */}
                <div className="flex-1">
                    <SearchSelect
                        label="SPA"
                        options={spaOptions}
                        value={filters.spa_id}
                        onChange={(val) => setFilters(prev => ({ ...prev, spa_id: val }))}
                        placeholder="Select SPA..."
                    />
                </div>

                {/* Status */}
                <div className="w-full md:w-40">
                    <label className="text-sm text-gray-600 mb-1 block">Status</label>
                    <select
                        name="status"
                        value={filters.status}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md text-sm"
                    >
                        <option value="">All</option>
                        <option value="active">Active</option>
                        <option value="left">Left</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

            </div>

            {/* Quick Date Filters */}
            <div>
                <label className="text-sm text-gray-600 mb-2 block">Date Filter</label>

                <div className="flex flex-wrap gap-2">
                    {[
                        { label: 'Today', value: 'today' },
                        { label: 'Yesterday', value: 'yesterday' },
                        { label: 'Last 7 Days', value: 'last7' },
                        { label: 'This Month', value: 'month' },
                        { label: 'Custom', value: 'custom' }
                    ].map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => {
                                if (opt.value === 'custom') {
                                    setFilters(prev => ({ ...prev, date_type: 'custom' }));
                                } else {
                                    setQuickDate(opt.value);
                                }
                            }}
                            className={`px-3 py-1.5 border rounded-md text-sm ${filters.date_type === opt.value ? 'bg-gray-900 text-white' : ''
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Custom Date Range */}
            {filters.date_type === 'custom' && (
                <div className="flex gap-4">
                    <div>
                        <label className="text-sm text-gray-600 mb-1 block">From</label>
                        <input
                            type="date"
                            name="from_date"
                            value={filters.from_date || ''}
                            onChange={handleChange}
                            className="px-3 py-2 border rounded-md text-sm"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-600 mb-1 block">To</label>
                        <input
                            type="date"
                            name="to_date"
                            value={filters.to_date || ''}
                            onChange={handleChange}
                            className="px-3 py-2 border rounded-md text-sm"
                        />
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={onRefresh}
                    className="px-3 py-2 border rounded-md text-sm flex items-center gap-1"
                >
                    <FaSyncAlt />
                    Refresh
                </button>

                <button
                    onClick={() =>
                        setFilters({
                            spa_id: '',
                            city: '',
                            status: '',
                            search: '',
                            from_date: '',
                            to_date: '',
                            date_type: ''
                        })
                    }
                    className="px-3 py-2 border rounded-md text-sm"
                >
                    Clear
                </button>
            </div>

        </div>
    );
};

export default StaffManageFilter;