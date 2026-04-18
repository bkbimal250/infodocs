import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { staffApi, adminApi } from '../../../api';
import { toast } from 'react-hot-toast';
import {
  FaUserPlus, FaUsers, FaUserCheck, FaSignOutAlt, FaExchangeAlt, FaSyncAlt
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
  const [totalItems, setTotalItems] = useState(0);
  const [availableCities, setAvailableCities] = useState([]);

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
    city: '',
    status: '',
    search: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
  }, [filters, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // With server-side pagination, 'staff' already contains the current page
  const paginatedStaff = staff;

  const fetchInitialData = async () => {
    try {
      const spaRes = await adminApi.forms.getAllSpas();
      const spaData = spaRes.data || [];
      setAllSpas(spaData);

      const mapping = {};
      spaData.forEach(s => mapping[s.id] = s); // store full spa object
      setAllSpasMap(mapping);
    } catch {
      toast.error('Failed to load SPAs');
    }

    try {
      const cityRes = await staffApi.getCities();
      setAvailableCities(cityRes.data || []);
    } catch {
      console.warn('Failed to load cities');
    }
  };

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      
      const skip = (currentPage - 1) * itemsPerPage;
      const res = await staffApi.getAllStaff({
        ...cleanFilters,
        skip,
        limit: itemsPerPage
      });
      
      // Backend returns { items, total, skip, limit }
      setStaff(res.data.items || []);
      setTotalItems(res.data.total || 0);
    } catch {
      toast.error('Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const spaId = filters.spa_id || undefined;
      const res = await staffApi.getConsolidatedAnalytics({ spa_id: spaId });
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const viewHistory = async (member) => {
    try {
      const res = await staffApi.getHistory(member.id);
      setHistoryData(res.data || []);
      setShowHistory(member);
    } catch {
      toast.error('Failed to load history');
    }
  };

  const executeDeleteStaff = async (member) => {
    if (!window.confirm(`Delete ${member.name}?`)) return;

    try {
      await staffApi.deleteStaff(member.id);
      toast.success('Deleted successfully');
      fetchStaff();
      fetchStats();
    } catch {
      toast.error('Delete failed');
    }
  };

  const executeTransfer = async (data) => {
    try {
      await staffApi.transferStaff(showTransfer.id, data);
      toast.success('Transferred');
      setShowTransfer(null);
      fetchStaff();
      fetchStats();
    } catch {
      toast.error('Transfer failed');
    }
  };

  const executeLeave = async (data) => {
    try {
      await staffApi.markLeft(showLeave.id, data);
      toast.success('Marked as left');
      setShowLeave(null);
      fetchStaff();
      fetchStats();
    } catch {
      toast.error('Action failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Staff Management
            </h1>
            <p className="text-sm text-gray-500">
              Manage staff, transfers, and activity
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => { fetchStaff(); fetchStats(); }}
              className="p-2 border rounded-md bg-white hover:bg-gray-100"
            >
              <FaSyncAlt className={loading ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={() => navigate('/admin/staff/add')}
              className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm"
            >
              <FaUserPlus className="inline mr-2" />
              Add Staff
            </button>
          </div>
        </div>

        {/* Stats */}
        <div>
          <h2 className="text-sm font-medium text-gray-600 mb-2">
            Overview
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Active" value={stats.total_active} icon={<FaUsers />} />
            <StatCard label="Joined Today" value={stats.today.today_new_join + stats.today.today_re_join} icon={<FaUserCheck />} />
            <StatCard label="Left Today" value={stats.today.today_leave} icon={<FaSignOutAlt />} />
            <StatCard label="Transfers" value={stats.today.today_transfer_out} icon={<FaExchangeAlt />} />
          </div>
        </div>

        {/* Filters */}
        <StaffManageFilter
          filters={filters}
          setFilters={setFilters}
          onRefresh={fetchStaff}
          spas={allSpas}
          cities={availableCities}
        />

        {/* Table */}
        <div className="bg-white border rounded-lg">
          <AdminStaffTable
            loading={loading}
            staff={paginatedStaff}
            totalItems={totalItems}
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

      {/* Modals */}
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

const StatCard = ({ icon, label, value }) => {
  return (
    <div className="bg-white border rounded-lg p-4 flex items-center gap-3">
      <div className="text-gray-500">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-lg font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

export default AdminStaffManage;