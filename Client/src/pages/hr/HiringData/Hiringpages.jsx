import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { hrApi } from '../../../api/hr/hrApi';
import HiringDataTable from './HiringDatatable';
import EditData from './Editdata';
import HiringFilter from './HiringFilter';
import Pagination from '../../common/Pagination';

/**
 * HR Hiring Data Management Page
 * View and manage hiring forms posted by SPAs
 */
const Hiringpages = () => {
  const [hiringForms, setHiringForms] = useState([]);
  const [allHiringForms, setAllHiringForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingForm, setEditingForm] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filter, setFilter] = useState({
    search: '',
    role: '',
    spa: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Helper function to filter forms
  const getFilteredForms = (forms) => {
    return forms.filter((form) => {
      const matchesSearch =
        filter.search === '' ||
        form.for_role?.toLowerCase().includes(filter.search.toLowerCase()) ||
        form.description?.toLowerCase().includes(filter.search.toLowerCase()) ||
        form.required_skills?.toLowerCase().includes(filter.search.toLowerCase()) ||
        (form.spa?.name || form.spa_name_text || '').toLowerCase().includes(filter.search.toLowerCase());
      
      const matchesRole =
        filter.role === '' ||
        form.for_role?.toLowerCase().includes(filter.role.toLowerCase());
      
      const matchesSpa =
        filter.spa === '' ||
        (form.spa?.name || form.spa_name_text || '').toLowerCase().includes(filter.spa.toLowerCase());
      
      return matchesSearch && matchesRole && matchesSpa;
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Apply filters and pagination
    const filtered = getFilteredForms(allHiringForms);
    
    // Apply pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setHiringForms(filtered.slice(startIndex, endIndex));
  }, [allHiringForms, filter, currentPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      const formsRes = await Promise.allSettled([
        hrApi.getHiringForms({ skip: 0, limit: 1000 }),
      ]);

      if (formsRes[0].status === 'fulfilled') {
        setAllHiringForms(formsRes[0].value.data || []);
        setError(null);
      } else {
        setAllHiringForms([]);
        const errorMsg = formsRes[0].reason?.response?.data?.detail || formsRes[0].reason?.response?.data?.error || formsRes[0].reason?.message || 'Failed to load hiring forms';
        setError(errorMsg);
        console.error('Failed to load hiring forms:', formsRes[0].reason);
      }
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilter(newFilters);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleEdit = (form) => {
    setEditingForm(form);
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hiring form? This action cannot be undone.')) {
      return;
    }

    try {
      await hrApi.deleteHiringForm(id);
      await loadData();
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to delete hiring form';
      setError(errorMessage);
      console.error('Delete hiring form error:', err);
    }
  };

  const handleView = (id) => {
    // Navigate to view details page
    window.location.href = `/hr/hiring-data/${id}`;
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setEditingForm(null);
    loadData();
  };

  const handleEditCancel = () => {
    setShowEditModal(false);
    setEditingForm(null);
  };

  if (loading && hiringForms.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-secondary)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-[var(--color-text-secondary)]">Loading hiring forms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-xl p-8">
            <h1 className="text-4xl font-bold mb-3">Hiring Requirements</h1>
            <p className="text-blue-100 text-lg">
              View hiring requirements submitted by users and managers
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

        {/* Info Banner */}
        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">Hiring Requirements</h3>
              <p className="text-sm text-blue-700">
                This page shows hiring requirements submitted by <strong>users and managers</strong>. 
                Hiring posts created by HR or Admin are not displayed here.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <HiringFilter
          hiringForms={allHiringForms}
          filters={filter}
          onFilterChange={handleFilterChange}
        />

        {/* Hiring Form - Removed as HR should not create hiring posts here */}
        {false && (
          <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingForm ? 'Edit Hiring Post' : 'Create New Hiring Post'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SPA Location *</label>
                <select
                  name="spa_id"
                  value={formData.spa_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select SPA Location</option>
                  {spas.map((spa) => (
                    <option key={spa.id} value={spa.id}>
                      {spa.name} - {spa.city}, {spa.state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <input
                  type="text"
                  name="for_role"
                  value={formData.for_role}
                  onChange={handleInputChange}
                  placeholder="e.g., Therapist, Receptionist, Manager"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Job description and requirements..."
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Required Experience *
                  </label>
                  <input
                    type="text"
                    name="required_experience"
                    value={formData.required_experience}
                    onChange={handleInputChange}
                    placeholder="e.g., 1 year, 2 years"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Required Education *
                  </label>
                  <input
                    type="text"
                    name="required_education"
                    value={formData.required_education}
                    onChange={handleInputChange}
                    placeholder="e.g., Bachelor's Degree, Diploma"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Required Skills *
                  </label>
                  <input
                    type="text"
                    name="required_skills"
                    value={formData.required_skills}
                    onChange={handleInputChange}
                    placeholder="e.g., Customer Service, Communication"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingForm ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingForm(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-[var(--color-bg-secondary)]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Hiring Forms Table */}
        <div className="bg-[var(--color-bg-primary)] rounded-lg shadow overflow-hidden">
          <HiringDataTable
            hiringForms={hiringForms}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
          {getFilteredForms(allHiringForms).length > itemsPerPage && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(getFilteredForms(allHiringForms).length / itemsPerPage)}
              onPageChange={setCurrentPage}
              totalItems={getFilteredForms(allHiringForms).length}
              itemsPerPage={itemsPerPage}
            />
          )}
        </div>

        {/* Edit Hiring Form Modal */}
        <EditData
          hiringForm={editingForm}
          isOpen={showEditModal}
          onSuccess={handleEditSuccess}
          onCancel={handleEditCancel}
        />
      </div>
    </div>
  );
};

export default Hiringpages;

