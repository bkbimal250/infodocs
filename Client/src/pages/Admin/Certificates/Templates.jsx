import { useState, useEffect, useMemo } from 'react';
import { useNavigate ,Link} from 'react-router-dom';
import { adminApi } from '../../../api/Admin/adminApi';
import {
  CERTIFICATE_CATEGORIES,
  CERTIFICATE_CATEGORY_METADATA,
  TEMPLATE_TYPES,
} from '../../../utils/certificateConstants';
import TemplateTable from './TemplateComponent/TemplateTable';
import TemplateForm from './TemplateComponent/TemplateForm';

/**
 * Admin Templates Management Page (Legacy - kept for backward compatibility)
 * This component uses the new component structure but maintains the old inline form behavior
 * For new implementations, use TemplatesList, AddTemplatePage, and EditTemplatePage
 */
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

const AdminTemplates = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  const categoryOptions = useMemo(
    () =>
      Object.entries(CERTIFICATE_CATEGORY_METADATA).map(([value, meta]) => ({
        value,
        label: meta.title,
      })),
    []
  );

  useEffect(() => {
    loadTemplates();
  }, []);

  const getCategoryLabel = (categoryValue) =>
    CERTIFICATE_CATEGORY_METADATA[categoryValue]?.title || categoryValue;

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await adminApi.certificates.getTemplates();
      setTemplates(response.data?.results || response.data || []);
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to load templates';
      setError(errorMessage);
      console.error('Load templates error:', err);
    } finally {
      setLoading(false);
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

      if (editingTemplate) {
        await adminApi.certificates.updateTemplate(editingTemplate.id, payload);
      } else {
        await adminApi.certificates.createTemplate(payload);
      }
      setShowForm(false);
      setEditingTemplate(null);
      setFormData(INITIAL_FORM_STATE);
      await loadTemplates();
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to save template';
      setError(errorMessage);
      console.error('Template save error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template) => {
    // Navigate to edit page instead of inline editing
    navigate(`/admin/certificates/templates/${template.id}/edit`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;

    try {
      await adminApi.certificates.deleteTemplate(id);
      await loadTemplates();
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to delete template';
      setError(errorMessage);
      console.error('Delete template error:', err);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTemplate(null);
    setFormData(INITIAL_FORM_STATE);
  };

  if (loading && templates.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Certificate Templates</h1>
          <Link
            to="/admin/certificates/templates/add"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Template
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Template Form - Using new TemplateForm component */}
        {showForm && (
          <TemplateForm
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            loading={loading}
            categoryOptions={categoryOptions}
            CERTIFICATE_CATEGORY_METADATA={CERTIFICATE_CATEGORY_METADATA}
            editingTemplate={editingTemplate}
            onCancel={handleCancel}
          />
        )}

        {/* Templates List - Using new TemplateTable component */}
        <TemplateTable
          templates={templates}
          onEdit={handleEdit}
          onDelete={handleDelete}
          getCategoryLabel={getCategoryLabel}
        />
      </div>
    </div>
  );
};

export default AdminTemplates;

