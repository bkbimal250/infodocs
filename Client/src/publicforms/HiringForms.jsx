import { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../utils/apiConfig';
import { Input, Select, Textarea, Button, Label } from '../ui';
import { apiCache } from '../utils/apiCache';
import { debounce } from '../utils/debounce';

/**
 * Hiring Form Submission Page
 * Authenticated users can submit hiring requirements for SPA locations
 */
const role_options = [
  'Therapist',
  'Receptionist',
  'Manager',
  'Beautician',
  'House Keeping',

];

const experience_options = [
  '0-1 year',
  '1-2 years',
  '2-3 years',
  '3-4 years',
  '4+ years',
];




const HiringForms = () => {
  const [spas, setSpas] = useState([]);
  const [spaSearch, setSpaSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    spa_id: '',
    staff_required: '',
    for_role: '',
    description: '',
    required_experience: '',
    required_education: '',
    required_skills: '',
  });

  useEffect(() => {
    loadSpas();
  }, []);

  const loadSpas = useCallback(async () => {
    try {
      // Check cache first
      const cacheKey = '/forms/spas';
      const cached = apiCache.get(cacheKey);
      
      if (cached) {
        setSpas(cached);
        return;
      }
      
      const response = await apiClient.get('/forms/spas');
      const spasData = response.data || [];
      setSpas(spasData);
      
      // Cache the response
      apiCache.set(cacheKey, {}, spasData);
    } catch (err) {
      console.error('Failed to load SPAs', err);
    }
  }, []);

  const filteredSpas = useMemo(() => {
    if (!spaSearch) return spas;
    const term = spaSearch.toLowerCase();
    return spas.filter((spa) => {
      return (
        spa.name?.toLowerCase().includes(term) ||
        (spa.code !== null && spa.code !== undefined && String(spa.code).includes(term)) ||
        spa.area?.toLowerCase().includes(term) ||
        spa.city?.toLowerCase().includes(term)
      );
    });
  }, [spas, spaSearch]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

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
        staff_required: parseInt(formData.staff_required),
      };

      const response = await apiClient.post('/forms/hiring-forms', submitData);

      toast.success('Hiring form submitted successfully!');
      
      // Reset form
      setFormData({
        spa_id: '',
        staff_required: '',
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8 space-y-8 border border-gray-100">
          {/* SPA Information */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span>SPA Information</span>
              <span className="text-red-500 text-lg">*</span>
            </h2>
            <div className="space-y-4">
              <div>
                <Label required className="mb-3">
                  Select SPA Location
                </Label>

                {/* SPA Search */}
                <div className="relative mb-3">
                  <Input
                    type="text"
                    value={spaSearch}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSpaSearch(value);
                      // Clear selection if current selected SPA is not in filtered results
                      if (formData.spa_id) {
                        const selectedSpa = filteredSpas.find(
                          (s) => s.id === parseInt(formData.spa_id)
                        );
                        if (!selectedSpa) {
                          setFormData((prev) => ({ ...prev, spa_id: '' }));
                        }
                      }
                    }}
                    placeholder="Search by name, code, area, or city..."
                    className="pl-10 pr-20"
                  />
                  {spaSearch && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">
                      {filteredSpas.length} {filteredSpas.length === 1 ? 'result' : 'results'}
                    </span>
                  )}
                </div>

                <select
                  name="spa_id"
                  value={formData.spa_id}
                  onChange={handleInputChange}
                  required
                  size={spaSearch ? Math.min(filteredSpas.length + 1, 8) : 1}
                  className={`w-full px-4 py-3 text-sm border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-medium ${
                    !formData.spa_id 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300 bg-white hover:border-purple-300'
                  } ${spaSearch ? 'overflow-y-auto' : ''}`}
                >
                  <option value="">
                    -- Select SPA Location
                    {spaSearch && filteredSpas.length > 0 ? ` (${filteredSpas.length} found)` : ''}
                    --
                  </option>
                  {filteredSpas.length > 0 ? (
                    filteredSpas.map((spa) => (
                      <option key={spa.id} value={spa.id}>
                        {spa.code ? `[${spa.code}] ` : ''}
                        {spa.name}
                        {spa.area ? ` - ${spa.area}` : ''}
                        {spa.city ? `, ${spa.city}` : ''}
                      </option>
                    ))
                  ) : spaSearch ? (
                    <option value="" disabled>
                      No SPAs found matching "{spaSearch}"
                    </option>
                  ) : (
                    spas.map((spa) => (
                      <option key={spa.id} value={spa.id}>
                        {spa.code ? `[${spa.code}] ` : ''}
                        {spa.name}
                        {spa.area ? ` - ${spa.area}` : ''}
                        {spa.city ? `, ${spa.city}` : ''}
                      </option>
                    ))
                  )}
                </select>
                {!formData.spa_id && !spaSearch && (
                  <p className="mt-1 text-xs text-red-600">
                    Please select a SPA location from the list
                  </p>
                )}
                {spaSearch && filteredSpas.length === 0 && (
                  <p className="mt-1 text-xs text-amber-600">
                    No SPAs found. Try a different search term.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Position Details */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <div className="p-2 bg-pink-100 rounded-lg">
                <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span>Position Details</span>
            </h2>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label required className="mb-2">
                    Number of Staff Required
                  </Label>
                  <Input
                    type="number"
                    name="staff_required"
                    value={formData.staff_required}
                    onChange={handleInputChange}
                    required
                    min="1"
                    step="1"
                    placeholder="e.g., 2, 5, 10"
                  />
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Enter the number of staff members needed for this position
                  </p>
                </div>
                <div>
                  <Label required className="mb-2">
                    Role/Position Required
                  </Label>
                  <Select
                    value={formData.for_role}
                    name="for_role"
                    onChange={handleInputChange}
                    required
                    options={role_options.map((role) => ({
                      value: role,
                      label: role
                    }))}
                    placeholder="-- Select Role --"
                  />
                </div>
              </div>
              <div>
                <Label required className="mb-2">
                  Job Description
                </Label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  placeholder="Describe the position, responsibilities, and what you're looking for..."
                />
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Provide a detailed description to attract the right candidates
                </p>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span>Requirements</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label required className="mb-2">
                  Required Experience
                </Label>
                <Select
                  value={formData.required_experience}
                  name="required_experience"
                  onChange={handleInputChange}
                  required
                  options={experience_options.map((experience) => ({
                    value: experience,
                    label: experience
                  }))}
                  placeholder="-- Select Experience --"
                />
              </div>
              <div>
                <Label required className="mb-2">
                  Required Education
                </Label>
                <Input
                  type="text"
                  name="required_education"
                  value={formData.required_education}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Diploma Therapist, Diploma Beautician"
                />
              </div>
              <div className="md:col-span-2">
                <Label required className="mb-2">
                  Required Skills
                </Label>
                <Input
                  type="text"
                  name="required_skills"
                  value={formData.required_skills}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Communication skills, Customer service, Team management"
                />
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Separate multiple skills with commas
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              fullWidth
              loading={loading}
            >
              {loading ? 'Submitting...' : 'Submit Hiring Form'}
            </Button>
          </div>
        </form>
        
        {/* Footer */}
        <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl text-center border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-700">
            <span className="font-bold text-gray-900">Proprietor:</span> Disha Online Solution
          </p>
        </div>
      </div>
    </div>
  );
};

export default HiringForms;
