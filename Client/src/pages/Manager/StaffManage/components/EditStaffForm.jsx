import React, { useState, useEffect } from 'react';
import {
  FaUser, FaBriefcase, FaFileAlt, FaMapMarkerAlt,
  FaTimes, FaHeartbeat, FaArrowLeft, FaSave,
  FaCloudUploadAlt, FaCheckCircle, FaSpinner
} from 'react-icons/fa';
import { staffApi } from '../../../../api/Staff/staffApi';

// Helper Components moved outside to prevent focus loss during re-renders
const TabButton = ({ id, icon, label, active, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(id)}
    className={`flex-grow flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${active === id
      ? 'bg-white text-indigo-600 shadow-sm border border-gray-500'
      : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
      }`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
    <span className="sm:hidden">{label.split(' ')[0]}</span>
  </button>
);

const Section = ({ title, icon, children }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 px-1">
      <div className="text-indigo-600 bg-indigo-50 p-2 rounded-lg text-sm">{icon}</div>
      <h4 className="font-extrabold text-gray-900  tracking-tight text-xs">{title}</h4>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {children}
    </div>
  </div>
);

const FormInput = ({ label, name, value, onChange, type = 'text', required = false, placeholder = '' }) => (
  <div className="space-y-1">
    <label className="block text-[10px] font-bold text-gray-400  tracking-widest ml-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value || ''}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      className="w-full p-3 bg-gray-50 border border-gray-500 rounded-xl outline-none focus:bg-white focus:border-indigo-500 transition-all text-sm font-medium"
    />
  </div>
);

const FormSelect = ({ label, name, value, onChange, options, required = false }) => (
  <div className="space-y-1">
    <label className="block text-[10px] font-bold text-gray-400  tracking-widest ml-1">{label}</label>
    <select
      name={name}
      value={value || ''}
      onChange={onChange}
      required={required}
      className="w-full p-3 bg-gray-50 border border-gray-500 rounded-xl outline-none focus:bg-white focus:border-indigo-500 transition-all text-sm font-medium"
    >
      <option value="">Select {label}</option>
      {options.map((opt, index) => (
        <option key={index} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const FormTextarea = ({ label, name, value, onChange, placeholder = '' }) => (
  <div className="space-y-1">
    <label className="block text-[10px] font-bold text-gray-400  tracking-widest ml-1">{label}</label>
    <textarea
      name={name}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full p-3 bg-gray-50 border border-gray-500 rounded-xl outline-none focus:bg-white focus:border-indigo-500 transition-all text-sm font-medium h-20 resize-none"
    />
  </div>
);

const FileInput = ({ label, name, value, uploading, onUpload }) => (
  <div className="space-y-1">
    <label className="block text-[10px] font-bold text-gray-400  tracking-widest ml-1">{label}</label>
    <div className="relative group">
      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={(e) => onUpload(e, name)}
        className="hidden"
        id={`file-${name}`}
      />
      <label
        htmlFor={`file-${name}`}
        className={`flex items-center justify-between p-3 bg-gray-50 border-2 border-dashed rounded-xl cursor-pointer transition-all ${value ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-500 group-hover:border-blue-300'}`}
      >
        <div className="flex items-center gap-2">
          {uploading ? (
            <FaSpinner className="animate-spin text-blue-500" />
          ) : value ? (
            <FaCheckCircle className="text-emerald-500" />
          ) : (
            <FaCloudUploadAlt className="text-gray-400 group-hover:text-blue-500" />
          )}
          <span className={`text-xs font-bold ${value ? 'text-emerald-700' : 'text-gray-400'}`}>
            {uploading ? 'Uploading...' : value ? 'Change File' : 'Choose File'}
          </span>
        </div>
        {value && (
          <div className="flex items-center gap-2">
            {value.match(/\.(jpeg|jpg|gif|png|webp)$/i) && (
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-emerald-200 shadow-sm transition-transform hover:scale-150 cursor-pointer">
                <img src={getImageUrl(value)} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
            <span className="text-[10px] text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md font-black">EXISTING</span>
          </div>
        )}
      </label>
    </div>
  </div>
);

const EditStaffForm = ({ staff, onSubmit, onClose, spaName }) => {
  // Helper to build full URL for images
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://infodocs.api.d0s369.co.in').split('/api')[0];
    const cleanPath = path.replace(/^\//, '');
    return `${API_BASE_URL}/media/${cleanPath}`;
  };

  const [activeTab, setActiveTab] = useState('personal');
  const [uploading, setUploading] = useState({});
  const [formData, setFormData] = useState({ ...staff });

  useEffect(() => {
    if (staff) {
      const formattedStaff = { ...staff };
      if (staff.joining_date) {
        formattedStaff.joining_date = new Date(staff.joining_date).toISOString().split('T')[0];
      }
      setFormData(formattedStaff);
    }
  }, [staff]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(prev => ({ ...prev, [fieldName]: true }));
    try {
      const response = await staffApi.uploadStaffFile(file);
      setFormData(prev => ({ ...prev, [fieldName]: response.data.url }));
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const tabs = [
    { id: 'personal', label: 'Personal', icon: <FaUser /> },
    { id: 'employment', label: 'Work', icon: <FaBriefcase /> },
    { id: 'docs', label: 'Documents', icon: <FaFileAlt /> },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col border border-white/20">
      {/* Header */}
      <div className="px-6 py-6 border-b border-gray-500 bg-gradient-to-br from-indigo-900 to-black relative">
        <button type="button" onClick={onClose} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white flex items-center gap-2 text-xs font-bold">
          <FaArrowLeft /> <span className="hidden sm:inline">Back</span>
        </button>
        <div className="text-center">
          <h3 className="font-black text-2xl text-white tracking-tight">Edit Profile</h3>
          <div className="flex items-center justify-center gap-2 mt-1">
            <p className="text-indigo-400 text-[10px]  font-bold tracking-widest">{staff.name}</p>
            {spaName && (
              <span className="bg-indigo-600/30 text-indigo-300 px-2 py-0.5 rounded text-[10px] font-black  tracking-tighter border border-indigo-500/30">
                {spaName}
              </span>
            )}
          </div>
        </div>
        <button type="button" onClick={onClose} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white text-xs">
          <FaTimes />
        </button>
      </div>

      <div className="flex bg-gray-50 p-1 border-b border-gray-500">
        {tabs.map(tab => (
          <TabButton key={tab.id} id={tab.id} icon={tab.icon} label={tab.label} active={activeTab} onClick={setActiveTab} />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 scrollbar-hide">
        {activeTab === 'personal' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Section title="Basic Information" icon={<FaUser />}>
              <FormInput label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
              <FormInput label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} required />
              <FormSelect label="Gender" name="gender" value={formData.gender} onChange={handleChange} options={[
                { label: 'Male', value: 'male' },
                { label: 'Female', value: 'female' },
                { label: 'Other', value: 'other' }
              ]} />
              <div className="sm:col-span-2">
                <FormTextarea label="Full Address" name="address" value={formData.address} onChange={handleChange} />
              </div>
            </Section>

            <Section title="Emergency Contact" icon={<FaHeartbeat />}>
              <FormInput label="Contact Name" name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange} />
              <FormInput label="Contact Number" name="emergency_contact_number" value={formData.emergency_contact_number} onChange={handleChange} />
            </Section>
          </div>
        )}

        {activeTab === 'employment' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Section title="Employment Details" icon={<FaBriefcase />}>
              <FormInput label="Designation" name="designation" value={formData.designation} onChange={handleChange} required />
              <FormInput label="Joining Date" name="joining_date" value={formData.joining_date} onChange={handleChange} type="date" required />
              <FormSelect label="Current Status" name="current_status" value={formData.current_status} onChange={handleChange} options={[
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
                { label: 'Left', value: 'left' }
              ]} />
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-gray-400  tracking-widest ml-1 mb-1">Current Branch / SPA</label>
                <div className="w-full p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl text-indigo-700 font-extrabold text-sm flex items-center gap-2">
                  <FaMapMarkerAlt className="text-indigo-500" />
                  {spaName || 'Branch Assignment Loading...'}
                </div>
              </div>
            </Section>
          </div>
        )}

        {activeTab === 'docs' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Section title="ID Documents" icon={<FaFileAlt />}>
              <FormInput label="Aadhar Card" name="adhar_card" value={formData.adhar_card} onChange={handleChange} />
              <FormInput label="PAN Card" name="pan_card" value={formData.pan_card} onChange={handleChange} />
            </Section>

            <Section title="Photos & Documents" icon={<FaFileAlt />}>
              <FileInput label="Passport Photo" name="passport_photo" value={formData.passport_photo} uploading={uploading.passport_photo} onUpload={handleFileUpload} />
              <FileInput label="Aadhar Photo" name="adhar_card_photo" value={formData.adhar_card_photo} uploading={uploading.adhar_card_photo} onUpload={handleFileUpload} />
              <FileInput label="PAN Photo" name="pan_card_photo" value={formData.pan_card_photo} uploading={uploading.pan_card_photo} onUpload={handleFileUpload} />
            </Section>
          </div>
        )}
      </form>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-500 flex justify-end gap-3">
        <button type="button" onClick={onClose} className="px-6 py-3 text-gray-500 font-bold text-xs hover:bg-gray-100 rounded-xl transition-all">Discard Changes</button>
        <button
          onClick={handleSubmit}
          disabled={Object.values(uploading).some(v => v)}
          className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-100 flex items-center gap-2 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {Object.values(uploading).some(v => v) ? <FaSpinner className="animate-spin" /> : <FaSave />}
          {Object.values(uploading).some(v => v) ? 'Saving...' : 'Update Profile'}
        </button>
      </div>
    </div>
  );
};

export default EditStaffForm;