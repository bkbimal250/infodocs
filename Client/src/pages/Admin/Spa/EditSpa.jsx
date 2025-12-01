import { useState, useEffect } from 'react';
import { adminApi } from '../../../api/Admin/adminApi';

const EditSpa = ({ spa, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    city: "",
    area: "",
    state: "",
    country: "",
    pincode: "",
    phone_number: "",
    alternate_number: "",
    email: "",
    website: "",
    logo: "",
    is_active: true,
  });

  useEffect(() => {
    if (spa) {
      setFormData({
        name: spa.name || "",
        code: spa.code || "",
        address: spa.address || "",
        city: spa.city || "",
        area: spa.area || "",
        state: spa.state || "",
        country: spa.country || "",
        pincode: spa.pincode || "",
        phone_number: spa.phone_number || "",
        alternate_number: spa.alternate_number || "",
        email: spa.email || "",
        website: spa.website || "",
        logo: spa.logo || "",
        is_active: spa.is_active !== undefined ? spa.is_active : true,
      });
    }
  }, [spa]);

  // handle file upload separately
  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      logo: e.target.files[0],
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      await adminApi.forms.updateSpa(spa.id, data);

      if (onSuccess) onSuccess();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "Failed to update SPA"
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Edit SPA</h2>
          <p className="text-sm text-gray-500 mt-1">Update SPA information</p>
        </div>
        <button 
          onClick={onCancel} 
          className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-800 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Name */}
        <Input label="SPA Name *" name="name" value={formData.name} onChange={handleInputChange} required />

        {/* Code */}
        <Input label="Code" name="code" value={formData.code} onChange={handleInputChange} />

        {/* Area */}
        <Input label="Area" name="area" value={formData.area} onChange={handleInputChange} />

        {/* Address */}
        <Textarea label="Address" name="address" value={formData.address} onChange={handleInputChange} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="City" name="city" value={formData.city} onChange={handleInputChange} />
          <Input label="State" name="state" value={formData.state} onChange={handleInputChange} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Country" name="country" value={formData.country} onChange={handleInputChange} />
          <Input label="Pincode" name="pincode" value={formData.pincode} onChange={handleInputChange} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Phone Number" name="phone_number" value={formData.phone_number} onChange={handleInputChange} />
          <Input label="Alternate Number" name="alternate_number" value={formData.alternate_number} onChange={handleInputChange} />
        </div>

        <Input label="Email" name="email" value={formData.email} onChange={handleInputChange} />
        <Input label="Website" name="website" value={formData.website} onChange={handleInputChange} />

        {/* Logo upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />

          {formData.logo && typeof formData.logo === "string" && (
            <img
              src={formData.logo}
              alt="Logo"
              className="mt-2 h-16 rounded border"
            />
          )}
        </div>

        {/* Active */}
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

        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Update SPA
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

/* Reusable Input Component */
const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
    <input
      {...props}
      className="w-full px-4 py-2.5 border-1.5 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
    />
  </div>
);

/* Reusable Textarea Component */
const Textarea = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
    <textarea
      {...props}
      rows={3}
      className="w-full px-4 py-2.5 border-1.5 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
    />
  </div>
);

export default EditSpa;
