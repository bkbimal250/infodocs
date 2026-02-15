import React from 'react';
import { CERTIFICATE_CATEGORY_METADATA, TEMPLATE_TYPES } from '../../../../utils/certificateConstants';

const TemplateTable = React.memo(({ templates, onEdit, onDelete, getCategoryLabel }) => {
  if (!templates || templates.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">No templates found. Create your first template to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {templates.map((template) => (
              <tr key={template.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{template.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getCategoryLabel(template.category)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {template.template_type?.toUpperCase() || TEMPLATE_TYPES.IMAGE.toUpperCase()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${template.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                      }`}
                  >
                    {template.is_active ? 'Active' : 'Inactive'}
                  </span>
                  {template.is_public && (
                    <span className="ml-2 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      Public
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onEdit(template)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(template.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4 p-4">
        {templates.map((template) => (
          <div key={template.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-medium text-gray-900">{template.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{getCategoryLabel(template.category)}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${template.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                    }`}
                >
                  {template.is_active ? 'Active' : 'Inactive'}
                </span>
                {template.is_public && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                    Public
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-3">
              <span className="text-xs text-gray-500">
                {template.template_type?.toUpperCase() || TEMPLATE_TYPES.IMAGE.toUpperCase()}
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => onEdit(template)}
                  className="text-blue-600 hover:text-blue-900 font-medium text-xs"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(template.id)}
                  className="text-red-600 hover:text-red-900 font-medium text-xs"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default TemplateTable;

