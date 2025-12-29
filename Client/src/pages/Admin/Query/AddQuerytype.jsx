import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { queryApi } from '../../../api/Query/queryApi';
import { FaArrowLeft } from 'react-icons/fa';
import { HiCheckCircle, HiXCircle } from 'react-icons/hi';

/**
 * Admin Add Query Type Page
 * Allows admin to create new query types
 */
const AddQuerytype = () => {
  const navigate = useNavigate();
  const emptyForm = {
    name: '',
    description: '',
    is_active: true,
  };

  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    
    // Clear messages when user starts typing
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleSubmit = async (e, addAnother = false) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await queryApi.createQueryType(formData);
      setSuccess('Query type created successfully!');

      if (addAnother) {
        setFormData(emptyForm);
        setSuccess(null);
        return;
      }

      // Navigate back to query types list after success
      setTimeout(() => {
        navigate('/admin/queries/query-types');
      }, 1000);
    } catch (err) {
      console.error('Error response:', err.response);
      console.error('Full error:', err);
      const detailMsg = err.response?.data?.detail;
      setError(
        (typeof detailMsg === 'string' ? detailMsg : JSON.stringify(detailMsg)) ||
          err.response?.data?.error ||
          'Failed to create query type'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/queries')}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            title="Go back"
          >
            <FaArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">Add Query Type</h1>
            <p className="text-[var(--color-text-secondary)]">Create a new query type for categorization</p>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
            <HiCheckCircle className="w-5 h-5" />
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
            <HiXCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Form */}
        <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Technical Issue, Billing Inquiry, General Question"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">Enter a unique name for this query type</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Optional description for this query type..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">Provide additional details about this query type (optional)</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_active"
                id="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                Active
              </label>
              <p className="text-xs text-gray-500">Inactive query types won't appear in the dropdown</p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/admin/queries/query-types')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save & Add Another'}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Query Type'}
              </button>
            </div>
          </form>
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">About Query Types</h3>
          <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
            <li>Query types help categorize and organize queries</li>
            <li>Users can select a query type when submitting queries (optional)</li>
            <li>Active query types appear in the dropdown, inactive ones are hidden</li>
            <li>Query type names must be unique</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddQuerytype;
