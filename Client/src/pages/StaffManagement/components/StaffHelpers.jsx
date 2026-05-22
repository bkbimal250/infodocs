import React, { useEffect, useMemo, useState } from 'react';
import { FaCheckCircle, FaTimes } from 'react-icons/fa';
import { adminApi } from '../../../api';

export const DOCUMENT_TYPES = [
    { value: 'aadhaar_photo', label: 'Aadhaar Photo' },
    { value: 'pancard', label: 'PAN Card' },
    { value: 'passport_size_photo', label: 'Passport Size Photo' },
    { value: 'course_certificate', label: 'Course Certificate' },
    { value: 'other', label: 'Other' }
];

export const EMPTY_FORM = {
    full_name: '',
    phone: '',
    gender: '',
    profile_photo: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    designation: '',
    current_spa_id: '',
    joining_date: new Date().toISOString().split('T')[0],
    employment_status: 'inactive'
};

export const getStaffKey = (staff) => staff?.staff_uuid || staff?.id;
export const staffName = (staff) => staff?.full_name || staff?.name || 'Staff member';
export const titleCase = (value) => String(value || '').replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
export const formatDate = (value) => value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
export const formatDateTime = (value) => value ? new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '-';

export const mediaUrl = (path) => {
    if (!path) return '';
    if (String(path).startsWith('http')) return path;
    const base = (import.meta.env.VITE_API_BASE_URL || 'https://infodocs.api.d0s369.co.in/api').replace(/\/api\/?$/, '');
    return `${base}/${String(path).replace(/^\//, '')}`;
};

export const normalizePage = (data) => ({
    items: data?.items || data?.results || (Array.isArray(data) ? data : []),
    total: data?.total ?? data?.count ?? (Array.isArray(data) ? data.length : 0)
});

export const roleHasStaffActions = (user, scope) => {
    const role = user?.role || user?.user_role || user?.type || '';
    return ['admin', 'super_admin', 'hr'].includes(role) || scope === 'admin' || scope === 'hr';
};

export const canVerifyStaff = (user, scope, staff) => {
    const role = user?.role || user?.user_role || user?.type || '';
    if (['admin', 'super_admin'].includes(role)) return true;
    return role === 'spa_manager' && scope === 'manager' && staff?.created_by === user?.id;
};

export const spaLabel = (spa) => {
    if (!spa) return 'Central Pool';
    return [spa.name, spa.code ? `#${spa.code}` : '', spa.area || spa.city || ''].filter(Boolean).join(' - ');
};

const badgeStyles = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    inactive: 'bg-gray-50 text-gray-600 border-gray-200',
    resigned: 'bg-rose-50 text-rose-700 border-rose-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    verified: 'bg-blue-50 text-blue-700 border-blue-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    blacklisted: 'bg-gray-900 text-white border-gray-900'
};

export const Badge = ({ value, tone }) => (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${badgeStyles[tone || value] || badgeStyles.inactive}`}>
        {titleCase(value || 'unknown')}
    </span>
);

export const Modal = ({ title, children, onClose, width = 'max-w-lg' }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
        <div className={`w-full ${width} max-w-full sm:max-w-xl md:max-w-2xl max-h-[calc(100vh-3rem)] overflow-hidden rounded-3xl bg-white shadow-2xl`}>
            <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <button type="button" onClick={onClose} className="rounded-2xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label="Close">
                    <FaTimes />
                </button>
            </div>
            <div className="max-h-[calc(100vh-9rem)] overflow-y-auto p-5">{children}</div>
        </div>
    </div>
);

export const Field = ({ label, name, value, onChange, type = 'text', required, children }) => (
    <label className="block">
        <span className="mb-1 block text-sm font-medium text-gray-700">{label}{required ? ' *' : ''}</span>
        {children || (
            <input
                type={type}
                name={name}
                value={value || ''}
                onChange={onChange}
                required={required}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
            />
        )}
    </label>
);

export const Section = ({ title, icon, children }) => (
    <section className="rounded-lg border bg-white p-5">
        <div className="mb-4 flex items-center gap-2 text-gray-900">
            {icon}
            <h2 className="text-base font-semibold">{title}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
);

export const ProfilePhoto = ({ staff, size = 'h-11 w-11' }) => (
    <div className={`${size} shrink-0 overflow-hidden rounded-full bg-gray-900 text-white`}>
        {staff?.profile_photo ? (
            <img src={mediaUrl(staff.profile_photo)} alt={staffName(staff)} className="h-full w-full object-cover" />
        ) : (
            <div className="flex h-full w-full items-center justify-center font-semibold">{staffName(staff).charAt(0).toUpperCase()}</div>
        )}
    </div>
);

export const MenuItem = ({ icon, children, danger, onClick }) => (
    <button type="button" onClick={onClick} className={`flex w-full items-center gap-2 rounded px-3 py-2 text-left hover:bg-gray-50 ${danger ? 'text-rose-600' : 'text-gray-700'}`}>
        {icon} {children}
    </button>
);

export const Info = ({ label, value, wide }) => (
    <div className={`rounded-md border bg-gray-50 p-3 ${wide ? 'md:col-span-3' : ''}`}>
        <p className="text-xs font-medium uppercase text-gray-500">{label}</p>
        <p className="mt-1 text-sm text-gray-900">{value || '-'}</p>
    </div>
);

export const DocumentCard = ({ doc, canAct, onVerify, onDelete }) => (
    <div className="rounded-md border bg-white p-4">
        <div className="flex items-start justify-between gap-3">
            <div>
                <p className="font-medium text-gray-900">
                    {titleCase(doc.document_type)}
                </p>

                <p className="text-sm text-gray-500">
                    {doc.document_number || '-'}
                </p>

                <div className="mt-2 flex gap-2">
                    <Badge value={doc.verification_status} />

                    {doc.file_url && (
                        <a
                            href={mediaUrl(doc.file_url)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-blue-600"
                        >
                            Preview
                        </a>
                    )}
                </div>
            </div>

            {canAct && doc.id && (
                <div className="flex gap-1">
                    {doc.verification_status !== 'verified' && (
                        <button
                            type="button"
                            onClick={onVerify}
                            className="rounded-md p-2 text-blue-600 hover:bg-blue-50"
                            title="Verify"
                        >
                            <FaCheckCircle />
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={onDelete}
                        className="rounded-md p-2 text-rose-600 hover:bg-rose-50"
                        title="Delete"
                    >
                        <FaTimes />
                    </button>
                </div>
            )}
        </div>
    </div>
);

export const useSpas = () => {
    const [spas, setSpas] = useState([]);
    const [loadingSpas, setLoadingSpas] = useState(true);

    useEffect(() => {
        adminApi.forms.getAllSpas()
            .then((res) => {
                const payload = res?.data;
                const list = Array.isArray(payload)
                    ? payload
                    : payload?.items || payload?.results || [];
                setSpas(list);
            })
            .catch(() => {
                setSpas([]);
            })
            .finally(() => {
                setLoadingSpas(false);
            });
    }, []);

    const spaMap = useMemo(() => Object.fromEntries((spas || []).map((spa) => [spa.id, spa])), [spas]);
    return { spas, spaMap, loadingSpas };
};
