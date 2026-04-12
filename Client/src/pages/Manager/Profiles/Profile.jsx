import { useState, useEffect } from 'react';
import {
  HiOutlineUser, HiOutlineMail, HiOutlinePhone,
  HiOutlineCalendar, HiOutlineShieldCheck, HiOutlineBadgeCheck,
  HiOutlineOfficeBuilding
} from 'react-icons/hi';
import { authApi } from '../../../api/Auth/authApi';
import { usersApi } from '../../../api/Users/usersApi';
import { adminApi } from '../../../api/Admin/adminApi';
import toast from 'react-hot-toast';

// Modular Components
import ProfileHeader from './components/ProfileHeader';
import ProfileInfoField from './components/ProfileInfoField';
import BranchAssignment from './components/BranchAssignment';

/**
 * Manager Profile Page
 * Enhanced version with modular components and premium UI
 */
const ManagerProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    spa_id: null,
  });
  const [spas, setSpas] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
    loadSpas();
  }, []);

  const loadSpas = async () => {
    try {
      const response = await adminApi.forms.getSpas();
      setSpas(response.data || []);
    } catch (error) {
      console.error('Error loading SPAs:', error);
    }
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await authApi.getCurrentUser();
      const userData = response.data;
      setUser(userData);
      setFormData({
        username: userData.username || '',
        email: userData.email || '',
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        phone_number: userData.phone_number || '',
        spa_id: userData.spa_id || null,
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await usersApi.updateProfile(user.id, formData);
      await loadProfile();
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to update profile';
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user.username || '',
      email: user.email || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone_number: user.phone_number || '',
      spa_id: user.spa_id || null,
    });
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent shadow-xl"></div>
          <p className="text-[10px] font-black text-gray-400  tracking-[0.3em]">Synchronizing Profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center p-12 bg-white rounded-3xl shadow-2xl">
          <p className="text-gray-900 font-black text-xl mb-4">PROFILE ACCESS FAILED</p>
          <button
            onClick={loadProfile}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-xl"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page Title */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">
            Manager <span className="text-blue-600">Identity</span>
          </h1>
          <div className="flex items-center justify-center sm:justify-start gap-4 mt-2">
            <span className="w-12 h-1 bg-gray-900 rounded-full"></span>
            <p className="text-[10px] font-black text-gray-400  tracking-[0.3em]">Credentials & Branch Governance</p>
          </div>
        </div>

        {/* Profile Master Card */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.05)] overflow-hidden border border-gray-50">

          <ProfileHeader
            firstName={user.first_name}
            lastName={user.last_name}
            role={user.role}
            editing={editing}
            onEditStart={() => setEditing(true)}
          />

          <div className="p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">

              {/* Personal Intelligence section */}
              <div className="md:col-span-2">
                <h3 className="text-xs font-black text-gray-900  tracking-[0.2em] mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  Personal Intelligence
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ProfileInfoField
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    icon={<HiOutlineUser />}
                    editing={editing}
                  />
                  <ProfileInfoField
                    label="Email Authority"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    icon={<HiOutlineMail />}
                    editing={editing}
                    type="email"
                  />
                  <ProfileInfoField
                    label="Legal First Name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    editing={editing}
                  />
                  <ProfileInfoField
                    label="Legal Last Name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    editing={editing}
                  />
                  <ProfileInfoField
                    label="Direct Line"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    icon={<HiOutlinePhone />}
                    editing={editing}
                    type="tel"
                  />
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400  tracking-widest ml-1 mb-1">
                      <HiOutlineShieldCheck className="text-blue-500 text-xs" />
                      Status & Verification
                    </label>
                    <div className="flex items-center gap-3 px-1">
                      <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black  tracking-widest border ${user.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                        {user.is_active ? 'ACTIVE STATUS' : 'INACTIVE'}
                      </span>
                      {user.is_verified && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-[10px] font-black  tracking-widest">
                          <HiOutlineBadgeCheck /> VERIFIED
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Branch Assignment Section */}
              <div className="md:col-span-2 pt-8 border-t border-gray-100">
                <h3 className="text-xs font-black text-gray-900  tracking-[0.2em] mb-6 flex items-center gap-2 text-blue-600">
                  <HiOutlineOfficeBuilding className="text-sm" />
                  Infrastructure Mapping
                </h3>
                <BranchAssignment
                  spaId={formData.spa_id}
                  spas={spas}
                  editing={editing}
                  onChange={(id) => setFormData(prev => ({ ...prev, spa_id: id }))}
                />
              </div>

              {/* Account History (Read-only) */}
              {!editing && (
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 border-t border-gray-50">
                  <div className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm">
                      <HiOutlineCalendar />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400  tracking-widest leading-none mb-1">Last Protocol Entry</p>
                      <p className="text-xs font-extrabold text-gray-900">{user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'NEVER'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm">
                      <HiOutlineCalendar />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400  tracking-widest leading-none mb-1">Registration Date</p>
                      <p className="text-xs font-extrabold text-gray-900">{new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {editing && (
                <div className="md:col-span-2 mt-8 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-end gap-4">
                  <button
                    onClick={handleCancel}
                    className="w-full sm:w-auto px-10 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs  tracking-widest hover:bg-gray-200 transition-all active:scale-95"
                    disabled={saving}
                  >
                    Discard Changes
                  </button>
                  <button
                    onClick={handleSave}
                    className="w-full sm:w-auto px-12 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs  tracking-widest hover:bg-black transition-all active:scale-95 disabled:opacity-50 shadow-2xl shadow-gray-200"
                    disabled={saving}
                  >
                    {saving ? 'Synchronizing...' : 'Finalize Profile'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerProfile;


