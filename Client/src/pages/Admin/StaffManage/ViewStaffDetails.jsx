import React from 'react';
import {
  FaUser, FaBriefcase, FaFileAlt, FaTimes, FaPhone,
  FaMapMarkerAlt, FaHeartbeat, FaExternalLinkAlt,
  FaIdCard, FaPassport
} from 'react-icons/fa';

const ViewStaffDetails = ({ staff, onClose }) => {
  if (!staff) return null;

  // Helper to build full URL for images
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://infodocs.api.d0s369.co.in').replace('/api', '');
    return `${API_BASE_URL}/media/${path.replace(/^\//, '')}`;
  };

  const DetailItem = ({ label, value, icon, fullWidth = false }) => (
    <div className={`flex items-start gap-4 p-4 bg-gray-50/50 backdrop-blur-sm rounded-2xl border border-gray-500/50 hover:bg-white transition-all duration-300 ${fullWidth ? 'md:col-span-2' : ''}`}>
      {icon && <div className="mt-1 text-blue-500 bg-blue-50 p-2 rounded-xl text-xs">{icon}</div>}
      <div>
        <p className="text-[10px] font-black text-gray-400  tracking-[0.2em] leading-none mb-1.5">{label}</p>
        <p className="text-sm font-bold text-gray-800 break-all">{value || 'Not provided'}</p>
      </div>
    </div>
  );

  const DocumentCard = ({ label, number, url, icon }) => {
    if (!url && !number) return null;
    const fullUrl = getImageUrl(url);
    const isImage = url?.match(/\.(jpeg|jpg|gif|png|webp)$/i);

    return (
      <div className="md:col-span-2 overflow-hidden bg-white border border-gray-500 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group">
        <div className="p-5 flex items-center justify-between border-b border-gray-50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
              {icon}
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400  tracking-widest">{label}</p>
              <p className="text-sm font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                {number || 'No ID Number'}
              </p>
            </div>
          </div>
          {url && (
            <a
              href={fullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-[10px] font-black  tracking-widest hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-gray-200"
            >
              View Document <FaExternalLinkAlt className="text-[8px]" />
            </a>
          )}
        </div>
        {url && isImage && (
          <div className="relative h-48 overflow-hidden bg-gray-50">
            <img
              src={fullUrl}
              alt={label}
              className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 cursor-zoom-in"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
          </div>
        )}
      </div>
    );
  };

  const Section = ({ title, icon, children }) => (
    <div className="space-y-5">
      <div className="flex items-center gap-3 px-1">
        <div className="text-blue-600 bg-blue-50 p-2.5 rounded-2xl text-sm ring-4 ring-blue-50/50">{icon}</div>
        <h4 className="font-black text-gray-900  tracking-tight text-sm">{title}</h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden border border-white/20 m-4">
      {/* Header */}
      <div className="px-10 py-12 border-b border-gray-500 bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl animate-pulse delay-1000" />

        <button
          onClick={onClose}
          className="absolute right-8 top-8 p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-white backdrop-blur-md border border-white/5"
        >
          <FaTimes />
        </button>

        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="w-32 h-32 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/10 relative bg-gray-800 flex items-center justify-center">
              {staff.passport_photo ? (
                <img
                  src={getImageUrl(staff.passport_photo)}
                  alt={staff.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-5xl font-black">{staff.name?.charAt(0) || '?'}</span>
              )}
            </div>
          </div>
          <div className="text-center md:text-left">
            <h3 className="font-black text-4xl text-white tracking-tight mb-3 underline decoration-blue-500/30 underline-offset-8 decoration-4">
              {staff.name}
            </h3>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <span className="px-4 py-1.5 bg-white/5 text-white rounded-xl text-[10px] font-black  tracking-[0.2em] border border-white/10 backdrop-blur-md">
                {staff.designation || 'Staff Member'}
              </span>
              <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black  tracking-[0.2em] border backdrop-blur-md shadow-lg ${staff.current_status === 'active'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/10'
                : 'bg-red-500/10 text-red-400 border-red-500/20 shadow-red-500/10'
                }`}>
                {staff.current_status || 'Unknown'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-10 space-y-12 max-h-[65vh] overflow-y-auto scrollbar-hide bg-gray-50/30">
        {/* Identity & Basic Info */}
        <Section title="Identity Profile" icon={<FaUser />}>
          <DetailItem label="Full Legal Name" value={staff.name} icon={<FaUser />} />
          <DetailItem label="Contact Number" value={staff.phone} icon={<FaPhone />} />
          <DetailItem label="Gender Identity" value={staff.gender} />
          <DetailItem label="System ID" value={`#INF-${staff.id?.toString().padStart(4, '0')}`} />
          <DetailItem label="Residential Address" value={staff.address} icon={<FaMapMarkerAlt />} fullWidth />
        </Section>

        {/* Professional Context */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Section title="Employment" icon={<FaBriefcase />}>
            <DetailItem label="Role Title" value={staff.designation} />
            <DetailItem label="Deployment" value={staff.spa_name || 'Central Operations'} icon={<FaMapMarkerAlt />} />
            <DetailItem label="Commencement" value={staff.joining_date ? new Date(staff.joining_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Pending'} fullWidth />
          </Section>

          <Section title="Emergency" icon={<FaHeartbeat />}>
            <DetailItem label="Legal Guardian/Contact" value={staff.emergency_contact_name} />
            <DetailItem label="Primary SOS Line" value={staff.emergency_contact_number} icon={<FaPhone />} />
          </Section>
        </div>

        {/* Verification Gallery */}
        <Section title="Verification Documents" icon={<FaFileAlt />}>
          <DocumentCard
            label="Aadhar Identity"
            number={staff.adhar_card}
            url={staff.adhar_card_photo}
            icon={<FaIdCard />}
          />
          <DocumentCard
            label="Permanent Account Number (PAN)"
            number={staff.pan_card}
            url={staff.pan_card_photo}
            icon={<FaIdCard />}
          />
          <DocumentCard
            label="Professional Passport Image"
            url={staff.passport_photo}
            icon={<FaPassport />}
          />
        </Section>
      </div>

      <div className="p-8 bg-white border-t border-gray-500 flex items-center justify-between">
        <p className="text-[10px] font-bold text-gray-400  tracking-widest italic">Confidential Staff Record</p>
        <button
          onClick={onClose}
          className="px-10 py-4 bg-gray-900 text-white rounded-[1.5rem] text-[10px] font-black  tracking-[0.3em] shadow-2xl hover:bg-blue-600 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
        >
          Exit Profile
        </button>
      </div>
    </div>
  );
};

export default ViewStaffDetails;
