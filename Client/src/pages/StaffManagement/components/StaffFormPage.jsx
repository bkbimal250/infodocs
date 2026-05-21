import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
    FaArrowLeft,
    FaBriefcase,
    FaCloudUploadAlt,
    FaFileAlt,
    FaPhone,
    FaSave,
    FaSpinner,
    FaUser
} from 'react-icons/fa';

import { authApi, staffApi } from '../../../api';

import {
    DOCUMENT_TYPES,
    EMPTY_FORM,
    getStaffKey,
    spaLabel,
    useSpas,
    mediaUrl
} from './StaffHelpers';

import {
    Field,
    Section,
    DocumentCard
} from './StaffHelpers';

const DesignationOptions = [
    'Therapist',
    'Receptionist',
    'Manager',
    'Housekeeping',
];


const FilePicker = ({
    label,
    value,
    loading,
    onFile
}) => (
    <div>
        <span className="mb-1 block text-sm font-medium text-gray-700">
            {label}
        </span>

        <label className="flex min-h-10 cursor-pointer items-center justify-between rounded-md border border-dashed px-3 py-2 text-sm text-gray-600 hover:border-gray-900">

            <input
                type="file"
                className="hidden"
                accept="image/*,application/pdf"
                onChange={(e) =>
                    e.target.files?.[0] &&
                    onFile(e.target.files[0])
                }
            />

            <span className="flex items-center gap-2">
                {loading
                    ? <FaSpinner className="animate-spin" />
                    : <FaCloudUploadAlt />
                }

                {value ? 'Uploaded' : 'Choose file'}
            </span>

            {value && (
                <a
                    href={mediaUrl(value)}
                    onClick={(e) => e.stopPropagation()}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600"
                >
                    Preview
                </a>
            )}
        </label>
    </div>
);


const DocumentUpload = ({
    onUpload,
    uploading
}) => {

    const [type, setType] = useState('aadhaar_photo');

    const [number, setNumber] = useState('');

    return (
        <div className="rounded-md border bg-gray-50 p-3">

            <div className="grid gap-2 sm:grid-cols-3">

                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="rounded-md border px-3 py-2 text-sm"
                >
                    {DOCUMENT_TYPES.map((item) => (
                        <option
                            key={item.value}
                            value={item.value}
                        >
                            {item.label}
                        </option>
                    ))}
                </select>

                <input
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="Document number"
                    className="rounded-md border px-3 py-2 text-sm"
                />

                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">

                    <input
                        type="file"
                        className="hidden"
                        accept="image/*,application/pdf"
                        onChange={(e) =>
                            e.target.files?.[0] &&
                            onUpload(
                                e.target.files[0],
                                type,
                                number
                            )
                        }
                    />

                    {uploading[`doc-${type}`]
                        ? <FaSpinner className="animate-spin" />
                        : <FaCloudUploadAlt />
                    }

                    Upload
                </label>

            </div>
        </div>
    );
};


export const StaffFormPage = ({
    mode = 'create',
    scope = 'admin',
    basePath = '/admin/staff'
}) => {

    const { id } = useParams();

    const navigate = useNavigate();

    const { spas } = useSpas();

    const [user, setUser] = useState(null);

    const [form, setForm] = useState(EMPTY_FORM);

    const [loading, setLoading] = useState(mode === 'edit');

    const [saving, setSaving] = useState(false);

    const [uploading, setUploading] = useState({});

    const [documents, setDocuments] = useState([]);


    useEffect(() => {
        authApi
            .getCurrentUser()
            .then((res) => setUser(res.data))
            .catch(() => { });
    }, []);


    useEffect(() => {

        if (mode !== 'edit') return;

        setLoading(true);

        staffApi
            .getStaff(id)
            .then((res) => {

                const data = res.data || {};

                setForm({
                    ...EMPTY_FORM,
                    ...data,

                    joining_date: data.joining_date
                        ? data.joining_date.slice(0, 10)
                        : '',

                    current_spa_id:
                        data.current_spa_id || ''
                });

                setDocuments(data.documents || []);
            })

            .catch(() => {
                toast.error('Failed to load staff');
                navigate(basePath);
            })

            .finally(() => setLoading(false));

    }, [basePath, id, mode, navigate]);


    useEffect(() => {

        if (
            mode === 'create' &&
            scope === 'manager' &&
            user?.spa_id
        ) {

            setForm((prev) => ({
                ...prev,
                current_spa_id: user.spa_id
            }));
        }

    }, [user, mode, scope]);


    const change = (e) => {

        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };


    const uploadFile = async (
        file,
        fieldName
    ) => {

        setUploading((prev) => ({
            ...prev,
            [fieldName]: true
        }));

        try {

            const res = await staffApi.uploadStaffFile(file);

            setForm((prev) => ({
                ...prev,
                [fieldName]: res.data.url
            }));

            toast.success('File uploaded');

        } catch (err) {

            toast.error(
                err.response?.data?.detail ||
                'Upload failed'
            );

        } finally {

            setUploading((prev) => ({
                ...prev,
                [fieldName]: false
            }));
        }
    };


    const uploadDocument = async (
        file,
        type,
        number = ''
    ) => {

        const key = `doc-${type}`;

        setUploading((prev) => ({
            ...prev,
            [key]: true
        }));

        try {

            const res = await staffApi.uploadStaffFile(file);

            setDocuments((prev) => [
                ...prev,
                {
                    document_type: type,
                    document_number: number,
                    file_url: res.data.url,
                    isLocal: true
                }
            ]);

            toast.success('Document ready');

        } catch (err) {

            toast.error(
                err.response?.data?.detail ||
                'Document upload failed'
            );

        } finally {

            setUploading((prev) => ({
                ...prev,
                [key]: false
            }));
        }
    };


    const payloadFromForm = () => {

        const payload = {

            full_name: form.full_name,

            phone: form.phone || null,

            gender: form.gender || null,

            profile_photo:
                form.profile_photo || null,

            address: form.address || null,

            city: form.city || null,

            state: form.state || null,

            pincode: form.pincode || null,

            designation:
                form.designation || null,

            current_spa_id:
                form.current_spa_id
                    ? Number(form.current_spa_id)
                    : null,

            joining_date:
                form.joining_date || null
        };

        if (mode === 'edit') {

            payload.employment_status =
                form.employment_status ||
                'inactive';
        }

        return payload;
    };


    const saveDocuments = async (
        staffKey
    ) => {

        const pending = documents.filter(
            (doc) =>
                doc.isLocal &&
                doc.file_url
        );

        for (const doc of pending) {

            await staffApi.addStaffDocument(
                staffKey,
                {
                    document_type:
                        doc.document_type,

                    document_number:
                        doc.document_number || null,

                    file_url: doc.file_url
                }
            );
        }
    };


    const submit = async (e) => {

        e.preventDefault();

        setSaving(true);

        try {

            const payload =
                payloadFromForm();

            const res =
                mode === 'edit'
                    ? await staffApi.updateStaff(
                        id,
                        payload
                    )
                    : await staffApi.createStaff(
                        payload
                    );

            await saveDocuments(
                getStaffKey(res.data)
            );

            toast.success(
                mode === 'edit'
                    ? 'Staff updated'
                    : 'Staff created'
            );

            navigate(basePath);

        } catch (err) {

            toast.error(
                err.response?.data?.detail ||
                'Save failed'
            );

        } finally {

            setSaving(false);
        }
    };


    if (loading) {

        return (
            <div className="p-8 text-sm text-gray-500">
                Loading staff form...
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">

            <form
                onSubmit={submit}
                className="mx-auto max-w-5xl space-y-5"
            >

                <div className="flex items-center justify-between">

                    <button
                        type="button"
                        onClick={() => navigate(basePath)}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                    >
                        <FaArrowLeft />
                        Back
                    </button>

                    <button
                        type="submit"
                        disabled={
                            saving ||
                            Object.values(uploading).some(Boolean)
                        }
                        className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                        {saving
                            ? <FaSpinner className="animate-spin" />
                            : <FaSave />
                        }

                        {mode === 'edit'
                            ? 'Update Staff'
                            : 'Create Staff'}
                    </button>
                </div>


                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        {mode === 'edit'
                            ? 'Edit Staff'
                            : 'Add Staff'}
                    </h1>

                    <p className="text-sm text-gray-500">
                        Staff profile and document management
                    </p>
                </div>


                <Section
                    title="Basic Details"
                    icon={<FaUser />}
                >

                    <Field
                        label="Full Name"
                        name="full_name"
                        value={form.full_name}
                        onChange={change}
                        required
                    />

                    <Field
                        label="Gender"
                        name="gender"
                        value={form.gender}
                        onChange={change}
                    >

                        <select
                            name="gender"
                            value={form.gender || ''}
                            onChange={change}
                            className="w-full rounded-md border px-3 py-2 text-sm"
                        >
                            <option value="">
                                Select gender
                            </option>

                            <option value="male">
                                Male
                            </option>

                            <option value="female">
                                Female
                            </option>

                            <option value="other">
                                Other
                            </option>
                        </select>

                    </Field>

                    <FilePicker
                        label="Profile Photo"
                        value={form.profile_photo}
                        loading={uploading.profile_photo}
                        onFile={(file) =>
                            uploadFile(
                                file,
                                'profile_photo'
                            )
                        }
                    />

                </Section>


                <Section
                    title="Contact Details"
                    icon={<FaPhone />}
                >

                    <Field
                        label="Phone"
                        name="phone"
                        value={form.phone}
                        onChange={change}
                        required
                    />

                </Section>


                <Section title="Address">

                    <Field
                        label="City"
                        name="city"
                        value={form.city}
                        onChange={change}
                    />

                    <Field
                        label="State"
                        name="state"
                        value={form.state}
                        onChange={change}
                    />

                    <Field
                        label="Pincode"
                        name="pincode"
                        value={form.pincode}
                        onChange={change}
                    />

                    <Field
                        label="Address"
                        name="address"
                        value={form.address}
                        onChange={change}
                    >

                        <textarea
                            name="address"
                            value={form.address || ''}
                            onChange={change}
                            rows={3}
                            className="w-full rounded-md border px-3 py-2 text-sm"
                        />

                    </Field>

                </Section>


                <Section
                    title="Employment"
                    icon={<FaBriefcase />}
                >

                    <Field
                        label="Designation"
                        name="designation"
                        value={form.designation}
                        onChange={change}
                    >
                        <select
                            name="designation"
                            value={form.designation || ''}
                            onChange={change}
                            className="w-full rounded-md border px-3 py-2 text-sm"
                        >
                            <option value="">Select designation</option>

                            {DesignationOptions.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field
                        label="Current SPA"
                        name="current_spa_id"
                        value={form.current_spa_id}
                        onChange={change}
                    >

                        <select
                            name="current_spa_id"
                            value={form.current_spa_id || ''}
                            onChange={change}
                            disabled={scope === 'manager'}
                            className="w-full rounded-md border px-3 py-2 text-sm disabled:bg-gray-100"
                        >

                            <option value="">
                                Central Pool
                            </option>

                            {spas.map((spa) => (
                                <option
                                    key={spa.id}
                                    value={spa.id}
                                >
                                    {spaLabel(spa)}
                                </option>
                            ))}

                        </select>

                    </Field>

                    <Field
                        label="Joining Date"
                        name="joining_date"
                        type="date"
                        value={form.joining_date}
                        onChange={change}
                    />

                    {mode === 'edit' && (

                        <Field
                            label="Employment Status"
                            name="employment_status"
                            value={form.employment_status}
                            onChange={change}
                        >

                            <select
                                name="employment_status"
                                value={
                                    form.employment_status ||
                                    'inactive'
                                }
                                onChange={change}
                                className="w-full rounded-md border px-3 py-2 text-sm"
                            >

                                <option value="active">
                                    Active
                                </option>

                                <option value="inactive">
                                    Inactive
                                </option>

                                <option value="resigned">
                                    Resigned
                                </option>

                            </select>

                        </Field>
                    )}

                </Section>


                <Section
                    title="Documents"
                    icon={<FaFileAlt />}
                >

                    <DocumentUpload
                        onUpload={uploadDocument}
                        uploading={uploading}
                    />

                    <div className="md:col-span-2 grid gap-3 md:grid-cols-2">

                        {documents.map((doc, index) => (

                            <DocumentCard
                                key={`${doc.id || index}-${doc.document_type}`}
                                doc={doc}
                            />
                        ))}

                    </div>

                </Section>

            </form>
        </div>
    );
};