import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  HiChevronLeft, 
  HiChevronRight,
  HiOutlineEye,
  HiOutlineDownload,
  HiOutlinePhotograph,
  HiOutlinePrinter
} from 'react-icons/hi';
import { adminApi } from '../../../../api/Admin/adminApi';
import apiClient from '../../../../utils/apiConfig';

/**
 * Certificate List Component
 * Shows all certificates with creator information
 */
const CertificateList = ({ certificates, loading, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all'); // all, user, category
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const getCertificateName = (cert) => {
    return cert.candidate_name || 
           cert.manager_name || 
           cert.employee_name || 
           cert.customer_name || 
           'N/A';
  };

  const getCertificateCategory = (cert) => {
    // Try multiple sources for category
    const category = cert.category || cert.certificate_data?.category || '';
    if (category) {
      const categoryMap = {
        spa_therapist: 'Spa Therapist',
        manager_salary: 'Manager Salary',
        offer_letter: 'Offer Letter',
        experience_letter: 'Experience Letter',
        appointment_letter: 'Appointment Letter',
        invoice_spa_bill: 'Invoice/SPA Bill',
        id_card: 'ID Card',
      };
      const normalized = category.toLowerCase();
      return categoryMap[normalized] || category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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

  // Pagination calculations
  const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredCertificates.length);
  const paginatedCertificates = filteredCertificates.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Reset to first page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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

  const handleDownloadPDF = async (certificateId) => {
    try {
      const response = await apiClient.get(
        `/certificates/generated/${certificateId}/download/pdf`,
        { responseType: 'blob' }
      );
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate_${certificateId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Clean up the URL after a short delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to download certificate';
      alert(`Failed to download certificate: ${errorMessage}`);
    }
  };

  const handleDownloadImage = async (certificateId) => {
    try {
      const response = await apiClient.get(
        `/certificates/generated/${certificateId}/download/image`,
        { responseType: 'blob' }
      );
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      const blob = new Blob([response.data], { type: 'image/png' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate_${certificateId}.png`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Clean up the URL after a short delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Error downloading certificate image:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to download certificate image';
      alert(`Failed to download certificate image: ${errorMessage}`);
    }
  };

  const handlePrint = async (certificateId) => {
    try {
      const response = await apiClient.get(
        `/certificates/generated/${certificateId}/download/pdf`,
        { responseType: 'blob' }
      );
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const printWindow = window.open(url, '_blank');
      
      if (printWindow) {
        // Wait for PDF to load before printing
        printWindow.addEventListener('load', () => {
          setTimeout(() => {
            printWindow.print();
            // Clean up URL after a delay (user can cancel print dialog)
            setTimeout(() => {
              window.URL.revokeObjectURL(url);
            }, 1000);
          }, 500);
        });
        
        // Fallback: if window doesn't load, try printing anyway
        setTimeout(() => {
          if (printWindow && !printWindow.closed) {
            try {
              printWindow.print();
            } catch (e) {
              console.error('Error triggering print:', e);
            }
          }
        }, 1000);
      } else {
        // If popup blocked, fallback to download
        alert('Popup blocked. Please allow popups and try again, or use the download button.');
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error printing certificate:', error);
      alert('Failed to print certificate. Please try downloading instead.');
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
            {paginatedCertificates.map((cert) => (
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
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {/* View Button */}
                    <Link
                      to={`/admin/certificates/${cert.id}`}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:text-blue-800 transition-colors"
                      title="View Certificate"
                    >
                      <HiOutlineEye className="h-4 w-4 mr-1.5" />
                      View
                    </Link>
                    
                    {/* Download PDF Button */}
                    <button
                      onClick={() => handleDownloadPDF(cert.id)}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 hover:text-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Download PDF"
                      disabled={deletingId === cert.id}
                    >
                      <HiOutlineDownload className="h-4 w-4 mr-1.5" />
                      PDF
                    </button>
                    
                    {/* Download Image Button */}
                    <button
                      onClick={() => handleDownloadImage(cert.id)}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:text-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Download Image (PNG)"
                      disabled={deletingId === cert.id}
                    >
                      <HiOutlinePhotograph className="h-4 w-4 mr-1.5" />
                      Image
                    </button>
                    
                    {/* Print Button */}
                    <button
                      onClick={() => handlePrint(cert.id)}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 hover:text-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Print Certificate"
                      disabled={deletingId === cert.id}
                    >
                      <HiOutlinePrinter className="h-4 w-4 mr-1.5" />
                      Print
                    </button>
                    
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(cert.id, cert.category)}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:text-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete Certificate"
                      disabled={deletingId === cert.id}
                    >
                      {deletingId === cert.id ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-700 mr-1.5"></div>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </>
                      )}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{endIndex}</span> of{' '}
                <span className="font-medium">{filteredCertificates.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <HiChevronLeft className="h-5 w-5" />
                </button>
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  // Show first page, last page, current page, and pages around current
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-blue-600 border-blue-600 text-white'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span
                        key={page}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <HiChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateList;

