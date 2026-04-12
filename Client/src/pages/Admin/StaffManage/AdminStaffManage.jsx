import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { staffApi, adminApi } from '../../../api';
import { toast } from 'react-hot-toast';
import {
  FaUserPlus, FaUsers, FaUserCheck, FaUserMinus, FaExchangeAlt, FaSignOutAlt, FaSyncAlt
} from 'react-icons/fa';

// Components
import StaffManageFilter from './components/StaffManageFilter';
import AdminStaffTable from './components/AdminStaffTable';
import { HistoryModal, TransferModal, LeaveModal } from './components/AdminStaffModals';

const AdminStaffManage = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [allSpas, setAllSpas] = useState([]);
  const [allSpasMap, setAllSpasMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_active: 0,
    total_left: 0,
    today: {
      today_new_join: 0,
      today_re_join: 0,
      today_transfer_out: 0,
      today_leave: 0
    }
  });

  const [filters, setFilters] = useState({
    spa_id: '',
    status: '',
    search: ''
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Workflow states
  const [showHistory, setShowHistory] = useState(null);
  const [showTransfer, setShowTransfer] = useState(null);
  const [showLeave, setShowLeave] = useState(null);
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchStaff();
    fetchStats();
    setCurrentPage(1); // Reset to first page on filter change
  }, [filters.spa_id, filters.status, filters.search]);

  // Derived paginated staff
  const paginatedStaff = staff.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchInitialData = async () => {
    try {
      const spaRes = await adminApi.forms.getAllSpas();
      const spaData = spaRes.data || [];
      setAllSpas(spaData);

      const mapping = {};
      spaData.forEach(s => mapping[s.id] = s.name);
      setAllSpasMap(mapping);
    } catch (err) {
      toast.error('Failed to load SPAs');
    }
  };

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await staffApi.getAllStaff({
        spa_id: filters.spa_id || undefined,
        status: filters.status || undefined,
        search: filters.search || undefined
      });
      setStaff(res.data || []);
    } catch (err) {
      toast.error('Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const spaId = filters.spa_id || undefined;
      const todayRes = await staffApi.getTodayAnalytics({ spa_id: spaId });
      const overallRes = await staffApi.getOverallAnalytics({ spa_id: spaId });
      setStats({
        ...overallRes.data,
        today: todayRes.data
      });
    } catch (err) {
      console.error('Stats error', err);
    }
  };

  const viewHistory = async (member) => {
    try {
      const res = await staffApi.getHistory(member.id);
      setHistoryData(res.data || []);
      setShowHistory(member);
    } catch (err) {
      toast.error('Failed to load history');
    }
  };

  const executeDeleteStaff = async (member) => {
    if (!window.confirm(`Are you sure you want to PERMANENTLY delete ${member.name}? This action is irreversible.`)) {
      return;
    }
    try {
      await staffApi.deleteStaff(member.id);
      toast.success('Staff record purged successfully');
      fetchStaff();
      fetchStats();
    } catch (err) {
      toast.error('Failed to delete staff record');
    }
  };

  const executeTransfer = async (data) => {
    try {
      await staffApi.transferStaff(showTransfer.id, data);
      toast.success('Staff transferred successfully');
      setShowTransfer(null);
      fetchStaff();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Transfer failed');
    }
  };

  const executeLeave = async (data) => {
    try {
      await staffApi.markLeft(showLeave.id, data);
      toast.success('Separation finalized successfully');
      setShowLeave(null);
      fetchStaff();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Action failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">
              Staff <span className="text-blue-600">Governance</span>
            </h1>
            <div className="flex items-center gap-3">
              <span className="w-12 h-1.5 bg-gray-900 rounded-full"></span>
              <p className="text-[10px] font-black text-gray-400  tracking-[0.3em]">Administrator Command Center</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => { fetchStaff(); fetchStats(); }}
              className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 hover:shadow-xl transition-all active:scale-90"
              title="Synchronize Data"
            >
              <FaSyncAlt className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => navigate('/admin/staff/add')}
              className="flex-grow md:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black shadow-2xl shadow-gray-200 hover:bg-black transition-all active:scale-95 text-xs  tracking-widest"
            >
              <FaUserPlus size={14} /> <span>Enroll New Staff</span>
            </button>
          </div>
        </div>

        {/* Intelligence Grid (Stats) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard
            label="Live Workforce"
            value={stats.total_active}
            subtitle="Active members"
            icon={<FaUsers />}
            color="blue"
          />
          <StatCard
            label="Inbound Sync"
            value={stats.today.today_new_join + stats.today.today_re_join}
            subtitle="Joined today"
            icon={<FaUserCheck />}
            color="emerald"
          />
          <StatCard
            label="Departures"
            value={stats.today.today_leave}
            subtitle="Finalized today"
            icon={<FaSignOutAlt />}
            color="rose"
          />
          <StatCard
            label="Transfer Flux"
            value={stats.today.today_transfer_out}
            subtitle="In motion"
            icon={<FaExchangeAlt />}
            color="orange"
          />
        </div>

        {/* Governance Controls (Filters) */}
        <StaffManageFilter
          filters={filters}
          setFilters={setFilters}
          onRefresh={fetchStaff}
          spas={allSpas}
        />

        {/* Workforce Registry (Main Table/Cards) */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-50 overflow-hidden min-h-[400px]">
          <AdminStaffTable
            loading={loading}
            staff={paginatedStaff}
            totalItems={staff.length}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            allSpasMap={allSpasMap}
            navigate={navigate}
            viewHistory={viewHistory}
            setShowTransfer={setShowTransfer}
            executeDeleteStaff={executeDeleteStaff}
            setShowLeave={setShowLeave}
          />
        </div>
      </div>

      {/* Workforce Workflows (Modals) */}
      {showHistory && (
        <HistoryModal
          staff={showHistory}
          history={historyData}
          allSpasMap={allSpasMap}
          onClose={() => setShowHistory(null)}
        />
      )}

      {showTransfer && (
        <TransferModal
          staff={showTransfer}
          spas={allSpas}
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

// Sub-components
const StatCard = ({ icon, label, value, color, subtitle }) => {
  const colorMap = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100 shadow-blue-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100 shadow-emerald-100',
    rose: 'text-rose-600 bg-rose-50 border-rose-100 shadow-rose-100',
    orange: 'text-orange-600 bg-orange-50 border-orange-100 shadow-orange-100'
  };

  return (
    <div className={`p-5 md:p-6 rounded-[2rem] border-2 bg-white transition-all hover:scale-[1.02] cursor-default group relative overflow-hidden flex flex-col items-start gap-4 ${colorMap[color].split(' ').slice(0, 3).join(' ')}`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-black text-gray-400  tracking-[0.2em] mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter">{value}</p>
          <p className="text-[10px] font-black text-gray-400  tracking-tighter whitespace-nowrap">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminStaffManage;

