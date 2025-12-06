/**
 * SPA Table Component
 * Displays SPAs in a table format with pagination
 */
import { Link } from 'react-router-dom';
import Pagination from '../../common/Pagination';

const SpaTable = ({
  spas,
  onEdit,
  onDelete,
  loading,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems = 0,
  itemsPerPage = 15
}) => {
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)] mx-auto"></div>
        <p className="mt-4 text-[var(--color-text-secondary)]">Loading...</p>
      </div>
    );
  }

  if (spas.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="text-[var(--color-text-tertiary)] mb-4">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
        <p className="text-[var(--color-text-secondary)] text-lg">No SPAs found</p>
        <p className="text-[var(--color-text-secondary)] text-sm mt-2">Add a new SPA to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-[var(--color-border-primary)]">
        <thead className="bg-gradient-to-r from-[var(--color-gray-50)] to-[var(--color-gray-100)]">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Location
            </th>


            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              State
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Created By
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-[var(--color-bg-primary)] divide-y divide-[var(--color-border-primary)]">
          {spas.map((spa) => (
            <tr key={spa.id} className="hover:bg-[var(--color-primary-light)] transition-colors duration-150">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="text-sm font-semibold text-[var(--color-text-primary)]">{spa.name}</div>
                  {spa.code && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-[var(--color-gray-100)] text-[var(--color-text-secondary)] rounded">
                      {spa.code}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-[var(--color-text-secondary)]">{spa.area || '-'}</div>
                <div className="text-sm text-[var(--color-text-secondary)]">{spa.city || '-'}</div>

              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-[var(--color-text-secondary)]">{spa.state || '-'}</div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${spa.is_active
                    ? 'bg-[var(--color-success-light)] text-[var(--color-success-dark)]'
                    : 'bg-[var(--color-gray-100)] text-[var(--color-gray-800)]'
                    }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${spa.is_active ? 'bg-[var(--color-success)]' : 'bg-[var(--color-gray-400)]'}`}></span>
                  {spa.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-secondary)]">
                {spa.created_at
                  ? new Date(spa.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })
                  : '-'}
                <br />

                {spa.updated_at
                  ? new Date(spa.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })
                  : '-'}


              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-secondary)]">
                {spa.created_by ? `User #${spa.created_by}` : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    to={`/admin/spas/${spa.id}`}
                    className="p-2 text-[var(--color-info)] hover:text-[var(--color-info-dark)] hover:bg-[var(--color-info-light)] rounded-lg transition-colors"
                    title="View Details"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </Link>
                  <Link
                    to={`/admin/spas/${spa.id}/edit`}
                    className="p-2 text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] hover:bg-[var(--color-primary-light)] rounded-lg transition-colors"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Link>
                  <button
                    onClick={() => onDelete(spa.id)}
                    className="p-2 text-[var(--color-error)] hover:text-[var(--color-error-dark)] hover:bg-[var(--color-error-light)] rounded-lg transition-colors"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          showInfo={true}
        />
      )}
    </div>
  );
};

export default SpaTable;

