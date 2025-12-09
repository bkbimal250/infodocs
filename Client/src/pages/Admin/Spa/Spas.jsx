import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { adminApi } from '../../../api/Admin/adminApi';
import SpaTable from './SpaTable';

/**
 * Admin SPA Management Page
 * View, create, edit, and manage SPA locations
 */
const Spas = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [spas, setSpas] = useState([]);
  const [allSpas, setAllSpas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    search: '',
    activeOnly: false,
  });
  // Get page from URL query params, default to 1
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const itemsPerPage = 15;

  useEffect(() => {
    loadSpas();
  }, []);

  const loadSpas = async () => {
    try {
      setLoading(true);
      const response = await adminApi.forms.getAllSpas();
      const all = response.data || [];
      setAllSpas(all);
      setError(null);
    } catch (err) {
      setError('Failed to load SPAs');
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
      loadSpas();
    } catch (err) {
      setError('Failed to delete SPA');
      console.error(err);
    }
  };

  const handlePageChange = (newPage) => {
    // Update URL query parameter when page changes
    setSearchParams({ page: newPage.toString() });
  };

  useEffect(() => {
    // Apply filters and pagination
    let filtered = allSpas.filter((spa) => {
      if (filter.activeOnly && !spa.is_active) return false;
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        return (
          spa.name?.toLowerCase().includes(searchLower) ||
          (spa.code !== null && spa.code !== undefined && String(spa.code).toLowerCase().includes(searchLower)) ||
          spa.address?.toLowerCase().includes(searchLower) ||
          spa.city?.toLowerCase().includes(searchLower) ||
          spa.state?.toLowerCase().includes(searchLower) ||
          spa.country?.toLowerCase().includes(searchLower) ||
          spa.pincode?.toString().includes(searchLower) ||
          spa.phone_number?.toString().includes(searchLower) ||
          spa.alternate_number?.toString().includes(searchLower) ||
          spa.email?.toLowerCase().includes(searchLower) ||
          spa.website?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });

    // Apply pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setSpas(filtered.slice(startIndex, endIndex));
  }, [allSpas, filter, currentPage]);

  const filteredSpas = allSpas.filter((spa) => {
    if (filter.activeOnly && !spa.is_active) return false;
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      return (
        spa.name?.toLowerCase().includes(searchLower) ||
        (spa.code !== null && spa.code !== undefined && String(spa.code).toLowerCase().includes(searchLower)) ||
        spa.address?.toLowerCase().includes(searchLower) ||
        spa.city?.toLowerCase().includes(searchLower) ||
        spa.state?.toLowerCase().includes(searchLower) ||
        spa.country?.toLowerCase().includes(searchLower) ||
        spa.pincode?.toString().includes(searchLower) ||
        spa.phone_number?.toString().includes(searchLower) ||
        spa.alternate_number?.toString().includes(searchLower) ||
        spa.email?.toLowerCase().includes(searchLower) ||
        spa.website?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">SPA Management</h1>
            <p className="text-[var(--color-text-secondary)]">Manage SPA locations and their details</p>
          </div>
          <button
            onClick={handleAdd}
            className="px-6 py-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-[var(--color-text-inverse)] rounded-lg hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary-dark)] font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New SPA
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
          <div className="bg-[var(--color-bg-primary)] rounded-xl shadow-md p-6 border-l-4 border-[var(--color-primary)] hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">Total SPAs</p>
                <p className="text-3xl font-bold text-[var(--color-text-primary)] mt-2">{filteredSpas.length}</p>
              </div>
              <div className="bg-[var(--color-primary-light)] rounded-full p-3">
                <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-[var(--color-bg-primary)] rounded-xl shadow-md p-6 border-l-4 border-[var(--color-success)] hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">Active SPAs</p>
                <p className="text-3xl font-bold text-[var(--color-success)] mt-2">
                  {filteredSpas.filter((s) => s.is_active).length}
                </p>
              </div>
              <div className="bg-[var(--color-success-light)] rounded-full p-3">
                <svg className="w-6 h-6 text-[var(--color-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-[var(--color-bg-primary)] rounded-xl shadow-md p-6 border-l-4 border-[var(--color-gray-400)] hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">Inactive SPAs</p>
                <p className="text-3xl font-bold text-[var(--color-gray-500)] mt-2">
                  {filteredSpas.filter((s) => !s.is_active).length}
                </p>
              </div>
              <div className="bg-[var(--color-gray-100)] rounded-full p-3">
                <svg className="w-6 h-6 text-[var(--color-gray-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[var(--color-bg-primary)] rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-[var(--color-text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={filter.search}
                  onChange={(e) => {
                    setFilter({ ...filter, search: e.target.value });
                    // Reset to page 1 when search changes
                    if (currentPage !== 1) {
                      setSearchParams({ page: '1' });
                    }
                  }}
                  placeholder="Search by name, address, city, state..."
                  className="w-full pl-10 pr-4 py-2 border border-[var(--color-border-primary)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
                />
              </div>
            </div>
            <div className="flex items-end">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filter.activeOnly}
                  onChange={(e) => {
                    setFilter({ ...filter, activeOnly: e.target.checked });
                    // Reset to page 1 when filter changes
                    if (currentPage !== 1) {
                      setSearchParams({ page: '1' });
                    }
                  }}
                  className="w-4 h-4 rounded border-[var(--color-border-primary)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
                />
                <span className="ml-2 text-sm text-[var(--color-text-primary)]">Show active SPAs only</span>
              </label>
            </div>
          </div>
        </div>

        {/* SPAs Table */}
        <div className="bg-[var(--color-bg-primary)] rounded-xl shadow-md overflow-hidden">
          <SpaTable
            spas={spas}
            onDelete={handleDelete}
            loading={loading}
            currentPage={currentPage}
            totalPages={Math.ceil(filteredSpas.length / itemsPerPage)}
            onPageChange={handlePageChange}
            totalItems={filteredSpas.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      </div>
    </div>
  );
};

export default Spas;

