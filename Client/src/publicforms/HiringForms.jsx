import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../utils/apiConfig';

/**
 * Hiring Form Submission Page
 * Authenticated users can submit hiring requirements for SPA locations
 */
const HiringForms = () => {
  const [spas, setSpas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    spa_id: '',
    for_role: '',
    description: '',
    required_experience: '',
    required_education: '',
    required_skills: '',
  });

  useEffect(() => {
    loadSpas();
  }, []);

  const loadSpas = async () => {
    try {
      const response = await apiClient.get('/forms/spas');
      setSpas(response.data || []);
    } catch (err) {
      console.error('Failed to load SPAs', err);
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

    // Validate SPA selection
    if (!formData.spa_id) {
      toast.error('Please select a SPA location from the list');
      setLoading(false);
      return;
    }

    try {
      const submitData = {
        ...formData,
        spa_id: parseInt(formData.spa_id),
      };

      const response = await apiClient.post('/forms/hiring-forms', submitData);

      toast.success('Hiring form submitted successfully!');
      
      // Reset form
      setFormData({
        spa_id: '',
        for_role: '',
        description: '',
        required_experience: '',
        required_education: '',
        required_skills: '',
      });
    } catch (err) {
      toast.error(err.response?.data?.detail || err.response?.data?.error || 'Failed to submit hiring form');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Submit Hiring Requirements</h1>
          <p className="text-sm text-gray-600">Post your job requirements for SPA locations</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 space-y-6 border border-gray-100">
          {/* SPA Information */}
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              SPA Information <span className="text-red-500">*</span>
            </h2>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select SPA Location <span className="text-red-500">*</span>
                </label>
                <select
                  name="spa_id"
                  value={formData.spa_id}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    !formData.spa_id 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  <option value="">-- Select SPA Location --</option>
                  {spas.map((spa) => (
                    <option key={spa.id} value={spa.id}>
                      {spa.name} {spa.city ? `(${spa.city})` : ''}
                    </option>
                  ))}
                </select>
                {!formData.spa_id && (
                  <p className="mt-1 text-xs text-red-600">Please select a SPA location from the list</p>
                )}
              </div>
            </div>
          </div>

          {/* Position Details */}
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Position Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role/Position Required <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="for_role"
                  value={formData.for_role}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Therapist, Receptionist, Manager, Beautician"
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="Describe the position, responsibilities, and what you're looking for..."
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Requirements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Experience <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="required_experience"
                  value={formData.required_experience}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., 1 year, 2 years, 3+ years"
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Education <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="required_education"
                  value={formData.required_education}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Diploma Therapist, Diploma Beautician"
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Skills <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="required_skills"
                  value={formData.required_skills}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Therapist, Receptionist, Manager, Beautician"
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-500 mt-1.5">Separate multiple skills with commas</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg text-base font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Submit Hiring Form
                </span>
              )}
            </button>
          </div>
        </form>
        
        {/* Footer */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg text-center">
          <p className="text-xs text-gray-600">
            <span className="font-semibold">Proprietor:</span> Diisha Online Solution
          </p>
        </div>
      </div>
    </div>
  );
};

export default HiringForms;
