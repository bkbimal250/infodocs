import React from 'react';

/**
 * User Certificate Counts Component
 * Shows how many certificates each user has created
 */
const UserCertificateCounts = ({ userCounts, totalCertificates }) => {
  const sortedUsers = [...userCounts].sort((a, b) => b.count - a.count);

  const getPercentage = (count) => {
    if (totalCertificates === 0) return 0;
    return ((count / totalCertificates) * 100).toFixed(1);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Certificates by User</h2>
        <p className="text-sm text-gray-600 mt-1">
          Total: {totalCertificates} certificates created by {userCounts.length} users
        </p>
      </div>

      <div className="space-y-4">
        {sortedUsers.map((user, index) => (
          <div key={user.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
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
                <div className="text-2xl font-bold text-blue-600">{user.count}</div>
                <div className="text-xs text-gray-500">
                  {getPercentage(user.count)}% of total
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${getPercentage(user.count)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}

        {userCounts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No users have created certificates yet
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {userCounts.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{userCounts.length}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {sortedUsers[0]?.count || 0}
              </div>
              <div className="text-sm text-gray-600">Most by One User</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {totalCertificates > 0 ? (totalCertificates / userCounts.length).toFixed(1) : 0}
              </div>
              <div className="text-sm text-gray-600">Average per User</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCertificateCounts;

