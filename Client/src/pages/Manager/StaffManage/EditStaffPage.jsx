import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { staffApi, adminApi } from '../../../api';
import { toast } from 'react-hot-toast';
import { FormSkeleton } from '../../../components/LoadingSkeleton';
import {
  FaUser, FaBriefcase, FaFileAlt, FaArrowLeft, FaArrowRight,
  FaSave, FaSpinner, FaCloudUploadAlt, FaCheckCircle, FaMapMarkerAlt,
  FaCheck
} from 'react-icons/fa';

const STORAGE_PREFIX = 'manager_edit_staff_';

/* ─── Floating Label Input ─── */
const FloatingInput = ({ label, name, value, onChange, type = 'text', required, disabled }) => (
  <div className="relative">
    <input
      type={type}
      name={name}
      id={`edit-${name}`}
      value={value || ''}
      onChange={onChange}
      required={required}
      disabled={disabled}
      placeholder=" "
      className="peer w-full px-3 pt-5 pb-2 border rounded-lg text-sm outline-none focus:border-gray-900 transition-colors bg-white disabled:bg-gray-50"
    />
    <label
      htmlFor={`edit-${name}`}
      className="absolute left-3 top-2 text-[10px] text-gray-400 font-medium transition-all
        peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-300
        peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-gray-600 pointer-events-none"
    >
      {label}{required && ' *'}
    </label>
  </div>
);

/* ─── Floating Label Select ─── */
const FloatingSelect = ({ label, name, value, onChange, options, required }) => (
  <div className="relative">
    <select
      name={name}
      id={`edit-${name}`}
      value={value || ''}
      onChange={onChange}
      required={required}
      className="peer w-full px-3 pt-5 pb-2 border rounded-lg text-sm outline-none focus:border-gray-900 transition-colors bg-white appearance-none"
    >
      <option value=""></option>
      {options.map((opt, i) => (
        <option key={i} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    <label
      htmlFor={`edit-${name}`}
      className="absolute left-3 top-2 text-[10px] text-gray-400 font-medium pointer-events-none"
    >
      {label}{required && ' *'}
    </label>
    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">▾</div>
  </div>
);

/* ─── Floating Label Textarea ─── */
const FloatingTextarea = ({ label, name, value, onChange }) => (
  <div className="relative">
    <textarea
      name={name}
      id={`edit-${name}`}
      value={value || ''}
      onChange={onChange}
      placeholder=" "
      rows={3}
      className="peer w-full px-3 pt-5 pb-2 border rounded-lg text-sm outline-none focus:border-gray-900 transition-colors bg-white resize-none"
    />
    <label
      htmlFor={`edit-${name}`}
      className="absolute left-3 top-2 text-[10px] text-gray-400 font-medium transition-all
        peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-300
        peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-gray-600 pointer-events-none"
    >
      {label}
    </label>
  </div>
);

/* ─── File Upload ─── */
const FileUpload = ({ label, name, value, uploading, onUpload }) => {
  const getUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const base = (import.meta.env.VITE_API_BASE_URL || '').split('/api')[0];
    return `${base}/media/${path.replace(/^\//, '')}`;
  };
  return (
    <div>
      <p className="text-xs text-gray-500 mb-1.5">{label}</p>
      <input type="file" accept="image/*,application/pdf" onChange={(e) => onUpload(e, name)} className="hidden" id={`efile-${name}`} />
      <label
        htmlFor={`efile-${name}`}
        className={`flex items-center justify-between p-3 border border-dashed rounded-lg cursor-pointer transition-colors ${
          value ? 'border-emerald-300 bg-emerald-50/50' : 'border-gray-200 hover:border-gray-400'
        }`}
      >
        <div className="flex items-center gap-2 text-xs">
          {uploading ? <FaSpinner className="animate-spin text-gray-400" />
            : value ? <FaCheckCircle className="text-emerald-500" />
            : <FaCloudUploadAlt className="text-gray-300" />}
          <span className={value ? 'text-emerald-700 font-medium' : 'text-gray-400'}>
            {uploading ? 'Uploading...' : value ? 'Change file' : 'Choose file'}
          </span>
        </div>
        {value && value.match(/\.(jpeg|jpg|png|webp)$/i) && (
          <img src={getUrl(value)} alt="" className="w-8 h-8 rounded object-cover border" />
        )}
      </label>
    </div>
  );
};

/* ═══════ STEPS CONFIG ═══════ */
const STEPS = [
  { id: 'personal', label: 'Personal', icon: <FaUser /> },
  { id: 'employment', label: 'Employment', icon: <FaBriefcase /> },
  { id: 'documents', label: 'Documents', icon: <FaFileAlt /> },
];

/* ═══════ MAIN COMPONENT ═══════ */
const EditStaffPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [spaName, setSpaName] = useState('');
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [uploading, setUploading] = useState({});
  const [formData, setFormData] = useState(null);
  const storageKey = `${STORAGE_PREFIX}${id}`;

  useEffect(() => { fetchStaffDetails(); }, [id]);

  // Auto-save to localStorage
  useEffect(() => {
    if (!formData) return;
    const timer = setTimeout(() => {
      localStorage.setItem(storageKey, JSON.stringify(formData));
    }, 500);
    return () => clearTimeout(timer);
  }, [formData]);

  const fetchStaffDetails = async () => {
    try {
      setLoading(true);
      const res = await staffApi.getStaff(id);
      const staffData = res.data;

      if (staffData.joining_date) {
        staffData.joining_date = new Date(staffData.joining_date).toISOString().split('T')[0];
      }

      // Restore draft if exists, otherwise use server data
      try {
        const draft = localStorage.getItem(storageKey);
        if (draft) {
          const parsed = JSON.parse(draft);
          setFormData({ ...staffData, ...parsed });
        } else {
          setFormData(staffData);
        }
      } catch {
        setFormData(staffData);
      }

      if (staffData.spa_id) {
        try {
          const spaRes = await adminApi.forms.getSpa(staffData.spa_id);
          setSpaName(spaRes.data.name);
        } catch {}
      }
    } catch {
      toast.error('Failed to load staff');
      navigate('/manager/staff');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(prev => ({ ...prev, [fieldName]: true }));
    try {
      const res = await staffApi.uploadStaffFile(file);
      setFormData(prev => ({ ...prev, [fieldName]: res.data.url }));
    } catch { toast.error('Upload failed'); }
    finally { setUploading(prev => ({ ...prev, [fieldName]: false })); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await staffApi.updateStaff(id, formData);
      localStorage.removeItem(storageKey);
      toast.success('Profile updated');
      navigate('/manager/staff');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Update failed');
    }
  };

  const clearDraft = () => {
    localStorage.removeItem(storageKey);
    fetchStaffDetails();
    toast.success('Draft discarded');
  };

  const goBack = () => navigate('/manager/staff');
  const canGoNext = step < STEPS.length - 1;
  const canGoPrev = step > 0;
  const isLastStep = step === STEPS.length - 1;

  if (loading || !formData) return <div className="p-8"><FormSkeleton /></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={goBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
            <FaArrowLeft /> Back
          </button>
          <button onClick={clearDraft} className="text-xs text-red-400 hover:text-red-600">
            Discard Changes
          </button>
        </div>

        <div className="bg-white border rounded-lg overflow-hidden">
          {/* Title */}
          <div className="px-6 pt-6 pb-4">
            <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
            <p className="text-sm text-gray-400 mt-1">
              {formData.name} {spaName && `· ${spaName}`}
            </p>
          </div>

          {/* ─── Stepper ─── */}
          <div className="px-6 pb-4">
            <div className="flex items-center">
              {STEPS.map((s, i) => (
                <React.Fragment key={s.id}>
                  <button
                    type="button"
                    onClick={() => setStep(i)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      i === step
                        ? 'bg-gray-900 text-white'
                        : i < step
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-gray-50 text-gray-400'
                    }`}
                  >
                    {i < step ? <FaCheck size={10} /> : s.icon}
                    <span className="hidden sm:inline">{s.label}</span>
                    <span className="sm:hidden">{i + 1}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-px mx-2 ${i < step ? 'bg-emerald-300' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* ─── Form Steps ─── */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 pb-6">

              {/* Step 1: Personal */}
              {step === 0 && (
                <div className="space-y-4">
                  <p className="text-xs text-gray-400 font-medium mb-2">Basic Information</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FloatingInput label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
                    <FloatingInput label="Phone" name="phone" value={formData.phone} onChange={handleChange} required />
                    <FloatingSelect label="Gender" name="gender" value={formData.gender} onChange={handleChange} options={[
                      { label: 'Male', value: 'male' },
                      { label: 'Female', value: 'female' },
                      { label: 'Other', value: 'other' }
                    ]} />
                    <FloatingInput label="City" name="city" value={formData.city} onChange={handleChange} />
                  </div>
                  <FloatingTextarea label="Full Address" name="address" value={formData.address} onChange={handleChange} />

                  <p className="text-xs text-gray-400 font-medium mt-6 mb-2">Emergency Contact</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FloatingInput label="Contact Name" name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange} />
                    <FloatingInput label="Contact Number" name="emergency_contact_number" value={formData.emergency_contact_number} onChange={handleChange} />
                  </div>
                </div>
              )}

              {/* Step 2: Employment */}
              {step === 1 && (
                <div className="space-y-4">
                  <p className="text-xs text-gray-400 font-medium mb-2">Work Details</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FloatingInput label="Designation" name="designation" value={formData.designation} onChange={handleChange} required />
                    <FloatingInput label="Joining Date" name="joining_date" value={formData.joining_date} onChange={handleChange} type="date" required />
                    <FloatingSelect label="Status" name="current_status" value={formData.current_status} onChange={handleChange} options={[
                      { label: 'Active', value: 'active' },
                      { label: 'Inactive', value: 'inactive' },
                      { label: 'Left', value: 'left' }
                    ]} />
                  </div>
                  <div className="p-3 bg-gray-50 border rounded-lg flex items-center gap-2 text-sm text-gray-600">
                    <FaMapMarkerAlt className="text-gray-400" />
                    <span className="font-medium">{spaName || 'Branch loading...'}</span>
                  </div>
                </div>
              )}

              {/* Step 3: Documents */}
              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-xs text-gray-400 font-medium mb-2">ID Numbers</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FloatingInput label="Aadhar Number" name="adhar_card" value={formData.adhar_card} onChange={handleChange} />
                    <FloatingInput label="PAN Number" name="pan_card" value={formData.pan_card} onChange={handleChange} />
                  </div>

                  <p className="text-xs text-gray-400 font-medium mt-6 mb-2">Uploads</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FileUpload label="Passport Photo" name="passport_photo" value={formData.passport_photo} uploading={uploading.passport_photo} onUpload={handleFileUpload} />
                    <FileUpload label="Aadhar Photo" name="adhar_card_photo" value={formData.adhar_card_photo} uploading={uploading.adhar_card_photo} onUpload={handleFileUpload} />
                    <FileUpload label="PAN Photo" name="pan_card_photo" value={formData.pan_card_photo} uploading={uploading.pan_card_photo} onUpload={handleFileUpload} />
                  </div>
                </div>
              )}
            </div>

            {/* ─── Footer Navigation ─── */}
            <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
              <div className="text-xs text-gray-300">
                {localStorage.getItem(storageKey) && '● Draft saved'}
              </div>
              <div className="flex items-center gap-2">
                {canGoPrev && (
                  <button type="button" onClick={() => setStep(s => s - 1)} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                    Back
                  </button>
                )}
                {canGoNext && (
                  <button type="button" onClick={() => setStep(s => s + 1)} className="flex items-center gap-1.5 px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                    Next <FaArrowRight size={10} />
                  </button>
                )}
                {isLastStep && (
                  <button
                    type="submit"
                    disabled={Object.values(uploading).some(v => v)}
                    className="flex items-center gap-1.5 px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {Object.values(uploading).some(v => v) ? <FaSpinner className="animate-spin" /> : <FaSave />}
                    Update
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditStaffPage;
