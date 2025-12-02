import { useState, useEffect } from 'react';
import { adminApi } from '../../../api/Admin/adminApi';
import FormsStatistics from './components/FormsStatistics';
import FormsBySpa from './components/FormsBySpa';
import FormsByUser from './components/FormsByUser';
import AllFormsList from './components/AllFormsList';

/**
 * Admin Forms Data Dashboard
 * New structure showing:
 * - Forms statistics (total, by type, by SPA, by user)
 * - Forms categorized by SPA
 * - Forms categorized by user
 * - All forms list with creator info
 */
const FormsData = () => {
  const [statistics, setStatistics] = useState(null);
  const [candidateForms, setCandidateForms] = useState([]);
  const [hiringForms, setHiringForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('statistics'); // statistics, by-spa, by-user, all-forms

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load statistics and forms in parallel
      const [statsResponse, candidateResponse, hiringResponse] = await Promise.all([
        adminApi.forms.getStatistics(),
        adminApi.forms.getAllCandidateForms({ skip: 0, limit: 1000 }),
        adminApi.forms.getAllHiringForms({ skip: 0, limit: 1000 })
      ]);
      
      setStatistics(statsResponse.data);
      setCandidateForms(Array.isArray(candidateResponse.data) ? candidateResponse.data : []);
      setHiringForms(Array.isArray(hiringResponse.data) ? hiringResponse.data : []);
    } catch (err) {
      setError('Failed to load forms data');
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
          <p className="mt-4 text-[var(--color-text-secondary)]">Loading forms data...</p>
        </div>
      </div>
    );
  }

  const totalForms = candidateForms.length + hiringForms.length;

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
                onClick={() => setActiveTab('by-spa')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'by-spa'
                    ? 'border-blue-500 text-[var(--color-primary)]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                By SPA
              </button>
              <button
                onClick={() => setActiveTab('by-user')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'by-user'
                    ? 'border-blue-500 text-[var(--color-primary)]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                By User
              </button>
              <button
                onClick={() => setActiveTab('all-forms')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'all-forms'
                    ? 'border-blue-500 text-[var(--color-primary)]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Forms ({totalForms})
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'statistics' && statistics && (
            <FormsStatistics statistics={statistics} />
          )}

          {activeTab === 'by-spa' && statistics && (
            <FormsBySpa spaData={statistics.by_spa || []} />
          )}

          {activeTab === 'by-user' && statistics && (
            <FormsByUser userData={statistics.by_user || []} />
          )}

          {activeTab === 'all-forms' && (
            <AllFormsList 
              candidateForms={candidateForms}
              hiringForms={hiringForms}
              loading={loading}
              onRefresh={loadData}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FormsData;

