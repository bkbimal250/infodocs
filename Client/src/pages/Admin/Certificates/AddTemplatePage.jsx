import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../../api/Admin/adminApi';
import {
  CERTIFICATE_CATEGORIES,
  CERTIFICATE_CATEGORY_METADATA,
  TEMPLATE_TYPES,
} from '../../../utils/certificateConstants';
import TemplateForm from './TemplateComponent/TemplateForm';
import { FaArrowLeft } from 'react-icons/fa';

const INITIAL_FORM_STATE = {
  name: '',
  banner_image: '',
  category: CERTIFICATE_CATEGORIES.SPA_THERAPIST,
  is_active: true,
  is_public: true,
  template_type: TEMPLATE_TYPES.IMAGE,
  template_image: '',
  template_html: '',
  template_config: '{}',
};

/**
 * Add Template Page
 * Create a new certificate template
 */
const AddTemplatePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categoryOptions = useMemo(
    () =>
      Object.entries(CERTIFICATE_CATEGORY_METADATA).map(([value, meta]) => ({
        value,
        label: meta.title,
      })),
    []
  );

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let parsedConfig = {};
      if (formData.template_config) {
        try {
          parsedConfig = JSON.parse(formData.template_config);
        } catch (parseErr) {
          setError('Template config must be valid JSON');
          setLoading(false);
          return;
        }
      }

      const payload = {
        name: formData.name.trim(),
        banner_image: formData.banner_image?.trim() || null,
        category: formData.category,
        template_type: formData.template_type,
        is_active: formData.is_active,
        is_public: formData.is_public,
        template_image:
          formData.template_type === TEMPLATE_TYPES.IMAGE
            ? formData.template_image?.trim() || null
            : null,
        template_html:
          formData.template_type === TEMPLATE_TYPES.HTML ? formData.template_html || '' : null,
        template_config: parsedConfig,
      };

      if (formData.template_type === TEMPLATE_TYPES.HTML && !payload.template_html) {
        setError('Please provide HTML content for an HTML template');
        setLoading(false);
        return;
      }

      await adminApi.certificates.createTemplate(payload);
      navigate('/admin/certificates/templates');
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        'Failed to save template';
      setError(errorMessage);
      console.error('Template save error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/certificates/templates');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <button
          onClick={() => navigate('/admin/certificates/templates')}
          className="text-blue-600 hover:text-blue-800 mb-6 flex items-center gap-2 font-medium transition-colors"
        >
          <FaArrowLeft className="mr-1" /> Back to Templates
        </button>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-800 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}

        <TemplateForm
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          loading={loading}
          categoryOptions={categoryOptions}
          CERTIFICATE_CATEGORY_METADATA={CERTIFICATE_CATEGORY_METADATA}
          editingTemplate={null}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default AddTemplatePage;

