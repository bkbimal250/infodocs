import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaArrowLeft, FaCheckCircle, FaCloudUploadAlt, FaSpinner } from 'react-icons/fa';
import { authApi, staffApi } from '../../../api';
import { useSpas, getStaffKey, staffName, titleCase, formatDate, formatDateTime, spaLabel, roleHasStaffActions } from './StaffHelpers';
import { ProfilePhoto, Badge, DocumentCard } from './StaffHelpers';
import { VerificationModal, TransferModal, LeaveModal } from './StaffModals';

export const StaffDetailsPage = ({ scope = 'admin', basePath = '/admin/staff' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { spas, spaMap, loadingSpas } = useSpas();
  const [user, setUser] = useState(null);
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [modal, setModal] = useState(null);

  useEffect(() => {
    authApi.getCurrentUser().then((res) => setUser(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setModal(null);
  }, [activeTab]);

  const loadStaff = useCallback(async () => {
    try {
      setLoading(true);
      const res = await staffApi.getStaff(id);
      setStaff(res.data);
    } catch {
      toast.error('Failed to load staff');
      navigate(basePath);
    } finally {
      setLoading(false);
    }
  }, [basePath, id, navigate]);

  useEffect(() => { loadStaff(); }, [loadStaff]);

  useEffect(() => {
    if (user) {
      const role = user?.role || user?.user_role || user?.type || '';
      setModal((prev) => prev);
    }
  }, [user]);

  if (loading || !staff) return <div className="p-8 text-sm text-gray-500">Loading staff profile...</div>;

  const tabs = [
    ['overview', 'Overview'],
    ['work', 'Work History'],
    ['verification', 'Verification Logs'],
    ['documents', 'Documents'],
    ['events', 'Events']
  ];

  const canActOnStaff = roleHasStaffActions(user, scope);

  const verify = async (data) => {
    try {
      await staffApi.verifyStaff(getStaffKey(staff), data);
      toast.success('Verification updated');
      setModal(null);
      loadStaff();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Verification failed');
    }
  };

  const transfer = async (data) => {
    try {
      await staffApi.transferStaff(getStaffKey(staff), data);
      toast.success('Transfer completed');
      setModal(null);
      loadStaff();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Transfer failed');
    }
  };

  const leave = async (data) => {
    try {
      await staffApi.markLeft(getStaffKey(staff), data);
      toast.success('Staff marked as left');
      setModal(null);
      loadStaff();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Action failed');
    }
  };

  const verifyDocument = async (docId) => {
    try {
      await staffApi.verifyDocument(docId);
      toast.success('Document verified');
      loadStaff();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Document verification failed');
    }
  };

  const deleteDocument = async (docId) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await staffApi.deleteDocument(docId);
      toast.success('Document deleted');
      loadStaff();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <button type="button" onClick={() => navigate(basePath)} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <FaArrowLeft /> Back to staff
        </button>

        <div className="rounded-lg border bg-white p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <ProfilePhoto staff={staff} size="h-20 w-20" />
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{staffName(staff)}</h1>
                <p className="text-sm text-gray-500">{staff.designation || 'Staff'} - {spaLabel(spaMap[staff.current_spa_id])}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge value={staff.verification_status} />
                  <Badge value={staff.employment_status} />
                  {staff.is_blacklisted && <Badge value="Blacklisted" tone="blacklisted" />}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to={`${basePath}/${getStaffKey(staff)}/edit`} className="rounded-md border px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Edit</Link>
              {canActOnStaff && <button type="button" onClick={() => setModal('verify')} className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white">Verify</button>}
              {canActOnStaff && <button type="button" onClick={() => setModal('transfer')} className="rounded-md bg-amber-600 px-3 py-2 text-sm text-white">Transfer</button>}
              <button type="button" onClick={() => setModal('leave')} className="rounded-md bg-rose-600 px-3 py-2 text-sm text-white">Mark Left</button>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white">
          <div className="flex overflow-x-auto border-b bg-white/80 no-scrollbar">
            {tabs.map(([idValue, label]) => (
              <button key={idValue} type="button" onClick={() => setActiveTab(idValue)} className={`shrink-0 px-4 py-3 text-sm font-medium ${activeTab === idValue ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="p-5">
            {activeTab === 'overview' && <Overview staff={staff} spaMap={spaMap} />}
            {activeTab === 'work' && <Timeline items={staff.work_history || []} spaMap={spaMap} type="work" />}
            {activeTab === 'verification' && <Timeline items={staff.verification_logs || []} type="verification" />}
            {activeTab === 'documents' && <DocumentsPanel staff={staff} canAct={canActOnStaff} onVerify={verifyDocument} onDelete={deleteDocument} onReload={loadStaff} />}
            {activeTab === 'events' && <Timeline items={staff.events || []} spaMap={spaMap} type="events" />}
          </div>
        </div>
      </div>

      {modal === 'verify' && <VerificationModal staff={staff} onClose={() => setModal(null)} onSubmit={verify} />}
      {modal === 'transfer' && <TransferModal staff={staff} spas={spas} loadingSpas={loadingSpas} onClose={() => setModal(null)} onSubmit={transfer} />}
      {modal === 'leave' && <LeaveModal staff={staff} onClose={() => setModal(null)} onSubmit={leave} />}
    </div>
  );
};

const Overview = ({ staff, spaMap }) => (
  <div className="grid gap-4 md:grid-cols-3">
    <Info label="Full Name" value={staff.full_name} />
    <Info label="Phone" value={staff.phone} />
    <Info label="Current SPA" value={spaLabel(spaMap[staff.current_spa_id])} />
    <Info label="Joining Date" value={formatDate(staff.joining_date)} />
    <Info label="Leave Date" value={formatDate(staff.leave_date)} />
    <Info label="Address" value={[staff.address, staff.city, staff.state, staff.pincode].filter(Boolean).join(', ')} />
    <Info label="Verified At" value={formatDateTime(staff.verified_at)} />

    {staff.blacklist_reason && (
      <Info
        label="Blacklist Reason"
        value={staff.blacklist_reason}
        wide
      />
    )}

    {staff.verification_reason && (
      <Info
        label="Verification Reason"
        value={staff.verification_reason}
        wide
      />
    )}
  </div>
);

const Info = ({ label, value, wide }) => (
  <div className={`rounded-md border bg-gray-50 p-3 ${wide ? 'md:col-span-3' : ''}`}>
    <p className="text-xs font-medium uppercase text-gray-500">{label}</p>
    <p className="mt-1 text-sm text-gray-900">{value || '-'}</p>
  </div>
);

const Timeline = ({ items, spaMap = {}, type }) => {
  if (!items.length) return <p className="text-sm text-gray-500">No records yet.</p>;
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={item.id || index} className="rounded-md border p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-gray-900">
                {type === 'work' && spaLabel(spaMap[item.spa_id])}
                {type === 'verification' && `${titleCase(item.old_status || 'new')} to ${titleCase(item.new_status)}`}
                {type === 'events' && titleCase(item.event_type)}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {type === 'work' && `${formatDate(item.join_date)} to ${formatDate(item.leave_date)}${item.is_transferred ? ' - transferred' : ''}`}
                {type === 'verification' && item.reason}
                {type === 'events' && [spaLabel(spaMap[item.from_spa_id || item.spa_id]), item.to_spa_id ? `to ${spaLabel(spaMap[item.to_spa_id])}` : '', item.transfer_reason].filter(Boolean).join(' ')}
              </p>
              {item.notes && <p className="mt-2 text-sm text-gray-600">{item.notes}</p>}
            </div>
            <span className="whitespace-nowrap text-xs text-gray-400">{formatDateTime(item.created_at || item.event_date || item.join_date)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const DocumentsPanel = ({ staff, canAct, onVerify, onDelete, onReload }) => {
  const [uploading, setUploading] = useState({});
  const [type, setType] = useState('aadhaar');
  const [number, setNumber] = useState('');

  const upload = async (file) => {
    setUploading((prev) => ({ ...prev, document: true }));
    try {
      const fileRes = await staffApi.uploadStaffFile(file);
      await staffApi.addStaffDocument(getStaffKey(staff), {
        document_type: type,
        document_number: number || type,
        file_url: fileRes.data.url
      });
      setNumber('');
      toast.success('Document uploaded');
      onReload();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading((prev) => ({ ...prev, document: false }));
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-gray-50 p-3">
        <div className="grid gap-2 md:grid-cols-4">
          <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-md border px-3 py-2 text-sm">
            <option value="">Select type</option>
            <option value="aadhaar">Aadhaar</option>
            <option value="pan">PAN</option>
            <option value="passport_photo">Passport Photo</option>
            <option value="course_certificate">Certificate</option>
          </select>
          <input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="Document number" className="rounded-md border px-3 py-2 text-sm md:col-span-2" />
          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md bg-gray-900 px-3 py-2 text-sm text-white">
            <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            {uploading.document ? <FaSpinner className="animate-spin" /> : <FaCloudUploadAlt />} Upload
          </label>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {(staff.documents || []).map((doc) => (
          <DocumentCard key={doc.id} doc={doc} canAct={canAct} onVerify={() => onVerify(doc.id)} onDelete={() => onDelete(doc.id)} />
        ))}
      </div>
    </div>
  );
};
