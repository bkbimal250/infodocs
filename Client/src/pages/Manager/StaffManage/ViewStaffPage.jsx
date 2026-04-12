import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { staffApi } from '../../../api';
import { toast } from 'react-hot-toast';
import { FormSkeleton } from '../../../components/LoadingSkeleton';
import {
  FaUser, FaPhone, FaMapMarkerAlt, FaBriefcase, FaFileAlt,
  FaTimes, FaHeartbeat, FaArrowLeft, FaExternalLinkAlt,
  FaIdCard, FaPassport, FaBuilding, FaCalendarAlt, FaEnvelope
} from 'react-icons/fa';

/**
 * Premium Staff Detail View
 */
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
      setStaff(res.data);
    } catch (err) {
      toast.error('Failed to load staff details');
      navigate('/manager/staff');
    } finally {
      setLoading(false);
    }
  };

  // Helper to build full URL for images/documents
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://infodocs.api.d0s369.co.in').split('/api')[0];
    const cleanPath = path.replace(/^\//, '');
    return `${API_BASE_URL}/media/${cleanPath}`;
  };

  if (loading || !staff) return <div className="p-8"><FormSkeleton /></div>;

  /**
   * Internal UI Components for Premium Feel
   */
  const InfoCard = ({ label, value, icon, className = "" }) => (
    <div className={`p-4 bg-white/40 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm transition-all hover:shadow-md hover:border-blue-100 group ${className}`}>
      <div className="flex items-center gap-3 mb-1">
        <div className="text-blue-500 bg-blue-50/50 p-1.5 rounded-lg text-[10px] group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <span className="text-[10px] font-black text-gray-400  tracking-widest">{label}</span>
      </div>
      <p className="text-sm font-bold text-gray-900 ml-1">{value || '---'}</p>
    </div>
  );

  const VerifiedDoc = ({ label, number, url, icon }) => {
    const fullUrl = getImageUrl(url);
    const isImage = url?.toLowerCase().split('?')[0].match(/\.(jpeg|jpg|gif|png|webp)$/i);

    return (
      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group">
        <div className="p-4 flex items-center justify-between border-b border-gray-50 bg-gray-50/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-900 text-white rounded-xl shadow-lg shadow-blue-900/10">
              {icon}
            </div>
            <div>
              <p className="text-[8px] font-black text-gray-400  tracking-widest leading-none mb-1">{label}</p>
              <p className="text-xs font-black text-gray-900">{number || 'Verified File'}</p>
            </div>
          </div>
          {url && (
            <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all transform active:scale-90">
              <FaExternalLinkAlt size={12} />
            </a>
          )}
        </div>
        {url && isImage && (
          <div className="h-40 relative overflow-hidden bg-gray-100 cursor-zoom-in group-hover:h-44 transition-all duration-500">
            <img src={fullUrl} alt={label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent flex items-end p-3">
              <span className="text-[8px] font-black text-white px-2 py-1 bg-white/10 backdrop-blur-md rounded-lg  tracking-widest">Digital Copy</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/80 p-4 md:p-8 flex flex-col items-center animate-in fade-in duration-700">
      <div className="w-full max-w-4xl">
        {/* Navigation Wrapper */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/manager/staff"
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-600 border border-gray-100 rounded-2xl text-[10px] font-black  tracking-widest shadow-sm hover:shadow-md hover:text-blue-600 transition-all active:scale-95 translate-x-0"
          >
            <FaArrowLeft /> Exit to list
          </Link>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-black text-gray-400  tracking-tighter">Live Database Record</span>
          </div>
        </div>

        {/* Profile Identity Section */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-emerald-600/5 blur-3xl rounded-[3rem]"></div>
          <div className="relative bg-white/70 backdrop-blur-xl border border-white rounded-[2.5rem] p-6 md:p-10 shadow-2xl flex flex-col md:flex-row items-center gap-8 md:gap-12 overflow-hidden ring-1 ring-black/5">
            <div className="absolute right-0 top-0 -mr-10 -mt-10 w-40 h-40 bg-blue-500/5 rounded-full blur-2xl"></div>

            <div className="relative shrink-0">
              <div className="absolute -inset-2 bg-gradient-to-tr from-blue-600 to-emerald-500 rounded-[2.5rem] blur-lg opacity-20"></div>
              <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2.2rem] bg-gray-900 border-4 border-white shadow-2xl overflow-hidden relative group">
                {staff.passport_photo ? (
                  <img src={getImageUrl(staff.passport_photo)} alt={staff.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl text-white font-black">{staff.name?.charAt(0)}</div>
                )}
                <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-[2.2rem]"></div>
              </div>
            </div>

            <div className="flex-grow text-center md:text-left">
              <div className="mb-4">
                <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tightest leading-none mb-4">{staff.name}</h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  <span className="px-4 py-1.5 bg-blue-900 text-white rounded-xl text-[10px] font-black  tracking-widest shadow-lg shadow-blue-900/20">{staff.designation || 'Staff Member'}</span>
                  <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black  tracking-widest border ${staff.current_status === 'active'
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    : 'bg-red-50 text-red-600 border-red-100'
                    }`}>
                    {staff.current_status}
                  </span>
                  <span className="px-4 py-1.5 bg-white border border-gray-100 text-gray-400 rounded-xl text-[10px] font-black  tracking-widest">Ref: #STF-{staff.id}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mt-8 pt-8 border-t border-gray-100/50">
                <div className="flex items-start gap-2">
                  <FaBuilding className="text-gray-300 mt-1" size={14} />
                  <div>
                    <p className="text-[8px] font-black text-gray-400  tracking-widest">Branch Location</p>
                    <p className="text-xs font-black text-gray-900 tracking-tight ">
                      {staff.spa?.name || 'Assigned Branch'}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold  tracking-tightest leading-none mt-0.5">
                      {staff.spa?.area ? `${staff.spa.area}, ${staff.spa.city}` : staff.spa?.city || 'Location Pending'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 border-l border-gray-100 pl-4">
                  <FaCalendarAlt className="text-gray-300 mt-1" size={14} />
                  <div>
                    <p className="text-[8px] font-black text-gray-400  tracking-widest">Joined On</p>
                    <p className="text-xs font-black text-gray-900 tracking-tight">
                      {staff.joining_date ? new Date(staff.joining_date).toLocaleDateString('en-GB') : '--/--/----'}
                    </p>
                  </div>
                </div>
                <div className="hidden md:flex items-start gap-2 border-l border-gray-100 pl-4">
                  <FaPhone className="text-gray-300 mt-1" size={12} />
                  <div>
                    <p className="text-[8px] font-black text-gray-400  tracking-widest">Direct Line</p>
                    <p className="text-xs font-black text-blue-600 tracking-tight">{staff.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20 animate-in slide-in-from-bottom-8 duration-1000">

          {/* Primary Data */}
          <div className="lg:col-span-2 space-y-8">
            <section className="space-y-4">
              <div className="flex items-center gap-3 ml-2">
                <div className="h-4 w-1 bg-blue-600 rounded-full"></div>
                <h2 className="text-[10px] font-black text-gray-900  tracking-[0.3em]">Operational Identity</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard label="Legal Full Name" value={staff.name} icon={<FaUser />} />
                <InfoCard label="Contact Identity" value={staff.phone} icon={<FaPhone />} />
                <InfoCard label="Gender Profile" value={staff.gender} icon={<FaUser />} />
                <InfoCard label="Primary Role" value={staff.designation} icon={<FaBriefcase />} />
                <InfoCard label="Residential Locality" value={staff.address} icon={<FaMapMarkerAlt />} className="md:col-span-2" />
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 ml-2">
                <div className="h-4 w-1 bg-emerald-600 rounded-full"></div>
                <h2 className="text-[10px] font-black text-gray-900  tracking-[0.3em]">Compliance Documents</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <VerifiedDoc label="Aadhar Document" number={staff.adhar_card} url={staff.adhar_card_photo} icon={<FaIdCard />} />
                <VerifiedDoc label="PAN Document" number={staff.pan_card} url={staff.pan_card_photo} icon={<FaIdCard />} />
              </div>
            </section>
          </div>

          {/* Sidebar Data */}
          <div className="space-y-8">
            <section className="p-6 bg-blue-50 rounded-[2.5rem] border border-blue-100">
              <div className="flex items-center gap-3 mb-6">
                <FaHeartbeat className="text-blue-600" size={18} />
                <h3 className="text-xs font-black text-blue-900  tracking-widest">Emergency SOS</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-2xl shadow-sm">
                  <p className="text-[8px] font-black text-gray-400  tracking-widest mb-1">Primary Contact</p>
                  <p className="text-sm font-black text-gray-900">{staff.emergency_contact_name || 'Not Listed'}</p>
                </div>
                <div className="p-4 bg-white rounded-2xl shadow-sm border border-blue-200">
                  <p className="text-[8px] font-black text-gray-400  tracking-widest mb-1">Direct SOS Line</p>
                  <p className="text-sm font-black text-blue-600 tracking-widest">{staff.emergency_contact_number || '---'}</p>
                </div>
                <div className="pt-4 flex flex-col items-center gap-2">
                  <FaPhone className="text-blue-300 transform rotate-90" />
                  <p className="text-[8px] font-bold text-blue-400 text-center px-4  leading-relaxed">External emergency protocols active</p>
                </div>
              </div>
            </section>

            <div className="p-8 bg-gray-900 rounded-[2.5rem] text-center text-white relative overflow-hidden group">
              <div className="absolute inset-0 bg-blue-600/10 group-hover:scale-150 transition-transform duration-1000"></div>
              <FaBriefcase className="mx-auto mb-4 text-white/20" size={30} />
              <h4 className="text-[10px] font-black  tracking-widest mb-1">Access Control</h4>
              <p className="text-xs text-white/60 mb-6 italic leading-relaxed px-4">Limited management access restricted to branch-specific data</p>
              <Link
                to="/manager/staff"
                className="inline-flex items-center justify-center w-full py-4 bg-white text-gray-900 rounded-2xl text-[10px] font-black  tracking-widest hover:bg-white/90 transition-all active:scale-95 shadow-xl shadow-black/30"
              >
                Return Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewStaffPage;
