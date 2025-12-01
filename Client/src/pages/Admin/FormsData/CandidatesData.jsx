import { useState, useEffect } from 'react';
import { adminApi } from '../../../api/Admin/adminApi';
import CandidatesTable from './CandidatesTable';
import EditCandidates from './EditCandidates';
import Pagination from '../../common/Pagination';

/**
 * Candidates Data Management Page
 * View and manage all candidate form submissions
 */
const CandidatesData = () => {
  const [candidates, setCandidates] = useState([]);
  const [allCandidates, setAllCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    search: '',
    position: '',
    spa: '',
  });
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const response = await adminApi.forms.getCandidateForms(0, 1000);
      setAllCandidates(response.data || []);
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to load candidate forms';
      setError(errorMessage);
      console.error('Load candidates error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Apply filters and pagination
    let filtered = allCandidates.filter((candidate) => {
      const fullName = `${candidate.first_name} ${candidate.middle_name || ''} ${candidate.last_name}`.toLowerCase();
      const matchesSearch =
        filter.search === '' ||
        fullName.includes(filter.search.toLowerCase()) ||
        candidate.phone_number?.toLowerCase().includes(filter.search.toLowerCase()) ||
        candidate.position_applied_for?.toLowerCase().includes(filter.search.toLowerCase());
      
      const matchesPosition =
        filter.position === '' ||
        candidate.position_applied_for?.toLowerCase().includes(filter.position.toLowerCase());
      
      const matchesSpa =
        filter.spa === '' ||
        (candidate.spa?.name || candidate.spa_name_text || '').toLowerCase().includes(filter.spa.toLowerCase());
      
      return matchesSearch && matchesPosition && matchesSpa;
    });

    // Apply pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCandidates(filtered.slice(startIndex, endIndex));
  }, [allCandidates, filter, currentPage]);

  const filteredCandidates = allCandidates.filter((candidate) => {
    const fullName = `${candidate.first_name} ${candidate.middle_name || ''} ${candidate.last_name}`.toLowerCase();
    const matchesSearch =
      filter.search === '' ||
      fullName.includes(filter.search.toLowerCase()) ||
      candidate.phone_number?.toLowerCase().includes(filter.search.toLowerCase()) ||
      candidate.position_applied_for?.toLowerCase().includes(filter.search.toLowerCase());
    
    const matchesPosition =
      filter.position === '' ||
      candidate.position_applied_for?.toLowerCase().includes(filter.position.toLowerCase());
    
    const matchesSpa =
      filter.spa === '' ||
      (candidate.spa?.name || candidate.spa_name_text || '').toLowerCase().includes(filter.spa.toLowerCase());
    
    return matchesSearch && matchesPosition && matchesSpa;
  });

  // Get unique positions and SPAs for filters
  const uniquePositions = [...new Set(allCandidates.map(c => c.position_applied_for).filter(Boolean))];
  const uniqueSpas = [...new Set(allCandidates.map(c => c.spa?.name || c.spa_name_text).filter(Boolean))];

  const handleEdit = (candidate) => {
    setEditingCandidate(candidate);
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this candidate form? This action cannot be undone.')) {
      return;
    }

    try {
      await adminApi.forms.deleteCandidateForm(id);
      await loadCandidates();
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to delete candidate form';
      setError(errorMessage);
      console.error('Delete candidate error:', err);
    }
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setEditingCandidate(null);
    loadCandidates();
  };

  const handleEditCancel = () => {
    setShowEditModal(false);
    setEditingCandidate(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search by name, phone, or position..."
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <select
                value={filter.position}
                onChange={(e) => setFilter({ ...filter, position: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Positions</option>
                {uniquePositions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SPA Location</label>
              <select
                value={filter.spa}
                onChange={(e) => setFilter({ ...filter, spa: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All SPAs</option>
                {uniqueSpas.map((spa) => (
                  <option key={spa} value={spa}>
                    {spa}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{candidates.length}</span> of{' '}
              <span className="font-semibold">{filteredCandidates.length}</span> candidates
            </p>
            {(filter.search || filter.position || filter.spa) && (
              <button
                onClick={() => setFilter({ search: '', position: '', spa: '' })}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Candidates Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <CandidatesTable 
            candidates={candidates} 
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          {filteredCandidates.length > itemsPerPage && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredCandidates.length / itemsPerPage)}
              onPageChange={setCurrentPage}
              totalItems={filteredCandidates.length}
              itemsPerPage={itemsPerPage}
            />
          )}
        </div>

        {/* Edit Candidate Modal */}
        <EditCandidates
          candidate={editingCandidate}
          isOpen={showEditModal}
          onSuccess={handleEditSuccess}
          onCancel={handleEditCancel}
        />
      </div>
    </div>
  );
};

export default CandidatesData;

