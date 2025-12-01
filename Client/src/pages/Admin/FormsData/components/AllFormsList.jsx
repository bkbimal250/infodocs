import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * All Forms List Component
 * Shows all candidate and hiring forms with creator information
 */
const AllFormsList = ({ candidateForms, hiringForms, loading, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [formType, setFormType] = useState('all'); // all, candidate, hiring

  const getCreatorName = (form) => {
    if (form.creator) {
      return `${form.creator.first_name || ''} ${form.creator.last_name || ''}`.trim() || form.creator.email || 'Unknown';
    }
    return 'System';
  };

  const getSpaName = (form) => {
    if (form.spa) {
      return form.spa.name;
    }
    if (form.spa_name_text) {
      return form.spa_name_text;
    }
    return 'N/A';
  };

  const getCandidateName = (form) => {
    return `${form.first_name || ''} ${form.middle_name || ''} ${form.last_name || ''}`.trim() || 'N/A';
  };

  const filteredCandidateForms = candidateForms.filter((form) => {
    const name = getCandidateName(form).toLowerCase();
    const creator = getCreatorName(form).toLowerCase();
    const spa = getSpaName(form).toLowerCase();
    const position = (form.position_applied_for || '').toLowerCase();
    const search = searchTerm.toLowerCase();

    if (formType !== 'all' && formType !== 'candidate') return false;
    return name.includes(search) || creator.includes(search) || spa.includes(search) || position.includes(search);
  });

  const filteredHiringForms = hiringForms.filter((form) => {
    const role = (form.for_role || '').toLowerCase();
    const creator = getCreatorName(form).toLowerCase();
    const spa = getSpaName(form).toLowerCase();
    const search = searchTerm.toLowerCase();

    if (formType !== 'all' && formType !== 'hiring') return false;
    return role.includes(search) || creator.includes(search) || spa.includes(search);
  });

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading forms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, creator, SPA, or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={formType}
              onChange={(e) => setFormType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Forms</option>
              <option value="candidate">Candidate Forms</option>
              <option value="hiring">Hiring Forms</option>
            </select>
          </div>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Candidate Forms */}
      {(formType === 'all' || formType === 'candidate') && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Candidate Forms ({filteredCandidateForms.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidate Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SPA</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCandidateForms.map((form) => (
                  <tr key={form.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{form.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{getCandidateName(form)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {form.position_applied_for || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getSpaName(form)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getCreatorName(form)}</div>
                      {form.creator?.email && (
                        <div className="text-sm text-gray-500">{form.creator.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {form.created_at ? new Date(form.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/admin/candidates/${form.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredCandidateForms.length === 0 && (
            <div className="text-center py-12 text-gray-500">No candidate forms found</div>
          )}
        </div>
      )}

      {/* Hiring Forms */}
      {(formType === 'all' || formType === 'hiring') && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Hiring Forms ({filteredHiringForms.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SPA</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHiringForms.map((form) => (
                  <tr key={form.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{form.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                        {form.for_role || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getSpaName(form)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getCreatorName(form)}</div>
                      {form.creator?.email && (
                        <div className="text-sm text-gray-500">{form.creator.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {form.created_at ? new Date(form.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/admin/hiring/${form.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredHiringForms.length === 0 && (
            <div className="text-center py-12 text-gray-500">No hiring forms found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default AllFormsList;

