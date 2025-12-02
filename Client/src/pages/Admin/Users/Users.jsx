import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminApi } from '../../../api/Admin/adminApi';
import UsersTable from './Userstable';
import Pagination from '../../common/Pagination';

/**
 * Admin Users Management Page
 * View, create, edit, and manage user accounts
 */
const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 15;

  useEffect(() => {
    loadUsers();
  }, [currentPage]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.users.getUsers();
      const allUsers = response.data || [];
      setTotalItems(allUsers.length);
      // Apply client-side pagination
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setUsers(allUsers.slice(startIndex, endIndex));
      setError(null);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
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

