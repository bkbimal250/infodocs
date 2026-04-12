import { Link } from 'react-router-dom';
import { HiPlus } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { managerApi } from '../../../api/Manager/managerApi';
import CandidatesTable from './CandidatesTable';

const ManagerCandidates = () => {
  const navigate = useNavigate();

  const handleEdit = (candidate) => { };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this candidate form? This action cannot be undone.')) {
      return;
    }

    try {
      await managerApi.deleteCandidateForm(id);
      toast.success('Candidate form deleted successfully!');
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
    <div className="min-h-screen bg-[var(--color-bg-secondary)] py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            {/* Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
                My Forms
              </h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-[var(--color-text-secondary)]">
                View and manage your submitted candidate forms
              </p>
            </div>

            {/* Button */}
            <Link
              to="/candidate-form"
              className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-4 py-2.5 
                         bg-blue-600 text-white text-sm sm:text-base font-medium 
                         rounded-lg shadow-sm hover:bg-blue-700 active:scale-95 
                         transition-all duration-200"
            >
              <HiPlus className="h-5 w-5" />
              <span>Submit Form</span>
            </Link>

          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white/60 backdrop-blur rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-text-primary)]">
              Submitted Forms
            </h2>
          </div>

          {/* Responsive Table Wrapper */}
          <div className="overflow-x-auto">
            <CandidatesTable onEdit={handleEdit} onDelete={handleDelete} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default ManagerCandidates;