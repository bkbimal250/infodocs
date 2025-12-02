import { useState, useEffect } from 'react';

/**
 * Candidate Filter Component
 * Provides filtering options for candidate forms
 */
const CandidateFilter = ({ onFilterChange }) => {
  const [filter, setFilter] = useState({
    search: '',
    position: ''
  });

  useEffect(() => {
    // Notify parent component when filter changes
    if (onFilterChange) {
      onFilterChange(filter);
    }
  }, [filter, onFilterChange]);

  const handleFilterChange = (key, value) => {
    setFilter(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-md p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Search</label>
          <input
            type="text"
            placeholder="Search by name, phone, or position..."
            value={filter.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full px-4 py-2 border border-[var(--color-border-primary)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Position</label>
          <select
            value={filter.position}
            onChange={(e) => handleFilterChange('position', e.target.value)}
            className="w-full px-4 py-2 border border-[var(--color-border-primary)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
          >
            <option value="">All Positions</option>
            <option value="Therapist">Therapist</option>
            <option value="Manager">Manager</option>
            <option value="Receptionist">Receptionist</option>
            <option value="Beautician">Beautician</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default CandidateFilter;