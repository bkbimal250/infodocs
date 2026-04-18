import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUser, FaBriefcase, FaFileAlt, FaSave, FaTimes, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { staffApi, adminApi } from '../../../api';

const EditStaffForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('personal');
  const [uploading, setUploading] = useState({});
  const [loading, setLoading] = useState(true);
  const [allSpas, setAllSpas] = useState([]);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [staffRes, spaRes] = await Promise.all([
        staffApi.getStaff(id),
        adminApi.forms.getAllSpas()
      ]);
      setFormData(staffRes.data);
      setAllSpas(spaRes.data || []);
    } catch {
      toast.error('Failed to load staff');
      navigate('/admin/staff');
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
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await staffApi.updateStaff(id, formData);
      toast.success('Updated successfully');
      navigate('/admin/staff');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Update failed');
    }
  };

  if (loading || !formData) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  // reusable inputs
  const Input = ({ label, name }) => (
    <div>
      <label className="text-sm text-gray-600 mb-1 block">{label}</label>
      <input
        name={name}
        value={formData[name] || ''}
        onChange={handleChange}
        className="w-full px-3 py-2 border rounded-md text-sm"
      />
    </div>
  );

  const Select = ({ label, name, options }) => (
    <div>
      <label className="text-sm text-gray-600 mb-1 block">{label}</label>
      <select
        name={name}
        value={formData[name] || ''}
        onChange={handleChange}
        className="w-full px-3 py-2 border rounded-md text-sm"
      >
        <option value="">Select {label}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  const FileInput = ({ label, name }) => (
    <div>
      <label className="text-sm text-gray-600 mb-1 block">{label}</label>
      <input type="file" onChange={(e) => handleFileUpload(e, name)} />
      {uploading[name] && <p className="text-xs text-gray-500">Uploading...</p>}
      {formData[name] && <p className="text-xs text-green-600">Attached</p>}
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold">Edit Staff</h1>
          <p className="text-sm text-gray-500">{formData.name}</p>
        </div>

        <button
          onClick={() => navigate('/admin/staff')}
          className="px-3 py-2 border rounded-md text-sm"
        >
          <FaTimes />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b text-sm">
        {[
          { id: 'personal', label: 'Personal', icon: <FaUser /> },
          { id: 'employment', label: 'Employment', icon: <FaBriefcase /> },
          { id: 'docs', label: 'Documents', icon: <FaFileAlt /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 border-b-2 flex items-center gap-2 ${activeTab === tab.id
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-500'
              }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">

        {activeTab === 'personal' && (
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Phone" name="phone" />
            <Input label="Full Name" name="name" />
            <Select
              label="Gender"
              name="gender"
              options={[
                { label: 'Male', value: 'male' },
                { label: 'Female', value: 'female' },
                { label: 'Other', value: 'other' }
              ]}
            />
            <div className="md:col-span-2">
              <label className="text-sm text-gray-600 mb-1 block">Address</label>
              <textarea
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
          </div>
        )}

        {activeTab === 'employment' && (
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Designation" name="designation" />
            <Select
              label="SPA"
              name="spa_id"
              options={allSpas.map(s => ({ label: s.name, value: s.id }))}
            />

            <div className="md:col-span-2 border rounded-md p-3">
              <p className="text-sm text-gray-600 mb-2">Emergency Contact</p>
              <div className="grid md:grid-cols-2 gap-4">
                <Input label="Name" name="emergency_contact_name" />
                <Input label="Phone" name="emergency_contact_number" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'docs' && (
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Aadhar Number" name="adhar_card" />
            <FileInput label="Aadhar File" name="adhar_card_photo" />

            <Input label="PAN Number" name="pan_card" />
            <FileInput label="PAN File" name="pan_card_photo" />

            <div className="md:col-span-2">
              <FileInput label="Photo" name="passport_photo" />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/admin/staff')}
            className="px-4 py-2 border rounded-md"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={Object.values(uploading).some(v => v)}
            className="px-4 py-2 bg-gray-900 text-white rounded-md flex items-center gap-2"
          >
            {Object.values(uploading).some(v => v)
              ? <FaSpinner className="animate-spin" />
              : <FaSave />}
            Save
          </button>
        </div>

      </form>
    </div>
  );
};

export default EditStaffForm;