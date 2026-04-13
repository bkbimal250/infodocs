import React from 'react';
import {
  HiOutlineDocumentText,
  HiOutlineDownload,
  HiOutlineCalendar,
  HiOutlineUser,
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
  onDelete,
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

  const categoryMap = {
    spa_therapist: 'Spa Therapist',
    manager_salary: 'Manager Salary',
    offer_letter: 'Offer Letter',
    experience_letter: 'Experience Letter',
    appointment_letter: 'Appointment Letter',
    invoice_spa_bill: 'Invoice/SPA Bill',
    id_card: 'ID Card',
    daily_sheet: 'Daily Sheet',
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Certificate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Candidate/Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Created Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">Actions</th>
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
                      {getCandidateName
                        ? getCandidateName(certificate)
                        : (certificate.candidate_name ||
                          certificate.manager_name ||
                          certificate.employee_name ||
                          'N/A')}
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

                    {/* Download */}
                    <button
                      onClick={() => onDownloadPDF(certificate.id)}
                      className="text-green-600 hover:text-green-900 cursor-pointer"
                      title="Download PDF"
                    >
                      <HiOutlineDownload className="h-5 w-5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => onDelete(certificate.id, certificate.category)}
                      className="text-red-600 hover:text-red-900 cursor-pointer"
                      title="Delete"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>

                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination (UNCHANGED) */}
      {totalPages > 1 && (
        <div className="bg-[var(--color-bg-secondary)] px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">

          <div className="flex-1 flex justify-between sm:hidden">
            <button onClick={() => handlePageChange(currentPage - 1)}>Previous</button>
            <button onClick={() => handlePageChange(currentPage + 1)}>Next</button>
          </div>

          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <p className="text-sm text-gray-700">
              Showing {startIndex + 1} to {endIndex} of {totalItems}
            </p>

            <div className="flex">
              <button onClick={() => handlePageChange(currentPage - 1)}>
                <HiChevronLeft />
              </button>
              <button onClick={() => handlePageChange(currentPage + 1)}>
                <HiChevronRight />
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default CertificateTable;