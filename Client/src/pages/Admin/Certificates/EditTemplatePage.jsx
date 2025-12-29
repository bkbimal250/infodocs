import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
 * Edit Template Page
 * Edit an existing certificate template
 */
const EditTemplatePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [template, setTemplate] = useState(null);

  const categoryOptions = useMemo(
    () =>
      Object.entries(CERTIFICATE_CATEGORY_METADATA).map(([value, meta]) => ({
        value,
        label: meta.title,
      })),
    []
  );

  useEffect(() => {
    if (id) {
      loadTemplate();
    }
  }, [id]);

  const loadTemplate = async () => {
    try {
      setLoadingData(true);
      const response = await adminApi.certificates.getTemplates();
      const templates = response.data?.results || response.data || [];
      const foundTemplate = templates.find((t) => t.id === parseInt(id));

      if (!foundTemplate) {
        setError('Template not found');
        return;
      }

      setTemplate(foundTemplate);
      setFormData({
        name: foundTemplate.name,
        banner_image: foundTemplate.banner_image || '',
        category: foundTemplate.category,
        is_active: Boolean(foundTemplate.is_active),
        is_public: Boolean(foundTemplate.is_public),
        template_type: foundTemplate.template_type || TEMPLATE_TYPES.IMAGE,
        template_image: foundTemplate.template_image || '',
        template_html: foundTemplate.template_html || '',
        template_config: foundTemplate.template_config
          ? JSON.stringify(foundTemplate.template_config, null, 2)
          : '{}',
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        'Failed to load template';
      setError(errorMessage);
      console.error('Load template error:', err);
    } finally {
      setLoadingData(false);
    }
  };

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

      await adminApi.certificates.updateTemplate(id, payload);
      navigate('/admin/certificates/templates');
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        'Failed to update template';
      setError(errorMessage);
      console.error('Template update error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/certificates/templates');
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading template...</p>
        </div>
      </div>
    );
  }

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

        {template && (
          <TemplateForm
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            loading={loading}
            categoryOptions={categoryOptions}
            CERTIFICATE_CATEGORY_METADATA={CERTIFICATE_CATEGORY_METADATA}
            editingTemplate={template}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default EditTemplatePage;

