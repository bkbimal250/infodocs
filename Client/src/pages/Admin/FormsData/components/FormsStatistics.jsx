import React from 'react';

/**
 * Forms Statistics Component
 * Displays overall statistics: total forms, by type, by SPA, by user
 */
const FormsStatistics = ({ statistics }) => {
  const {
    total_forms = 0,
    total_candidate_forms = 0,
    total_hiring_forms = 0,
    by_spa = [],
    by_user = []
  } = statistics || {};

  return (
    <div className="space-y-6">
      {/* Total Statistics Cards */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Overall Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="text-3xl font-bold">{total_forms}</div>
            <div className="text-blue-100 mt-1">Total Forms</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="text-3xl font-bold">{total_candidate_forms}</div>
            <div className="text-green-100 mt-1">Candidate Forms</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="text-3xl font-bold">{total_hiring_forms}</div>
            <div className="text-purple-100 mt-1">Hiring Forms</div>
          </div>
        </div>
      </div>

      {/* By Type Breakdown */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Forms by Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Candidate Forms</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">{total_candidate_forms}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {total_forms > 0 ? ((total_candidate_forms / total_forms) * 100).toFixed(1) : 0}% of total
                </div>
              </div>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold text-xl">{total_candidate_forms}</span>
              </div>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Hiring Forms</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">{total_hiring_forms}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {total_forms > 0 ? ((total_hiring_forms / total_forms) * 100).toFixed(1) : 0}% of total
                </div>
              </div>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-semibold text-xl">{total_hiring_forms}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top SPAs */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Top SPAs by Forms</h2>
        <div className="space-y-3">
          {by_spa
            .sort((a, b) => b.total_count - a.total_count)
            .slice(0, 10)
            .map((spa, index) => (
              <div key={spa.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{spa.name}</div>
                    {spa.city && <div className="text-sm text-gray-500">{spa.city}</div>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-blue-600">{spa.total_count}</div>
                  <div className="text-xs text-gray-500">
                    {spa.candidate_count} candidates, {spa.hiring_count} hiring
                  </div>
                </div>
              </div>
            ))}
          {by_spa.length === 0 && (
            <div className="text-center text-gray-500 py-8">No SPA forms data available</div>
          )}
        </div>
      </div>

      {/* Top Users */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Top Form Creators</h2>
        <div className="space-y-3">
          {by_user
            .sort((a, b) => b.total_count - a.total_count)
            .slice(0, 10)
            .map((user, index) => (
              <div key={user.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {user.first_name} {user.last_name}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-green-600">{user.total_count}</div>
                  <div className="text-xs text-gray-500">
                    {user.candidate_count} candidates, {user.hiring_count} hiring
                  </div>
                </div>
              </div>
            ))}
          {by_user.length === 0 && (
            <div className="text-center text-gray-500 py-8">No users have created forms yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormsStatistics;

