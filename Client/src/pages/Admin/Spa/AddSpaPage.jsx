import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../../api/Admin/adminApi";
import { FaArrowLeft, FaChevronRight, FaChevronLeft, FaSave, FaPlus, FaTrash } from 'react-icons/fa';
import { FloatingInput, Stepper } from "../../../ui";
import { useLocalStorage } from "../../../hooks/useLocalStorage";

const AddSpaPage = () => {
  const navigate = useNavigate();
  const emptyForm = {
    name: "",
    code: "",
    address: "",
    city: "",
    area: "",
    state: "",
    country: "INDIA",
    pincode: "",
    phone_number: "",
    alternate_number: "",
    gst_number: "",
    email: "",
    website: "",
    logo: "",
    is_active: true,
  };

  // Auto-save form data to localStorage
  const [formData, setFormData] = useLocalStorage("spa_form_draft", emptyForm);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const steps = ["Basic Details", "Location", "Media & Status"];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else if (type === "file") {
      const file = e.target.files[0];
      // File objects can't be stored in localStorage comfortably
      // So we'll keep a separate state for files if needed, 
      // but for now, we'll just handle it in the submit form
    } else {
      // Auto-uppercase for text inputs as per existing requirement
      const processedValue = value.toUpperCase().trimStart();
      setFormData({
        ...formData,
        [name]: processedValue,
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // We don't save the actual file to localStorage, just handle it in memory
      setFormData({
        ...formData,
        logo: file // This will fail JSON.stringify in useLocalStorage if we're not careful
        // Actually, useLocalStorage uses JSON.stringify. File objects don't stringify well.
        // Let's keep a separate state for the logo file.
      });
    }
  };

  // Special handling for logo since File objects don't persist in localStorage
  const [logoFile, setLogoFile] = useState(null);

  const onFileChange = (e) => {
    const file = e.target.files[0];
    setLogoFile(file);
  };

  const clearDraft = () => {
    if (window.confirm("Are you sure you want to clear the form draft?")) {
      setFormData(emptyForm);
      setLogoFile(null);
      setCurrentStep(1);
    }
  };

  const nextStep = () => {
    // Basic validation before moving to next step
    if (currentStep === 1 && !formData.name) {
      setError("SPA Name is required");
      return;
    }
    setError(null);
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const submitForm = async (e, addAnother = false) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const data = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key === "logo" || key === "is_active") return;
        if (value !== undefined && value !== null && value !== "") {
          data.append(key, String(value));
        }
      });

      data.append("is_active", String(formData.is_active));

      if (logoFile) {
        data.append("logo", logoFile);
      }

      await adminApi.forms.createSpa(data);
      
      // Clear draft on success
      window.localStorage.removeItem("spa_form_draft");
      setSuccess("SPA added successfully!");

      if (addAnother) {
        setFormData(emptyForm);
        setLogoFile(null);
        setCurrentStep(1);
        setSuccess(null);
        return;
      }

      setTimeout(() => {
        navigate('/admin/spas');
      }, 1000);
    } catch (err) {
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header */}
      <div className="bg-white border-b border-border sticky top-0 z-30 px-4 py-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/admin/spas')}
            className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors text-sm font-bold uppercase tracking-wider"
          >
            <FaArrowLeft /> Back
          </button>
          <div className="text-center flex-1">
             <h1 className="text-lg font-black tracking-tighter text-text-primary">ADD SPA</h1>
          </div>
          <button
            onClick={clearDraft}
            className="text-danger hover:bg-red-50 p-2 rounded-full transition-colors"
            title="Clear Draft"
          >
            <FaTrash size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Stepper */}
          <Stepper currentStep={currentStep} steps={steps} />

          {/* Messages */}
          {error && (
            <div className="alert alert-danger mb-6 flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success mb-6 flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
              {success}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-border p-6 sm:p-8">
            <form onSubmit={(e) => e.preventDefault()}>
              {/* Step 1: Basic Details */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FloatingInput
                      label="SPA Name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                    />
                    <FloatingInput
                      label="SPA Code"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FloatingInput
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    <FloatingInput
                      label="Phone Number"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FloatingInput
                      label="Alternate Number"
                      name="alternate_number"
                      value={formData.alternate_number}
                      onChange={handleChange}
                    />
                    <FloatingInput
                      label="GST Number"
                      name="gst_number"
                      value={formData.gst_number}
                      onChange={handleChange}
                    />
                  </div>
                  <FloatingInput
                    label="Website URL"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div>
              )}

              {/* Step 2: Location */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FloatingInput
                      label="City"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                    />
                    <FloatingInput
                      label="State"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FloatingInput
                      label="Area"
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                    />
                    <FloatingInput
                      label="Pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                    />
                  </div>
                  <FloatingInput
                    label="Country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                  />
                  <div className="relative">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1 block ml-2">
                      Full Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all text-sm font-medium"
                      placeholder="Enter detailed address..."
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Media & Status */}
              {currentStep === 3 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted block ml-2">
                       SPA Logo
                    </label>
                    <div className="flex flex-col items-center p-8 border-2 border-dashed border-gray-300 rounded-2xl hover:border-primary transition-colors bg-gray-50/30 group">
                      <input
                        type="file"
                        id="logo-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={onFileChange}
                      />
                      <label 
                        htmlFor="logo-upload" 
                        className="cursor-pointer flex flex-col items-center text-center"
                      >
                        {logoFile || (formData.logo && typeof formData.logo === "string") ? (
                          <div className="relative">
                            <img
                              src={logoFile ? URL.createObjectURL(logoFile) : formData.logo}
                              alt="Logo Preview"
                              className="h-32 w-32 object-contain rounded-xl shadow-md border-4 border-white"
                            />
                            <div className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                              <FaPlus size={12} />
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                              <FaPlus size={24} />
                            </div>
                            <p className="text-sm font-bold text-text-primary">Click to upload logo</p>
                            <p className="text-[10px] text-text-muted mt-1 uppercase tracking-wider">PNG, JPG or WEBP (Max 2MB)</p>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-border">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-text-primary">Active Status</span>
                      <span className="text-[10px] text-text-muted uppercase tracking-tight">Toggle SPA availability</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-12 flex flex-col sm:flex-row gap-4">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-text-primary rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all"
                  >
                    <FaChevronLeft /> Previous
                  </button>
                )}

                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-blue-200"
                  >
                    Next Step <FaChevronRight />
                  </button>
                ) : (
                  <div className="flex-1 flex flex-col sm:flex-row gap-4">
                    <button
                      type="button"
                      onClick={(e) => submitForm(e, false)}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
                    >
                      {loading ? "Processing..." : <><FaSave /> Save SPA</>}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => submitForm(e, true)}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-success hover:opacity-90 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-green-100 disabled:opacity-50"
                    >
                      {loading ? "Processing..." : <><FaPlus /> Save & Add Another</>}
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSpaPage;

