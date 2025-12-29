import { TEMPLATE_TYPES } from '../../../../utils/certificateConstants';

const TemplateFormFields = ({ formData, handleInputChange, categoryOptions, CERTIFICATE_CATEGORY_METADATA }) => {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Banner Image URL
        </label>
        <input
          type="text"
          name="banner_image"
          value={formData.banner_image || ''}
          onChange={handleInputChange}
          placeholder="https://example.com/banner.png"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="mt-1 text-xs text-gray-500">
          Optional banner image URL to display in template listings and previews.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            {CERTIFICATE_CATEGORY_METADATA[formData.category]?.description}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Template Type *
          </label>
          <select
            name="template_type"
            value={formData.template_type}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={TEMPLATE_TYPES.IMAGE}>Image Template</option>
            <option value={TEMPLATE_TYPES.HTML}>HTML Template</option>
          </select>
        </div>
      </div>

      {formData.template_type === TEMPLATE_TYPES.IMAGE && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Template Image URL
          </label>
          <input
            type="text"
            name="template_image"
            value={formData.template_image}
            onChange={handleInputChange}
            placeholder="https://example.com/template.png"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500">
            Provide a hosted image that will be used as the certificate background.
          </p>
        </div>
      )}

      {formData.template_type === TEMPLATE_TYPES.HTML && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Template HTML * <span className="text-red-500">(Required for HTML templates)</span>
          </label>
          <textarea
            name="template_html"
            value={formData.template_html}
            onChange={handleInputChange}
            rows="20"
            placeholder="<!DOCTYPE html>&#10;<html>&#10;<head>&#10;  <style>/* Your CSS */</style>&#10;</head>&#10;<body>&#10;  <div>{{candidate_name}}</div>&#10;  <!-- Use {{variable}} for dynamic data -->&#10;</body>&#10;</html>"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-xs"
            required
          />
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-gray-700">
            <p className="font-semibold mb-1">💡 How to create HTML template:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Write your HTML with CSS styles (for PDF generation)</li>
              <li>Use <code className="bg-blue-100 px-1 rounded">{'{{variable_name}}'}</code> for dynamic data</li>
              <li>Available variables: <code className="bg-blue-100 px-1 rounded">candidate_name</code>, <code className="bg-blue-100 px-1 rounded">spa_name</code>, <code className="bg-blue-100 px-1 rounded">date</code>, etc.</li>
              <li>Paste the complete HTML code here</li>
            </ol>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Template Config (JSON)</label>
        <textarea
          name="template_config"
          value={formData.template_config}
          onChange={handleInputChange}
          rows="4"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          placeholder='{"text_positions": [], "color": "#000000"}'
        />
        <p className="mt-1 text-xs text-gray-500">
          Optional advanced configuration (eg. text positions) stored as JSON.
        </p>
      </div>

      <div className="flex gap-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleInputChange}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Active</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            name="is_public"
            checked={formData.is_public}
            onChange={handleInputChange}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Public</span>
        </label>
      </div>
    </>
  );
};

export default TemplateFormFields;

