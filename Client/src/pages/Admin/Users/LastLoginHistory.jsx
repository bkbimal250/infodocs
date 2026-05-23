import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineDesktopComputer,
  HiOutlineExclamationCircle,
  HiOutlineGlobe,
  HiOutlineXCircle,
} from 'react-icons/hi';
import apiClient from '../../../utils/apiConfig';

const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : 'N/A');

const LastLoginHistory = () => {
  const { userId } = useParams();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadLoginHistory() {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.get('/notifications/login-history', {
        params: { user_id: userId || undefined, limit: userId ? 100 : 200 },
      });
      setHistory(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError('Failed to load login history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    Promise.resolve().then(loadLoginHistory);
  }, [userId]);

  const stats = useMemo(() => {
    const success = history.filter((entry) => entry.login_status === 'success').length;
    const failed = history.length - success;
    return { success, failed, total: history.length };
  }, [history]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-secondary)] flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--color-primary)]" />
          <p className="mt-4 text-sm text-[var(--color-text-secondary)]">Loading login history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Login History</h1>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              {userId ? 'Recent access activity for this user.' : 'Recent access activity across users.'}
            </p>
          </div>
          <button
            type="button"
            onClick={loadLoginHistory}
            className="rounded-lg border border-[var(--color-border-primary)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)] transition hover:bg-[var(--color-gray-50)]"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-[var(--color-error-light)] bg-[var(--color-error-light)] px-4 py-3 text-[var(--color-error-dark)]">
            {error}
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-[var(--color-border-primary)] bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">Total Attempts</p>
            <p className="mt-2 text-3xl font-bold text-[var(--color-text-primary)]">{stats.total}</p>
          </div>
          <div className="rounded-lg border border-[var(--color-border-primary)] bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">Successful</p>
            <p className="mt-2 text-3xl font-bold text-[var(--color-success-dark)]">{stats.success}</p>
          </div>
          <div className="rounded-lg border border-[var(--color-border-primary)] bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">Failed</p>
            <p className="mt-2 text-3xl font-bold text-[var(--color-error-dark)]">{stats.failed}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-[var(--color-border-primary)] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--color-border-primary)] px-5 py-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--color-text-primary)]">
              <HiOutlineClock className="h-5 w-5 text-[var(--color-primary)]" />
              Attempts
            </h2>
          </div>

          {history.length === 0 ? (
            <div className="py-14 text-center">
              <HiOutlineExclamationCircle className="mx-auto mb-3 h-14 w-14 text-[var(--color-text-tertiary)]" />
              <p className="font-medium text-[var(--color-text-primary)]">No login history found</p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">New login attempts will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-visible">
              <table className="min-w-full divide-y divide-[var(--color-border-primary)]">
                <thead className="bg-[var(--color-gray-50)]">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">IP Address</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">Device</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">Failure Reason</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-primary)] bg-white">
                  {history.map((entry) => {
                    const isSuccess = entry.login_status === 'success';
                    return (
                      <tr key={entry.id} className="transition hover:bg-[var(--color-gray-50)]">
                        <td className="whitespace-nowrap px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${isSuccess ? 'bg-[var(--color-success-light)] text-[var(--color-success-dark)]' : 'bg-[var(--color-error-light)] text-[var(--color-error-dark)]'}`}>
                            {isSuccess ? <HiOutlineCheckCircle className="h-4 w-4" /> : <HiOutlineXCircle className="h-4 w-4" />}
                            {isSuccess ? 'Success' : 'Failed'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-[var(--color-text-primary)]">
                            <HiOutlineGlobe className="h-4 w-4 text-[var(--color-text-tertiary)]" />
                            {entry.ip_address || 'N/A'}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex max-w-md items-center gap-2 text-sm text-[var(--color-text-primary)]">
                            <HiOutlineDesktopComputer className="h-4 w-4 shrink-0 text-[var(--color-text-tertiary)]" />
                            <span className="truncate" title={entry.user_agent || ''}>{entry.user_agent || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-sm text-[var(--color-text-secondary)]">
                          {entry.failure_reason || '-'}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-sm text-[var(--color-text-secondary)]">
                          {formatDateTime(entry.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LastLoginHistory;
