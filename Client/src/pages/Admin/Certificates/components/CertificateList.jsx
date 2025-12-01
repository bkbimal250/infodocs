import React, { useState } from 'react';
import { adminApi } from '../../../../api/Admin/adminApi';

/**
 * Certificate List Component
 * Shows all certificates with creator information
 */
const CertificateList = ({ certificates, loading, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all'); // all, user, category

  const getCertificateName = (cert) => {
    return cert.candidate_name || 
           cert.manager_name || 
           cert.employee_name || 
           cert.customer_name || 
           'N/A';
  };

  const getCertificateCategory = (cert) => {
    if (cert.category) {
      const categoryMap = {
        spa_therapist: 'Spa Therapist',
        manager_salary: 'Manager Salary',
        offer_letter: 'Offer Letter',
        experience_letter: 'Experience Letter',
        appointment_letter: 'Appointment Letter',
        invoice_spa_bill: 'Invoice/SPA Bill',
      };
      return categoryMap[cert.category] || cert.category;
    }
    return 'Unknown';
  };

  const getCreatorName = (cert) => {
    if (cert.creator) {
      return `${cert.creator.first_name || ''} ${cert.creator.last_name || ''}`.trim() || cert.creator.email || 'Unknown';
    }
    return 'System';
  };

  const filteredCertificates = certificates.filter((cert) => {
    const name = getCertificateName(cert).toLowerCase();
    const creator = getCreatorName(cert).toLowerCase();
    const category = getCertificateCategory(cert).toLowerCase();
    const search = searchTerm.toLowerCase();

    return name.includes(search) || creator.includes(search) || category.includes(search);
  });

  const handleDownload = async (certificateId) => {
    try {
      const response = await adminApi.certificates.downloadCertificate(certificateId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate_${certificateId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download certificate:', err);
      alert('Failed to download certificate');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading certificates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Search and Filter */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, creator, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Certificate Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Generated Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCertificates.map((cert) => (
              <tr key={cert.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  #{cert.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {getCertificateName(cert)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                    {getCertificateCategory(cert)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{getCreatorName(cert)}</div>
                  {cert.creator?.email && (
                    <div className="text-sm text-gray-500">{cert.creator.email}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {cert.generated_at 
                    ? new Date(cert.generated_at).toLocaleDateString()
                    : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleDownload(cert.id)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredCertificates.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No certificates found
        </div>
      )}
    </div>
  );
};

export default CertificateList;

