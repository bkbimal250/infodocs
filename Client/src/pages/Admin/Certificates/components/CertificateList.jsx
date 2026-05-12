import React, { useState, useEffect, useMemo } from 'react';
import {
  HiOutlineDownload,
  HiOutlineTrash,
  HiOutlineSearch,
  HiOutlineRefresh,
  HiOutlineDocumentText,
  HiOutlineUserCircle,
  HiOutlineCalendar,
} from 'react-icons/hi';
import { adminApi } from '../../../../api/Admin/adminApi';
import apiClient from '../../../../utils/apiConfig';
import Pagination from '../../../common/Pagination';

/**
 * Certificate List Component
 * Shows all certificates with creator information in a premium table format.
 */
const CertificateList = ({ certificates = [], loading, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
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

  const getCategoryColor = (category) => {
    const normalized = category?.toLowerCase() || '';
    if (normalized.includes('letter')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (normalized.includes('invoice') || normalized.includes('bill')) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (normalized.includes('therapist')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (normalized.includes('salary')) return 'bg-purple-100 text-purple-700 border-purple-200';
    if (normalized.includes('card')) return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
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

  const filteredCertificates = useMemo(() => {
    return certificates.filter((cert) => {
      const name = getCertificateName(cert).toLowerCase();
      const creator = getCreatorName(cert).toLowerCase();
      const category = getCertificateCategory(cert).toLowerCase();
      const search = searchTerm.toLowerCase();

      return (
        name.includes(search) ||
        creator.includes(search) ||
        category.includes(search) ||
        String(cert.id).includes(search)
      );
    });
  }, [certificates, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredCertificates.length);
  const paginatedCertificates = filteredCertificates.slice(startIndex, endIndex);

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
    if (!window.confirm('Are you sure you want to delete this certificate? This action cannot be undone.')) return;

    try {
      setDeletingId(certificateId);
      await adminApi.certificates.deleteCertificate(certificateId, category);

      const newSelected = new Set(selectedIds);
      newSelected.delete(certificateId);
      setSelectedIds(newSelected);

      onRefresh && onRefresh();
    } catch (err) {
      alert('Failed to delete certificate');
    } finally {
      setDeletingId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    if (!window.confirm(`Are you sure you want to permanently delete these ${selectedIds.size} certificates?`)) return;

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

  if (loading && certificates.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-500 font-medium">Synchronizing certificates...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300">

      {/* Header Actions */}
      <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96 group">
          <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search by name, category, or creator..."
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all outline-none text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl hover:bg-rose-100 transition-all flex items-center justify-center gap-2 text-sm font-bold active:scale-95 disabled:opacity-50"
            >
              <HiOutlineTrash size={18} />
              Delete {selectedIds.size}
            </button>
          )}

          <button
            onClick={onRefresh}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl hover:bg-indigo-100 transition-all flex items-center justify-center gap-2 text-sm font-bold active:scale-95"
          >
            <HiOutlineRefresh size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        {filteredCertificates.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 w-12">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => el && (el.indeterminate = isIndeterminate)}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </div>
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Certificate Info</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Created By</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedCertificates.map((cert) => {
                const category = getCertificateCategory(cert);
                return (
                  <tr key={cert.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(cert.id)}
                          onChange={() => handleSelectOne(cert.id)}
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                          <HiOutlineDocumentText size={20} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {getCertificateName(cert)}
                          </div>
                          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-0.5">
                            ID: #{cert.id} • {cert.generated_at ? new Date(cert.generated_at).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border ${getCategoryColor(category)}`}>
                        {category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <HiOutlineUserCircle size={18} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-600">{getCreatorName(cert)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <button
                          onClick={() => handleDownloadPDF(cert.id)}
                          title="Download PDF"
                          className="p-2 text-emerald-600 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-all active:scale-90"
                        >
                          <HiOutlineDownload size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(cert.id, cert.category)}
                          disabled={deletingId === cert.id}
                          title="Delete Certificate"
                          className="p-2 text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 transition-all active:scale-90 disabled:opacity-50"
                        >
                          <HiOutlineTrash size={18} className={deletingId === cert.id ? 'animate-pulse' : ''} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-16 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiOutlineDocumentText size={40} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No certificates found</h3>
            <p className="text-gray-500 max-w-xs mx-auto">We couldn't find any certificates matching your current filters.</p>
            <button
              onClick={() => setSearchTerm('')}
              className="mt-6 text-indigo-600 font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Pagination Container */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filteredCertificates.length}
        itemsPerPage={itemsPerPage}
        showInfo={true}
      />
    </div>
  );
};

export default CertificateList;