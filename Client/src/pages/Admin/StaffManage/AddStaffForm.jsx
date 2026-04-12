import React, { useState } from 'react';
import { FaUser, FaBriefcase, FaFileAlt, FaSave, FaTimes, FaCloudUploadAlt, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { staffApi } from '../../../../api/Staff/staffApi';

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
    spa_id: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'phone' && onPhoneChange) {
      if (/^\d*$/.test(value) && value.length <= 10) {
        onPhoneChange(value, (memberData) => {
          if (memberData) {
            setFormData(prev => ({
              ...prev,
              ...memberData,
              staff_type: 're_join'
            }));
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
    { id: 'employment', label: 'Employment', icon: <FaBriefcase /> },
    { id: 'docs', label: 'Documents', icon: <FaFileAlt /> },
  ];

  const Input = ({ label, name, type = 'text', required = false, placeholder = '' }) => (
    <div className="space-y-1">
      <label className="block text-[10px] font-bold text-gray-400  tracking-widest ml-1">{label}</label>
      <input
        type={type}
        name={name}
        value={formData[name] || ''}
        onChange={handleChange}
        required={required}
        placeholder={placeholder}
        className="w-full p-3 bg-gray-50 border border-gray-500 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all text-sm font-medium"
      />
    </div>
  );

  const FileInput = ({ label, name, accept = "image/*,application/pdf" }) => (
    <div className="space-y-1">
      <label className="block text-[10px] font-bold text-gray-400  tracking-widest ml-1">{label}</label>
      <div className="relative group">
        <input
          type="file"
          accept={accept}
          onChange={(e) => handleFileUpload(e, name)}
          className="hidden"
          id={`file-${name}`}
        />
        <label
          htmlFor={`file-${name}`}
          className={`flex items-center justify-between p-3 bg-gray-50 border-2 border-dashed rounded-xl cursor-pointer transition-all ${formData[name] ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-500 group-hover:border-blue-300'}`}
        >
          <div className="flex items-center gap-2">
            {uploading[name] ? (
              <FaSpinner className="animate-spin text-blue-500" />
            ) : formData[name] ? (
              <FaCheckCircle className="text-emerald-500" />
            ) : (
              <FaCloudUploadAlt className="text-gray-400 group-hover:text-blue-500" />
            )}
            <span className={`text-xs font-bold ${formData[name] ? 'text-emerald-700' : 'text-gray-400'}`}>
              {uploading[name] ? 'Uploading...' : formData[name] ? 'File Uploaded' : 'Choose File'}
            </span>
          </div>
          {formData[name] && (
            <span className="text-[10px] text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md font-black">READY</span>
          )}
        </label>
      </div>
    </div>
  );

  const Select = ({ label, name, options, required = false }) => (
    <div className="space-y-1">
      <label className="block text-[10px] font-bold text-gray-400  tracking-widest ml-1">{label}</label>
      <select
        name={name}
        value={formData[name] || ''}
        onChange={handleChange}
        required={required}
        className="w-full p-3 bg-gray-50 border border-gray-500 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all text-sm font-medium"
      >
        <option value="">Select {label}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-white/20">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-500 flex justify-between items-center bg-gray-50/50">
        <div>
          <h3 className="font-black text-xl text-gray-900 leading-none">Add Staff Member</h3>
          <p className="text-xs text-gray-400 mt-1 font-bold">CREATE NEW EMPLOYEE PROFILE</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <FaTimes className="text-gray-400" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-50/30 p-2 gap-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-grow flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === tab.id
              ? 'bg-white text-blue-600 shadow-sm border border-gray-500'
              : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
              }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-8">
        <div className="min-h-[320px]">
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="relative">
                <Input label="Phone Number" name="phone" required placeholder="10 digit number" />
                {phoneChecking && (
                  <div className="absolute right-3 top-8 animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                )}
              </div>
              <Input label="Full Name" name="name" required />
              <Select label="Gender" name="gender" options={[
                { label: 'Male', value: 'male' },
                { label: 'Female', value: 'female' },
                { label: 'Other', value: 'other' }
              ]} />
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-gray-400  tracking-widest ml-1 mb-1">Current Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-50 border border-gray-500 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all text-sm font-medium h-20"
                />
              </div>
            </div>
          )}

          {activeTab === 'employment' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Input label="Designation" name="designation" placeholder="e.g. Senior Therapist" />
              <div className="md:col-span-1">
                <label className="block text-[10px] font-bold text-gray-400  tracking-widest ml-1 mb-2">Action Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`flex-grow p-4 rounded-2xl text-xs font-black transition-all border-2 ${formData.staff_type === 'new_join' ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-100' : 'bg-gray-50 text-gray-400 border-gray-500'}`}
                    onClick={() => setFormData({ ...formData, staff_type: 'new_join' })}
                  >NEW JOIN</button>
                  <button
                    type="button"
                    className={`flex-grow p-4 rounded-2xl text-xs font-black transition-all border-2 ${formData.staff_type === 're_join' ? 'bg-emerald-600 text-white border-emerald-600 shadow-xl shadow-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-500'}`}
                    onClick={() => setFormData({ ...formData, staff_type: 're_join' })}
                  >RE-JOIN</button>
                </div>
              </div>

              <div className="md:col-span-2">
                <Select
                  label="Target Branch (SPA)"
                  name="spa_id"
                  required
                  options={spas.map(s => ({ label: s.name, value: s.id }))}
                />
              </div>

              <div className="md:col-span-2 mt-4 p-5 bg-orange-50/50 rounded-2xl border border-orange-100 shadow-sm shadow-orange-50">
                <p className="text-[10px] font-black text-orange-600  mb-3 tracking-widest">Emergency Contact Safeguard</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Primary Contact Name" name="emergency_contact_name" placeholder="Name of relative/friend" />
                  <Input label="Emergency Phone" name="emergency_contact_number" placeholder="Contact number" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Aadhar Card Number" name="adhar_card" placeholder="12 digit aadhar" />
                <FileInput label="Aadhar Card Photo" name="adhar_card_photo" />
              </div>
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                <Input label="PAN Card Number" name="pan_card" placeholder="10 digit PAN" />
                <FileInput label="PAN Card Photo" name="pan_card_photo" />
              </div>
              <div className="md:col-span-2 pt-4 border-t border-gray-50">
                <FileInput label="Passport Size Photo" name="passport_photo" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-500 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={Object.values(uploading).some(v => v)}
            className="flex-grow py-4 bg-gray-900 text-white rounded-2xl font-black shadow-2xl hover:bg-black transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {Object.values(uploading).some(v => v) ? (
              <FaSpinner className="animate-spin" />
            ) : <FaSave />}
            {Object.values(uploading).some(v => v) ? 'UPLOADING DOCUMENTS...' : 'SAVE STAFF PROFILE'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStaffForm;
