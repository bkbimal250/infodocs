import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiArrowLeft,
  HiOutlineBriefcase,
  HiOutlineLocationMarker,
  HiOutlineOfficeBuilding,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineGlobeAlt,
} from 'react-icons/hi';
import { hrApi } from '../../../api/hr/hrApi';

const valueOrDash = (value) => value || '-';

const fullAddress = (spa) => {
  if (!spa) return '-';
  return [spa.address, spa.area, spa.city, spa.state, spa.country, spa.pincode].filter(Boolean).join(', ') || '-';
};

const formatDateTime = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const ViewData = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hiringForm, setHiringForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      loadHiringForm();
    }
  }, [id]);

  const loadHiringForm = async () => {
    try {
      setLoading(true);
      const response = await hrApi.getHiringForm(id);
      setHiringForm(response.data);
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to load hiring form details';
      setError(errorMessage);
      console.error('Load hiring form error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-sm text-slate-600">Loading hiring form details...</p>
        </div>
      </div>
    );
  }

  if (error || !hiringForm) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <BackButton onClick={() => navigate('/hr/hiring-data')} />
          <div className="mt-4 border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error || 'Hiring form not found'}
          </div>
        </div>
      </div>
    );
  }

  const spa = hiringForm.spa;

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <BackButton onClick={() => navigate('/hr/hiring-data')} />

        <div className="mt-5 border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <p className="text-sm font-semibold uppercase text-indigo-700">Hiring Requirement #{hiringForm.id}</p>
              <h1 className="mt-1 text-3xl font-bold text-slate-950">{valueOrDash(hiringForm.for_role)}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{valueOrDash(hiringForm.description)}</p>
            </div>
            <div className="rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <p className="font-semibold text-slate-950">Submitted</p>
              <p>{formatDateTime(hiringForm.created_at)}</p>
            </div>
          </div>

          <div className="grid gap-5 py-5 lg:grid-cols-[1.15fr_0.85fr]">
            <section>
              <SectionTitle icon={HiOutlineOfficeBuilding} title="SPA Details" />
              <div className="mt-3 border border-slate-200">
                <div className="bg-slate-50 px-4 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-950">{valueOrDash(spa?.name)}</h2>
                    {spa?.code !== null && spa?.code !== undefined && (
                      <span className="rounded bg-white px-2 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                        Code {spa.code}
                      </span>
                    )}
                    <span className={`rounded px-2 py-1 text-xs font-semibold ${spa?.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                      {spa?.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="mt-2 flex items-start gap-2 text-sm text-slate-600">
                    <HiOutlineLocationMarker className="mt-0.5 h-5 w-5 flex-none text-indigo-500" />
                    {fullAddress(spa)}
                  </p>
                </div>
                <div className="grid grid-cols-1 divide-y divide-slate-200 md:grid-cols-2 md:divide-x md:divide-y-0">
                  <Info label="Area" value={spa?.area} />
                  <Info label="City" value={spa?.city} />
                </div>
                <div className="grid grid-cols-1 divide-y divide-slate-200 border-t border-slate-200 md:grid-cols-2 md:divide-x md:divide-y-0">
                  <Info label="State" value={spa?.state} />
                  <Info label="Pincode" value={spa?.pincode} />
                </div>
                <Info label="Address" value={spa?.address} wide />
              </div>
            </section>

            <section>
              <SectionTitle icon={HiOutlineBriefcase} title="Requirement Details" />
              <div className="mt-3 border border-slate-200">
                <Info label="Role / Position" value={hiringForm.for_role} />
                <Info label="Required Experience" value={hiringForm.required_experience} />
                <Info label="Required Education" value={hiringForm.required_education} />
                <Info label="Required Skills" value={hiringForm.required_skills} />
                <Info label="Last Updated" value={formatDateTime(hiringForm.updated_at)} />
              </div>
            </section>
          </div>

          <section className="border-t border-slate-200 pt-5">
            <SectionTitle icon={HiOutlinePhone} title="SPA Contact" />
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
              <ContactItem icon={HiOutlinePhone} label="Phone" value={spa?.phone_number} />
              <ContactItem icon={HiOutlineMail} label="Email" value={spa?.email} />
              <ContactItem icon={HiOutlineGlobeAlt} label="Website" value={spa?.website} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const BackButton = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
  >
    <HiArrowLeft className="h-5 w-5" />
    Back to Hiring Data
  </button>
);

const SectionTitle = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 text-base font-bold text-slate-950">
    <Icon className="h-5 w-5 text-indigo-600" />
    {title}
  </div>
);

const Info = ({ label, value, wide }) => (
  <div className={`px-4 py-3 ${wide ? 'border-t border-slate-200' : ''}`}>
    <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
    <p className="mt-1 whitespace-pre-wrap text-sm font-medium text-slate-900">{valueOrDash(value)}</p>
  </div>
);

const ContactItem = ({ icon: Icon, label, value }) => (
  <div className="flex gap-3 border border-slate-200 bg-slate-50 px-4 py-3">
    <Icon className="mt-0.5 h-5 w-5 flex-none text-indigo-600" />
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-slate-900">{valueOrDash(value)}</p>
    </div>
  </div>
);

export default ViewData;
