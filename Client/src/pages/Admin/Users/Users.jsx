import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminApi } from '../../../api/Admin/adminApi';
import UsersTable from './Userstable';
import UserFilter from './UserFilter';
import Pagination from '../../common/Pagination';

/**
 * Admin Users Management Page
 * View, create, edit, and manage user accounts
 */
const AdminUsers = () => {
  const navigate = useNavigate();
  const [allUsers, setAllUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filter, setFilter] = useState({
    search: '',
    role: '',
    status: '',
  });
  const itemsPerPage = 15;

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    // Apply filters and pagination whenever allUsers, filter, or currentPage changes
    applyFiltersAndPagination();
  }, [allUsers, filter, currentPage]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.users.getUsers();
      const usersData = response.data || [];
      setAllUsers(usersData);
      setError(null);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndPagination = () => {
    // Apply filters
    let filtered = allUsers.filter((user) => {
      // Search filter
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        const matchesSearch =
          user.first_name?.toLowerCase().includes(searchLower) ||
          user.last_name?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.username?.toLowerCase().includes(searchLower) ||
          user.phone_number?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Role filter
      if (filter.role && user.role !== filter.role) {
        return false;
      }

      // Status filter
      if (filter.status) {
        if (filter.status === 'active' && !user.is_active) return false;
        if (filter.status === 'inactive' && user.is_active) return false;
        if (filter.status === 'verified' && !user.is_verified) return false;
        if (filter.status === 'unverified' && user.is_verified) return false;
      }

      return true;
    });

    // Update total items
    setTotalItems(filtered.length);

    // Apply pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setUsers(filtered.slice(startIndex, endIndex));
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleClearFilters = () => {
    setFilter({
      search: '',
      role: '',
      status: '',
    });
    setCurrentPage(1);
  };

  const handleEdit = (user) => {
    navigate(`/admin/users/${user.id}/edit`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await adminApi.users.deleteUser(id);
      loadUsers();
    } catch (err) {
      setError('Failed to delete user');
      console.error(err);
    }
  };


  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-secondary)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto"></div>
          <p className="mt-4 text-[var(--color-text-secondary)]">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">User Management</h1>
            <p className="mt-2 text-[var(--color-text-secondary)]">Manage user accounts and permissions</p>
          </div>
          <Link
            to="/admin/users/add"
            className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-text-inverse)] rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add User
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-[var(--color-error-light)] border border-[var(--color-error-light)] text-[var(--color-error-dark)] rounded">
            {error}
          </div>
        )}

        {/* Filters */}
        <UserFilter
          filter={filter}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        {/* Users Table */}
        <div className="bg-[var(--color-bg-primary)] rounded-lg shadow overflow-hidden">
          <UsersTable
            users={users}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading && users.length === 0}
          />
          {totalItems > itemsPerPage && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(totalItems / itemsPerPage)}
              onPageChange={setCurrentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;

