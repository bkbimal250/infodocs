import React, { useState, useEffect } from 'react';
import {
  HiChevronLeft,
  HiChevronRight,
  HiOutlineDownload,
} from 'react-icons/hi';
import { adminApi } from '../../../../api/Admin/adminApi';
import apiClient from '../../../../utils/apiConfig';

/**
 * Certificate List Component
 * Shows all certificates with creator information
 */
const CertificateList = ({ certificates, loading, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [deletingId, setDeletingId] = useState(null);

  const getCertificateName = (cert) => {
    return (
      cert.candidate_name ||
      cert.manager_name ||
      cert.employee_name ||
      cert.customer_name ||
      'N/A'
    );
  };

  const getCertificateCategory = (cert) => {
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
      return (
        categoryMap[normalized] ||
        category.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
      );
    }
    return 'Unknown';
  };

  const getCreatorName = (cert) => {
    if (cert.creator) {
      return (
        `${cert.creator.first_name || ''} ${cert.creator.last_name || ''}`.trim() ||
        cert.creator.email ||
        'Unknown'
      );
    }
    return 'System';
  };

  const filteredCertificates = certificates.filter((cert) => {
    const name = getCertificateName(cert).toLowerCase();
    const creator = getCreatorName(cert).toLowerCase();
    const category = getCertificateCategory(cert).toLowerCase();
    const search = searchTerm.toLowerCase();

    return (
      name.includes(search) ||
      creator.includes(search) ||
      category.includes(search)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredCertificates.length);
  const paginatedCertificates = filteredCertificates.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Selection
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredCertificates.map((cert) => cert.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (certId) => {
    const newSelected = new Set(selectedIds);
    newSelected.has(certId)
      ? newSelected.delete(certId)
      : newSelected.add(certId);
    setSelectedIds(newSelected);
  };

  const isAllSelected =
    filteredCertificates.length > 0 &&
    filteredCertificates.every((cert) => selectedIds.has(cert.id));

  const isIndeterminate =
    selectedIds.size > 0 && selectedIds.size < filteredCertificates.length;

  // Download
  const handleDownloadPDF = async (certificateId) => {
    try {
      const response = await apiClient.get(
        `/certificates/generated/${certificateId}/download/pdf`,
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate_${certificateId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error(error);
      alert('Failed to download certificate');
    }
  };

  // Delete
  const handleDelete = async (certificateId, category = null) => {
    if (!window.confirm('Are you sure you want to delete this certificate?')) return;

    try {
      setDeletingId(certificateId);
      await adminApi.certificates.deleteCertificate(certificateId, category);

      const newSelected = new Set(selectedIds);
      newSelected.delete(certificateId);
      setSelectedIds(newSelected);

      onRefresh && onRefresh();
    } catch (err) {
      alert('Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return alert('Select certificates');

    if (!window.confirm(`Delete ${selectedIds.size} certificates?`)) return;

    try {
      setIsDeleting(true);
      await adminApi.certificates.bulkDeleteCertificates([...selectedIds]);
      setSelectedIds(new Set());
      onRefresh && onRefresh();
    } catch {
      alert('Bulk delete failed');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md">

      {/* Search */}
      <div className="p-6 border-b flex gap-4">
        <input
          type="text"
          placeholder="Search..."
          className="flex-1 border px-4 py-2 rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {selectedIds.size > 0 && (
          <button
            onClick={handleBulkDelete}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Delete ({selectedIds.size})
          </button>
        )}

        <button onClick={onRefresh} className="bg-blue-600 text-white px-4 py-2 rounded">
          Refresh
        </button>
      </div>

      {/* Table */}
      <table className="min-w-full">
        <thead>
          <tr>
            <th><input type="checkbox" checked={isAllSelected}
              ref={(el) => el && (el.indeterminate = isIndeterminate)}
              onChange={handleSelectAll} /></th>
            <th>ID</th>
            <th>Name</th>
            <th>Category</th>
            <th>Creator</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {paginatedCertificates.map((cert) => (
            <tr key={cert.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedIds.has(cert.id)}
                  onChange={() => handleSelectOne(cert.id)}
                />
              </td>

              <td>#{cert.id}</td>
              <td>{getCertificateName(cert)}</td>
              <td>{getCertificateCategory(cert)}</td>
              <td>{getCreatorName(cert)}</td>
              <td>{cert.generated_at ? new Date(cert.generated_at).toLocaleDateString() : 'N/A'}</td>

              <td className="flex gap-2">

                {/* Download */}
                <button
                  onClick={() => handleDownloadPDF(cert.id)}
                  className="bg-green-100 text-green-700 px-3 py-1 rounded flex items-center cursor-pointer"
                >
                  <HiOutlineDownload className="mr-1" />
                  Download
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(cert.id, cert.category)}
                  className="bg-red-100 text-red-700 px-3 py-1 rounded cursor-pointer"
                >
                  {deletingId === cert.id ? 'Deleting...' : 'Delete'}
                </button>

              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 flex justify-between">
          <button onClick={() => handlePageChange(currentPage - 1)}>
            <HiChevronLeft />
          </button>

          <span>Page {currentPage} / {totalPages}</span>

          <button onClick={() => handlePageChange(currentPage + 1)}>
            <HiChevronRight />
          </button>
        </div>
      )}

    </div>
  );
};

export default CertificateList;