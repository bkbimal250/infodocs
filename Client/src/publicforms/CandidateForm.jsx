import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../utils/apiConfig';
import PersonalInformation from './compoenents/PersonalInformation';
import DocumentUpload from './compoenents/DocumentUpload';

/**
 * Candidate Form
 * Authenticated users can submit a candidate application form
 */
const CandidateForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [spas, setSpas] = useState([]);
  const [loading, setLoading] = useState(false);
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
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: value,
      };
      
      return newData;
    });
  };

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-4 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-4">
       
        </div>

        {/* Step Indicator */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              {/* Step 1 */}
              <div className="flex items-center gap-2 flex-1">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm ${
                  currentStep >= 1 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > 1 ? '✓' : '1'}
                </div>
                <div className="flex-1">
                  <div className={`text-xs font-medium ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>
                    SPA Selection
                  </div>
                </div>
              </div>
              
              {/* Connector */}
              <div className={`h-0.5 flex-1 mx-2 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              
              {/* Step 2 */}
              <div className="flex items-center gap-2 flex-1">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm ${
                  currentStep >= 2 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > 2 ? '✓' : '2'}
                </div>
                <div className="flex-1">
                  <div className={`text-xs font-medium ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>
                    Personal Info
                  </div>
                </div>
              </div>
              
              {/* Connector */}
              <div className={`h-0.5 flex-1 mx-2 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              
              {/* Step 3 */}
              <div className="flex items-center gap-2 flex-1">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm ${
                  currentStep >= 3 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  3
                </div>
                <div className="flex-1">
                  <div className={`text-xs font-medium ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-500'}`}>
                    Documents
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-4 space-y-4 border border-gray-100">
          {/* Step 1: SPA Information */}
          {currentStep === 1 && (
            <div className="border-b border-gray-200 pb-3">
              <h2 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                SPA Information <span className="text-red-500">*</span>
              </h2>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    SPA Location <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="spa_id"
                    value={formData.spa_id}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent ${
                      !formData.spa_id 
                        ? 'border-red-300' 
                        : 'border-gray-300'
                    }`}
                  >
                    <option value="">-- Select SPA --</option>
                    {spas.map((spa) => (
                      <option key={spa.id} value={spa.id}>
                        {spa.name}
                      </option>
                    ))}
                  </select>
                  {!formData.spa_id && (
                    <p className="mt-1 text-xs text-red-600">Please select a SPA location from the list</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Personal Information Component */}
          {currentStep === 2 && (
            <PersonalInformation formData={formData} handleInputChange={handleInputChange} />
          )}

          {/* Step 3: Document Upload Component */}
          {currentStep === 3 && (
            <DocumentUpload 
              files={files} 
              handleFileChange={handleFileChange} 
              setFiles={setFiles}
            />
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-2 pt-3 border-t border-gray-200">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded text-sm font-semibold hover:bg-gray-300 transition-all"
              >
                Previous
              </button>
            )}
            
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded text-sm font-semibold hover:from-blue-700 hover:to-purple-700 shadow hover:shadow-md transition-all"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded text-sm font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow hover:shadow-md transition-all"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting...
                  </span>
                ) : (
                  'Submit Application'
                )}
              </button>
            )}
          </div>
        </form>
        
        {/* Proprietor Information */}
        <div className="mt-4 p-2 bg-gray-100 rounded text-center">
          <p className="text-xs text-gray-600">
            <span className="font-semibold">Proprietor:</span> Diisha Online Solution
          </p>
        </div>
      </div>
    </div>
  );
};

export default CandidateForm;

