import React from 'react';
import {
  FaUser, FaBriefcase, FaFileAlt, FaTimes, FaPhone,
  FaMapMarkerAlt, FaHeartbeat, FaCalendarAlt, FaChevronRight,
  FaIdCard, FaPassport, FaCheckCircle, FaUserTag, FaMars, FaVenus, FaGenderless, FaBirthdayCake
} from 'react-icons/fa';

/**
 * Premium Staff Details Profile View
 * Comprehensive display of all employee information with document previews
 */
const ViewStaffDetails = ({ staff, onClose }) => {
  if (!staff) return null;

  // Helper to build full URL for images
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://infodocs.api.d0s369.co.in').split('/api')[0];
    const cleanPath = path.replace(/^\//, '');
    return `${API_BASE_URL}/media/${cleanPath}`;
  };

  const DetailItem = ({ label, value, icon, fullWidth = false, badge = false }) => (
    <div className={`p-4 md:p-5 rounded-3xl bg-white border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-blue-100 group ${fullWidth ? 'md:col-span-2' : ''}`}>
      <div className="flex items-center gap-4">
        {icon && (
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm">
            {icon}
          </div>
        )}
        <div className="flex-grow">
          <p className="text-[9px] font-black text-gray-400  tracking-widest leading-none mb-1.5">{label}</p>
          {badge ? (
            <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black  tracking-tight ${value === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
              }`}>
              {value || 'Unknown'}
            </span>
          ) : (
            <p className="text-sm font-extrabold text-gray-900 tracking-tight leading-tight">{value || '--'}</p>
          )}
        </div>
      </div>
    </div>
  );

  const DocumentCard = ({ label, number, url, icon }) => {
    const fullUrl = getImageUrl(url);
    const isImage = url?.match(/\.(jpeg|jpg|gif|png|webp)$/i);

    return (
      <div className="md:col-span-2 overflow-hidden bg-white border border-gray-100 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 group border-l-4 border-l-blue-500">
        <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
            {icon}
          </div>
          <div className="flex-grow text-center md:text-left">
            <h5 className="text-[10px] font-black text-gray-400  tracking-widest mb-1">{label}</h5>
            <p className="text-lg font-black text-gray-900 tracking-tighter">
              {number || 'Document Number Not Recorded'}
            </p>
          </div>
          {url ? (
            <a
              href={fullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 bg-gray-900 text-white rounded-2xl text-[10px] font-black  tracking-widest hover:bg-blue-600 transition-all active:scale-95 shadow-xl shadow-gray-200"
            >
              Secure Open
            </a>
          ) : (
            <span className="text-[10px] font-black text-gray-300  tracking-widest bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">No Attachment</span>
          )}
        </div>
        {url && isImage && (
          <div className="relative h-64 overflow-hidden bg-gray-50 mt-2 mx-4 mb-4 rounded-3xl">
            <img
              src={fullUrl}
              alt={label}
              className="w-full h-full object-contain cursor-zoom-in"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/10 to-transparent pointer-events-none" />
          </div>
        )}
      </div>
    );
  };

  const Section = ({ title, icon, color = "blue", children }) => {
    const colors = {
      blue: "text-blue-600 bg-blue-50 ring-blue-50/50",
      emerald: "text-emerald-600 bg-emerald-50 ring-emerald-50/50",
      orange: "text-orange-600 bg-orange-50 ring-orange-50/50",
      rose: "text-rose-600 bg-rose-50 ring-rose-50/50"
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 px-2">
          <div className={`p-3 rounded-[1.25rem] text-lg shadow-sm ${colors[color]}`}>{icon}</div>
          <h4 className="font-black text-gray-900  tracking-tight text-base italic">{title}</h4>
          <div className="flex-grow h-px bg-gradient-to-r from-gray-100 to-transparent"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#FBFCFE] rounded-[3rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.12)] w-full max-w-5xl overflow-hidden border border-white mx-4 my-8 flex flex-col max-h-[90vh]">

      {/* Dynamic Cinematic Header */}
      <div className="relative px-8 md:px-12 py-16 md:py-20 bg-gray-900 overflow-hidden shrink-0">
        {/* Abstract Art Layers */}
        <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-blue-600/20 to-transparent skew-x-12 transform translate-x-20"></div>
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] animate-pulse"></div>

        <button
          onClick={onClose}
          className="absolute right-8 top-8 w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white text-white hover:text-gray-900 rounded-2xl transition-all backdrop-blur-md border border-white/10 shadow-2xl z-50 group hover:rotate-90"
        >
          <FaTimes size={18} />
        </button>

        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition-all duration-700"></div>
            <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/20 relative bg-gray-800 flex items-center justify-center transform group-hover:scale-[1.03] transition-transform duration-500">
              {staff.passport_photo ? (
                <img
                  src={getImageUrl(staff.passport_photo)}
                  alt={staff.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-6xl font-black opacity-20">{staff.name?.charAt(0) || '?'}</span>
              )}
            </div>
          </div>

          <div className="text-center md:text-left flex-grow space-y-4">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-blue-400  tracking-[0.4em]">Official Personnel Record</p>
              <h3 className="font-black text-4xl md:text-6xl text-white tracking-tighter leading-tight">
                {staff.name}
              </h3>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <div className="flex items-center gap-2 px-6 py-2 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-xl">
                <FaBriefcase className="text-blue-400" size={12} />
                <span className="text-[10px] font-black text-white  tracking-widest">{staff.designation || 'Specialist'}</span>
              </div>
              <div className={`flex items-center gap-2 px-6 py-2 rounded-2xl border backdrop-blur-xl shadow-2xl ${staff.current_status === 'active'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                <FaCheckCircle size={12} />
                <span className="text-[10px] font-black  tracking-widest">{staff.current_status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Content Area */}
      <div className="flex-grow overflow-y-auto p-8 md:p-12 space-y-12 bg-gray-50/10 custom-scrollbar">

        {/* Section 1: Core Identity */}
        <Section title="Institutional Identity" icon={<FaIdCard />} color="blue">
          <DetailItem label="Full Legal Alias" value={staff.name} icon={<FaUser size={12} />} />
          <DetailItem label="Primary Cellular" value={staff.phone} icon={<FaPhone size={12} />} />
          <DetailItem label="Global Registry ID" value={`#IFD-${staff.id?.toString().padStart(6, '0')}`} icon={<FaUserTag size={12} />} />
          <DetailItem
            label="Gender Declaration"
            value={staff.gender}
            icon={staff.gender === 'male' ? <FaMars size={12} /> : staff.gender === 'female' ? <FaVenus size={12} /> : <FaGenderless size={12} />}
          />
          <DetailItem label="Permanent Residence" value={staff.address} icon={<FaMapMarkerAlt size={12} />} fullWidth />
        </Section>

        {/* Section 2: Operational Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Section title="Career Matrix" icon={<FaBriefcase />} color="emerald">
            <DetailItem label="Current Assignment" value={staff.spa_name || 'Global Resource Pool'} icon={<FaMapMarkerAlt size={12} />} />
            <DetailItem label="Commencement" value={staff.joining_date ? new Date(staff.joining_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'} icon={<FaCalendarAlt size={12} />} />
            <DetailItem label="Operational Status" value={staff.current_status} badge fullWidth />
          </Section>

          <Section title="Safety Protocols" icon={<FaHeartbeat />} color="rose">
            <DetailItem label="Emergency Point" value={staff.emergency_contact_name} icon={<FaUser size={12} />} />
            <DetailItem label="Hotline Access" value={staff.emergency_contact_number} icon={<FaPhone size={12} />} />
            <DetailItem label="Last Update" value={staff.updated_at ? new Date(staff.updated_at).toLocaleDateString() : 'Initial State'} fullWidth />
          </Section>
        </div>

        {/* Section 3: Verification Vault */}
        <Section title="Authentication Repository" icon={<FaFileAlt />} color="orange">
          <DocumentCard
            label="Government-Issued Aadhar"
            number={staff.adhar_card}
            url={staff.adhar_card_photo}
            icon={<FaIdCard size={20} />}
          />
          <DocumentCard
            label="Taxation Registry (PAN)"
            number={staff.pan_card}
            url={staff.pan_card_photo}
            icon={<FaIdCard size={20} />}
          />
          <DocumentCard
            label="Biometric Passport Image"
            url={staff.passport_photo}
            icon={<FaPassport size={20} />}
          />
        </Section>
      </div>

      {/* Footer Controls */}
      <div className="p-8 bg-white border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></div>
          <p className="text-[10px] font-black text-gray-400  tracking-[0.3em]">Encrypted Data Transmission Confirmed</p>
        </div>
        <button
          onClick={onClose}
          className="w-full md:w-auto px-16 py-4 bg-gray-900 text-white rounded-[1.5rem] text-[10px] font-black  tracking-[0.5em] shadow-2xl hover:bg-blue-600 hover:-translate-y-1 active:translate-y-0 transition-all duration-500 ring-4 ring-gray-900/5 group"
        >
          Exit Profile <FaChevronRight className="inline ml-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default ViewStaffDetails;
