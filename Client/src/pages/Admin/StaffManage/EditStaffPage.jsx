import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { staffApi, adminApi } from '../../../api';
import { toast } from 'react-hot-toast';
import EditStaffForm from './components/EditStaffForm';
import { FormSkeleton } from '../../../components/LoadingSkeleton';

const EditStaffPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [allSpas, setAllSpas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [staffRes, spaRes] = await Promise.all([
        staffApi.getStaff(id),
        adminApi.forms.getAllSpas()
      ]);
      
      setStaff(staffRes.data);
      setAllSpas(spaRes.data || []);
    } catch (err) {
      toast.error('Failed to load data');
      navigate('/admin/staff');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (data) => {
    try {
      await staffApi.updateStaff(id, data);
      toast.success('Staff profile updated successfully');
      navigate('/admin/staff');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update staff profile');
    }
  };

  if (loading) return <div className="min-h-screen bg-[#F8FAFC] p-8 flex items-center justify-center"><FormSkeleton /></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-12 flex items-center justify-center relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-0 left-0 w-[50%] h-full bg-indigo-50/20 skew-x-12 -translate-x-20 pointer-events-none"></div>
      
      <div className="relative z-10 w-full max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
        <EditStaffForm
            staff={{ ...staff, spa_name: allSpas.find(s => s.id === staff.spa_id)?.name }}
            onClose={() => navigate('/admin/staff')}
            onSubmit={handleUpdate}
        />
      </div>
    </div>
  );
};

export default EditStaffPage;
