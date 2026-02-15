import { Link } from 'react-router-dom';
import {
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineUser
} from 'react-icons/hi';

/**
 * Users Table Component
 * Displays users in a table format
 */
import React from 'react';

// ... imports

const getRoleBadgeColor = (role) => {
  switch (role?.toLowerCase()) {
    case 'admin':
      return 'bg-purple-100 text-purple-800';
    case 'manager':
      return 'bg-blue-100 text-blue-800';
    case 'hr':
      return 'bg-pink-100 text-pink-800';
    case 'employee':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getRoleDisplay = (role) => {
  if (!role) return 'Unknown';
  return role.charAt(0).toUpperCase() + role.slice(1);
};

const UsersTable = React.memo(({ users, onEdit, onDelete, loading = false }) => {
  // ... helper functions

  if (loading) {
    // ... loading state
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto"></div>
        <p className="mt-4 text-[var(--color-text-secondary)]">Loading users...</p>
      </div>
    );
  }

  if (users.length === 0) {
    // ... empty state
    return (
      <div className="text-center py-12">
        <HiOutlineUser className="h-16 w-16 text-[var(--color-text-tertiary)] mx-auto mb-4" />
        <p className="text-[var(--color-text-secondary)] text-lg">No users found</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-bg-primary)] rounded-lg shadow overflow-hidden">
      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--color-border-primary)]">
          <thead className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-inverse)] uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-inverse)] uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-inverse)] uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-inverse)] uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-text-inverse)] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-[var(--color-bg-primary)] divide-y divide-[var(--color-border-primary)]">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-[var(--color-gray-50)] transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-[var(--color-primary-light)] rounded-full flex items-center justify-center mr-3">
                      <HiOutlineUser className="h-5 w-5 text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[var(--color-text-primary)]">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-sm text-[var(--color-text-secondary)]">{user.email}</div>
                      <div className="text-xs text-[var(--color-text-tertiary)]">{user.username}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(
                      user.role
                    )}`}
                  >
                    {getRoleDisplay(user.role)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${user.is_active
                        ? 'bg-[var(--color-success-light)] text-[var(--color-success-dark)]'
                        : 'bg-[var(--color-gray-100)] text-[var(--color-gray-800)]'
                        }`}
                    >
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {!user.is_verified && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-[var(--color-warning-light)] text-[var(--color-warning-dark)]">
                        Unverified
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-secondary)]">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <Link
                      to={`/admin/users/${user.id}`}
                      className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] p-2 rounded hover:bg-[var(--color-primary-light)] transition-colors"
                      title="View Details"
                    >
                      <HiOutlineEye className="h-5 w-5" />
                    </Link>
                    <Link
                      to={`/admin/users/${user.id}/edit`}
                      className="text-[var(--color-info)] hover:text-[var(--color-info-dark)] p-2 rounded hover:bg-[var(--color-info-light)] transition-colors"
                      title="Edit"
                    >
                      <HiOutlinePencil className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => onDelete && onDelete(user.id)}
                      className="text-[var(--color-error)] hover:text-[var(--color-error-dark)] p-2 rounded hover:bg-[var(--color-error-light)] transition-colors"
                      title="Delete"
                    >
                      <HiOutlineTrash className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4 p-4">
        {users.map((user) => (
          <div key={user.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-[var(--color-primary-light)] rounded-full flex items-center justify-center">
                  <HiOutlineUser className="h-5 w-5 text-[var(--color-primary)]" />
                </div>
                <div>
                  <div className="text-sm font-medium text-[var(--color-text-primary)]">
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="text-xs text-[var(--color-text-secondary)]">{user.email}</div>
                </div>
              </div>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(
                  user.role
                )}`}
              >
                {getRoleDisplay(user.role)}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500">Status</span>
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-full w-fit ${user.is_active
                    ? 'bg-[var(--color-success-light)] text-[var(--color-success-dark)]'
                    : 'bg-[var(--color-gray-100)] text-[var(--color-gray-800)]'
                    }`}
                >
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex space-x-1">
                <Link
                  to={`/admin/users/${user.id}`}
                  className="p-2 text-[var(--color-primary)] bg-[var(--color-primary-light)] rounded-full"
                >
                  <HiOutlineEye className="h-4 w-4" />
                </Link>
                <Link
                  to={`/admin/users/${user.id}/edit`}
                  className="p-2 text-[var(--color-info)] bg-[var(--color-info-light)] rounded-full"
                >
                  <HiOutlinePencil className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => onDelete && onDelete(user.id)}
                  className="p-2 text-[var(--color-error)] bg-[var(--color-error-light)] rounded-full"
                >
                  <HiOutlineTrash className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default UsersTable;

