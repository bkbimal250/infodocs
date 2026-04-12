import { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../utils/apiConfig';
import { Input, Select, Textarea, Button, Label } from '../ui';
import { apiCache } from '../utils/apiCache';
import SpaSelectionField from './compoenents/SpaSelectionField';

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  const handleSpaSelect = (spa) => {
    if (!spa) {
      setFormData(prev => ({ ...prev, spa_id: '' }));
      setSpaSearch('');
    } else {
      setFormData(prev => ({ ...prev, spa_id: spa.id }));
      setSpaSearch(spa.name);
    }
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    loadSpas();
  }, []);

  const onSpaSearchChange = useCallback((e) => {
    setSpaSearch(e.target.value);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-4 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">

        <form className="bg-white rounded-xl shadow-sm p-4 sm:p-6 space-y-6 border border-gray-500">

          {/* SPA Selection */}
          <SpaSelectionField
            spaSearch={spaSearch}
            handleSpaSearchChange={onSpaSearchChange}
            selectedSpaId={formData.spa_id}
            selectedSpa={spas.find((s) => s.id === formData.spa_id)}
            handleSpaSelect={handleSpaSelect}
            isDropdownOpen={isDropdownOpen}
            setIsDropdownOpen={setIsDropdownOpen}
            filteredSpas={filteredSpas}
            spaLoading={loading && spas.length === 0}
            required={true}
          />

          {/* Position */}
          <div className="bg-gray-50 rounded-xl p-4 border space-y-4">
            <h2 className="text-lg font-semibold">💼 Position Details</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <Label required>Staff Required</Label>
                <Input
                  type="number"
                  name="staff_required"
                  value={formData.staff_required}
                  onChange={handleInputChange}
                  placeholder="e.g. 2"
                />
              </div>

              <div>
                <Label required>Role</Label>
                <Select
                  name="for_role"
                  value={formData.for_role}
                  onChange={handleInputChange}
                  options={role_options.map((r) => ({ value: r, label: r }))}
                  placeholder="Select role"
                />
              </div>

            </div>

            <div>
              <Label required>Description</Label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Describe the job..."
              />
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-gray-50 rounded-xl p-4 border space-y-4">
            <h2 className="text-lg font-semibold">✅ Requirements</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <Label required>Experience</Label>
                <Select
                  name="required_experience"
                  value={formData.required_experience}
                  onChange={handleInputChange}
                  options={experience_options.map((e) => ({ value: e, label: e }))}
                  placeholder="Select experience"
                />
              </div>

              <div>
                <Label required>Education</Label>
                <Input
                  name="required_education"
                  value={formData.required_education}
                  onChange={handleInputChange}
                  placeholder="e.g. Diploma"
                />
              </div>

              <div className="sm:col-span-2">
                <Label required>Skills</Label>
                <Input
                  name="required_skills"
                  value={formData.required_skills}
                  onChange={handleInputChange}
                  placeholder="e.g. Communication, Sales"
                />
              </div>

            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <Button
              type="submit"
              loading={loading}
              fullWidth
            >
              {loading ? 'Submitting...' : 'Submit Hiring Form'}
            </Button>
          </div>

        </form>

        {/* Footer */}
        <div className="mt-4 text-center text-xs sm:text-sm text-gray-600">
          <span className="font-semibold">Proprietor:</span> Disha Online Solution
        </div>

      </div>
    </div>
  );
};

export default HiringForms;
