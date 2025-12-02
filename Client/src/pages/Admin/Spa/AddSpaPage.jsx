import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../../api/Admin/adminApi";
import { FaArrowLeft } from 'react-icons/fa';

const AddSpaPage = () => {
  const navigate = useNavigate();
  const emptyForm = {
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
  };

  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else if (type === "file") {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        [name]: file || "",
      });
    } else {
      // Auto uppercase + remove only leading spaces for text inputs
      const processedValue = value.toUpperCase().trimStart();
      setFormData({
        ...formData,
        [name]: processedValue,
      });
    }
  };

  const submitForm = async (e, addAnother = false) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const data = new FormData();

      // Append all simple fields as strings (skip empty strings for optional fields)
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "logo" || key === "is_active") return; // handle logo separately, is_active handled below

        // Skip undefined, null or empty string values so backend optional fields don't fail validation
        if (value !== undefined && value !== null && value !== "") {
          data.append(key, String(value));
        }
      });

      // Always append is_active (it has a default, so it's safe)
      data.append("is_active", String(formData.is_active));

      // Append logo file if present
      if (formData.logo instanceof File) {
        data.append("logo", formData.logo);
      }

      await adminApi.forms.createSpa(data);
      setSuccess("SPA added successfully!");

      if (addAnother) {
        setFormData(emptyForm);
        setSuccess(null);
        return;
      }

      // Navigate back to spa list after success
      setTimeout(() => {
        navigate('/admin/spas');
      }, 1000);
    } catch (err) {
      console.error("Error response:", err.response);
      console.error("Full error:", err);
      const detailMsg = err.response?.data?.detail;
      setError(
        (typeof detailMsg === "string" ? detailMsg : JSON.stringify(detailMsg)) ||
          err.response?.data?.error ||
          "Failed to add SPA"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-bg-secondary)] to-[var(--color-gray-100)] py-8 px-4">
      <div className="max-w-4xl mx-auto bg-[var(--color-bg-primary)] rounded-xl shadow-lg p-8">
        <button 
          onClick={() => navigate('/admin/spas')} 
          className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] mb-6 flex items-center gap-2 font-medium transition-colors"
        >
          <FaArrowLeft className="mr-1" /> Back to SPAs
        </button>

        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-[var(--color-border-primary)]">
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Add New SPA</h2>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">Fill in the details to create a new SPA location</p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-[var(--color-error-light)] border-l-4 border-[var(--color-error)] text-[var(--color-error-dark)] rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-[var(--color-success-light)] border-l-4 border-[var(--color-success)] text-[var(--color-success-dark)] rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        )}

        {/* Form */}
        <form className="space-y-5" onSubmit={(e) => submitForm(e, false)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">
                SPA Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                onBlur={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value.trim(),
                  })
                }
                className="w-full px-4 py-2.5 border-1.5 border-[var(--color-gray-500)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
                placeholder="Enter SPA name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">SPA Code</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-1.5 border-[var(--color-border-primary)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
                placeholder="Enter SPA code"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-1.5 border-[var(--color-border-primary)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
                placeholder="Enter city"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-1.5 border-[var(--color-border-primary)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
                placeholder="Enter state"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">Pincode</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-1.5 border-[var(--color-border-primary)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
                placeholder="Enter pincode"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-1.5 border-[var(--color-border-primary)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
                placeholder="Enter country"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">Phone Number</label>
              <input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-1.5 border-[var(--color-border-primary)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">Alternate Number</label>
              <input
                type="text"
                name="alternate_number"
                value={formData.alternate_number}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-1.5 border-[var(--color-border-primary)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
                placeholder="Enter alternate number"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-1.5 border-[var(--color-border-primary)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">Website</label>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-1.5 border-[var(--color-border-primary)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
                placeholder="Enter website URL"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Area</label>
            <input
              name="area"
              value={formData.area}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border-1.5 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Enter area"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2.5 border-1.5 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Enter full address"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Logo Upload
            </label>
            <div className="border-2 border-dashed border-[var(--color-border-primary)] rounded-lg p-4 hover:border-[var(--color-primary-light)] transition-colors">
              <input
                type="file"
                name="logo"
                accept="image/*"
                onChange={handleChange}
                className="w-full text-sm text-[var(--color-text-secondary)] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-primary-light)] file:text-[var(--color-primary-dark)] hover:file:bg-[var(--color-primary-light)]"
              />
              {/* Preview */}
              {formData.logo instanceof File && (
                <div className="mt-4">
                  <img
                    src={URL.createObjectURL(formData.logo)}
                    alt="New Logo"
                    className="h-24 w-24 object-cover rounded-lg border-2 border-[var(--color-border-primary)]"
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="rounded border-[var(--color-border-primary)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              />
              <span className="ml-2 text-sm text-[var(--color-text-primary)]">Active</span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-[var(--color-border-primary)]">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-[var(--color-text-inverse)] py-3 px-6 rounded-lg hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary-dark)] disabled:opacity-50 font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save
                </>
              )}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={(e) => submitForm(e, true)}
              className="flex-1 bg-gradient-to-r from-[var(--color-success)] to-[var(--color-success-dark)] text-[var(--color-text-inverse)] py-3 px-6 rounded-lg hover:from-[var(--color-success-dark)] hover:to-[var(--color-success-dark)] disabled:opacity-50 font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                "Saving..."
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Save & Add Another
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/admin/spas')}
              className="px-6 py-3 border border-[var(--color-border-primary)] rounded-lg hover:bg-[var(--color-gray-50)] font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSpaPage;

