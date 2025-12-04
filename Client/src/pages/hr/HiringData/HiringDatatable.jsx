import { useState, useEffect } from 'react';
import { adminApi } from '../../../api/Admin/adminApi';

/**
 * Hiring Data Table Component
 * Reusable table component for displaying hiring forms
 */
const HiringDataTable = ({ hiringForms, onEdit, onDelete, onView }) => {
  if (!hiringForms || hiringForms.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--color-text-secondary)]">No hiring forms found</p>
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
                Education Required
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-[var(--color-bg-primary)] divide-y divide-gray-200">
            {hiringForms.map((form) => (
              <tr key={form.id} className="hover:bg-[var(--color-bg-secondary)]">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-primary)]">
                  {form.spa?.name || form.spa_name_text || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-[var(--color-text-primary)]">{form.for_role}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-secondary)]">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold">
                    {form.staff_required || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-secondary)]">
                  {form.required_experience}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-secondary)]">
                  {form.required_education}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-secondary)]">
                  {new Date(form.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {onView && (
                    <button
                      onClick={() => onView(form.id)}
                      className="text-[var(--color-primary)] hover:text-blue-900 mr-4"
                    >
                      View
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={() => onEdit(form)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(form.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HiringDataTable;

