import { useState, useEffect } from 'react';
import { queryApi } from '../../../api/Query/queryApi';
import { HiCheckCircle, HiXCircle, HiPaperAirplane } from 'react-icons/hi';
import SelectSpa from '../../common/Selectspa';

/**
 * Manager Send Query Page
 * Manager can send queries to admin
 */
const SendQueries = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    spa_id: '',
    query_type_id: '',
    query: '',
    contact_number: '',
  });
  const [queryTypes, setQueryTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadQueryTypes();
  }, []);

  const loadQueryTypes = async () => {
    try {
      const response = await queryApi.getQueryTypes();
      setQueryTypes(response.data || []);
    } catch (err) {
      console.error('Error loading query types:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await queryApi.createQuery(formData);
      setSuccess('Query submitted successfully! Admin will review and respond soon.');
      setFormData({
        spa_id: '',
        query_type_id: '',
        query: '',
        contact_number: '',
      });
      // Call onSuccess callback if provided
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to submit query';
      setError(errorMessage);
      console.error('Submit query error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 text-green-800 rounded-lg shadow-sm flex items-start gap-3">
            <HiCheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p className="flex-1">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-800 rounded-lg shadow-sm flex items-start gap-3">
            <HiXCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p className="flex-1">{error}</p>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <SelectSpa
              value={formData.spa_id}
              onChange={handleChange}
              role="spa_manager"
              required
              label="SPA"
            />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Query Type <span className="text-gray-400 font-normal text-xs">(Optional)</span>
              </label>
              <select
                name="query_type_id"
                value={formData.query_type_id}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
              >
                <option value="">Select Query Type</option>
                {queryTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Query <span className="text-red-500">*</span>
              </label>
              <textarea
                name="query"
                value={formData.query}
                onChange={handleChange}
                required
                rows={6}
                placeholder="Describe your query or issue in detail..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contact Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
                required
                placeholder="Enter your contact number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow-md transition-all"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <HiPaperAirplane className="w-5 h-5" />
                    Submit Query
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <HiCheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Important Information</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Your query will be reviewed by admin</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>You will receive updates on the status of your query</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Admin may contact you using the provided contact number</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
    </div>
  );
};

export default SendQueries;
