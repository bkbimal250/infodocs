import { useState, useEffect } from 'react';
import { staffApi, authApi, adminApi } from '../../../api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  FaUserPlus, FaUsers, FaUserCheck, FaUserMinus
} from 'react-icons/fa';

// Sub-components
import StaffFilter from './components/StaffFilter';
import StaffTable from './components/StaffTable';
import HistoryModal from './components/HistoryModal';
import TransferModal from './components/TransferModal';
import LeaveModal from './components/LeaveModal';

const ManagerStaffManage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [spa, setSpa] = useState(null);
  const [allSpasMap, setAllSpasMap] = useState({});
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_active: 0,
    today: { today_new_join: 0, today_re_join: 0, today_leave: 0 }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [showHistory, setShowHistory] = useState(null);
  const [showTransfer, setShowTransfer] = useState(null);
  const [showLeave, setShowLeave] = useState(null);
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const userRes = await authApi.getCurrentUser();
      const userData = userRes.data;
      setUser(userData);

      if (userData.spa_id) {
        const spaRes = await adminApi.forms.getSpa(userData.spa_id);
        setSpa(spaRes.data);

        const allSpasRes = await adminApi.forms.getAllSpas();
        const mapping = {};
        allSpasRes.data.forEach(s => mapping[s.id] = s.name);
        setAllSpasMap(mapping);

        loadStaff(userData.spa_id);
        loadStats(userData.spa_id);
      } else {
        toast.error('You are not assigned to any branch');
        setLoading(false);
      }
    } catch (err) {
      toast.error('Failed to load system data');
      setLoading(false);
    }
  };

  const loadStaff = async (spaId) => {
    try {
      const res = await staffApi.getAllStaff({ spa_id: spaId });
      setStaff(res.data || []);
    } catch (err) {
      toast.error('Failed to load staff list');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async (spaId) => {
    try {
      const todayRes = await staffApi.getTodayAnalytics({ spa_id: spaId });
      const overallRes = await staffApi.getOverallAnalytics({ spa_id: spaId });
      setStats({
        ...overallRes.data,
        today: todayRes.data
      });
    } catch (err) { }
  };

  const executeDeleteStaff = async (member) => {
    if (!window.confirm(`Are you sure you want to PERMANENTLY delete ${member.name}?`)) {
      return;
    }
    try {
      await staffApi.deleteStaff(member.id);
      toast.success('Record purged');
      loadStaff(user.spa_id);
      loadStats(user.spa_id);
    } catch (err) {
      toast.error('Deletion failed');
    }
  };

  const executeTransfer = async (data) => {
    try {
      await staffApi.transferStaff(showTransfer.id, data);
      toast.success('Transfer complete');
      setShowTransfer(null);
      loadStaff(user.spa_id);
    } catch (err) {
      toast.error('Transfer failed');
    }
  };

  const executeLeave = async (data) => {
    try {
      await staffApi.markLeft(showLeave.id, data);
      toast.success('Termination recorded');
      setShowLeave(null);
      loadStaff(user.spa_id);
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const viewHistory = async (member) => {
    try {
      const res = await staffApi.getHistory(member.id);
      setHistoryData(res.data || []);
      setShowHistory(member);
    } catch (err) {
      toast.error('Failed to fetch logs');
    }
  };

  const filteredStaff = staff.filter(s => {
    const matchesSearch = s.name?.toLowerCase().includes(searchQuery.toLowerCase()) || s.phone?.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || s.current_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Derived paginated staff
  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page relative to filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  if (!user?.spa_id && !loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 text-center max-w-sm">
        <FaUserMinus className="mx-auto text-4xl text-red-500 mb-6" />
        <h2 className="text-xl font-black text-gray-900 tracking-tight">Access Restricted</h2>
        <p className="text-gray-400 text-sm mt-2 leading-relaxed font-bold  tracking-widest text-[9px]">Contact Administrator for branch assignment</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-10 bg-gray-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-4 w-1 bg-blue-600 rounded-full"></span>
              <span className="text-[10px] font-black text-gray-400  tracking-widest">Workspace Dashboard</span>
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none mb-3">Branch Workforce</h1>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-white border border-gray-100 rounded-lg shadow-sm flex items-center gap-2">
                <FaBuilding className="text-blue-500" size={10} />
                <span className="text-[10px] font-black text-blue-600  tracking-tighter">{spa?.name || 'Loading...'}</span>
              </div>
              <span className="text-[10px] font-bold text-gray-400">{spa?.city}</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/manager/staff/add')}
            className="group flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-[1.5rem] font-black  tracking-widest text-[10px] shadow-2xl hover:bg-blue-600 transition-all active:scale-95"
          >
            <FaUserPlus className="group-hover:rotate-12 transition-transform" /> Add New Specialist
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <StatCard icon={<FaUsers size={18} />} label="Total Strength" value={stats.total_active} color="blue" subtitle="Active members" />
          <StatCard icon={<FaUserCheck size={18} />} label="New Onboarding" value={stats.today.today_new_join + stats.today.today_re_join} color="green" subtitle="Joined today" />
          <StatCard icon={<FaUserMinus size={18} />} label="Offboarding" value={stats.today.today_leave} color="red" subtitle="Left today" />
        </div>

        {/* Table/ListView Container */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-white/50 overflow-hidden">
          <StaffFilter
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
          <StaffTable
            loading={loading}
            spa={spa}
            filteredStaff={paginatedStaff}
            totalItems={filteredStaff.length}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            navigate={navigate}
            viewHistory={viewHistory}
            setShowTransfer={setShowTransfer}
            executeDeleteStaff={executeDeleteStaff}
            setShowLeave={setShowLeave}
          />
        </div>
      </div>

      {/* Modals */}
      {showHistory && (
        <HistoryModal
          staff={showHistory}
          historyData={historyData}
          allSpasMap={allSpasMap}
          onClose={() => setShowHistory(null)}
        />
      )}

      {showTransfer && (
        <TransferModal
          staff={showTransfer}
          onClose={() => setShowTransfer(null)}
          onSubmit={executeTransfer}
        />
      )}

      {showLeave && (
        <LeaveModal
          staff={showLeave}
          onClose={() => setShowLeave(null)}
          onSubmit={executeLeave}
        />
      )}
    </div>
  );
};

const FaBuilding = ({ className, size }) => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height={size} width={size} className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path>
    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path>
    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path>
    <path d="M10 6h4"></path>
    <path d="M10 10h4"></path>
    <path d="M10 14h4"></path>
    <path d="M10 18h4"></path>
  </svg>
);

const StatCard = ({ icon, label, value, color, subtitle }) => {
  const themes = {
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/10',
    green: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/10',
    red: 'text-red-500 bg-red-500/10 border-red-500/10'
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-blue-900/5 flex items-center justify-between group hover:scale-[1.02] transition-all cursor-default">
      <div>
        <p className="text-[10px] font-black text-gray-400  tracking-widest leading-none mb-3">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-black text-gray-900 leading-none tracking-tightest">{value}</p>
          {subtitle && <p className="text-[9px] font-bold text-gray-300  whitespace-nowrap">{subtitle}</p>}
        </div>
      </div>
      <div className={`w-14 h-14 rounded-3xl flex items-center justify-center transition-transform group-hover:scale-110 border ${themes[color]}`}>
        {icon}
      </div>
    </div>
  );
};

export default ManagerStaffManage;
