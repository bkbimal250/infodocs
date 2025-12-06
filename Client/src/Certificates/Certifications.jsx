import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { certificateApi } from '../api/Certificates/certificateApi';
import { getCategoryDisplayName } from '../utils/certificateUtils';
import { HiDocumentText, HiTemplate, HiArrowRight } from 'react-icons/hi';
import { Button, Card } from '../ui';
import { TemplateCardSkeleton } from '../components/LoadingSkeleton';
import { apiCache } from '../utils/apiCache';

/**
 * Memoized Template Card Component
 * Prevents unnecessary re-renders
 */
const TemplateCard = memo(({ template, onClick }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      padding="p-0"
      onClick={onClick}
    >
      {/* Template Image or Placeholder */}
      <div className="h-48 flex items-center justify-center relative bg-gradient-to-br from-blue-100 to-purple-100">
        {template.template_image && !imageError ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
            )}
            <img
              src={template.template_image}
              alt={template.name || 'Certificate Template'}
              className={`w-full h-full object-cover ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
              loading="lazy"
              onError={() => setImageError(true)}
              onLoad={() => setImageLoaded(true)}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <HiDocumentText className="w-16 h-16 text-gray-400" />
          </div>
        )}
      </div>

      {/* Template Info */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold flex-1 text-gray-900">
            {template.name || 'Untitled Template'}
          </h3>
        </div>

        {template.category && (
          <div className="mb-3">
            <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
              {getCategoryDisplayName(template.category)}
            </span>
          </div>
        )}

        {template.description && (
          <p className="text-sm mb-4 line-clamp-2 text-gray-600">
            {template.description}
          </p>
        )}

        {template.template_type && (
          <div className="mb-4">
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700">
              <HiTemplate className="w-3 h-3 mr-1" />
              {template.template_type.toUpperCase()}
            </span>
          </div>
        )}

        <Button
          variant="primary"
          fullWidth
          className="flex items-center justify-center gap-2"
        >
          <span>Use Template</span>
          <HiArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
});

TemplateCard.displayName = 'TemplateCard';

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

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check cache first
      const cacheKey = '/certificates/templates';
      const cached = apiCache.get(cacheKey);
      
      if (cached) {
        setTemplates(cached);
        setLoading(false);
        return;
      }
      
      const response = await certificateApi.getPublicTemplates();
      const templates = response.data || [];
      setTemplates(templates);
      
      // Cache the response
      apiCache.set(cacheKey, {}, templates);
    } catch (err) {
      setError('Failed to load certificate templates. Please try again later.');
      console.error('Error loading templates:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleTemplateClick = useCallback((templateId) => {
    navigate('/certificate-creation', { state: { templateId } });
  }, [navigate]);

  const memoizedTemplates = useMemo(() => templates, [templates]);

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2 text-gray-900">Certificate Templates</h1>
            <p className="text-gray-600">Choose a template to create your certificate</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <TemplateCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Certificate Templates</h1>
          <p className="text-gray-600">Choose a template to create your certificate</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
            {error}
          </div>
        )}

        {/* Templates Grid */}
        {memoizedTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memoizedTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onClick={() => handleTemplateClick(template.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 rounded-lg shadow-sm bg-white">
            <HiDocumentText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2 text-gray-900">No Templates Available</h3>
            <p className="text-gray-600">No certificate templates found. Please check back later.</p>
          </div>
        )}

        {/* Info Section */}
        {memoizedTemplates.length > 0 && (
          <div className="mt-12 rounded-lg p-6 bg-blue-50 border border-blue-200">
            <div className="flex items-start gap-4">
              <div className="rounded-full p-3 bg-blue-600">
                <HiDocumentText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">How to Use</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
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
