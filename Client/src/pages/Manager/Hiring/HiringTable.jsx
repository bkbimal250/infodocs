import { HiBriefcase, HiEye, HiPencil, HiTrash } from 'react-icons/hi';

/**
 * Hiring Table Component
 * Display manager's submitted hiring forms in a table format
 */
const HiringTable = ({ hiringForms, loading, onView, onEdit, onDelete }) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-[var(--color-text-secondary)]">Loading your hiring forms...</p>
      </div>
    );
  }

  if (!hiringForms || hiringForms.length === 0) {
    return (
      <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-md p-12 text-center">
        <HiBriefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Hiring Forms Submitted</h3>
        <p className="text-[var(--color-text-secondary)] mb-4">
          You haven't submitted any hiring forms yet.
        </p>
        <a
          href="/hiring-forms"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Submit Your First Hiring Form
        </a>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[var(--color-bg-secondary)]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                SPA Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                Staff Required
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                Experience Required
              </th>
           
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                Skills Required
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                Submitted Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-[var(--color-bg-primary)] divide-y divide-gray-200">
            {hiringForms.map((form) => (
              <tr key={form.id} className="hover:bg-[var(--color-bg-secondary)]">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {form.spa?.name || form.spa_name_text || 'N/A'}
                  </div>
                  {form.spa?.city && form.spa?.state && (
                    <div className="text-sm text-[var(--color-text-secondary)]">
                      {form.spa.city}, {form.spa.state}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{form.for_role || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold text-sm">
                    {form.staff_required || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[var(--color-text-secondary)]">{form.required_experience || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[var(--color-text-secondary)]">{form.required_education || 'N/A'}</div>
                </td>
             
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[var(--color-text-secondary)]">
                    {form.created_at ? new Date(form.created_at).toLocaleDateString() : 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-3">
                    {onView && (
                      <button
                        onClick={() => onView(form.id)}
                        className="text-[var(--color-primary)] hover:text-blue-900 flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                        title="View Details"
                      >
                        <HiEye className="w-4 h-4" />
                        View
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(form)}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1 px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
                        title="Edit Form"
                      >
                        <HiPencil className="w-4 h-4" />
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(form.id)}
                        className="text-red-600 hover:text-red-900 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                        title="Delete Form"
                      >
                        <HiTrash className="w-4 h-4" />
                        Delete
                      </button>
                    )}
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

export default HiringTable;

