import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../utils/apiConfig';
import PersonalInformation from './compoenents/PersonalInformation';
import DocumentUpload from './compoenents/DocumentUpload';
import { Input, Select, Button, Label } from '../ui';
import { apiCache } from '../utils/apiCache';
import SpaSelectionField from './compoenents/SpaSelectionField';

/**
 * Candidate Form
 * Authenticated users can submit a candidate application form
 */
const CandidateForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [spas, setSpas] = useState([]);
  const [spaSearch, setSpaSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const [formData, setFormData] = useState({
    spa_id: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    current_address: '',
    aadhar_address: '',
    city: '',
    zip_code: '',
    state: '',
    country: 'India',
    phone_number: '',
    alternate_number: '',
    age: '',
    work_experience: '',
    Therapist_experience: '',
    position_applied_for: '',
    education_certificate_courses: '',
  });
  const [files, setFiles] = useState({
    passport_size_photo: null,
    age_proof_document: null,
    aadhar_card_front: null,
    aadhar_card_back: null,
    pan_card: null,
    signature: null,
    documents: [],
  });

  useEffect(() => {
    loadSpas();
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

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleSpaSelect = useCallback((spa) => {
    if (!spa) {
      setFormData(prev => ({ ...prev, spa_id: '' }));
      setSpaSearch('');
    } else {
      setFormData(prev => ({ ...prev, spa_id: spa.id }));
      setSpaSearch(spa.name);
    }
    setIsDropdownOpen(false);
  }, []);

  const onSpaSearchChange = useCallback((e) => {
    setSpaSearch(e.target.value);
  }, []);

  // Reset selected index when filtered list changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [filteredSpas]);



  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    if (name === 'documents') {
      setFiles((prev) => ({
        ...prev,
        documents: Array.from(fileList),
      }));
    } else {
      setFiles((prev) => ({
        ...prev,
        [name]: fileList[0],
      }));
    }
  };

  // Validate current step before proceeding
  const validateStep = (step) => {
    if (step === 1) {
      // Validate SPA selection - must select from database
      if (!formData.spa_id) {
        toast.error('Please select a SPA location from the list');
        return false;
      }
      return true;
    }

    if (step === 2) {
      // Validate required personal information fields
      const requiredFields = [
        'first_name',
        'last_name',
        'current_address',
        'city',
        'zip_code',
        'state',
        'phone_number',
        'age',
        'position_applied_for',
        'work_experience',
        'Therapist_experience'
      ];

      const missingFields = requiredFields.filter(field => !formData[field]?.trim());

      if (missingFields.length > 0) {
        toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate SPA selection - must select from database
    if (!formData.spa_id) {
      toast.error('Please select a SPA location from the list');
      setLoading(false);
      return;
    }

    try {
      const submitData = new FormData();

      // Add form fields
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== '' && formData[key] !== null) {
          if (key === 'spa_id' && formData[key]) {
            submitData.append(key, parseInt(formData[key]));
          } else if (key === 'age') {
            submitData.append(key, parseInt(formData[key]));
          } else {
            submitData.append(key, formData[key]);
          }
        }
      });

      // Don't send spa_name_text as it's not needed when spa_id is selected

      // Add files
      if (files.passport_size_photo) {
        submitData.append('passport_size_photo', files.passport_size_photo);
      }
      if (files.age_proof_document) {
        submitData.append('age_proof_document', files.age_proof_document);
      }
      if (files.aadhar_card_front) {
        submitData.append('aadhar_card_front', files.aadhar_card_front);
      }
      if (files.aadhar_card_back) {
        submitData.append('aadhar_card_back', files.aadhar_card_back);
      }
      if (files.pan_card) {
        submitData.append('pan_card', files.pan_card);
      }
      if (files.signature) {
        submitData.append('signature', files.signature);
      }

      // Add multiple documents
      files.documents.forEach((doc) => {
        submitData.append('documents', doc);
      });

      const response = await apiClient.post('/forms/candidate-forms', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Form submitted successfully!');

      // Reset form
      setFormData({
        spa_id: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        current_address: '',
        aadhar_address: '',
        city: '',
        zip_code: '',
        state: '',
        country: 'India',
        phone_number: '',
        alternate_number: '',
        age: '',
        work_experience: '',
        Therapist_experience: '',
        position_applied_for: '',
        education_certificate_courses: '',
      });
      setFiles({
        passport_size_photo: null,
        age_proof_document: null,
        aadhar_card_front: null,
        aadhar_card_back: null,
        pan_card: null,
        signature: null,
        documents: [],
      });
      // Reset to step 1
      setCurrentStep(1);
    } catch (err) {
      toast.error(err.response?.data?.detail || err.response?.data?.error || 'Failed to submit form');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-4 px-3 sm:px-4">
      <div className="max-w-3xl mx-auto">

        {/* Step Indicator */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-500">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            {[1, 2, 3].map((step, index) => {
              const labels = ['SPA Selection', 'Personal Info', 'Documents'];
              return (
                <div key={step} className="flex items-center gap-3 flex-1">

                  {/* Circle */}
                  <div
                    className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold shrink-0
                  ${currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                  >
                    {currentStep > step ? '✓' : step}
                  </div>

                  {/* Label */}
                  <div className="flex-1">
                    <p
                      className={`text-xs sm:text-sm font-medium
                    ${currentStep >= step ? 'text-blue-600' : 'text-gray-500'}`}
                    >
                      {labels[index]}
                    </p>
                  </div>

                  {/* Line (hidden on mobile) */}
                  {step !== 3 && (
                    <div className={`hidden sm:block h-0.5 flex-1 mx-2
                    ${currentStep > step ? 'bg-blue-600' : 'bg-gray-200'}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <form className="bg-white rounded-xl shadow-sm p-4 sm:p-6 space-y-5 border border-gray-500">

          {/* Step 1 */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="text-blue-600">📍</span>
                SPA Information <span className="text-red-500">*</span>
              </h2>

              <SpaSelectionField
                spaSearch={spaSearch}
                handleSpaSearchChange={onSpaSearchChange}
                selectedSpaId={formData.spa_id}
                selectedSpa={spas.find(s => s.id === formData.spa_id)}
                handleSpaSelect={handleSpaSelect}
                isDropdownOpen={isDropdownOpen}
                setIsDropdownOpen={setIsDropdownOpen}
                filteredSpas={filteredSpas}
                spaLoading={loading && spas.length === 0}
                required={true}
              />


            </div>
          )}

          {/* Step 2 */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <PersonalInformation
                formData={formData}
                handleInputChange={handleInputChange}
              />
            </div>
          )}

          {/* Step 3 */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <DocumentUpload
                files={files}
                handleFileChange={handleFileChange}
                setFiles={setFiles}
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">

            {currentStep > 1 && (
              <Button
                type="button"
                onClick={handlePrevious}
                variant="secondary"
                className="w-full sm:w-auto"
              >
                Previous
              </Button>
            )}

            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={handleNext}
                variant="primary"
                fullWidth
                className="w-full"
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={loading}
                variant="primary"
                fullWidth
                loading={loading}
                className="w-full"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="mt-4 p-3 bg-gray-100 rounded-lg text-center">
          <p className="text-xs sm:text-sm text-gray-600">
            <span className="font-semibold">Proprietor:</span> Diisha Online Solution
          </p>
        </div>

      </div>
    </div>
  );
};

export default CandidateForm;

