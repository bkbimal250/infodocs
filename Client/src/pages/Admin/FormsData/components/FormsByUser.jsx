import React from 'react';

/**
 * Forms By User Component
 * Shows forms categorized by user (who created them)
 */
const FormsByUser = ({ userData }) => {
  const sortedUsers = [...userData].sort((a, b) => b.total_count - a.total_count);

  const getPercentage = (count, total) => {
    if (total === 0) return 0;
    return ((count / total) * 100).toFixed(1);
  };

  const totalForms = userData.reduce((sum, user) => sum + user.total_count, 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Forms by User</h2>
        <p className="text-sm text-gray-600 mt-1">
          Total: {totalForms} forms created by {userData.length} users
        </p>
      </div>

      <div className="space-y-4">
        {sortedUsers.map((user, index) => (
          <div key={user.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {index + 1}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{user.total_count}</div>
                <div className="text-xs text-gray-500">
                  {getPercentage(user.total_count, totalForms)}% of total
                </div>
              </div>
            </div>
            
            {/* Breakdown */}
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">Candidate Forms</div>
                <div className="text-xl font-bold text-green-600">{user.candidate_count}</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">Hiring Forms</div>
                <div className="text-xl font-bold text-purple-600">{user.hiring_count}</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${getPercentage(user.total_count, totalForms)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}

        {userData.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No users have created forms yet
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {userData.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{userData.length}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {sortedUsers[0]?.total_count || 0}
              </div>
              <div className="text-sm text-gray-600">Most by One User</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {totalForms > 0 ? (totalForms / userData.length).toFixed(1) : 0}
              </div>
              <div className="text-sm text-gray-600">Average per User</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormsByUser;

