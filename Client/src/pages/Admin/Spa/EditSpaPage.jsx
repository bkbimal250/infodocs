import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { adminApi } from "../../../api/Admin/adminApi";
import { FaArrowLeft, FaChevronRight, FaChevronLeft, FaSave, FaTrash, FaPlus } from 'react-icons/fa';
import { FloatingInput, Stepper } from "../../../ui";
import { useLocalStorage } from "../../../hooks/useLocalStorage";

const EditSpaPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const page = searchParams.get('page') || '1';

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Auto-save form data to localStorage, unique to this SPA ID
  const [formData, setFormData] = useLocalStorage(`spa_edit_draft_${id}`, null);
  const [logoFile, setLogoFile] = useState(null);
  const [initialLogoUrl, setInitialLogoUrl] = useState(null);

  const steps = ["Basic Details", "Location", "Media & Status"];

  useEffect(() => {
    const loadSpa = async () => {
      try {
        setLoadingData(true);
        const res = await adminApi.forms.getSpa(id);
        const spa = res.data;
        
        const serverData = {
          name: spa.name || "",
          code: spa.code || "",
          address: spa.address || "",
          city: spa.city || "",
          area: spa.area || "",
          state: spa.state || "",
          country: spa.country || "INDIA",
          pincode: spa.pincode || "",
          phone_number: spa.phone_number || "",
          alternate_number: spa.alternate_number || "",
          gst_number: spa.gst_number || "",
          email: spa.email || "",
          website: spa.website || "",
          is_active: spa.is_active !== undefined ? spa.is_active : true,
        };

        // Store initial logo URL to show current logo
        if (spa.logo) {
          const fileBase = (import.meta.env.VITE_API_BASE_URL || 'https://infodocs.api.d0s369.co.in/api') + '/forms/files/';
          setInitialLogoUrl(fileBase + spa.logo);
        }

        // Only populate if no draft exists OR if we want to reset
        if (!formData) {
          setFormData(serverData);
        }
      } catch (e) {
        setError('Failed to load SPA details');
        console.error(e);
      } finally {
        setLoadingData(false);
      }
    };
    if (id) {
      loadSpa();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else {
      // Auto-uppercase for consistency
      const processedValue = value.toUpperCase().trimStart();
      setFormData({
        ...formData,
        [name]: processedValue,
      });
    }
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
    }
  };

  const clearDraft = () => {
    if (window.confirm("Restore original data from server and clear current edits?")) {
      window.localStorage.removeItem(`spa_edit_draft_${id}`);
      window.location.reload(); // Simplest way to re-fetch and reset
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && !formData?.name) {
      setError("SPA Name is required");
      return;
    }
    setError(null);
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const submitForm = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const data = new FormData();

      // Ensure formData is not null
      if (!formData) throw new Error("Form data is empty");

      Object.entries(formData).forEach(([key, value]) => {
        if (key === "is_active") return;
        if (value !== undefined && value !== null && value !== "") {
          data.append(key, String(value));
        }
      });

      data.append("is_active", String(formData.is_active));

      if (logoFile) {
        data.append("logo", logoFile);
      }

      await adminApi.forms.updateSpa(id, data);
      
      // Clear draft on success
      window.localStorage.removeItem(`spa_edit_draft_${id}`);
      setSuccess("SPA updated successfully!");

      setTimeout(() => {
        navigate(`/admin/spas?page=${page}`);
      }, 1000);
    } catch (err) {
      const detailMsg = err.response?.data?.detail;
      setError(
        (typeof detailMsg === "string" ? detailMsg : JSON.stringify(detailMsg)) ||
        err.response?.data?.error ||
        "Failed to update SPA"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-text-muted font-bold uppercase tracking-widest text-[10px]">Loading Spa Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header */}
      <div className="bg-white border-b border-border sticky top-0 z-30 px-4 py-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(`/admin/spas?page=${page}`)}
            className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors text-sm font-bold uppercase tracking-wider"
          >
            <FaArrowLeft /> Back
          </button>
          <div className="text-center flex-1">
             <h1 className="text-lg font-black tracking-tighter text-text-primary">EDIT SPA</h1>
          </div>
          <button
            onClick={clearDraft}
            className="text-danger hover:bg-red-50 p-2 rounded-full transition-colors"
            title="Reset to original"
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
                      value={formData?.name || ""}
                      onChange={handleChange}
                    />
                    <FloatingInput
                      label="SPA Code"
                      name="code"
                      value={formData?.code || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FloatingInput
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData?.email || ""}
                      onChange={handleChange}
                    />
                    <FloatingInput
                      label="Phone Number"
                      name="phone_number"
                      value={formData?.phone_number || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FloatingInput
                      label="Alternate Number"
                      name="alternate_number"
                      value={formData?.alternate_number || ""}
                      onChange={handleChange}
                    />
                    <FloatingInput
                      label="GST Number"
                      name="gst_number"
                      value={formData?.gst_number || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <FloatingInput
                    label="Website URL"
                    name="website"
                    value={formData?.website || ""}
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
                      value={formData?.city || ""}
                      onChange={handleChange}
                    />
                    <FloatingInput
                      label="State"
                      name="state"
                      value={formData?.state || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FloatingInput
                      label="Area"
                      name="area"
                      value={formData?.area || ""}
                      onChange={handleChange}
                    />
                    <FloatingInput
                      label="Pincode"
                      name="pincode"
                      value={formData?.pincode || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <FloatingInput
                    label="Country"
                    name="country"
                    value={formData?.country || ""}
                    onChange={handleChange}
                  />
                  <div className="relative">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1 block ml-2">
                      Full Address
                    </label>
                    <textarea
                      name="address"
                      value={formData?.address || ""}
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
                        {logoFile || initialLogoUrl ? (
                          <div className="relative">
                            <img
                              src={logoFile ? URL.createObjectURL(logoFile) : initialLogoUrl}
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
                            <p className="text-sm font-bold text-text-primary">Click to change logo</p>
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
                        checked={formData?.is_active || false}
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
                  <button
                    type="button"
                    onClick={submitForm}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
                  >
                    {loading ? "Updating..." : <><FaSave /> Update SPA</>}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditSpaPage;
