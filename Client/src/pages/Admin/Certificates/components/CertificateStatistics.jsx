import React from 'react';
import { CERTIFICATE_CATEGORY_METADATA } from '../../../../utils/certificateConstants';

/**
 * Certificate Statistics Component
 * Displays overall statistics: total certificates, by category, etc.
 */
const CertificateStatistics = ({ statistics }) => {
  const { total_certificates = 0, by_category = {}, by_user = [] } = statistics || {};

  const categoryLabels = {
    spa_therapist: 'Spa Therapist',
    manager_salary: 'Manager Salary',
    offer_letter: 'Offer Letter',
    experience_letter: 'Experience Letter',
    appointment_letter: 'Appointment Letter',
    invoice_spa_bill: 'Invoice/SPA Bill',
  };

  return (
    <div className="space-y-6">
      {/* Total Statistics Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Overall Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="text-3xl font-bold">{total_certificates}</div>
            <div className="text-blue-100 mt-1">Total Certificates</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="text-3xl font-bold">{by_user.length}</div>
            <div className="text-green-100 mt-1">Active Users</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="text-3xl font-bold">{Object.keys(by_category).length}</div>
            <div className="text-purple-100 mt-1">Certificate Types</div>
          </div>
        </div>
      </div>

      {/* By Category */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Certificates by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(by_category).map(([category, count]) => (
            <div key={category} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">{categoryLabels[category] || category}</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">{count}</div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">{count}</span>
                </div>
              </div>
            </div>
          ))}
          {Object.keys(by_category).length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-8">
              No certificates by category yet
            </div>
          )}
        </div>
      </div>

      {/* Top Users */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Top Certificate Creators</h2>
        <div className="space-y-3">
          {by_user
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)
            .map((user, index) => (
              <div key={user.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
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
                  <div className="text-xl font-bold text-blue-600">{user.count}</div>
                  <div className="text-xs text-gray-500">certificates</div>
                </div>
              </div>
            ))}
          {by_user.length === 0 && (
            <div className="text-center text-gray-500 py-8">No users have created certificates yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificateStatistics;

