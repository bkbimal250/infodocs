import { useState, useEffect } from 'react';
import { adminApi } from '../../../api/Admin/adminApi';
import { FaChevronRight, FaChevronLeft, FaSave, FaPlus, FaTimes } from 'react-icons/fa';
import { FloatingInput, Stepper } from "../../../ui";
import { useLocalStorage } from "../../../hooks/useLocalStorage";

const EditSpa = ({ spa, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const steps = ["Basic Details", "Location", "Media & Status"];

  // Use local storage for "component" version too, keyed by spa id
  const [formData, setFormData] = useLocalStorage(`spa_comp_edit_draft_${spa?.id}`, null);
  const [logoFile, setLogoFile] = useState(null);
  const [initialLogoUrl, setInitialLogoUrl] = useState(null);

  useEffect(() => {
    if (spa && !formData) {
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
      setFormData(serverData);
    }
    
    if (spa?.logo) {
      const fileBase = (import.meta.env.VITE_API_BASE_URL || 'https://infodocs.api.d0s369.co.in/api') + '/forms/files/';
      setInitialLogoUrl(fileBase + spa.logo);
    }
  }, [spa]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value.toUpperCase().trimStart() });
    }
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setLogoFile(file);
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

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "is_active") return;
        if (value !== undefined && value !== null && value !== "") {
          data.append(key, String(value));
        }
      });
      data.append("is_active", String(formData.is_active));
      if (logoFile) data.append("logo", logoFile);

      await adminApi.forms.updateSpa(spa.id, data);
      
      // Clear draft on success
      window.localStorage.removeItem(`spa_comp_edit_draft_${spa.id}`);
      
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || "Failed to update SPA");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b border-border px-6 py-4 flex items-center justify-between">
        <h2 className="text-sm font-black uppercase tracking-widest text-text-primary">Edit SPA Details</h2>
        <button onClick={onCancel} className="text-text-muted hover:text-danger transition-colors p-2 rounded-full hover:bg-red-50">
          <FaTimes />
        </button>
      </div>

      <div className="p-6 sm:p-8">
        <Stepper currentStep={currentStep} steps={steps} />

        {error && (
          <div className="alert alert-danger mb-6">
            {error}
          </div>
        )}

        <form onSubmit={(e) => e.preventDefault()}>
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FloatingInput label="SPA Name" name="name" required value={formData?.name || ""} onChange={handleChange} />
                <FloatingInput label="SPA Code" name="code" value={formData?.code || ""} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FloatingInput label="Email Address" name="email" type="email" value={formData?.email || ""} onChange={handleChange} />
                <FloatingInput label="Phone Number" name="phone_number" value={formData?.phone_number || ""} onChange={handleChange} />
              </div>
              <FloatingInput label="GST Number" name="gst_number" value={formData?.gst_number || ""} onChange={handleChange} />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FloatingInput label="City" name="city" value={formData?.city || ""} onChange={handleChange} />
                <FloatingInput label="State" name="state" value={formData?.state || ""} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FloatingInput label="Area" name="area" value={formData?.area || ""} onChange={handleChange} />
                <FloatingInput label="Pincode" name="pincode" value={formData?.pincode || ""} onChange={handleChange} />
              </div>
              <div className="relative">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1 block ml-2">Full Address</label>
                <textarea
                  name="address"
                  value={formData?.address || ""}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all text-sm font-medium"
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted block ml-2">Logo</label>
                <div className="flex flex-col items-center p-6 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50/30 group">
                  <input type="file" id="logo-comp-upload" className="hidden" accept="image/*" onChange={onFileChange} />
                  <label htmlFor="logo-comp-upload" className="cursor-pointer flex flex-col items-center">
                    {logoFile || initialLogoUrl ? (
                      <img src={logoFile ? URL.createObjectURL(logoFile) : initialLogoUrl} alt="Preview" className="h-24 w-24 object-contain rounded-lg shadow-sm" />
                    ) : (
                      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-primary mb-2"><FaPlus /></div>
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-wider mt-2">Change Logo</span>
                  </label>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-border">
                <span className="text-xs font-bold text-text-primary uppercase tracking-wider">Active</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="is_active" checked={formData?.is_active || false} onChange={handleChange} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                </label>
              </div>
            </div>
          )}

          <div className="mt-8 flex gap-4">
            {currentStep > 1 && (
              <button type="button" onClick={prevStep} className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-text-primary rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all">
                <FaChevronLeft />
              </button>
            )}
            {currentStep < steps.length ? (
              <button type="button" onClick={nextStep} className="flex-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-lg">
                Next <FaChevronRight />
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={loading} className="flex-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-lg">
                {loading ? "Updating..." : <><FaSave className="inline mr-2" /> Update</>}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSpa;
