import React from 'react';
import { HiArrowLeft } from 'react-icons/hi';
import { CERTIFICATE_CATEGORIES, CERTIFICATE_CATEGORY_METADATA } from '../../utils/certificateConstants';

/**
 * CertificateHeader Component
 * Manages the top configuration bar for certificate creation
 * Focused on mobile responsiveness and compact design
 */
const CertificateHeader = ({
  selectedCategory,
  setSelectedCategory,
  selectedVariant,
  setSelectedVariant,
  selectedTemplateId,
  handleTemplateChange,
  availableVariants,
  availableTemplates,
  onPreview,
  onGenerate,
  state,
  FORM_STATES,
  navigate
}) => {
  return (
    <div className="card shadow-soft bg-white/80 backdrop-blur-xl border-primary/5 sticky top-4 z-50 mb-6 p-4 md:p-6">
      <div className="flex flex-col gap-6">
        {/* Top row: Back button and Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/certificates')}
              className="btn btn-ghost text-gray-400 hover:text-primary p-2 group flex items-center"
            >
              <HiArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black  tracking-widest ml-1 hidden sm:inline">Back</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse hidden sm:block" />
                <h1 className="text-lg md:text-xl font-black text-gray-900 tracking-tighter leading-none">
                  Creation Engine
                </h1>
              </div>
              <p className="text-[9px] font-bold text-gray-400  tracking-widest mt-1 hidden sm:block">
                Industrial Document Provisioning
              </p>
            </div>
          </div>

          {/* Action Buttons (Desktop) */}
          <div className="hidden lg:flex gap-2">
            <button
              onClick={onPreview}
              disabled={state === FORM_STATES.PREVIEW || state === FORM_STATES.GENERATING}
              className="btn btn-secondary px-6 py-2 text-[10px] font-black  tracking-widest"
            >
              {state === FORM_STATES.PREVIEW ? 'Loading...' : 'Preview'}
            </button>
            <button
              onClick={onGenerate}
              disabled={state === FORM_STATES.PREVIEW || state === FORM_STATES.GENERATING}
              className="btn btn-primary px-6 py-2 text-[10px] font-black  tracking-widest"
            >
              {state === FORM_STATES.GENERATING ? 'Working...' : 'Download PDF'}
            </button>
          </div>
        </div>

        {/* Configuration selectors (Responsive Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Category */}
          <div className="space-y-1">
            <p className="text-[9px] font-black text-gray-400  tracking-widest ml-1">Category</p>
            <select
              value={selectedCategory || ''}
              onChange={(e) => {
                const category = e.target.value || null;
                setSelectedCategory(category);
                setSelectedVariant(null);
              }}
              className="input w-full py-2 text-[11px] font-bold"
            >
              <option value="">All Categories</option>
              {Object.values(CERTIFICATE_CATEGORIES).map((category) => (
                <option key={category} value={category}>
                  {CERTIFICATE_CATEGORY_METADATA[category]?.title || category}
                </option>
              ))}
            </select>
          </div>

          {/* Variant */}
          {selectedCategory && availableVariants.length > 0 && (
            <div className="space-y-1">
              <p className="text-[9px] font-black text-gray-400  tracking-widest ml-1">Variant</p>
              <select
                value={selectedVariant || ''}
                onChange={(e) => setSelectedVariant(e.target.value || null)}
                className="input w-full py-2 text-[11px] font-bold"
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

          {/* Template */}
          <div className="space-y-1 sm:col-span-2 lg:col-span-1">
            <p className="text-[9px] font-black text-gray-400  tracking-widest ml-1">Design Template</p>
            <select
              value={selectedTemplateId || ''}
              onChange={handleTemplateChange}
              className="input w-full py-2 text-[11px] font-black text-primary border-primary/20"
            >
              {availableTemplates.length === 0 ? (
                <option value="">No templates available</option>
              ) : (
                availableTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} {t.template_variant && `(${t.template_variant})`}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Action Buttons (Mobile/Tablet) */}
        <div className="flex lg:hidden gap-2">
          <button
            onClick={onPreview}
            disabled={state === FORM_STATES.PREVIEW || state === FORM_STATES.GENERATING}
            className="btn btn-secondary flex-1 py-2.5 text-[10px] font-black  tracking-widest"
          >
            {state === FORM_STATES.PREVIEW ? 'Loading...' : 'Preview'}
          </button>
          <button
            onClick={onGenerate}
            disabled={state === FORM_STATES.PREVIEW || state === FORM_STATES.GENERATING}
            className="btn btn-primary flex-1 py-2.5 text-[10px] font-black  tracking-widest"
          >
            {state === FORM_STATES.GENERATING ? 'Working...' : 'Download PDF'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificateHeader;
