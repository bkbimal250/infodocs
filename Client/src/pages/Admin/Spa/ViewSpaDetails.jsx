
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { adminApi } from '../../../api/Admin/adminApi';
import { FaArrowLeft } from 'react-icons/fa';

const ViewSpaDetails = () => {
  const [spa, setSpa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const loadSpa = async () => {
      try {
        const res = await adminApi.forms.getSpa(id);
        setSpa(res.data);
      } catch (e) {
        setError('Failed to load SPA details');
      } finally {
        setLoading(false);
      }
    };
    loadSpa();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-secondary)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-[var(--color-text-secondary)]">Loading SPA...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-secondary)] flex items-center justify-center">
        <div className="text-center text-[var(--color-error)]">{error}</div>
      </div>
    );
  }

  if (!spa) {
    return null;
  }

  const fileBase = (import.meta.env.VITE_API_BASE_URL || 'https://infodocs.api.d0s369.co.in/api') + '/forms/files/';
  const logoUrl = spa.logo ? fileBase + spa.logo : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-[var(--color-bg-primary)] rounded-xl shadow-lg p-8">
        <button 
          onClick={() => window.history.back()} 
          className="text-[var(--color-primary)] hover:text-blue-800 mb-6 flex items-center gap-2 font-medium transition-colors"
        >
          <FaArrowLeft className="mr-1" /> Back
        </button>
        
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-[var(--color-border-primary)]">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">SPA Details</h1>
            <p className="text-[var(--color-text-secondary)]">Complete information about the SPA location</p>
          </div>
          {logoUrl && (
            <div className="bg-gray-100 rounded-xl p-3 border-2 border-[var(--color-border-primary)]">
              <img src={logoUrl} alt="Logo" className="h-20 w-20 object-cover rounded-lg" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Detail label="Name" value={spa.name} />
          <Detail label="Code" value={spa.code ?? '-'} />
          <Detail label="Area" value={spa.area ?? '-'} />
          <Detail label="City" value={spa.city ?? '-'} />
          <Detail label="State" value={spa.state ?? '-'} />
          <Detail label="Country" value={spa.country ?? '-'} />
          <Detail label="Pincode" value={spa.pincode ?? '-'} />
          <Detail label="Phone" value={spa.phone_number ?? '-'} />
          <Detail label="Alternate" value={spa.alternate_number ?? '-'} />
          <Detail label="Email" value={spa.email ?? '-'} />
          <Detail label="Website" value={spa.website ?? '-'} />
          <Detail label="Status" value={spa.is_active ? 'Active' : 'Inactive'} isStatus />
          <Detail label="Created" value={spa.created_at ? new Date(spa.created_at).toLocaleString() : '-'} />
          <Detail label="Updated" value={spa.updated_at ? new Date(spa.updated_at).toLocaleString() : '-'} />
        </div>

        <div className="mt-8 p-6 bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border-primary)]">
          <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Address
          </div>
          <div className="text-gray-800 whitespace-pre-line leading-relaxed">{spa.address || '-'}</div>
        </div>
      </div>
    </div>
  );
};

const Detail = ({ label, value, isStatus }) => (
  <div className="bg-[var(--color-bg-secondary)] rounded-lg p-4 border border-[var(--color-border-primary)]">
    <div className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-2">{label}</div>
    {isStatus ? (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
        value === 'Active' 
          ? 'bg-green-100 text-green-800' 
          : 'bg-gray-100 text-gray-800'
      }`}>
        <span className={`w-2 h-2 rounded-full mr-2 ${value === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
        {value}
      </span>
    ) : (
      <div className="text-base font-medium text-[var(--color-text-primary)]">{value}</div>
    )}
  </div>
);

export default ViewSpaDetails;
