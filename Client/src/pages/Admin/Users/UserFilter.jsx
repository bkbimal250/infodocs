import { HiOutlineFilter, HiOutlineSearch, HiOutlineX } from 'react-icons/hi';
import SearchSelect from '../../../ui/SearchSelect';

const UserFilter = ({ filter, spas = [], onFilterChange, onClearFilters }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({
      ...filter,
      [name]: value,
    });
  };

  const handleSpaChange = (value) => {
    onFilterChange({
      ...filter,
      spa_id: value,
    });
  };

  const spaOptions = [
    { label: 'Unassigned users', value: 'unassigned' },
    ...spas.map((spa) => ({
      label: `${spa.name}${spa.code ? ` (${spa.code})` : ''}`,
      value: String(spa.id),
      city: spa.city,
      state: spa.state,
    })),
  ];

  const hasActiveFilters = filter.search || filter.role || filter.status || filter.spa_id;

  return (
    <div className="mb-6 rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] shadow-sm">
      <div className="flex flex-col gap-3 border-b border-[var(--color-border-primary)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)]">
            <HiOutlineFilter className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-[var(--color-text-primary)]">User Filters</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">Find users by identity, SPA, role, or account state.</p>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--color-border-primary)] px-3 py-2 text-sm font-semibold text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-gray-50)]"
          >
            <HiOutlineX className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
            Search
          </label>
          <div className="relative">
            <HiOutlineSearch className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
            <input
              type="text"
              name="search"
              value={filter.search || ''}
              onChange={handleInputChange}
              placeholder="Name, email, phone, SPA"
              className="w-full rounded-lg border border-[var(--color-border-primary)] bg-white py-2.5 pl-10 pr-4 text-sm text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
            SPA
          </label>
          <SearchSelect
            options={spaOptions}
            value={filter.spa_id || ''}
            onChange={handleSpaChange}
            placeholder="All SPAs"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
            Role
          </label>
          <select
            name="role"
            value={filter.role || ''}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-[var(--color-border-primary)] bg-white px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
          >
            <option value="">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="spa_manager">SPA Manager</option>
            <option value="hr">HR</option>
            <option value="user">User</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
            Status
          </label>
          <select
            name="status"
            value={filter.status || ''}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-[var(--color-border-primary)] bg-white px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default UserFilter;
