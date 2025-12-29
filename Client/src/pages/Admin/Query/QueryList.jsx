import { useState, useEffect } from 'react';
import { queryApi } from '../../../api/Query/queryApi';
import { adminApi } from '../../../api/Admin/adminApi';
import QueryFilters from './components/QueryFilters';
import QueryTable from './components/QueryTable';
import ViewQueryModal from './components/ViewQueryModal';
import EditQueryModal from './components/EditQueryModal';
import DeleteQueryModal from './components/DeleteQueryModal';
import Pagination from '../../common/Pagination';
import { filterQueries, getUniqueFilterValues } from './utils/queryUtils';

/**
 * Admin Query List Component
 * Main component for displaying and managing queries
 */
const QueryList = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePermanent, setDeletePermanent] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    spa_id: '',
    state: '',
    city: '',
    area: '',
    search: '',
  });
  const [spas, setSpas] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 15;

  useEffect(() => {
    loadSpas();
    loadQueries();
  }, []);

  useEffect(() => {
    loadQueries();
  }, [filters, currentPage]);

  const loadSpas = async () => {
    try {
      const response = await adminApi.forms.getSpas();
      setSpas(response.data || []);
    } catch (err) {
      console.error('Error loading SPAs:', err);
    }
  };

  const loadQueries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        page_size: itemsPerPage,
      };
      
      if (filters.status) params.status = filters.status;
      if (filters.spa_id) params.spa_id = filters.spa_id;
      
      const response = await queryApi.getQueries(params);
      const data = response.data;
      
      // Handle paginated response from backend
      if (data && data.queries) {
        setQueries(data.queries);
        setTotalItems(data.total || 0);
      } else if (Array.isArray(data)) {
        // Fallback for non-paginated response
        setQueries(data);
        setTotalItems(data.length);
      } else {
        setQueries([]);
        setTotalItems(0);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to load queries';
      setError(errorMessage);
      console.error('Load queries error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (query) => {
    try {
      const response = await queryApi.getQuery(query.id);
      setSelectedQuery(response.data);
      setShowViewModal(true);
    } catch (err) {
      console.error('Error loading query details:', err);
      setSelectedQuery(query);
      setShowViewModal(true);
    }
  };

  const handleEdit = (query) => {
    setSelectedQuery(query);
    setShowEditModal(true);
  };

  const handleDelete = (query) => {
    setSelectedQuery(query);
    setDeletePermanent(false);
    setShowDeleteModal(true);
  };

  const handleUpdateQuery = async (updateData) => {
    try {
      await queryApi.updateQuery(selectedQuery.id, updateData);
      setShowEditModal(false);
      setSelectedQuery(null);
      loadQueries();
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to update query';
      alert(errorMessage);
      console.error('Update query error:', err);
    }
  };

  const handleDeleteQuery = async () => {
    try {
      await queryApi.deleteQuery(selectedQuery.id, deletePermanent);
      setShowDeleteModal(false);
      setSelectedQuery(null);
      setDeletePermanent(false);
      loadQueries();
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to delete query';
      alert(errorMessage);
      console.error('Delete query error:', err);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ status: '', spa_id: '', state: '', city: '', area: '', search: '' });
    setCurrentPage(1);
  };

  // Get unique values for filters
  const { states: uniqueStates, cities: uniqueCities, areas: uniqueAreas } = getUniqueFilterValues(queries);

  // Filter queries based on all filters (client-side filtering for non-paginated fields)
  const filteredQueries = filterQueries(queries, filters);

  // Calculate total pages
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <QueryFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        spas={spas}
        uniqueStates={uniqueStates}
        uniqueCities={uniqueCities}
        uniqueAreas={uniqueAreas}
      />

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Queries Table */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading queries...</p>
        </div>
      ) : (
        <>
          <QueryTable
            queries={filteredQueries}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              showInfo={true}
            />
          )}
        </>
      )}

      {/* View Modal */}
      {showViewModal && selectedQuery && (
        <ViewQueryModal
          query={selectedQuery}
          onClose={() => {
            setShowViewModal(false);
            setSelectedQuery(null);
          }}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedQuery && (
        <EditQueryModal
          query={selectedQuery}
          onClose={() => {
            setShowEditModal(false);
            setSelectedQuery(null);
          }}
          onSave={handleUpdateQuery}
        />
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedQuery && (
        <DeleteQueryModal
          query={selectedQuery}
          permanent={deletePermanent}
          onPermanentChange={setDeletePermanent}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedQuery(null);
            setDeletePermanent(false);
          }}
          onConfirm={handleDeleteQuery}
        />
      )}
    </div>
  );
};

export default QueryList;
