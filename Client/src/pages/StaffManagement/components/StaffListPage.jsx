import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaPlus, FaUserMinus } from 'react-icons/fa';
import { adminApi, authApi, staffApi } from '../../../api';
import Pagination from '../../common/Pagination';
import { useSpas, normalizePage, roleHasStaffActions, canVerifyStaff, getStaffKey, staffName } from './StaffHelpers';
import { StaffFilters } from './StaffFilters';
import { StaffTable } from './StaffTable';
import { VerificationModal, TransferModal, LeaveModal } from './StaffModals';
import { Stat } from './StaffStats';

export const StaffListPage = ({ scope = 'admin', basePath = '/admin/staff' }) => {
  const navigate = useNavigate();
  const { spas, spaMap, loadingSpas } = useSpas();
  const [user, setUser] = useState(null);
  const [staff, setStaff] = useState([]);
  const [stats, setStats] = useState({ total_active: 0, total_left: 0, today: {} });
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    city: '',
    employment_status: '',
    verification_status: '',
    current_spa_id: '',
    blacklist: ''
  });
  const itemsPerPage = 25;
  const canAct = roleHasStaffActions(user, scope);

  useEffect(() => {
    authApi.getCurrentUser().then((res) => setUser(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      const managerSpaId = scope === 'manager' ? user?.spa_id : null;
      const params = {
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
        search: filters.search || undefined,
        city: filters.city || undefined,
        verification_status: filters.verification_status || undefined,
        employment_status: filters.employment_status || undefined,
        spa_id: managerSpaId || filters.current_spa_id || undefined
      };
      const res = await staffApi.getAllStaff(params);
      const page = normalizePage(res.data);
      const list = filters.blacklist
        ? page.items.filter((item) => String(Boolean(item.is_blacklisted)) === filters.blacklist)
        : page.items;
      setStaff(list);
      setTotalItems(page.total);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load staff');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters, itemsPerPage, scope, user]);

  const fetchStats = useCallback(async () => {
    try {
      const spaId = scope === 'manager' ? user?.spa_id : filters.current_spa_id || undefined;
      const res = await staffApi.getConsolidatedAnalytics({ spa_id: spaId });
      setStats(res.data || {});
    } catch {
      setStats((prev) => prev);
    }
  }, [filters.current_spa_id, scope, user]);

  useEffect(() => {
    if (scope === 'manager' && !user) return;
    fetchStaff();
    fetchStats();
  }, [fetchStaff, fetchStats, scope, user]);

  const refresh = () => {
    fetchStaff();
    fetchStats();
  };

  const deleteStaff = async (member) => {
    if (!window.confirm(`Delete ${staffName(member)}?`)) return;
    try {
      await staffApi.deleteStaff(getStaffKey(member));
      toast.success('Staff deleted');
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed');
    }
  };

  const submitVerification = async (member, data) => {
    try {
      await staffApi.verifyStaff(getStaffKey(member), data);
      toast.success(data.status === 'verified' ? 'Staff verified' : 'Verification rejected');
      setModal(null);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Verification failed');
    }
  };

  const submitTransfer = async (member, data) => {
    try {
      await staffApi.transferStaff(getStaffKey(member), data);
      toast.success('Transfer completed');
      setModal(null);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Transfer failed');
    }
  };

  const submitLeave = async (member, data) => {
    try {
      await staffApi.markLeft(getStaffKey(member), data);
      toast.success('Staff marked as left');
      setModal(null);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Action failed');
    }
  };

  const toggleBlacklist = async (member) => {
    const isBlacklisted = !member.is_blacklisted;
    const blacklist_reason = isBlacklisted ? window.prompt('Blacklist reason') : '';
    if (isBlacklisted && !blacklist_reason) return;
    try {
      await staffApi.blacklistStaff(getStaffKey(member), { is_blacklisted: isBlacklisted, blacklist_reason });
      toast.success(isBlacklisted ? 'Staff blacklisted' : 'Blacklist removed');
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Blacklist update failed');
    }
  };

  if (scope === 'manager' && user && !user.spa_id) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-md rounded-lg border bg-white p-8 text-center">
          <FaUserMinus className="mx-auto mb-3 text-2xl text-rose-500" />
          <h1 className="text-lg font-semibold text-gray-900">Branch access required</h1>
          <p className="mt-1 text-sm text-gray-500">Your account is not assigned to a spa branch.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Staff Management</h1>
            <p className="text-sm text-gray-500">
  Manage staff profiles, transfers, verification and documents
</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={refresh} className="rounded-md border bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
              Refresh
            </button>
            <Link to={`${basePath}/add`} className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black">
              <FaPlus /> Add Staff
            </Link>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <Stat label="Active" value={stats.total_active || 0} />
          <Stat label="Left" value={stats.total_left || 0} />
         <Stat label="Joined Today" value={stats.today?.today_new_join || 0 } />
          <Stat label="Transfers Today" value={stats.today?.today_transfer_out || 0} />
        </div>

        <StaffFilters filters={filters} setFilters={setFilters} spas={spas} showSpa={scope !== 'manager'} />

        <div className="overflow-visible rounded-lg border bg-white">
          <StaffTable
            loading={loading}
            staff={staff}
            spaMap={spaMap}
            basePath={basePath}
            canAct={canAct}
            canVerify={(member) => canVerifyStaff(user, scope, member)}
            navigate={navigate}
            onVerify={(member) => setModal({ type: 'verify', staff: member })}
            onTransfer={(member) => setModal({ type: 'transfer', staff: member })}
            onLeave={(member) => setModal({ type: 'leave', staff: member })}
            onBlacklist={toggleBlacklist}
            onDelete={deleteStaff}
          />
          {totalItems > itemsPerPage && (
            <div className="border-t p-3">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(totalItems / itemsPerPage)}
                onPageChange={setCurrentPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}
        </div>
      </div>

      {modal?.type === 'verify' && (
        <VerificationModal staff={modal.staff} onClose={() => setModal(null)} onSubmit={(data) => submitVerification(modal.staff, data)} />
      )}
      {modal?.type === 'transfer' && (
        <TransferModal staff={modal.staff} spas={spas} loadingSpas={loadingSpas} onClose={() => setModal(null)} onSubmit={(data) => submitTransfer(modal.staff, data)} />
      )}
      {modal?.type === 'leave' && (
        <LeaveModal staff={modal.staff} onClose={() => setModal(null)} onSubmit={(data) => submitLeave(modal.staff, data)} />
      )}
    </div>
  );
};
