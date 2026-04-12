import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { staffApi, adminApi } from '../../../api';
import { toast } from 'react-hot-toast';
import ViewStaffDetails from './components/ViewStaffDetails';
import { FormSkeleton } from '../../../components/LoadingSkeleton';

const ViewStaffPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaffDetails();
  }, [id]);

  const fetchStaffDetails = async () => {
    try {
      setLoading(true);
      const res = await staffApi.getStaff(id);
      const staffData = res.data;

      // Fetch SPA name for display if needed
      if (staffData.spa_id) {
        try {
          const spaRes = await adminApi.forms.getSpa(staffData.spa_id);
          staffData.spa_name = spaRes.data.name;
        } catch (err) {
          console.error("Failed to fetch SPA name", err);
        }
      }

      setStaff(staffData);
    } catch (err) {
      toast.error('Failed to load staff details');
      navigate('/admin/staff');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#F8FAFC] p-8 flex items-center justify-center"><FormSkeleton /></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-12 flex items-center justify-center relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute inset-0 bg-gradient-to-tr from-gray-50/50 via-white to-blue-50/20 pointer-events-none"></div>
      <div className="absolute -right-20 -top-20 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="relative z-10 w-full max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-700">
        <ViewStaffDetails
          staff={staff}
          onClose={() => navigate('/admin/staff')}
        />
      </div>
    </div>
  );
};

export default ViewStaffPage;
