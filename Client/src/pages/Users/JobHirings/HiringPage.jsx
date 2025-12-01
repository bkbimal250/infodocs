import { useState, useEffect } from 'react';
import { HiBriefcase, HiLocationMarker, HiCalendar } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { usersApi } from '../../../api/Users/usersApi';
import HiringTable from './HiringTable';
import Hiringfilter from './Hiringfilter';
import EditData from './EditData';
import Pagination from '../../common/Pagination';

/**
 * User Job Hirings Page
 * View user's own submitted hiring forms
 */
const HiringPage = () => {
  const navigate = useNavigate();
  const [hiringForms, setHiringForms] = useState([]);
  const [filteredForms, setFilteredForms] = useState([]);
  const [displayedForms, setDisplayedForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingForm, setEditingForm] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    spa: '',
    experience: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    loadHiringForms();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, hiringForms]);

  useEffect(() => {
    // Apply pagination to filtered forms
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedForms(filteredForms.slice(startIndex, endIndex));
  }, [filteredForms, currentPage]);

  const loadHiringForms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get user's own hiring forms - try to filter by current user
      // The backend should automatically filter by current_user.id for regular users
      const response = await usersApi.getHiringForms({
        skip: 0,
        limit: 1000,
      });
      
      const forms = response.data || [];
      // If backend doesn't filter automatically, filter client-side by checking created_by
      // For now, we'll trust the backend to filter correctly
      setHiringForms(forms);
    } catch (err) {
      // If endpoint requires admin/manager role, try alternative approach
      if (err.response?.status === 403 || err.response?.status === 401) {
        setHiringForms([]);
        setError('Access denied. Please contact administrator to view your submitted hiring forms.');
      } else {
        const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to load your hiring forms';
        setError(errorMessage);
        console.error('Load hiring forms error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...hiringForms];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (form) =>
          form.for_role?.toLowerCase().includes(searchLower) ||
          form.description?.toLowerCase().includes(searchLower) ||
          form.required_skills?.toLowerCase().includes(searchLower) ||
          (form.spa?.name || form.spa_name_text || '').toLowerCase().includes(searchLower)
      );
    }

    // Role filter
    if (filters.role) {
      filtered = filtered.filter((form) =>
        form.for_role?.toLowerCase().includes(filters.role.toLowerCase())
      );
    }

    // SPA filter
    if (filters.spa) {
      filtered = filtered.filter((form) =>
        (form.spa?.name || form.spa_name_text || '').toLowerCase().includes(filters.spa.toLowerCase())
      );
    }

    // Experience filter
    if (filters.experience) {
      filtered = filtered.filter((form) =>
        form.required_experience?.toLowerCase().includes(filters.experience.toLowerCase())
      );
    }

    setFilteredForms(filtered);
  };

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  const handleView = (id) => {
    navigate(`/user/job-hirings/${id}`);
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
      await usersApi.deleteHiringForm(id);
      toast.success('Hiring form deleted successfully!');
      await loadHiringForms();
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to delete hiring form';
      toast.error(errorMessage);
      console.error('Delete hiring form error:', err);
    }
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setEditingForm(null);
    loadHiringForms();
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
          <p className="mt-4 text-gray-600">Loading job openings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <HiBriefcase className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">My Hiring Forms</h1>
          </div>
          <p className="text-gray-600 ml-11">
            View and manage your submitted hiring requirements
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-red-900 mb-1">Error Loading Jobs</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {!error && hiringForms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{hiringForms.length}</p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <HiBriefcase className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Different Roles</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {new Set(hiringForms.map((f) => f.for_role).filter(Boolean)).size}
                  </p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <HiLocationMarker className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">SPA Locations</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {new Set(hiringForms.map((f) => f.spa?.name || f.spa_name_text).filter(Boolean)).size}
                  </p>
                </div>
                <div className="bg-purple-100 rounded-full p-3">
                  <HiCalendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <Hiringfilter
          hiringForms={hiringForms}
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        {/* Hiring Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <HiringTable 
            hiringForms={displayedForms} 
            loading={loading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          {filteredForms.length > itemsPerPage && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredForms.length / itemsPerPage)}
              onPageChange={setCurrentPage}
              totalItems={filteredForms.length}
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

export default HiringPage;

