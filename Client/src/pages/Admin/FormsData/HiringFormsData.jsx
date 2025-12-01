import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiArrowRight } from 'react-icons/hi';
import { adminApi } from '../../../api/Admin/adminApi';
import Pagination from '../../common/Pagination';

/**
 * Hiring Forms Data Management Page
 * View and manage all hiring form submissions
 */
const HiringFormsData = () => {
  const [hiringForms, setHiringForms] = useState([]);
  const [allHiringForms, setAllHiringForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    search: '',
    role: '',
    spa: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    loadHiringForms();
  }, []);

  const loadHiringForms = async () => {
    try {
      setLoading(true);
      const response = await adminApi.forms.getHiringForms(0, 1000);
      setAllHiringForms(response.data || []);
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to load hiring forms';
      setError(errorMessage);
      console.error('Load hiring forms error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Apply filters and pagination
    let filtered = allHiringForms.filter((form) => {
      const matchesSearch =
        filter.search === '' ||
        form.for_role?.toLowerCase().includes(filter.search.toLowerCase()) ||
        form.description?.toLowerCase().includes(filter.search.toLowerCase()) ||
        form.required_skills?.toLowerCase().includes(filter.search.toLowerCase());
      
      const matchesRole =
        filter.role === '' ||
        form.for_role?.toLowerCase().includes(filter.role.toLowerCase());
      
      const matchesSpa =
        filter.spa === '' ||
        (form.spa?.name || form.spa_name_text || '').toLowerCase().includes(filter.spa.toLowerCase());
      
      return matchesSearch && matchesRole && matchesSpa;
    });

    // Apply pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setHiringForms(filtered.slice(startIndex, endIndex));
  }, [allHiringForms, filter, currentPage]);

  const filteredForms = allHiringForms.filter((form) => {
    const matchesSearch =
      filter.search === '' ||
      form.for_role?.toLowerCase().includes(filter.search.toLowerCase()) ||
      form.description?.toLowerCase().includes(filter.search.toLowerCase()) ||
      form.required_skills?.toLowerCase().includes(filter.search.toLowerCase());
    
    const matchesRole =
      filter.role === '' ||
      form.for_role?.toLowerCase().includes(filter.role.toLowerCase());
    
    const matchesSpa =
      filter.spa === '' ||
      (form.spa?.name || form.spa_name_text || '').toLowerCase().includes(filter.spa.toLowerCase());
    
    return matchesSearch && matchesRole && matchesSpa;
  });

  // Get unique roles and SPAs for filters
  const uniqueRoles = [...new Set(allHiringForms.map(f => f.for_role).filter(Boolean))];
  const uniqueSpas = [...new Set(allHiringForms.map(f => f.spa?.name || f.spa_name_text).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading hiring forms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg shadow-xl p-8">
            <h1 className="text-4xl font-bold mb-3">Hiring Forms</h1>
            <p className="text-green-100 text-lg">
              View and manage all hiring requirement submissions
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search by role, description, or skills..."
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={filter.role}
                onChange={(e) => setFilter({ ...filter, role: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                value={filter.spa}
                onChange={(e) => setFilter({ ...filter, spa: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              Showing <span className="font-semibold">{hiringForms.length}</span> of{' '}
              <span className="font-semibold">{filteredForms.length}</span> hiring forms
            </p>
            {(filter.search || filter.role || filter.spa) && (
              <button
                onClick={() => setFilter({ search: '', role: '', spa: '' })}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Hiring Forms List */}
        {filteredForms.length === 0 && !loading ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="w-24 h-24 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-500 text-lg">No hiring forms found</p>
            <p className="text-gray-400 text-sm mt-2">Hiring forms will appear here when submitted</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map((form) => (
              <div
                key={form.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 p-6 border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{form.for_role}</h3>
                    <p className="text-sm text-gray-600">
                      {form.spa?.name || form.spa_name_text || 'N/A'}
                    </p>
                  </div>
                  <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    #{form.id}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">Description</label>
                    <p className="text-sm text-gray-900 line-clamp-3">{form.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-medium text-gray-500 block mb-1">Experience</label>
                      <p className="text-sm text-gray-900">{form.required_experience}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 block mb-1">Education</label>
                      <p className="text-sm text-gray-900">{form.required_education}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">Required Skills</label>
                    <p className="text-sm text-gray-900">{form.required_skills}</p>
                  </div>
                </div>

                <div className="border-t pt-4 flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    {new Date(form.created_at).toLocaleDateString()}
                  </p>
                  <Link
                    to={`/admin/hiring/${form.id}`}
                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    View Details <HiArrowRight className="inline ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        {filteredForms.length > itemsPerPage && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredForms.length / itemsPerPage)}
              onPageChange={setCurrentPage}
              totalItems={filteredForms.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default HiringFormsData;

