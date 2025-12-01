import { Link } from 'react-router-dom';
import { 
  HiOutlineClipboardList, 
  HiOutlineUserGroup,
  HiOutlineBriefcase,
  HiArrowRight,
  HiPlus
} from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { usersApi } from '../../../api/Users/usersApi';
import CandidatesTable from './CandidatesTable';

/**
 * User Forms Page
 * Shows all submitted candidate forms and provides options to submit new forms
 */
const Forms = () => {
  const navigate = useNavigate();

  const handleEdit = (candidate) => {
    // Edit is handled in CandidatesTable component
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this candidate form? This action cannot be undone.')) {
      return;
    }

    try {
      await usersApi.deleteCandidateForm(id);
      toast.success('Candidate form deleted successfully!');
      // Reload will be handled by CandidatesTable
      window.location.reload();
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to delete candidate form';
      toast.error(errorMessage);
      console.error('Delete candidate form error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Forms</h1>
              <p className="mt-2 text-gray-600">
                View and manage your submitted candidate forms
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/candidate-form"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <HiPlus className="h-5 w-5" />
                <span>Submit Candidate Form</span>
              </Link>
              <Link
                to="/hiring-forms"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <HiPlus className="h-5 w-5" />
                <span>Submit Hiring Form</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Candidate Form Card */}
          <Link
            to="/candidate-form"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <HiOutlineUserGroup className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Candidate Form</h2>
                  <p className="text-sm text-gray-600">Apply for a position</p>
                </div>
              </div>
              <HiArrowRight className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-600 text-sm">
              Submit your candidate information, documents, and application details
            </p>
          </Link>

          {/* Hiring Form Card */}
          <Link
            to="/hiring-forms"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <HiOutlineBriefcase className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Hiring Form</h2>
                  <p className="text-sm text-gray-600">Post job requirements</p>
                </div>
              </div>
              <HiArrowRight className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-600 text-sm">
              Submit hiring requirements for positions you need to fill
            </p>
          </Link>
        </div>

        {/* Submitted Forms Table */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">My Submitted Candidate Forms</h2>
          <CandidatesTable onEdit={handleEdit} onDelete={handleDelete} />
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-start">
            <HiOutlineClipboardList className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Form Submission Guidelines
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>All form submissions require authentication</li>
                <li>Your submissions will be tracked and linked to your account</li>
                <li>You can view, print, and download your submitted forms</li>
                <li>Make sure to provide accurate information</li>
                <li>You can view detailed information by clicking the "View" button</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forms;

