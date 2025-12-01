import React from 'react';

/**
 * Forms By SPA Component
 * Shows forms categorized by SPA location
 */
const FormsBySpa = ({ spaData }) => {
  const sortedSpas = [...spaData].sort((a, b) => b.total_count - a.total_count);

  const getPercentage = (count, total) => {
    if (total === 0) return 0;
    return ((count / total) * 100).toFixed(1);
  };

  const totalForms = spaData.reduce((sum, spa) => sum + spa.total_count, 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Forms by SPA Location</h2>
        <p className="text-sm text-gray-600 mt-1">
          Total: {totalForms} forms across {spaData.length} SPA locations
        </p>
      </div>

      <div className="space-y-4">
        {sortedSpas.map((spa, index) => (
          <div key={spa.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {index + 1}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{spa.name}</div>
                  {spa.city && <div className="text-sm text-gray-500">{spa.city}</div>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{spa.total_count}</div>
                <div className="text-xs text-gray-500">
                  {getPercentage(spa.total_count, totalForms)}% of total
                </div>
              </div>
            </div>
            
            {/* Breakdown */}
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">Candidate Forms</div>
                <div className="text-xl font-bold text-green-600">{spa.candidate_count}</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">Hiring Forms</div>
                <div className="text-xl font-bold text-purple-600">{spa.hiring_count}</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${getPercentage(spa.total_count, totalForms)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}

        {spaData.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No SPA forms data available
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {spaData.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{spaData.length}</div>
              <div className="text-sm text-gray-600">Total SPAs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {sortedSpas[0]?.total_count || 0}
              </div>
              <div className="text-sm text-gray-600">Most by One SPA</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {totalForms > 0 ? (totalForms / spaData.length).toFixed(1) : 0}
              </div>
              <div className="text-sm text-gray-600">Average per SPA</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormsBySpa;

