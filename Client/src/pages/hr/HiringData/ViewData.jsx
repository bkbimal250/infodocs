import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi';
import { adminApi } from '../../../api/Admin/adminApi';

/**
 * HR View Hiring Details Component
 * Display detailed information about a hiring form
 */
const ViewData = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hiringForm, setHiringForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      loadHiringForm();
    }
  }, [id]);

  const loadHiringForm = async () => {
    try {
      setLoading(true);
      const response = await adminApi.forms.getHiringForm(id);
      setHiringForm(response.data);
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to load hiring form details';
      setError(errorMessage);
      console.error('Load hiring form error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading hiring form details...</p>
        </div>
      </div>
    );
  }

  if (error || !hiringForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/hr/hiring-data')}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
            <HiArrowLeft className="inline mr-1" /> Back to Hiring Data
          </button>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-red-600">{error || 'Hiring form not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/hr/hiring-data')}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Hiring Data
        </button>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Hiring Form Details</h1>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 w-1/4">
                    Form ID
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    #{hiringForm.id}
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50">
                    SPA Location
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {hiringForm.spa?.name || 'N/A'}
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50">
                    Role/Position
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-semibold">
                    {hiringForm.for_role}
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50">
                    Job Description
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-pre-wrap">
                    {hiringForm.description}
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50">
                    Required Experience
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {hiringForm.required_experience}
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50">
                    Required Education
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {hiringForm.required_education}
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50">
                    Required Skills
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {hiringForm.required_skills}
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50">
                    Created At
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {new Date(hiringForm.created_at).toLocaleString()}
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50">
                    Last Updated
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {new Date(hiringForm.updated_at).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewData;

