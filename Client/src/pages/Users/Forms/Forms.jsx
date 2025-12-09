import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiOutlineClipboardList,
  HiOutlineUserGroup,
  HiOutlineBriefcase,
  HiArrowRight,
  HiPlus,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { usersApi } from '../../../api/Users/usersApi';
import CandidatesTable from './CandidatesTable';
import CandidateFilter from './components/CandidateFilter';

/**
 * User Forms Page
 * Shows all submitted candidate forms and provides options to submit new forms
 */
const Forms = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState({
    search: '',
    position: '',
  });

  const handleEdit = (candidate) => {
    // Edit is handled in CandidatesTable component
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this candidate form? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      await usersApi.deleteCandidateForm(id);
      toast.success('Candidate form deleted successfully!');
      // Reload will be handled by CandidatesTable
      window.location.reload();
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        'Failed to delete candidate form';
      toast.error(errorMessage);
      console.error('Delete candidate form error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header / Hero Card */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-lg p-[1px]">
            <div className="bg-[var(--color-bg-primary)] rounded-2xl px-6 py-5 md:px-8 md:py-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                    <HiOutlineUserGroup className="w-6 h-6 text-blue-600" />
                  </span>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">
                      My Candidate Forms
                    </h1>
                    <p className="text-sm md:text-[15px] text-[var(--color-text-secondary)]">
                      Manage all candidate profiles you have submitted for open positions.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-xs md:text-sm text-[var(--color-text-secondary)]">
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1">
                    <HiOutlineBriefcase className="w-4 h-4" />
                    Track candidates by position
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1">
                    <HiOutlineClipboardList className="w-4 h-4" />
                    Edit or remove submissions anytime
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-stretch md:items-end gap-3">
                <Link
                  to="/candidate-form"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 focus-visible:ring-offset-[var(--color-bg-primary)] transition-all"
                >
                  <HiPlus className="h-5 w-5" />
                  <span>Submit Candidate Form</span>
                </Link>
                <button
                  type="button"
                  onClick={() => navigate('/hiring-forms')}
                  className="inline-flex items-center gap-1.5 text-xs md:text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
                >
                  View my hiring requirements
                  <HiArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filter + Table Card */}
        <div className="mb-8 bg-[var(--color-bg-primary)] rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 md:px-6 py-4 border-b border-gray-100 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-base md:text-lg font-semibold text-[var(--color-text-primary)]">
                Submitted Candidate Forms
              </h2>
              <p className="text-xs md:text-sm text-[var(--color-text-secondary)] mt-1">
                Use search and filters to quickly find candidates by name or position.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-bg-secondary)] px-3 py-1 text-[10px] md:text-xs text-[var(--color-text-secondary)]">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100">
                <HiOutlineUserGroup className="w-3.5 h-3.5 text-blue-600" />
              </span>
              Manage your own candidate submissions
            </div>
          </div>

          {/* Filter */}
          <div className="px-4 md:px-6 py-4 border-b border-gray-100">
            <CandidateFilter onFilterChange={setFilter} />
          </div>

          {/* Table */}
          <div className="px-2 md:px-4 pb-4 pt-2">
            <CandidatesTable
              onEdit={handleEdit}
              onDelete={handleDelete}
              filter={filter}
            />
          </div>
        </div>

        {/* Info / Guidelines Section */}
        <div className="mt-6 bg-blue-50 rounded-xl p-5 md:p-6 border border-blue-200 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
                <HiOutlineClipboardList className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div>
              <h3 className="text-base md:text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                Candidate Form Guidelines
              </h3>
              <ul className="list-disc list-inside text-sm md:text-[15px] text-gray-700 space-y-1.5">
                <li>All form submissions require authentication.</li>
                <li>Your submissions are tracked and linked to your account.</li>
                <li>You can view, print, and download your submitted forms.</li>
                <li>Provide complete and accurate information for each candidate.</li>
                <li>Click the “View” button in the table for full candidate details.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forms;
