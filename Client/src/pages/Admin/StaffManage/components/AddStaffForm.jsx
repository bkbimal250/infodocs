import React, { useState } from 'react';
import {
  FaUser, FaBriefcase, FaHeartbeat, FaFileAlt, FaSave, FaTimes,
  FaCloudUploadAlt, FaCheckCircle, FaSpinner, FaPhone,
  FaMapMarkerAlt, FaUserTag, FaIdCard, FaPassport, FaChevronRight
} from 'react-icons/fa';
import { staffApi } from '../../../../api/Staff/staffApi';

/**
 * Premium Staff Enrollment Form
 * Handles Personal, Employment, and Document verification with real-time feedback.
 */
const AddStaffForm = ({ onSubmit, onClose, phoneChecking = false, onPhoneChange, spas = [] }) => {
  const [activeTab, setActiveTab] = useState('personal');
  const [uploading, setUploading] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    gender: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_number: '',
    designation: '',
    adhar_card: '',
    adhar_card_photo: '',
    pan_card: '',
    pan_card_photo: '',
    passport_photo: '',
    staff_type: 'new_join',
    spa_id: '',
    joining_date: new Date().toISOString().split('T')[0],
    current_status: 'active'
  });

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://infodocs.api.d0s369.co.in').split('/api')[0];
    const cleanPath = path.replace(/^\//, '');
    return `${API_BASE_URL}/media/${cleanPath}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'phone' && onPhoneChange) {
      if (/^\d*$/.test(value) && value.length <= 10) {
        onPhoneChange(value, (memberData) => {
          if (memberData) {
            setFormData(prev => ({ ...prev, ...memberData, staff_type: 're_join' }));
            setActiveTab('employment'); // Move to next logically
          }
        });
      }
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
      alert('Failed to upload file.');
    } finally {
      setUploading(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const tabs = [
    { id: 'personal', label: 'Identity', icon: <FaUser /> },
    { id: 'employment', label: 'Workforce', icon: <FaBriefcase /> },
    { id: 'docs', label: 'Vetting', icon: <FaFileAlt /> },
  ];

  const Input = ({ label, name, type = 'text', required = false, placeholder = '', icon }) => (
    <div className="space-y-1.5 group">
      <label className="block text-[10px] font-black text-gray-400  tracking-[0.2em] ml-1">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors">{icon}</div>}
        <input
          type={type}
          name={name}
          value={formData[name] || ''}
          onChange={handleChange}
          required={required}
          placeholder={placeholder}
          className={`w-full ${icon ? 'pl-11' : 'pl-4'} pr-4 py-3.5 bg-gray-50/50 border-2 border-transparent rounded-[1.25rem] outline-none focus:bg-white focus:border-blue-500/30 transition-all text-sm font-extrabold text-gray-900 shadow-inner group-hover:border-gray-100`}
        />
      </div>
    </div>
  );

  const FileInput = ({ label, name, icon }) => (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-black text-gray-400  tracking-[0.2em] ml-1">{label}</label>
      <div className="relative">
        <input type="file" onChange={(e) => handleFileUpload(e, name)} className="hidden" id={`file-${name}`} />
        <label
          htmlFor={`file-${name}`}
          className={`flex items-center justify-between p-4 rounded-[1.25rem] cursor-pointer transition-all border-2 border-dashed ${formData[name] ? 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-xl shadow-emerald-100/20' : 'bg-gray-50/50 border-gray-200 hover:border-blue-300 hover:bg-white'
            }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${formData[name] ? 'bg-emerald-500 text-white' : 'bg-white text-gray-300 shadow-sm'}`}>
              {uploading[name] ? <FaSpinner className="animate-spin" /> : formData[name] ? <FaCheckCircle /> : icon}
            </div>
            <span className="text-[11px] font-black  tracking-tight">{uploading[name] ? 'Syncing...' : formData[name] ? 'Verified' : 'Attach Document'}</span>
          </div>
          {formData[name] && (
            <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white shadow-lg ring-1 ring-emerald-100">
              <img src={getImageUrl(formData[name])} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </label>
      </div>
    </div>
  );

  const Select = ({ label, name, options, required = false, icon }) => (
    <div className="space-y-1.5 group">
      <label className="block text-[10px] font-black text-gray-400  tracking-[0.2em] ml-1">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors pointer-events-none">{icon}</div>}
        <select
          name={name}
          value={formData[name] || ''}
          onChange={handleChange}
          required={required}
          className={`w-full ${icon ? 'pl-11' : 'pl-4'} pr-8 py-3.5 bg-gray-50/50 border-2 border-transparent rounded-[1.25rem] outline-none focus:bg-white focus:border-blue-500/30 transition-all text-sm font-extrabold text-gray-900 shadow-inner group-hover:border-gray-100 appearance-none`}
        >
          <option value="">Select {label}</option>
          {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-focus-within:rotate-180 transition-transform"><FaChevronRight size={10} className="rotate-90" /></div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-[3rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.12)] w-full max-w-2xl overflow-hidden border border-gray-50 animate-in zoom-in-95 duration-500">
      {/* Header */}
      <div className="px-10 py-8 bg-gray-900 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h3 className="font-black text-2xl text-white tracking-tighter">Enroll <span className="text-blue-500">Staff</span></h3>
            <p className="text-[10px] font-black text-gray-400  tracking-[0.3em] mt-1">Personnel Registration Protocol</p>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all active:scale-90"><FaTimes size={18} /></button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-50/50 p-2 gap-2 border-b border-gray-100">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-grow flex items-center justify-center gap-3 py-4 rounded-[1.5rem] text-[10px] font-black  tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-gray-900 shadow-xl shadow-gray-200/50 border border-gray-100' : 'text-gray-400 hover:text-gray-600 hover:bg-white/30'
              }`}
          >
            {tab.icon} <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-10 space-y-8">
        <div className="min-h-[350px]">
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-500">
              <div className="relative md:col-span-2">
                <Input label="Registry Cellular" name="phone" required placeholder="10-digit primary number" icon={<FaPhone size={12} />} />
                {phoneChecking && <div className="absolute right-4 top-10 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
              </div>
              <Input label="Full Signature Name" name="name" required icon={<FaUser size={12} />} />
              <Select label="Global Gender" name="gender" icon={<FaUserTag size={12} />} options={[{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }, { label: 'Other', value: 'other' }]} />
              <div className="md:col-span-2 space-y-1.5 group">
                <label className="block text-[10px] font-black text-gray-400  tracking-[0.2em] ml-1">Current Base Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Complete residential coordinates..."
                  className="w-full p-4 bg-gray-50/50 border-2 border-transparent rounded-[1.25rem] outline-none focus:bg-white focus:border-blue-500/30 transition-all text-sm font-extrabold text-gray-900 shadow-inner group-hover:border-gray-100 h-28 resize-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'employment' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-500">
              <Input label="Professional Role" name="designation" placeholder="e.g. Senior Specialist" icon={<FaBriefcase size={12} />} />
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-gray-400  tracking-[0.2em] ml-1">Registry Mode</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setFormData({ ...formData, staff_type: 'new_join' })} className={`flex-grow py-3.5 rounded-2xl text-[10px] font-black tracking-widest transition-all border-2 ${formData.staff_type === 'new_join' ? 'bg-gray-900 text-white border-gray-900 shadow-xl' : 'bg-gray-50 text-gray-300 border-transparent hover:border-gray-200'}`}>NEW JOIN</button>
                  <button type="button" onClick={() => setFormData({ ...formData, staff_type: 're_join' })} className={`flex-grow py-3.5 rounded-2xl text-[10px] font-black tracking-widest transition-all border-2 ${formData.staff_type === 're_join' ? 'bg-blue-600 text-white border-blue-600 shadow-xl' : 'bg-gray-50 text-gray-300 border-transparent hover:border-gray-200'}`}>RE-JOIN</button>
                </div>
              </div>

              <div className="md:col-span-2">
                <Select label="Deployment Branch" name="spa_id" required icon={<FaMapMarkerAlt size={12} />} options={spas.map(s => ({ label: `${s.name} (${s.city || 'TBD'})`, value: s.id }))} />
              </div>

              <div className="md:col-span-1">
                <Input label="Registry Date" name="joining_date" type="date" required icon={<FaChevronRight size={10} className="rotate-90" />} />
              </div>
              <div className="md:col-span-1">
                <Select label="Initial Status" name="current_status" required icon={<FaCheckCircle size={12} />} options={[{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }]} />
              </div>

              <div className="md:col-span-2 p-6 bg-rose-50/30 rounded-[2rem] border border-rose-100/50 shadow-sm space-y-4 mt-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center"><FaHeartbeat size={14} /></div>
                  <p className="text-[10px] font-black text-rose-900  tracking-widest">Emergency Safeguard Protocols</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Kin / Contact Person" name="emergency_contact_name" placeholder="Name of relative" />
                  <Input label="Emergency Hotline" name="emergency_contact_number" placeholder="Verified Phone" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-500">
              <Input label="Aadhar ID Number" name="adhar_card" placeholder="12-digit UIDAI number" icon={<FaIdCard size={12} />} />
              <FileInput label="Aadhar Credential" name="adhar_card_photo" icon={<FaCloudUploadAlt size={14} />} />
              <div className="md:col-span-2 h-px bg-gray-100 my-2"></div>
              <Input label="PAN Registry" name="pan_card" placeholder="10-digit Alpha-Numeric" icon={<FaIdCard size={12} />} />
              <FileInput label="PAN Credential" name="pan_card_photo" icon={<FaCloudUploadAlt size={14} />} />
              <div className="md:col-span-2 pt-4">
                <FileInput label="Official Passport Image (Profile)" name="passport_photo" icon={<FaPassport size={14} />} />
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-8 py-4 bg-gray-50 text-gray-400 rounded-2xl text-[10px] font-black  tracking-[0.2em] hover:bg-gray-100 transition-all">Cancel Enrollment</button>
          <button
            type="submit"
            disabled={Object.values(uploading).some(v => v)}
            className="flex-grow py-4 bg-gray-900 text-white rounded-2xl font-black  tracking-[0.4em] text-[10px] shadow-2xl hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 scroll-mt-px shadow-gray-200"
          >
            {Object.values(uploading).some(v => v) ? (
              <FaSpinner className="animate-spin" />
            ) : <FaSave size={14} />}
            <span>{Object.values(uploading).some(v => v) ? 'Syncing Credentials...' : 'Finalize Profile Enrollment'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStaffForm;
