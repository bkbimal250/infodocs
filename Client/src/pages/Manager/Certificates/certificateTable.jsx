import React from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineDocumentText,
  HiOutlineDownload,
  HiOutlineEye,
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlinePrinter,
  HiOutlinePhotograph,
  HiChevronLeft,
  HiChevronRight
} from 'react-icons/hi';

/**
 * Certificate Table Component with Pagination
 */
const CertificateTable = ({
  certificates,
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onDownloadPDF,
  onDownloadImage,
  onPrint,
  getCandidateName,
  getCategoryName
}) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedCertificates = certificates.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };

  // Category mapping for consistent display
  const categoryMap = {
    'spa_therapist': 'Spa Therapist',
    'manager_salary': 'Manager Salary',
    'offer_letter': 'Offer Letter',
    'experience_letter': 'Experience Letter',
    'appointment_letter': 'Appointment Letter',
    'invoice_spa_bill': 'Invoice/SPA Bill',
    'id_card': 'ID Card',
  };

  const formatCategory = (category) => {
    if (!category) return 'Unknown';
    const normalized = category.toLowerCase();
    return categoryMap[normalized] || category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="bg-[var(--color-bg-primary)] rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[var(--color-bg-secondary)]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Certificate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Candidate/Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-[var(--color-bg-primary)] divide-y divide-gray-200">
            {paginatedCertificates.map((certificate) => (
              <tr key={certificate.id} className="hover:bg-[var(--color-bg-secondary)]">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <HiOutlineDocumentText className="h-5 w-5 text-[var(--color-primary)] mr-2" />
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">
                      Certificate #{certificate.id}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {formatCategory(
                      certificate.category || 
                      certificate.certificate_data?.category || 
                      (getCategoryName ? getCategoryName(certificate) : '')
                    )}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <HiOutlineUser className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-[var(--color-text-primary)]">
                      {getCandidateName ? getCandidateName(certificate) : (certificate.candidate_name || certificate.manager_name || certificate.employee_name || 'N/A')}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-500">
                    <HiOutlineCalendar className="h-4 w-4 mr-2" />
                    {new Date(certificate.generated_at || certificate.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <Link
                      to={`/certificate/${certificate.id}`}
                      className="text-[var(--color-primary)] hover:text-blue-900"
                      title="View"
                    >
                      <HiOutlineEye className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => onDownloadPDF(certificate.id)}
                      className="text-green-600 hover:text-green-900"
                      title="Download PDF"
                    >
                      <HiOutlineDownload className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onDownloadImage(certificate.id)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Download Image (PNG)"
                    >
                      <HiOutlinePhotograph className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onPrint(certificate.id)}
                      className="text-purple-600 hover:text-purple-900"
                      title="Print Certificate"
                    >
                      <HiOutlinePrinter className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-[var(--color-bg-secondary)] px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
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
                <span className="font-medium">{totalItems}</span> results
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
                            ? 'z-10 bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
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

export default CertificateTable;

