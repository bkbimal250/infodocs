import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { usersApi } from '../../api/Users/usersApi';

/**
 * Common Certificate Creation Page
 * For regular users/candidates to create certificates
 */
const CertificateCreation = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    certificate_data: {},
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPublicTemplates();
  }, []);

  const loadPublicTemplates = async () => {
    try {
      const response = await usersApi.certificates.getPublicTemplates();
      // Response is now a flat array of templates
      setTemplates(response.data || []);
    } catch (err) {
      toast.error('Failed to load certificate templates');
      console.error(err);
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        template_id: selectedTemplate.id,
        name: formData.name,
        email: formData.email,
        certificate_data: formData.certificate_data,
      };

      const response = await usersApi.certificates.generatePublicCertificate(data);
      
      toast.success(response.data.message || 'Certificate generated successfully!');
      
      // TODO: Implement certificate download when PDF generation is ready
      // if (response.data.certificate_id) {
      //   // Certificate created, could redirect or show download link
      // }
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        certificate_data: {},
      });
      setSelectedTemplate(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate certificate');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Certificate</h1>

        {/* Template Selection */}
        {!selectedTemplate && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Select a Certificate Template</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className="border rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:shadow-md transition"
                >
                  {template.template_image && (
                    <img
                      src={template.template_image}
                      alt={template.name}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                  )}
                  <h3 className="font-semibold text-gray-900">{template.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certificate Form */}
        {selectedTemplate && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Certificate Details</h2>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="text-gray-600 hover:text-gray-900"
              >
                Change Template
              </button>
            </div>

            {selectedTemplate.template_image && (
              <img
                src={selectedTemplate.template_image}
                alt={selectedTemplate.name}
                className="w-full max-w-md mx-auto mb-6 rounded"
              />
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Generating...' : 'Generate Certificate'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTemplate(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateCreation;

