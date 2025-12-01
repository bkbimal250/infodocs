import { HiSearch, HiX } from 'react-icons/hi';
import { useState } from 'react';

/**
 * Hiring Filter Component
 * Filter job openings by search, role, SPA, and experience
 */
const Hiringfilter = ({ hiringForms, filters, onFilterChange }) => {
  const [showFilters, setShowFilters] = useState(false);

  // Get unique values for filter dropdowns
  const uniqueRoles = [...new Set(hiringForms.map((f) => f.for_role).filter(Boolean))].sort();
  const uniqueSpas = [
    ...new Set(
      hiringForms
        .map((f) => f.spa?.name || f.spa_name_text)
        .filter(Boolean)
    ),
  ].sort();
  const uniqueExperiences = [
    ...new Set(hiringForms.map((f) => f.required_experience).filter(Boolean)),
  ].sort();

  const handleInputChange = (name, value) => {
    onFilterChange({ [name]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      role: '',
      spa: '',
      experience: '',
    });
  };

  const hasActiveFilters = filters.search || filters.role || filters.spa || filters.experience;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by role, description, skills, or location..."
            value={filters.search}
            onChange={(e) => handleInputChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {filters.search && (
            <button
              onClick={() => handleInputChange('search', '')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <HiX className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          {showFilters ? 'Hide' : 'Show'} Advanced Filters
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm font-medium text-gray-600 hover:text-gray-800 flex items-center gap-1"
          >
            <HiX className="w-4 h-4" />
            Clear All Filters
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={filters.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Roles</option>
              {uniqueRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* SPA Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SPA Location</label>
            <select
              value={filters.spa}
              onChange={(e) => handleInputChange('spa', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Locations</option>
              {uniqueSpas.map((spa) => (
                <option key={spa} value={spa}>
                  {spa}
                </option>
              ))}
            </select>
          </div>

          {/* Experience Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
            <select
              value={filters.experience}
              onChange={(e) => handleInputChange('experience', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Experience Levels</option>
              {uniqueExperiences.map((exp) => (
                <option key={exp} value={exp}>
                  {exp}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700">Active Filters:</span>
            {filters.search && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
                Search: {filters.search}
                <button
                  onClick={() => handleInputChange('search', '')}
                  className="ml-1 hover:text-blue-900"
                >
                  <HiX className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.role && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-1">
                Role: {filters.role}
                <button
                  onClick={() => handleInputChange('role', '')}
                  className="ml-1 hover:text-green-900"
                >
                  <HiX className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.spa && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-1">
                Location: {filters.spa}
                <button
                  onClick={() => handleInputChange('spa', '')}
                  className="ml-1 hover:text-purple-900"
                >
                  <HiX className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.experience && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm flex items-center gap-1">
                Experience: {filters.experience}
                <button
                  onClick={() => handleInputChange('experience', '')}
                  className="ml-1 hover:text-yellow-900"
                >
                  <HiX className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">
            {hiringForms.length}
          </span> job opening{hiringForms.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
};

export default Hiringfilter;

