import React, { useState } from 'react';
import { adminApi } from '../../../../api/Admin/adminApi';

/**
 * Certificate List Component
 * Shows all certificates with creator information
 */
const CertificateList = ({ certificates, loading, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all'); // all, user, category
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

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
        id_card: 'ID Card',
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

  const [deletingId, setDeletingId] = useState(null);

  // Selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredCertificates.map(cert => cert.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (certId) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(certId)) {
      newSelected.delete(certId);
    } else {
      newSelected.add(certId);
    }
    setSelectedIds(newSelected);
  };

  const isAllSelected = filteredCertificates.length > 0 && 
    filteredCertificates.every(cert => selectedIds.has(cert.id));
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < filteredCertificates.length;

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

  const handleDelete = async (certificateId, category = null) => {
    if (!window.confirm('Are you sure you want to delete this certificate? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(certificateId);
      await adminApi.certificates.deleteCertificate(certificateId, category);
      // Remove from selection if it was selected
      const newSelected = new Set(selectedIds);
      newSelected.delete(certificateId);
      setSelectedIds(newSelected);
      // Refresh the list after successful deletion
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to delete certificate:', err);
      alert(err.response?.data?.detail || 'Failed to delete certificate');
    } finally {
      setDeletingId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) {
      alert('Please select at least one certificate to delete');
      return;
    }

    const count = selectedIds.size;
    if (!window.confirm(`Are you sure you want to delete ${count} certificate(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      setIsDeleting(true);
      const idsArray = Array.from(selectedIds);
      const response = await adminApi.certificates.bulkDeleteCertificates(idsArray);
      
      // Show result message
      if (response.data.deleted_count > 0) {
        alert(`Successfully deleted ${response.data.deleted_count} certificate(s)`);
      }
      if (response.data.failed_count > 0) {
        alert(`Failed to delete ${response.data.failed_count} certificate(s)`);
      }
      
      // Clear selection
      setSelectedIds(new Set());
      
      // Refresh the list
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to delete certificates:', err);
      alert(err.response?.data?.detail || 'Failed to delete certificates');
    } finally {
      setIsDeleting(false);
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
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, creator, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed"
            >
              {isDeleting ? `Deleting ${selectedIds.size}...` : `Delete Selected (${selectedIds.size})`}
            </button>
          )}
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = isIndeterminate;
                  }}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
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
              <tr key={cert.id} className={`hover:bg-gray-50 ${selectedIds.has(cert.id) ? 'bg-blue-50' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(cert.id)}
                    onChange={() => handleSelectOne(cert.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
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
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleDownload(cert.id)}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                      disabled={deletingId === cert.id}
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(cert.id, cert.category)}
                      className="text-red-600 hover:text-red-900 font-medium"
                      disabled={deletingId === cert.id}
                    >
                      {deletingId === cert.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
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

