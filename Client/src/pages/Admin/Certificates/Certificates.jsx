import { useState, useEffect } from 'react';
import { adminApi } from '../../../api/Admin/adminApi';
import CertificateStatistics from './components/CertificateStatistics';
import CertificateList from './components/CertificateList';
import UserCertificateCounts from './components/UserCertificateCounts';

/**
 * Admin Certificates Dashboard
 * New structure showing:
 * - Certificate statistics (total, by category, by user)
 * - Who created certificates and how many
 * - User certificate counts
 * - All certificates list with creator info
 */
const AdminCertificates = () => {
  const [statistics, setStatistics] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('statistics'); // statistics, certificates, users

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load statistics and certificates in parallel
      const [statsResponse, certsResponse] = await Promise.all([
        adminApi.certificates.getStatistics(),
        adminApi.certificates.getAllCertificates({ skip: 0, limit: 1000 })
      ]);
      
      setStatistics(statsResponse.data);
      setCertificates(Array.isArray(certsResponse.data) ? certsResponse.data : []);
    } catch (err) {
      setError('Failed to load certificate data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !statistics) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-secondary)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-[var(--color-text-secondary)]">Loading certificate data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-sm mb-6">
          <div className="border-b border-[var(--color-border-primary)]">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('statistics')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'statistics'
                    ? 'border-blue-500 text-[var(--color-primary)]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Statistics
              </button>
              <button
                onClick={() => setActiveTab('certificates')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'certificates'
                    ? 'border-blue-500 text-[var(--color-primary)]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Certificates ({certificates.length})
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-[var(--color-primary)]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                By User
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'statistics' && statistics && (
            <CertificateStatistics statistics={statistics} />
          )}

          {activeTab === 'certificates' && (
            <CertificateList 
              certificates={certificates} 
              loading={loading}
              onRefresh={loadData}
            />
          )}

          {activeTab === 'users' && statistics && (
            <UserCertificateCounts 
              userCounts={statistics.by_user || []}
              totalCertificates={statistics.total_certificates}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCertificates;
