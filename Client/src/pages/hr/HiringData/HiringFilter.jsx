/**
 * Hiring Filter Component
 * Filter component for HR Hiring Data page
 */
const HiringFilter = ({ 
  hiringForms, 
  filters, 
  onFilterChange 
}) => {
  // Get unique roles and SPAs for filter dropdowns
  const uniqueRoles = [...new Set(hiringForms.map(f => f.for_role).filter(Boolean))];
  const uniqueSpas = [...new Set(hiringForms.map(f => f.spa?.name || f.spa_name_text).filter(Boolean))];

  // Calculate filtered count
  const getFilteredCount = () => {
    return hiringForms.filter((form) => {
      const matchesSearch =
        filters.search === '' ||
        form.for_role?.toLowerCase().includes(filters.search.toLowerCase()) ||
        form.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
        form.required_skills?.toLowerCase().includes(filters.search.toLowerCase()) ||
        (form.spa?.name || form.spa_name_text || '').toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesRole =
        filters.role === '' ||
        form.for_role?.toLowerCase().includes(filters.role.toLowerCase());
      
      const matchesSpa =
        filters.spa === '' ||
        (form.spa?.name || form.spa_name_text || '').toLowerCase().includes(filters.spa.toLowerCase());
      
      return matchesSearch && matchesRole && matchesSpa;
    }).length;
  };

  const filteredCount = getFilteredCount();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filters
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            placeholder="Search by role, description, skills, or SPA..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select
            value={filters.role}
            onChange={(e) => onFilterChange({ ...filters, role: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Roles</option>
            {uniqueRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SPA Location</label>
          <select
            value={filters.spa}
            onChange={(e) => onFilterChange({ ...filters, spa: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All SPAs</option>
            {uniqueSpas.map((spa) => (
              <option key={spa} value={spa}>
                {spa}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold">{filteredCount}</span> of{' '}
          <span className="font-semibold">{hiringForms.length}</span> hiring forms
        </p>
        {(filters.search || filters.role || filters.spa) && (
          <button
            onClick={() => onFilterChange({ search: '', role: '', spa: '' })}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default HiringFilter;

