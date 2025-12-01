import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../../api/Admin/adminApi';
import HiringDataTable from './Hiringdatatable';
import EditData from './EditData';
import Pagination from '../../common/Pagination';

/**
 * Admin Hiring Management Page
 * View and manage hiring forms posted by SPAs
 */
const AdminHirings = () => {
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
  const itemsPerPage = 20;

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
        adminApi.forms.getHiringForms(0, 1000),
      ]);

      if (formsRes[0].status === 'fulfilled') {
        const forms = formsRes[0].value.data || [];
        setAllHiringForms(forms);
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


  const handleEdit = (form) => {
    setEditingForm(form);
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hiring form? This action cannot be undone.')) {
      return;
    }

    try {
      await adminApi.forms.deleteHiringForm(id);
      await loadData();
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to delete hiring form';
      setError(errorMessage);
      console.error('Delete hiring form error:', err);
    }
  };

  const handleView = (id) => {
    // Navigate to view details page
    window.location.href = `/admin/hiring/${id}`;
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
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hiring Management</h1>
            <p className="mt-2 text-gray-600">View all hiring forms submitted by users</p>
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
                value={filter.search}
                onChange={(e) => {
                  setFilter({ ...filter, search: e.target.value });
                  setCurrentPage(1); // Reset to first page when filter changes
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={filter.role}
                onChange={(e) => {
                  setFilter({ ...filter, role: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Roles</option>
                {[...new Set(allHiringForms.map(f => f.for_role).filter(Boolean))].map((role) => (
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
                onChange={(e) => {
                  setFilter({ ...filter, spa: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All SPAs</option>
                {[...new Set(allHiringForms.map(f => f.spa?.name || f.spa_name_text).filter(Boolean))].map((spa) => (
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
              <span className="font-semibold">{getFilteredForms(allHiringForms).length}</span> hiring forms
            </p>
            {(filter.search || filter.role || filter.spa) && (
              <button
                onClick={() => {
                  setFilter({ search: '', role: '', spa: '' });
                  setCurrentPage(1);
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Hiring Forms Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
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

export default AdminHirings;

