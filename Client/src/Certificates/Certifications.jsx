import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { certificateApi } from '../api/Certificates/certificateApi';
import { getCategoryDisplayName } from '../utils/certificateUtils';
import { CERTIFICATE_CATEGORIES, CERTIFICATE_CATEGORY_METADATA } from '../utils/certificateConstants';
import { HiDocumentText, HiTemplate, HiArrowRight, HiFilter, HiX } from 'react-icons/hi';
import { Button, Card } from '../ui';
import { TemplateCardSkeleton } from '../components/LoadingSkeleton';
import { apiCache } from '../utils/apiCache';

/**
 * Memoized Template Card Component
 * Prevents unnecessary re-renders
 */
const TemplateImage = '/bgimages/templateImage.jpg';

const TemplateCard = memo(({ template, onClick }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  return (
    <div
      className="card card-compact overflow-hidden border-none shadow-soft hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      {/* Template Image or Placeholder */}
      <div className="h-44 flex items-center justify-center relative bg-gray-50/50 overflow-hidden">
        {(template.banner_image || template.template_image) && !imageError ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-100 animate-pulse"></div>
            )}
            <img
              src={template.banner_image || template.template_image}
              alt={template.name || 'Certificate Template'}
              className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
              onError={() => setImageError(true)}
              onLoad={() => setImageLoaded(true)}
            />
          </>
        ) : (
          <img
            src={TemplateImage}
            alt={template.name || 'Certificate Template'}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>

      {/* Template Info */}
      <div className="p-4">
        <h3 className="text-sm font-black text-gray-900 mb-2 truncate">
          {template.name || 'Untitled Template'}
        </h3>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {template.category && (
            <span className="badge badge-info">
              {getCategoryDisplayName(template.category)}
            </span>
          )}
          {template.template_variant && (
            <span className="badge badge-success bg-secondary/10 text-secondary border-secondary/10">
              {template.template_variant}
            </span>
          )}
          {template.template_type && (
            <span className="badge bg-gray-100 text-gray-500 border-gray-200">
              {template.template_type}
            </span>
          )}
        </div>

        {template.description && (
          <p className="text-[10px] font-bold text-gray-400 mb-4 line-clamp-2 leading-relaxed">
            {template.description}
          </p>
        )}

        <button
          className="btn btn-primary w-full"
        >
          <span>Use Template</span>
          <HiArrowRight size={12} />
        </button>
      </div>
    </div>
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
  const [templatesByCategory, setTemplatesByCategory] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'grouped'

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

  // Load templates by category when category is selected
  useEffect(() => {
    if (selectedCategory) {
      loadTemplatesByCategory(selectedCategory);
    }
  }, [selectedCategory]);

  const loadTemplatesByCategory = useCallback(async (category) => {
    try {
      const response = await certificateApi.getTemplatesByCategory(category);
      const variants = response.data || {};
      setTemplatesByCategory(prev => ({ ...prev, [category]: variants }));
    } catch (err) {
      console.error('Error loading templates by category:', err);
    }
  }, []);

  // Get available variants for selected category
  const availableVariants = useMemo(() => {
    if (!selectedCategory || !templatesByCategory[selectedCategory]) return [];
    return Object.keys(templatesByCategory[selectedCategory]);
  }, [selectedCategory, templatesByCategory]);

  // Filter templates based on selected category and variant
  const filteredTemplates = useMemo(() => {
    if (!selectedCategory) return templates;

    const categoryVariants = templatesByCategory[selectedCategory];
    if (!categoryVariants) {
      // Fallback to filtering from all templates
      return templates.filter(t => t.category === selectedCategory);
    }

    if (selectedVariant && categoryVariants[selectedVariant]) {
      return categoryVariants[selectedVariant];
    }

    // Return all templates for selected category (all variants)
    // Use a Map to ensure unique templates by ID (in case same template appears in multiple variants)
    const uniqueTemplatesMap = new Map();
    Object.values(categoryVariants).flat().forEach(template => {
      if (template && template.id) {
        uniqueTemplatesMap.set(template.id, template);
      }
    });
    return Array.from(uniqueTemplatesMap.values());
  }, [templates, selectedCategory, selectedVariant, templatesByCategory]);

  const handleTemplateClick = useCallback((templateId) => {
    navigate('/certificate-creation', { state: { templateId } });
  }, [navigate]);

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
    <div className="min-h-screen py-8 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-4xl font-black mb-2 text-gray-900 tracking-tighter">Certificate Templates</h1>
          <p className="text-sm font-bold text-gray-400  tracking-widest">Choose a premium template to initialize your creation</p>
        </div>

        {/* Filters */}
        <div className="mb-6 card card-compact bg-white/70 backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 pl-2">
              <HiFilter className="w-5 h-5 text-gray-300" />
              <span className="text-[10px] font-black text-gray-400  tracking-widest">Filters</span>
            </div>

            {/* Category Filter */}
            <div className="flex-1 min-w-[200px]">
              <select
                value={selectedCategory || ''}
                onChange={(e) => {
                  setSelectedCategory(e.target.value || null);
                  setSelectedVariant(null);
                }}
                className="input"
              >
                <option value="">All Categories</option>
                {Object.values(CERTIFICATE_CATEGORIES).map((category) => (
                  <option key={category} value={category}>
                    {CERTIFICATE_CATEGORY_METADATA[category]?.title || getCategoryDisplayName(category)}
                  </option>
                ))}
              </select>
            </div>

            {/* Variant Filter */}
            {selectedCategory && availableVariants.length > 0 && (
              <div className="flex-1 min-w-[200px]">
                <select
                  value={selectedVariant || ''}
                  onChange={(e) => setSelectedVariant(e.target.value || null)}
                  className="input"
                >
                  <option value="">All Variants</option>
                  {availableVariants.map((variant) => (
                    <option key={variant} value={variant}>
                      {variant === 'default' ? 'Default' : variant.charAt(0).toUpperCase() + variant.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Clear Filters */}
            {(selectedCategory || selectedVariant) && (
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedVariant(null);
                }}
                className="btn btn-ghost text-red-500 hover:bg-red-50"
              >
                <HiX size={14} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
            {error}
          </div>
        )}

        {/* Templates Grid */}
        {filteredTemplates.length > 0 ? (
          <>
            {selectedCategory && (
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {CERTIFICATE_CATEGORY_METADATA[selectedCategory]?.title || getCategoryDisplayName(selectedCategory)}
                  {selectedVariant && ` - ${selectedVariant.charAt(0).toUpperCase() + selectedVariant.slice(1)}`}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} available
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onClick={() => handleTemplateClick(template.id)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 rounded-lg shadow-sm bg-white">
            <HiDocumentText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2 text-gray-900">No Templates Available</h3>
            <p className="text-gray-600">
              {selectedCategory
                ? `No templates found for ${CERTIFICATE_CATEGORY_METADATA[selectedCategory]?.title || selectedCategory}.`
                : 'No certificate templates found. Please check back later.'}
            </p>
          </div>
        )}

        {/* Info Section */}
        {filteredTemplates.length > 0 && (
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
