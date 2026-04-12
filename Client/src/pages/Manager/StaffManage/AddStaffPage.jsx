import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { staffApi, authApi, adminApi } from '../../../api';
import { toast } from 'react-hot-toast';
import { FormSkeleton } from '../../../components/LoadingSkeleton';
import {
  FaUser, FaPhone, FaMapMarkerAlt,
  FaBriefcase, FaFileAlt,
  FaCheck, FaTimes, FaHeartbeat, FaArrowLeft, FaSave,
  FaCloudUploadAlt, FaCheckCircle, FaSpinner
} from 'react-icons/fa';

/**
 * UI Helper Components
 */
const TabButton = ({ id, icon, label, active, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(id)}
    className={`flex-grow flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${active === id
      ? 'bg-white text-blue-600 shadow-sm border border-gray-500'
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
      <div className="text-blue-600 bg-blue-50 p-2 rounded-lg text-sm">{icon}</div>
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
      className="w-full p-3 bg-gray-50 border border-gray-500 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all text-sm font-medium"
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
      className="w-full p-3 bg-gray-50 border border-gray-500 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all text-sm font-medium"
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
      className="w-full p-3 bg-gray-50 border border-gray-500 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all text-sm font-medium h-20 resize-none"
    />
  </div>
);

const FileInput = ({ label, name, value, uploading, onUpload }) => {
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://infodocs.api.d0s369.co.in').split('/api')[0];
    const cleanPath = path.replace(/^\//, '');
    return `${API_BASE_URL}/media/${cleanPath}`;
  };

  return (
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
              {uploading ? 'Uploading...' : value ? 'File Uploaded' : 'Choose File'}
            </span>
          </div>
          {value && (
            <div className="flex items-center gap-2">
              {value.match(/\.(jpeg|jpg|gif|png|webp)$/i) && (
                <div className="w-8 h-8 rounded-lg overflow-hidden border border-emerald-200 shadow-sm">
                  <img src={getImageUrl(value)} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <span className="text-[10px] text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md font-black">READY</span>
            </div>
          )}
        </label>
      </div>
    </div>
  );
};

const AddStaffPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [spa, setSpa] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form State from former AddStaffForm
  const [activeTab, setActiveTab] = useState('personal');
  const [phoneChecking, setPhoneChecking] = useState(false);
  const [uploading, setUploading] = useState({});
  const [formData, setFormData] = useState({
    name: '', phone: '', gender: '', address: '',
    designation: '', joining_date: new Date().toISOString().split('T')[0],
    emergency_contact_name: '', emergency_contact_number: '',
    adhar_card: '', pan_card: '',
    current_status: 'active', staff_type: 'new_join',
    passport_photo: '', adhar_card_photo: '', pan_card_photo: ''
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const res = await authApi.getCurrentUser();
      const userData = res.data;
      setUser(userData);

      if (userData.spa_id) {
        try {
          const spaRes = await adminApi.forms.getSpa(userData.spa_id);
          setSpa(spaRes.data);
        } catch (err) {
          console.error("Failed to fetch SPA details", err);
        }
      }
    } catch (err) {
      toast.error('Failed to authenticate');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto-check for existing staff on phone number change
    if (name === 'phone' && value.length >= 10) {
      setPhoneChecking(true);
      checkStaffPhone(value);
    }
  };

  const checkStaffPhone = async (phone) => {
    try {
      const res = await staffApi.getStaffByPhone(phone);
      const data = res.data;
      setPhoneChecking(false);
      if (data) {
        setFormData(prev => ({
          ...prev,
          ...data,
          staff_type: 're_join',
          joining_date: new Date().toISOString().split('T')[0]
        }));
      } else {
        setFormData(prev => ({ ...prev, staff_type: 'new_join' }));
      }
    } catch (err) {
      setPhoneChecking(false);
      setFormData(prev => ({ ...prev, staff_type: 'new_join' }));
    }
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
      toast.error('Failed to upload file');
    } finally {
      setUploading(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!user?.spa_id) {
        toast.error('No branch assigned to your profile');
        return;
      }
      await staffApi.createStaff({ ...formData, spa_id: user.spa_id });
      toast.success('Staff profile created successfully');
      navigate('/manager/staff');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create staff profile');
    }
  };

  if (loading) return <div className="p-8"><FormSkeleton /></div>;

  const tabs = [
    { id: 'personal', label: 'Personal Details', icon: <FaUser /> },
    { id: 'employment', label: 'Employment', icon: <FaBriefcase /> },
    { id: 'docs', label: 'Documents', icon: <FaFileAlt /> },
  ];

  const onClose = () => navigate('/manager/staff');

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col border border-white/20">
        {/* Header */}
        <div className="px-6 py-6 border-b border-gray-500 bg-gradient-to-br from-gray-900 to-black relative">
          <button type="button" onClick={onClose} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white flex items-center gap-2 text-xs font-bold">
            <FaArrowLeft /> <span className="hidden sm:inline">Back</span>
          </button>
          <div className="text-center">
            <h3 className="font-black text-2xl text-white tracking-tight">New Staff Member</h3>
            <div className="flex items-center justify-center gap-2 mt-1">
              <p className="text-gray-400 text-[10px]  font-bold tracking-widest">Onboarding Process</p>
              {spa?.name && (
                <span className="bg-blue-600/30 text-blue-400 px-2 py-0.5 rounded text-[10px] font-black  tracking-tighter border border-blue-500/30">
                  {spa.name}
                </span>
              )}
            </div>
          </div>
          <button type="button" onClick={onClose} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white text-xs">
            <FaTimes />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-50 p-1 border-b border-gray-500">
          {tabs.map(tab => (
            <TabButton key={tab.id} id={tab.id} icon={tab.icon} label={tab.label} active={activeTab} onClick={setActiveTab} />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 scrollbar-hide">
          {activeTab === 'personal' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Section title="Basic Info" icon={<FaUser />}>
                <div className="relative">
                  <FormInput label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} required placeholder="10-digit number" />
                  {phoneChecking && (
                    <div className="absolute right-3 top-9 animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-blue-500"></div>
                  )}
                </div>
                <FormInput label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
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
              <Section title="Work Details" icon={<FaBriefcase />}>
                <FormInput label="Designation" name="designation" value={formData.designation} onChange={handleChange} required placeholder="e.g. Therapist" />
                <FormInput label="Joining Date" name="joining_date" value={formData.joining_date} onChange={handleChange} type="date" required />
                <FormSelect label="Initial Status" name="current_status" value={formData.current_status} onChange={handleChange} options={[
                  { label: 'Active', value: 'active' },
                  { label: 'Inactive', value: 'inactive' }
                ]} />
                <div className="sm:col-span-1">
                  <label className="block text-[10px] font-bold text-gray-400  tracking-widest ml-1 mb-2">Registration Type</label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, staff_type: 'new_join' })}
                      className={`flex-grow py-3 rounded-xl text-[10px] font-black tracking-widest border-2 transition-all ${formData.staff_type === 'new_join' ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-gray-50 border-gray-500 text-gray-400'}`}
                    >NEW JOINING</button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, staff_type: 're_join' })}
                      className={`flex-grow py-3 rounded-xl text-[10px] font-black tracking-widest border-2 transition-all ${formData.staff_type === 're_join' ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-gray-50 border-gray-500 text-gray-400'}`}
                    >RE-JOINING</button>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400  tracking-widest ml-1 mb-1">Assigned Branch / SPA</label>
                  <div className="w-full p-4 bg-blue-50/50 border border-blue-100 rounded-xl text-blue-700 font-extrabold text-sm flex items-center gap-2">
                    <FaMapMarkerAlt className="text-blue-500" />
                    {spa?.name || 'Branch Assignment Loading...'}
                  </div>
                </div>
              </Section>
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Section title="Identity Numbers" icon={<FaFileAlt />}>
                <FormInput label="Aadhar Number" name="adhar_card" value={formData.adhar_card} onChange={handleChange} />
                <FormInput label="PAN Number" name="pan_card" value={formData.pan_card} onChange={handleChange} />
              </Section>

              <Section title="Document Uploads" icon={<FaFileAlt />}>
                <FileInput label="Passport Photo" name="passport_photo" value={formData.passport_photo} uploading={uploading.passport_photo} onUpload={handleFileUpload} />
                <FileInput label="Aadhar Card Photo" name="adhar_card_photo" value={formData.adhar_card_photo} uploading={uploading.adhar_card_photo} onUpload={handleFileUpload} />
                <FileInput label="PAN Card Photo" name="pan_card_photo" value={formData.pan_card_photo} uploading={uploading.pan_card_photo} onUpload={handleFileUpload} />
              </Section>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-500 flex items-center justify-between">
          <div>
            {formData.staff_type === 're_join' && (
              <span className="px-3 py-1 bg-orange-100 text-orange-700 text-[10px] font-black  rounded-full border border-orange-200">Re-join Identified</span>
            )}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="px-6 py-3 text-gray-500 font-bold text-xs hover:bg-gray-100 rounded-xl transition-all">Cancel</button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={Object.values(uploading).some(v => v)}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-100 flex items-center gap-2 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {Object.values(uploading).some(v => v) ? <FaSpinner className="animate-spin" /> : <FaSave />}
              {Object.values(uploading).some(v => v) ? 'Uploading...' : 'Create Profile'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStaffPage;
