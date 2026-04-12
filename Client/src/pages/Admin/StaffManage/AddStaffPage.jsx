import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { staffApi, adminApi } from '../../../api';
import { toast } from 'react-hot-toast';
import AddStaffForm from './components/AddStaffForm';
import { FormSkeleton } from '../../../components/LoadingSkeleton';

const AddStaffPage = () => {
  const navigate = useNavigate();
  const [allSpas, setAllSpas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSpas();
  }, []);

  const fetchSpas = async () => {
    try {
      setLoading(true);
      const res = await adminApi.forms.getAllSpas();
      setAllSpas(res.data || []);
    } catch (err) {
      toast.error('Failed to load SPA branches');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (data) => {
    try {
      await staffApi.createStaff(data);
      toast.success('Staff profile created successfully');
      navigate('/admin/staff');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create staff profile');
    }
  };

  if (loading) return <div className="min-h-screen bg-[#F8FAFC] p-8 flex items-center justify-center"><FormSkeleton /></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-12 flex items-center justify-center relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-[50%] h-full bg-blue-50/30 -skew-x-12 translate-x-20 pointer-events-none"></div>
      
      <div className="relative z-10 w-full max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
        <AddStaffForm
            onSubmit={handleAddStaff}
            onClose={() => navigate('/admin/staff')}
            spas={allSpas}
            onPhoneChange={async (phone, callback) => {
              try {
                const res = await staffApi.getStaffByPhone(phone);
                callback(res.data);
              } catch (err) { callback(null); }
            }}
        />
      </div>
    </div>
  );
};

export default AddStaffPage;
