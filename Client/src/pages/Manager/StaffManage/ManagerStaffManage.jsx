import { useState, useEffect } from 'react';
import { staffApi, authApi, adminApi } from '../../../api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaUsers, FaUserCheck, FaUserMinus } from 'react-icons/fa';

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
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_active: 0,
    today: { today_new_join: 0, today_re_join: 0, today_leave: 0 }
  });

  const [filters, setFilters] = useState({ search: '', status: '' });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals
  const [showHistory, setShowHistory] = useState(null);
  const [showTransfer, setShowTransfer] = useState(null);
  const [showLeave, setShowLeave] = useState(null);
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => { fetchInitialData(); }, []);

  // Reset page on filter change
  useEffect(() => { setCurrentPage(1); }, [filters]);

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
        allSpasRes.data.forEach(s => mapping[s.id] = { name: s.name, code: s.code, area: s.area });
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
      setLoading(true);
      const skip = (currentPage - 1) * itemsPerPage;
      const params = { 
        spa_id: spaId,
        skip,
        limit: itemsPerPage
      };
      
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
      
      const res = await staffApi.getAllStaff(params);
      setStaff(res.data.items || []);
      setTotalItems(res.data.total || 0);
    } catch (err) {
      toast.error('Failed to load staff list');
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when filters change
  useEffect(() => {
    if (user?.spa_id) loadStaff(user.spa_id);
  }, [filters, currentPage]);

  const loadStats = async (spaId) => {
    try {
      const res = await staffApi.getConsolidatedAnalytics({ spa_id: spaId });
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const executeDeleteStaff = async (member) => {
    if (!window.confirm(`Permanently delete ${member.name}?`)) return;
    try {
      await staffApi.deleteStaff(member.id);
      toast.success('Record deleted');
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
      toast.success('Recorded');
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
      toast.error('Failed to fetch history');
    }
  };

  // Pagination
  const paginatedStaff = staff;

  if (!user?.spa_id && !loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-8 rounded-lg border text-center max-w-sm">
        <FaUserMinus className="mx-auto text-3xl text-red-500 mb-4" />
        <h2 className="text-lg font-bold text-gray-900">Access Restricted</h2>
        <p className="text-gray-500 text-sm mt-1">Contact Administrator for branch assignment</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
            <p className="text-sm text-gray-500 mt-1">
              {spa?.name || 'Loading...'} {spa?.city && `· ${spa.city}`}
            </p>
          </div>
          <button
            onClick={() => navigate('/manager/staff/add')}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <FaUserPlus /> Add Staff
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard label="Active Staff" value={stats.total_active} color="blue" />
          <StatCard label="Joined Today" value={stats.today.today_new_join + stats.today.today_re_join} color="green" />
          <StatCard label="Left Today" value={stats.today.today_leave} color="red" />
        </div>

        {/* Filter + Table */}
        <div className="bg-white border rounded-lg overflow-hidden">
          <StaffFilter filters={filters} setFilters={setFilters} />
          <StaffTable
            loading={loading}
            staff={paginatedStaff}
            totalItems={totalItems}
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

const StatCard = ({ label, value, color }) => {
  const colors = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-emerald-600 bg-emerald-50',
    red: 'text-red-600 bg-red-50'
  };
  return (
    <div className="bg-white p-5 rounded-lg border flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${colors[color]}`}>
        {value}
      </div>
    </div>
  );
};

export default ManagerStaffManage;
