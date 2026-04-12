import React from 'react';
import { FaSearch, FaFilter, FaBuilding, FaUserCheck, FaChevronDown, FaUserTimes, FaSyncAlt } from 'react-icons/fa';

const StaffManageFilter = ({ filters, setFilters, onRefresh, spas }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const statusOptions = [
        { label: 'All Status', value: '', icon: <FaFilter /> },
        { label: 'Active', value: 'active', icon: <FaUserCheck className="text-emerald-500" /> },
        { label: 'Left', value: 'left', icon: <FaUserTimes className="text-red-500" /> },
        { label: 'Inactive', value: 'inactive', icon: <FaUserCheck className="text-gray-400" /> },
    ];

    const [branchSearch, setBranchSearch] = React.useState('');
    const [showBranches, setShowBranches] = React.useState(false);

    const filteredSpas = spas.filter(spa =>
        String(spa.name || '').toLowerCase().includes(branchSearch.toLowerCase()) ||
        String(spa.city || '').toLowerCase().includes(branchSearch.toLowerCase()) ||
        String(spa.code || '').toLowerCase().includes(branchSearch.toLowerCase())
    );

    const selectedSpa = spas.find(s => s.id == filters.spa_id);

    return (
        <div className="bg-white p-3 rounded-2xl shadow-soft border border-gray-500/50 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center mb-6 animate-in fade-in slide-in-from-top-4 duration-500">

            {/* Search Input (Global Phone Search) */}
            <div className="relative flex-grow min-w-[250px]">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none group-focus-within:text-primary transition-colors" />
                <input
                    type="text"
                    name="search"
                    placeholder="Search member by phone..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-transparent rounded-xl focus:bg-white focus:border-primary/30 outline-none transition-all text-xs font-bold text-gray-700"
                    value={filters.search}
                    onChange={handleChange}
                />
            </div>

            <div className="hidden lg:block h-8 w-px bg-gray-100"></div>

            {/* Advanced Branch Selector (Searchable) */}
            <div className="relative w-full lg:w-72 group">
                <div
                    onClick={() => setShowBranches(!showBranches)}
                    className={`w-full pl-10 pr-8 py-2 bg-gray-50/50 border border-transparent rounded-xl cursor-pointer hover:bg-gray-100/80 transition-all flex items-center ${showBranches ? 'bg-white border-primary/20 shadow-soft' : ''}`}
                >
                    <FaBuilding className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${selectedSpa ? 'text-primary' : 'text-gray-300'}`} />
                    <div className="flex flex-col">
                        <span className={`text-[10px] font-black  tracking-widest truncate ${selectedSpa ? 'text-gray-900' : 'text-gray-400'}`}>
                            {selectedSpa ? selectedSpa.name : 'All Branches / Global'}
                        </span>
                        {selectedSpa && (
                            <span className="text-[8px] font-bold text-primary  tracking-tighter">
                                {selectedSpa.code} • {selectedSpa.city}
                            </span>
                        )}
                    </div>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300">
                        <FaChevronDown className={`transition-transform duration-300 ${showBranches ? 'rotate-180' : ''}`} size={10} />
                    </div>
                </div>

                {showBranches && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-500 rounded-xl shadow-2xl z-50 p-2 overflow-hidden animate-in zoom-in-95 duration-200 origin-top">
                        <div className="relative mb-2">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-[9px]" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Find branch..."
                                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border-none rounded-lg outline-none text-[10px] font-bold"
                                value={branchSearch}
                                onChange={(e) => setBranchSearch(e.target.value)}
                            />
                        </div>

                        <div className="max-h-52 overflow-y-auto custom-scrollbar">
                            <button
                                onClick={() => { setFilters({ ...filters, spa_id: '' }); setShowBranches(false); setBranchSearch(''); }}
                                className="w-full text-left px-3 py-2 rounded-lg hover:bg-primary/5 transition-colors flex items-center justify-between group"
                            >
                                <span className="text-[9px] font-black  tracking-widest text-gray-400 group-hover:text-primary">All Branches</span>
                                {!filters.spa_id && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                            </button>

                            {filteredSpas.map(spa => (
                                <button
                                    key={spa.id}
                                    onClick={() => { setFilters({ ...filters, spa_id: spa.id }); setShowBranches(false); setBranchSearch(''); }}
                                    className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center justify-between mt-0.5 ${filters.spa_id == spa.id ? 'bg-primary/5 border border-primary/10' : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex flex-col">
                                        <span className={`text-[9px] font-black  tracking-widest ${filters.spa_id == spa.id ? 'text-primary' : 'text-gray-700'}`}>
                                            {spa.name}
                                        </span>
                                        <span className="text-[8px] font-bold text-gray-400  tracking-tighter">
                                            {spa.code} • {spa.city}
                                        </span>
                                    </div>
                                    {filters.spa_id == spa.id && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Status Filter */}
            <div className="flex bg-gray-100/40 p-1 rounded-xl gap-1 w-full lg:w-auto overflow-x-auto scrollbar-hide">
                {statusOptions.map(opt => (
                    <button
                        key={opt.value}
                        onClick={() => setFilters(prev => ({ ...prev, status: opt.value }))}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black  tracking-tighter transition-all whitespace-nowrap ${filters.status === opt.value
                            ? 'bg-white text-gray-900 shadow-soft border border-gray-500'
                            : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        {React.cloneElement(opt.icon, { size: 10 })}
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 w-full lg:w-auto">
                <button
                    onClick={() => setFilters({ spa_id: '', status: '', search: '' })}
                    className="flex-grow lg:flex-none px-3 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all active:scale-95 flex items-center justify-center gap-2 text-[9px] font-black  tracking-widest border border-red-100/50"
                    title="Clear All Filters"
                >
                    <FaUserTimes size={12} />
                    <span>Clear</span>
                </button>
            </div>
        </div>
    );
};

export default StaffManageFilter;
