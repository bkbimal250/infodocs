import { HiOutlineSearch, HiOutlineFilter, HiX } from 'react-icons/hi';

const text = (value) => (value || '').toString().toLowerCase();

const matchesFilters = (form, filters) => {
  const spaFields = [
    form.spa?.name,
    form.spa?.code,
    form.spa?.area,
    form.spa?.city,
    form.spa?.state,
    form.spa?.address,
    form.spa_name_text,
  ].map(text).join(' ');

  const matchesSearch =
    !filters.search ||
    text(form.for_role).includes(text(filters.search)) ||
    text(form.description).includes(text(filters.search)) ||
    text(form.required_skills).includes(text(filters.search)) ||
    spaFields.includes(text(filters.search));

  const matchesRole = !filters.role || text(form.for_role).includes(text(filters.role));
  const matchesSpa = !filters.spa || spaFields.includes(text(filters.spa));
  const matchesCity = !filters.city || text(form.spa?.city).includes(text(filters.city));

  return matchesSearch && matchesRole && matchesSpa && matchesCity;
};

const HiringFilter = ({
  hiringForms,
  filters,
  onFilterChange,
}) => {
  const uniqueRoles = [...new Set(hiringForms.map((f) => f.for_role).filter(Boolean))].sort();
  const uniqueSpas = [...new Set(hiringForms.map((f) => f.spa?.name || f.spa_name_text).filter(Boolean))].sort();
  const uniqueCities = [...new Set(hiringForms.map((f) => f.spa?.city).filter(Boolean))].sort();
  const filteredCount = hiringForms.filter((form) => matchesFilters(form, filters)).length;
  const hasFilters = filters.search || filters.role || filters.spa || filters.city;

  return (
    <div className="mb-5 border-y border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <HiOutlineFilter className="h-5 w-5 text-indigo-600" />
          Filters
        </div>
        <p className="text-sm text-slate-500">
          Showing <span className="font-semibold text-slate-900">{filteredCount}</span> of{' '}
          <span className="font-semibold text-slate-900">{hiringForms.length}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(260px,1.4fr)_1fr_1fr_1fr_auto]">
        <label className="relative block">
          <span className="sr-only">Search</span>
          <HiOutlineSearch className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search role, SPA name, city, address, skills..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="h-10 w-full rounded-md border border-slate-300 pl-10 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </label>

        <select
          value={filters.role}
          onChange={(e) => onFilterChange({ ...filters, role: e.target.value })}
          className="h-10 rounded-md border border-slate-300 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          <option value="">All roles</option>
          {uniqueRoles.map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>

        <select
          value={filters.spa}
          onChange={(e) => onFilterChange({ ...filters, spa: e.target.value })}
          className="h-10 rounded-md border border-slate-300 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          <option value="">All SPAs</option>
          {uniqueSpas.map((spa) => (
            <option key={spa} value={spa}>{spa}</option>
          ))}
        </select>

        <select
          value={filters.city}
          onChange={(e) => onFilterChange({ ...filters, city: e.target.value })}
          className="h-10 rounded-md border border-slate-300 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          <option value="">All cities</option>
          {uniqueCities.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>

        {hasFilters && (
          <button
            type="button"
            onClick={() => onFilterChange({ search: '', role: '', spa: '', city: '' })}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <HiX className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default HiringFilter;
