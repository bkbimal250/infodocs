import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { certificateApi } from '../api/Certificates/certificateApi';
import { getCategoryDisplayName } from '../utils/certificateUtils';
import { HiDocumentText, HiTemplate, HiArrowRight } from 'react-icons/hi';

/**
 * Certifications Landing Page
 * Simple page to browse certificate templates
 */
const Certifications = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await certificateApi.getPublicTemplates();
      setTemplates(response.data || []);
    } catch (err) {
      setError('Failed to load certificate templates. Please try again later.');
      console.error('Error loading templates:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Certificate Templates</h1>
          <p className="text-gray-600">Choose a template to create your certificate</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Templates Grid */}
        {templates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden"
              >
                {/* Template Image or Placeholder */}
                <div className="h-48 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                  {template.template_image ? (
                    <img
                      src={template.template_image}
                      alt={template.name || 'Certificate Template'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-full h-full flex items-center justify-center ${template.template_image ? 'hidden' : ''}`}
                  >
                    <HiDocumentText className="w-16 h-16 text-gray-400" />
                  </div>
                </div>

                {/* Template Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">
                      {template.name || 'Untitled Template'}
                    </h3>
                  </div>

                  {template.category && (
                    <div className="mb-3">
                      <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {getCategoryDisplayName(template.category)}
                      </span>
                    </div>
                  )}

                  {template.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {template.description}
                    </p>
                  )}

                  {/* Template Type Badge */}
                  {template.template_type && (
                    <div className="mb-4">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                        <HiTemplate className="w-3 h-3 mr-1" />
                        {template.template_type.toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* Use Template Button */}
                  <button
                    onClick={() => navigate('/certificate-creation', { state: { templateId: template.id } })}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <span>Use Template</span>
                    <HiArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <HiDocumentText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Templates Available</h3>
            <p className="text-gray-600">No certificate templates found. Please check back later.</p>
          </div>
        )}

        {/* Info Section */}
        {templates.length > 0 && (
          <div className="mt-12 bg-blue-50 rounded-lg p-6 border border-blue-200">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 rounded-full p-3">
                <HiDocumentText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How to Use</h3>
                <ol className="list-decimal list-inside text-gray-700 space-y-1 text-sm">
                  <li>Select a template from the options above</li>
                  <li>Fill in the required information</li>
                  <li>Preview and download your certificate</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Certifications;
