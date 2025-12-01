import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../../api/Admin/adminApi';
import { CERTIFICATE_CATEGORY_METADATA } from '../../../utils/certificateConstants';
import TemplateTable from './TemplateComponent/TemplateTable';

/**
 * Admin Templates List Page
 * View and manage certificate templates
 */
const TemplatesList = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        'Failed to load templates';
      setError(errorMessage);
      console.error('Load templates error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template) => {
    navigate(`/admin/certificates/templates/${template.id}/edit`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;

    try {
      await adminApi.certificates.deleteTemplate(id);
      await loadTemplates();
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        'Failed to delete template';
      setError(errorMessage);
      console.error('Delete template error:', err);
    }
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
          <button
            onClick={() => navigate('/admin/certificates/templates/add')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Template
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

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

export default TemplatesList;

