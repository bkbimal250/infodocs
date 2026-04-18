import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { staffApi, adminApi } from '../../../api';
import { toast } from 'react-hot-toast';
import { FormSkeleton } from '../../../components/LoadingSkeleton';
import { Button, Card } from '../../../ui';

const ViewStaffDetails = () => {
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

      if (staffData.spa_id) {
        try {
          const spaRes = await adminApi.forms.getSpa(staffData.spa_id);
          staffData.spa_name = spaRes.data.name;
        } catch (err) {
          console.error('SPA fetch failed');
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

  const onClose = () => navigate('/admin/staff');

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const base = (import.meta.env.VITE_API_BASE_URL || 'https://infodocs.api.d0s369.co.in').replace('/api', '');
    return `${base}/media/${path.replace(/^\//, '')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <FormSkeleton />
      </div>
    );
  }

  if (!staff) return null;

  // Clean Components
  const DetailItem = ({ label, value }) => (
    <div className="flex flex-col gap-1 p-2 rounded-lg hover:bg-gray-50/80 transition-colors">
      <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase">{label}</p>
      <p className="text-sm text-gray-900 font-medium">{value || '—'}</p>
    </div>
  );

  const Section = ({ title, children }) => (
    <div className="space-y-4 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
      <h4 className="text-base font-semibold text-gray-800 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
        {title}
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {children}
      </div>
    </div>
  );

  const DocumentCard = ({ label, number, url }) => {
    if (!url && !number) return null;
    const fullUrl = getImageUrl(url);

    return (
      <div className="border border-gray-200 rounded-xl p-4 bg-white hover:border-gray-300 hover:shadow-md transition-all flex items-center justify-between group shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
               <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-0.5">{label}</p>
            <p className="text-sm font-semibold text-gray-900">
              {number || 'No ID'}
            </p>
          </div>
        </div>

        {url && (
          <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium px-3 py-1.5 rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors shrink-0"
          >
            View
          </a>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center pb-12 pt-6 px-4 md:px-8">
      <Card
        className="w-full max-w-4xl"
        padding="p-0"
        title={
          <div className="flex items-center justify-between pb-2 pt-2">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center border-2 border-white shadow-sm ring-2 ring-gray-50">
                {staff.passport_photo ? (
                  <img
                    src={getImageUrl(staff.passport_photo)}
                    alt={staff.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-bold text-blue-600">
                    {staff.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                  {staff.name}
                </h3>
                <p className="text-sm font-medium text-gray-500 mt-0.5">
                  {staff.designation || 'Staff'}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              className="text-gray-400 hover:text-gray-700 p-2 hidden sm:block"
              onClick={onClose}
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        }
        footer={
          <div className="flex justify-between items-center">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Confidential Record
            </p>

            <Button
              variant="primary"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        }
      >
        <div className="p-6 md:p-8">
          <div className="flex flex-col gap-8">
            {/* Basic Info */}
            <Section title="Basic Information">
              <DetailItem label="Full Name" value={staff.name} />
              <DetailItem label="Phone" value={staff.phone} />
              <DetailItem label="Gender" value={staff.gender} />
              <DetailItem label="City" value={staff.city} />
              <DetailItem label="Staff ID" value={`#INF-${staff.id?.toString().padStart(4, '0')}`} />
              <DetailItem label="Address" value={staff.address} />
            </Section>

            {/* Employment */}
            <Section title="Employment">
              <DetailItem label="Role" value={staff.designation} />
              <DetailItem label="SPA" value={staff.spa_name || '—'} />
              <DetailItem
                label="Joining Date"
                value={
                  staff.joining_date
                    ? new Date(staff.joining_date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : '—'
                }
              />
            </Section>

            {/* Emergency */}
            <Section title="Emergency Contact">
              <DetailItem label="Name" value={staff.emergency_contact_name} />
              <DetailItem label="Phone" value={staff.emergency_contact_number} />
            </Section>

            {/* Documents */}
            <Section title="Documents">
              <DocumentCard
                label="Aadhar Card"
                number={staff.adhar_card}
                url={staff.adhar_card_photo}
              />
              <DocumentCard
                label="PAN Card"
                number={staff.pan_card}
                url={staff.pan_card_photo}
              />
              <DocumentCard
                label="Passport Photo"
                url={staff.passport_photo}
              />
            </Section>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ViewStaffDetails;