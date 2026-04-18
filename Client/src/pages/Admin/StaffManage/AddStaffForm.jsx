import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaBriefcase, FaFileAlt, FaSave, FaTimes, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { staffApi, adminApi } from '../../../api';
import { Input, Select, Button, Textarea } from '../../../ui';

const AddStaffForm = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('personal');
  const [uploading, setUploading] = useState({});
  const [loading, setLoading] = useState(true);
  const [phoneChecking, setPhoneChecking] = useState(false);
  const [allSpas, setAllSpas] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    gender: '',
    city: '',
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

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const res = await adminApi.forms.getAllSpas();
      setAllSpas(res.data || []);
    } catch {
      toast.error('Failed to load SPAs');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneCheck = async () => {
    if (!/^\d{10}$/.test(formData.phone)) return;

    setPhoneChecking(true);
    try {
      const res = await staffApi.getStaffByPhone(formData.phone);
      if (res.data) {
        setFormData(prev => ({
          ...prev,
          ...res.data,
          staff_type: 're_join'
        }));
        toast.success('Existing staff found');
      }
    } catch {
      // silent fail (no need to show error every time)
    } finally {
      setPhoneChecking(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(prev => ({ ...prev, [field]: true }));
    try {
      const res = await staffApi.uploadStaffFile(file);
      setFormData(prev => ({ ...prev, [field]: res.data.url }));
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await staffApi.createStaff(formData);
      toast.success('Staff created');
      navigate('/admin/staff');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed');
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-500">Loading...</div>;
  }

  // reusable inputs

  const FileInput = ({ label, name }) => (
    <div>
      <label className="text-sm text-gray-600 mb-1 block">{label}</label>
      <input type="file" onChange={(e) => handleFileUpload(e, name)} />
      {uploading[name] && <p className="text-xs text-gray-500">Uploading...</p>}
      {formData[name] && <p className="text-xs text-green-600">Uploaded</p>}
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold">Add Staff</h1>
          <p className="text-sm text-gray-500">Create new employee</p>
        </div>

        <Button variant="outline" onClick={() => navigate('/admin/staff')} className="px-3 py-2">
          <FaTimes />
        </Button>
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
            className={`px-4 py-2 border-b-2 flex items-center gap-2 ${activeTab === tab.id ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500'
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
            <div className="relative">
              <Input
                label="Phone"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                onBlur={handlePhoneCheck}
              />
              {phoneChecking && <FaSpinner className="absolute right-2 top-8 animate-spin text-sm" />}
            </div>

            <Input label="Full Name" name="name" required value={formData.name} onChange={handleChange} />

            <Select
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              options={[
                { label: 'Male', value: 'male' },
                { label: 'Female', value: 'female' }
              ]}
            />

            <Input label="City" name="city" value={formData.city} onChange={handleChange} />

            <div className="md:col-span-2">
              <Textarea
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>
        )}

        {activeTab === 'employment' && (
          <div className="grid md:grid-cols-2 gap-4">

            <Input label="Designation" name="designation" value={formData.designation} onChange={handleChange} />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Staff Type</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.staff_type === 'new_join' ? 'primary' : 'outline'}
                  onClick={() => setFormData({ ...formData, staff_type: 'new_join' })}
                  className="flex-1"
                >
                  New
                </Button>

                <Button
                  type="button"
                  variant={formData.staff_type === 're_join' ? 'primary' : 'outline'}
                  onClick={() => setFormData({ ...formData, staff_type: 're_join' })}
                  className="flex-1"
                >
                  Re-Join
                </Button>
              </div>
            </div>

            <div className="md:col-span-2">
              <Select
                label="SPA"
                name="spa_id"
                value={formData.spa_id}
                onChange={handleChange}
                options={allSpas.map(s => ({ label: s.name, value: s.id }))}
              />
            </div>

            <div className="md:col-span-2 border rounded-md p-3">
              <p className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</p>
              <div className="grid md:grid-cols-2 gap-4">
                <Input label="Name" name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange} />
                <Input label="Phone" name="emergency_contact_number" value={formData.emergency_contact_number} onChange={handleChange} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'docs' && (
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Aadhar Number" name="adhar_card" value={formData.adhar_card} onChange={handleChange} />
            <FileInput label="Aadhar File" name="adhar_card_photo" />

            <Input label="PAN Number" name="pan_card" value={formData.pan_card} onChange={handleChange} />
            <FileInput label="PAN File" name="pan_card_photo" />

            <div className="md:col-span-2">
              <FileInput label="Photo" name="passport_photo" />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="ghost" type="button" onClick={() => navigate('/admin/staff')}>
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={Object.values(uploading).some(v => v)}
            className="flex items-center gap-2"
          >
            {Object.values(uploading).some(v => v)
              ? <FaSpinner className="animate-spin" />
              : <FaSave />}
            Save
          </Button>
        </div>

      </form>
    </div>
  );
};

export default AddStaffForm;