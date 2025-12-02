import { useState, useEffect } from 'react';
import { adminApi } from '../../../api/Admin/adminApi';

/**
 * Edit Hiring Form Component
 * Modal form to edit hiring form submission
 */
const EditData = ({ hiringForm, isOpen, onSuccess, onCancel }) => {
  const [spas, setSpas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    spa_id: '',
    for_role: '',
    description: '',
    required_experience: '',
    required_education: '',
    required_skills: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadSpas();
      if (hiringForm) {
        setFormData({
          spa_id: hiringForm.spa_id || '',
          for_role: hiringForm.for_role || '',
          description: hiringForm.description || '',
          required_experience: hiringForm.required_experience || '',
          required_education: hiringForm.required_education || '',
          required_skills: hiringForm.required_skills || '',
        });
      }
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, hiringForm]);

  const loadSpas = async () => {
    try {
      const response = await adminApi.forms.getAllSpas();
      setSpas(response.data || []);
    } catch (err) {
      console.error('Failed to load SPAs:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updateData = {
        ...formData,
        spa_id: formData.spa_id ? parseInt(formData.spa_id) : undefined,
      };

      // Remove empty fields
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] === '' || updateData[key] === null) {
          delete updateData[key];
        }
      });

      await adminApi.forms.updateHiringForm(hiringForm.id, updateData);
      setSuccess('Hiring form updated successfully!');
      
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1000);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to update hiring form';
      setError(errorMessage);
      console.error('Update hiring form error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-[var(--color-bg-primary)] rounded-lg shadow-2xl max-w-3xl w-full p-6 transform transition-all border-2 border-[var(--color-border-primary)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-[var(--color-border-primary)]">
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Edit Hiring Form</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-[var(--color-text-secondary)] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 text-green-700 rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SPA Location</label>
              <select
                name="spa_id"
                value={formData.spa_id}
                onChange={handleInputChange}
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
                required
                placeholder="e.g., Therapist, Receptionist, Manager"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                required
                placeholder="Job description and requirements..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Required Experience *</label>
                <input
                  type="text"
                  name="required_experience"
                  value={formData.required_experience}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., 1 year, 2 years"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Required Education *</label>
                <input
                  type="text"
                  name="required_education"
                  value={formData.required_education}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Bachelor's Degree, Diploma"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills *</label>
                <input
                  type="text"
                  name="required_skills"
                  value={formData.required_skills}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Customer Service, Communication"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-[var(--color-border-primary)]">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[var(--color-primary)] text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md hover:shadow-lg transition-all"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Updating...
                  </span>
                ) : (
                  'Update'
                )}
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-[var(--color-bg-secondary)] disabled:opacity-50 font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditData;

