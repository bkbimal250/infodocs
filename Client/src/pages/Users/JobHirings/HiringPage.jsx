import { useState, useEffect } from 'react';
import { HiBriefcase, HiLocationMarker, HiCalendar, HiPlus } from 'react-icons/hi';
import { useNavigate, Link } from 'react-router-dom';
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
  const itemsPerPage = 15;

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

      const response = await usersApi.getHiringForms({
        skip: 0,
        limit: 1000,
      });

      const forms = response.data || [];
      setHiringForms(forms);
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        setHiringForms([]);
        setError(
          'Access denied. Please contact administrator to view your submitted hiring forms.'
        );
      } else {
        const errorMessage =
          err.response?.data?.detail ||
          err.response?.data?.error ||
          err.message ||
          'Failed to load your hiring forms';
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
          (form.spa?.name || form.spa_name_text || '')
            .toLowerCase()
            .includes(searchLower)
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
        (form.spa?.name || form.spa_name_text || '')
          .toLowerCase()
          .includes(filters.spa.toLowerCase())
      );
    }

    // Experience filter
    if (filters.experience) {
      filtered = filtered.filter((form) =>
        form.required_experience
          ?.toLowerCase()
          .includes(filters.experience.toLowerCase())
      );
    }

    setFilteredForms(filtered);
    setCurrentPage(1);
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
    if (
      !window.confirm(
        'Are you sure you want to delete this hiring form? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      await usersApi.deleteHiringForm(id);
      toast.success('Hiring form deleted successfully!');
      await loadHiringForms();
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        'Failed to delete hiring form';
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
      <div className="min-h-screen bg-[var(--color-bg-secondary)] flex items-center justify-center px-4">
        <div className="bg-[var(--color-bg-primary)] rounded-2xl shadow-lg px-8 py-6 flex flex-col items-center max-w-sm w-full">
          <div className="w-12 h-12 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin mb-4" />
          <p className="text-[var(--color-text-primary)] font-medium">
            Loading your hiring forms...
          </p>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Please wait a moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-lg p-[1px]">
          <div className="bg-[var(--color-bg-primary)] rounded-2xl px-6 py-5 md:px-8 md:py-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                  <HiBriefcase className="w-6 h-6 text-blue-600" />
                </span>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">
                    My Hiring Forms
                  </h1>
                  <p className="text-sm md:text-[15px] text-[var(--color-text-secondary)]">
                    View, filter and manage your submitted hiring requirements.
                  </p>
                </div>
              </div>
              {!error && (
                <p className="mt-2 text-xs md:text-sm text-[var(--color-text-secondary)]">
                  You currently have{' '}
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    {hiringForms.length}
                  </span>{' '}
                  submission{hiringForms.length === 1 ? '' : 's'}.
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 justify-end">
              <Link
                to="/hiring-forms"
                className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-600 focus-visible:ring-offset-[var(--color-bg-primary)] transition-all"
              >
                <HiPlus className="h-5 w-5" />
                <span>Submit Hiring Form</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 md:px-5 md:py-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <svg
                  className="w-5 h-5 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-red-900 mb-0.5">
                  Unable to load hiring forms
                </h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {!error && hiringForms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-[var(--color-bg-primary)] rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                    Total Submissions
                  </p>
                  <p className="mt-2 text-2xl font-bold text-[var(--color-text-primary)]">
                    {hiringForms.length}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-full p-3">
                  <HiBriefcase className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-[var(--color-bg-primary)] rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                    Different Roles
                  </p>
                  <p className="mt-2 text-2xl font-bold text-[var(--color-text-primary)]">
                    {
                      new Set(
                        hiringForms
                          .map((f) => f.for_role)
                          .filter(Boolean)
                      ).size
                    }
                  </p>
                </div>
                <div className="bg-emerald-50 rounded-full p-3">
                  <HiLocationMarker className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-[var(--color-bg-primary)] rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                    SPA Locations
                  </p>
                  <p className="mt-2 text-2xl font-bold text-[var(--color-text-primary)]">
                    {
                      new Set(
                        hiringForms
                          .map((f) => f.spa?.name || f.spa_name_text)
                          .filter(Boolean)
                      ).size
                    }
                  </p>
                </div>
                <div className="bg-purple-50 rounded-full p-3">
                  <HiCalendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-[var(--color-bg-primary)] rounded-xl border border-gray-100 shadow-sm p-4 md:p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base md:text-lg font-semibold text-[var(--color-text-primary)]">
              Filter & Search
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Narrow down results by role, SPA, experience or keyword.
            </p>
          </div>
          <Hiringfilter
            hiringForms={hiringForms}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Hiring Table */}
        <div className="bg-[var(--color-bg-primary)] rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 px-4 md:px-5 py-3 flex items-center justify-between">
            <h2 className="text-sm md:text-base font-semibold text-[var(--color-text-primary)]">
              Hiring Forms ({filteredForms.length})
            </h2>
            {filteredForms.length > 0 && (
              <p className="text-xs text-[var(--color-text-secondary)]">
                Showing {displayedForms.length} of {filteredForms.length} result
                {filteredForms.length === 1 ? '' : 's'}
              </p>
            )}
          </div>

          <HiringTable
            hiringForms={displayedForms}
            loading={loading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {filteredForms.length === 0 && !loading && !error && (
            <div className="px-6 py-10 text-center text-sm text-[var(--color-text-secondary)]">
              <p className="font-medium text-[var(--color-text-primary)] mb-1">
                No hiring forms found
              </p>
              <p>
                Try adjusting your filters or submit a new hiring form using the
                button above.
              </p>
            </div>
          )}

          {filteredForms.length > itemsPerPage && (
            <div className="border-t border-gray-100 px-4 md:px-5 py-3 bg-[var(--color-bg-secondary)]/60">
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
