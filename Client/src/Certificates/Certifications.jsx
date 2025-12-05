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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: 'var(--color-info)' }}></div>
          <p className="mt-4" style={{ color: 'var(--color-text-secondary)' }}>Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Certificate Templates</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>Choose a template to create your certificate</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-error-light)', borderColor: 'var(--color-error)', borderWidth: '1px', color: 'var(--color-error-dark)' }}>
            {error}
          </div>
        )}

        {/* Templates Grid */}
        {templates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="rounded-lg shadow-md transition-shadow overflow-hidden"
                style={{ 
                  backgroundColor: 'var(--color-bg-primary)',
                  borderColor: 'var(--color-border-primary)',
                  borderWidth: '1px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                }}
              >
                {/* Template Image or Placeholder */}
                <div 
                  className="h-48 flex items-center justify-center"
                  style={{ background: 'linear-gradient(to bottom right, var(--color-info-light), var(--color-primary-light))' }}
                >
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
                    <HiDocumentText className="w-16 h-16" style={{ color: 'var(--color-text-tertiary)' }} />
                  </div>
                </div>

                {/* Template Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold flex-1" style={{ color: 'var(--color-text-primary)' }}>
                      {template.name || 'Untitled Template'}
                    </h3>
                  </div>

                  {template.category && (
                    <div className="mb-3">
                      <span className="inline-block px-3 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: 'var(--color-info-light)', color: 'var(--color-info-dark)' }}>
                        {getCategoryDisplayName(template.category)}
                      </span>
                    </div>
                  )}

                  {template.description && (
                    <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                      {template.description}
                    </p>
                  )}

                  {/* Template Type Badge */}
                  {template.template_type && (
                    <div className="mb-4">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded" style={{ backgroundColor: 'var(--color-gray-100)', color: 'var(--color-text-primary)' }}>
                        <HiTemplate className="w-3 h-3 mr-1" />
                        {template.template_type.toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* Use Template Button */}
                  <button
                    onClick={() => navigate('/certificate-creation', { state: { templateId: template.id } })}
                    className="w-full px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
                    style={{ 
                      backgroundColor: 'var(--color-info)',
                      color: 'var(--color-text-inverse)'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-info-dark)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-info)'}
                  >
                    <span>Use Template</span>
                    <HiArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 rounded-lg shadow-sm" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
            <HiDocumentText className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-text-tertiary)' }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>No Templates Available</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>No certificate templates found. Please check back later.</p>
          </div>
        )}

        {/* Info Section */}
        {templates.length > 0 && (
          <div className="mt-12 rounded-lg p-6" style={{ backgroundColor: 'var(--color-info-light)', borderColor: 'var(--color-info)', borderWidth: '1px' }}>
            <div className="flex items-start gap-4">
              <div className="rounded-full p-3" style={{ backgroundColor: 'var(--color-info)' }}>
                <HiDocumentText className="w-6 h-6" style={{ color: 'var(--color-text-inverse)' }} />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>How to Use</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm" style={{ color: 'var(--color-text-primary)' }}>
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
