import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { adminApi } from '../../../api/Admin/adminApi';
import SpaTable from './SpaTable';
import SpasFilter from './SpasFilter';
const Spas = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [spas, setSpas] = useState([]); // Filtered SPAs for current view
  const [allSpas, setAllSpas] = useState([]); // All SPAs for stats and filter options
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync filters with URL search params
  const filters = {
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    state: searchParams.get('state') || '',
    status: searchParams.get('status') || '',
  };

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const itemsPerPage = 8; // Smaller page size for better UI with more filters

  useEffect(() => {
    // Initial load to get all data (for stats and filter options)
    loadAllSpas();
  }, []);

  useEffect(() => {
    // Fetch filtered data whenever filters change
    loadFilteredSpas();
  }, [searchParams]);

  const loadAllSpas = async () => {
    try {
      const response = await adminApi.forms.getAllSpas();
      setAllSpas(response.data || []);
    } catch (err) {
      console.error('Failed to load all SPAs for metadata:', err);
    }
  };

  const loadFilteredSpas = async () => {
    try {
      setLoading(true);
      const response = await adminApi.forms.getAllSpas({
        search: filters.search,
        city: filters.city,
        state: filters.state,
        status: filters.status
      });
      setSpas(response.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load filtered SPAs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    navigate('/admin/spas/add');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this SPA?')) {
      return;
    }

    try {
      await adminApi.forms.deleteSpa(id);
      loadFilteredSpas();
      loadAllSpas();
    } catch (err) {
      setError('Failed to delete SPA');
      console.error(err);
    }
  };

  const handleFilterChange = (newFilters) => {
    const params = new URLSearchParams();
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.city) params.set('city', newFilters.city);
    if (newFilters.state) params.set('state', newFilters.state);
    if (newFilters.status) params.set('status', newFilters.status);
    params.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  // Extract unique cities and states from allSpas for the filter dropdowns
  const uniqueCities = [...new Set(allSpas.map(s => s.city).filter(Boolean))].sort();
  const uniqueStates = [...new Set(allSpas.map(s => s.state).filter(Boolean))].sort();

  // Paginated view of filtered SPAs
  const paginatedSpas = spas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading && spas.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-secondary)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto"></div>
          <p className="mt-4 text-[var(--color-text-secondary)]">Loading SPAs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-bg-secondary)] to-[var(--color-gray-100)] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">SPA Management</h1>
            <p className="text-gray-500 font-medium tracking-tight">Manage and filter your global SPA locations</p>
          </div>
          <button
            onClick={handleAdd}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md active:scale-95 transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add SPA
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[var(--color-error-light)] border-l-4 border-[var(--color-error)] text-[var(--color-error-dark)] rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total SPAs</p>
                <p className="text-2xl font-black text-gray-800 mt-1">{allSpas.length}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Result</p>
                <p className="text-2xl font-black text-green-600 mt-1">
                  {spas.filter((s) => s.is_active).length}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Matching Filters</p>
                <p className="text-2xl font-black text-orange-600 mt-1">
                  {spas.length}
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* New Filters Component */}
        <SpasFilter
          filters={filters}
          onFilterChange={handleFilterChange}
          cities={uniqueCities}
          states={uniqueStates}
          onClear={handleClearFilters}
        />

        {/* SPAs Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <SpaTable
            spas={paginatedSpas}
            onDelete={handleDelete}
            loading={loading}
            currentPage={currentPage}
            totalPages={Math.ceil(spas.length / itemsPerPage)}
            onPageChange={handlePageChange}
            totalItems={spas.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      </div>
    </div>
  );
};

export default Spas;

