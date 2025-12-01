import { useState, useEffect } from "react";
import { adminApi } from "../../../api/Admin/adminApi";

const AddSpa = ({ isOpen, onCancel, onSuccess }) => {
  const emptyForm = {
    name: "",
    code: "",
    address: "",
    city: "",
    area:"",
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
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    if (isOpen) {
      setFormData(emptyForm);
      setMsg({ type: "", text: "" });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Auto uppercase + remove only leading spaces
    const processedValue = value.toUpperCase().trimStart();

    setFormData({
      ...formData,
      [name]: processedValue,
    });
  };


  const submitForm = async (e, addAnother = false) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: "", text: "" });

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

      // Log form data for debugging
      console.log("FormData being sent to backend:");
      for (let [key, value] of data.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File(${value.name}, ${value.type}, ${value.size} bytes)`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      await adminApi.forms.createSpa(data);
      setMsg({ type: "success", text: "SPA added successfully!" });

      if (addAnother) {
        setFormData(emptyForm);
        return;
      }

      setTimeout(() => onSuccess && onSuccess(), 800);
    } catch (err) {
      console.error("Error response:", err.response);
      console.error("Full error:", err);
      const detailMsg = err.response?.data?.detail;
      setMsg({
        type: "error",
        text:
          (typeof detailMsg === "string" ? detailMsg : JSON.stringify(detailMsg)) ||
          err.response?.data?.error ||
          "Failed to add SPA",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onCancel} className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      <div
        className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add New SPA</h2>
            <p className="text-sm text-gray-500 mt-1">Fill in the details to create a new SPA location</p>
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

        {/* Message */}
        {msg.text && (
          <div
            className={`p-4 rounded-lg mb-4 text-sm flex items-center gap-2 ${
              msg.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            {msg.type === "success" ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            {msg.text}
          </div>
        )}

        {/* Form */}
        <form className="space-y-5" onSubmit={(e) => submitForm(e, false)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                className="input-field"
                placeholder="Enter SPA name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">SPA Code</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter SPA code"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter city"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter state"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Pincode</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter pincode"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter country"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
              <input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Alternate Number</label>
              <input
                type="text"
                name="alternate_number"
                value={formData.alternate_number}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter alternate number"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Website</label>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="input-field"
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
              className="input-field"
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
              className="input-field"
              placeholder="Enter full address"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Logo Upload
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
              <input
                type="file"
                name="logo"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setFormData((prev) => ({
                    ...prev,
                    logo: file
                  }));
                }}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {/* Preview */}
              {formData.logo && typeof formData.logo === "string" && (
                <div className="mt-4">
                  <img
                    src={formData.logo}
                    alt="Current Logo"
                    className="h-24 w-24 object-cover rounded-lg border-2 border-gray-200"
                  />
                </div>
              )}
              {formData.logo instanceof File && (
                <div className="mt-4">
                  <img
                    src={URL.createObjectURL(formData.logo)}
                    alt="New Logo"
                    className="h-24 w-24 object-cover rounded-lg border-2 border-gray-200"
                  />
                </div>
              )}
            </div>
          </div>





          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
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
              className="btn-success flex-1 flex items-center justify-center gap-2"
            >
              {loading ? "Saving..." : (
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
              onClick={onCancel}
              className="btn-light px-6"
            >
              Cancel
            </button>
          </div>
        </form>

      </div>

      {/* Tailwind addon classes */}
      <style>{`
        .input-field {
          width: 100%;
          padding: 10px 14px;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          outline: none;
          transition: all 0.2s;
          font-size: 14px;
        }
        .input-field:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .btn-primary {
          background: linear-gradient(to right, #2563eb, #1d4ed8);
          color: white;
          padding: 12px 20px;
          border-radius: 10px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .btn-primary:hover:not(:disabled) {
          background: linear-gradient(to right, #1d4ed8, #1e40af);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-success {
          background: linear-gradient(to right, #16a34a, #15803d);
          color: white;
          padding: 12px 20px;
          border-radius: 10px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .btn-success:hover:not(:disabled) {
          background: linear-gradient(to right, #15803d, #166534);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
        }
        .btn-success:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-light {
          background: #f9fafb;
          border: 1.5px solid #e5e7eb;
          color: #374151;
          padding: 12px 20px;
          border-radius: 10px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .btn-light:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
        }
      `}</style>
    </div>
  );
};

export default AddSpa;
