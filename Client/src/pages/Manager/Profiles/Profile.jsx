import { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSpinner } from 'react-icons/fa';
import { authApi } from '../../../api/Auth/authApi';
import { usersApi } from '../../../api/Users/usersApi';
import { adminApi } from '../../../api/Admin/adminApi';
import SelectSpa from '../../common/Selectspa';
import toast from 'react-hot-toast';

const ManagerProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [spas, setSpas] = useState([]);
  const [formData, setFormData] = useState({
    username: '', email: '', first_name: '', last_name: '',
    phone_number: '', spa_id: null,
  });

  useEffect(() => { loadProfile(); loadSpas(); }, []);

  const loadSpas = async () => {
    try { const res = await adminApi.forms.getSpas(); setSpas(res.data || []); }
    catch {}
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await authApi.getCurrentUser();
      const u = res.data;
      setUser(u);
      setFormData({
        username: u.username || '', email: u.email || '',
        first_name: u.first_name || '', last_name: u.last_name || '',
        phone_number: u.phone_number || '', spa_id: u.spa_id || null,
      });
    } catch { toast.error('Failed to load profile'); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await usersApi.updateProfile(user.id, formData);
      await loadProfile();
      setEditing(false);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Update failed');
    } finally { setSaving(false); }
  };

  const handleCancel = () => {
    setFormData({
      username: user.username || '', email: user.email || '',
      first_name: user.first_name || '', last_name: user.last_name || '',
      phone_number: user.phone_number || '', spa_id: user.spa_id || null,
    });
    setEditing(false);
  };

  const getRoleLabel = (role) => ({
    super_admin: 'Super Admin', admin: 'Admin',
    spa_manager: 'SPA Manager', hr: 'HR', user: 'User'
  }[role] || role);

  const currentSpa = spas.find(s => String(s.id) === String(formData.spa_id));

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <FaSpinner className="animate-spin text-gray-300 text-xl" />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white border rounded-lg p-8 text-center max-w-sm">
        <p className="font-semibold text-gray-700 mb-3">Failed to load profile</p>
        <button onClick={loadProfile} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm">
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your account details</p>
        </div>

        <div className="bg-white border rounded-lg overflow-hidden">

          {/* Identity Banner */}
          <div className="p-6 border-b flex flex-col sm:flex-row items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center text-white text-xl font-bold shrink-0">
              {(user.first_name?.charAt(0) || user.username?.charAt(0) || '?').toUpperCase()}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-lg font-bold text-gray-900">
                {user.first_name} {user.last_name}
              </h2>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                  {getRoleLabel(user.role)}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  user.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                }`}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <FaEdit size={12} /> Edit
              </button>
            )}
          </div>

          {/* Form Fields */}
          <div className="p-6 space-y-6">

            {/* Personal */}
            <div>
              <p className="text-xs text-gray-400 font-medium mb-3">Account Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Username" name="username" value={formData.username} onChange={handleChange} icon={<FaUser />} editing={editing} />
                <Field label="Email" name="email" value={formData.email} onChange={handleChange} icon={<FaEnvelope />} editing={editing} type="email" />
                <Field label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} editing={editing} />
                <Field label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} editing={editing} />
                <Field label="Phone" name="phone_number" value={formData.phone_number} onChange={handleChange} icon={<FaPhone />} editing={editing} type="tel" />
              </div>
            </div>

            {/* Branch */}
            <div className="pt-4 border-t">
              <p className="text-xs text-gray-400 font-medium mb-3">Branch Assignment</p>
              {editing ? (
                <SelectSpa
                  value={formData.spa_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, spa_id: e.target.value }))}
                  label="Assigned Branch"
                  placeholder="Search branch..."
                />
              ) : (
                <div className="p-4 bg-gray-50 border rounded-lg flex items-center gap-3">
                  <FaMapMarkerAlt className="text-gray-400" />
                  {currentSpa ? (
                    <div>
                      <p className="text-sm font-medium text-gray-900">{currentSpa.name}</p>
                      <p className="text-xs text-gray-400">
                        {[currentSpa.area, currentSpa.city, currentSpa.code].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No branch assigned</p>
                  )}
                </div>
              )}
            </div>

            {/* Account Info (read-only) */}
            {!editing && (
              <div className="pt-4 border-t">
                <p className="text-xs text-gray-400 font-medium mb-3">Account History</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-400 mb-0.5">Last Login</p>
                    <p className="text-sm font-medium text-gray-700">
                      {user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never'}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-400 mb-0.5">Registered</p>
                    <p className="text-sm font-medium text-gray-700">
                      {new Date(user.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {editing && (
              <div className="pt-4 border-t flex justify-end gap-3">
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-5 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {saving ? <FaSpinner className="animate-spin" /> : null}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Inline Field Component ─── */
const Field = ({ label, name, value, onChange, icon, editing, type = 'text' }) => (
  <div>
    <label className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
      {icon && <span className="text-gray-300">{icon}</span>}
      {label}
    </label>
    {editing ? (
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-gray-900 transition-colors"
      />
    ) : (
      <p className="px-3 py-2 bg-gray-50 border border-transparent rounded-lg text-sm text-gray-700 min-h-[38px] flex items-center">
        {value || <span className="text-gray-300 italic">Not set</span>}
      </p>
    )}
  </div>
);

export default ManagerProfile;
