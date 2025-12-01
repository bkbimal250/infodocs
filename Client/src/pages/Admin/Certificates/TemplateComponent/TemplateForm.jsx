import TemplateFormFields from './TemplateFormFields';

const TemplateForm = ({
  formData,
  handleInputChange,
  handleSubmit,
  loading,
  categoryOptions,
  CERTIFICATE_CATEGORY_METADATA,
  editingTemplate,
  onCancel,
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">
        {editingTemplate ? 'Edit Template' : 'Create Template'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TemplateFormFields
          formData={formData}
          handleInputChange={handleInputChange}
          categoryOptions={categoryOptions}
          CERTIFICATE_CATEGORY_METADATA={CERTIFICATE_CATEGORY_METADATA}
        />

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : editingTemplate ? 'Update' : 'Create'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TemplateForm;

