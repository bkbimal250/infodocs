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
const UsersTable = ({ users, onEdit, onDelete, loading = false }) => {
  const getRoleBadgeColor = (role) => {
    const colors = {
      super_admin: 'bg-[var(--color-error-light)] text-[var(--color-error-dark)]',
      admin: 'bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]',
      spa_manager: 'bg-[var(--color-secondary-light)] text-[var(--color-secondary-dark)]',
      hr: 'bg-[var(--color-success-light)] text-[var(--color-success-dark)]',
      user: 'bg-[var(--color-gray-100)] text-[var(--color-gray-800)]',
    };
    return colors[role] || colors.user;
  };

  const getRoleDisplay = (role) => {
    return role.replace('_', ' ').toUpperCase();
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto"></div>
        <p className="mt-4 text-[var(--color-text-secondary)]">Loading users...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <HiOutlineUser className="h-16 w-16 text-[var(--color-text-tertiary)] mx-auto mb-4" />
        <p className="text-[var(--color-text-secondary)] text-lg">No users found</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-bg-primary)] rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
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
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.is_active
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
    </div>
  );
};

export default UsersTable;

