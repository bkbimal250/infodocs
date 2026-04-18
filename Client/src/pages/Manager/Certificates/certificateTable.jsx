import React from 'react';
import {
  HiOutlineDocumentText,
  HiOutlineDownload,
  HiOutlineCalendar,
  HiOutlineUser,
  HiChevronLeft,
  HiChevronRight,
  HiOutlineTrash,
  HiOutlineEye
} from 'react-icons/hi';

/**
 * Certificate Table Component
 * Features a dual-view:
 * 1. Desktop: Premium Table
 * 2. Mobile: Card-based layout
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
    if (newPage >= 1 && (totalPages === 0 || newPage <= totalPages)) {
      onPageChange(newPage);
    }
  };

  const categoryStyles = {
    spa_therapist: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    manager_salary: 'bg-blue-50 text-blue-700 border-blue-100',
    offer_letter: 'bg-purple-50 text-purple-700 border-purple-100',
    experience_letter: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    appointment_letter: 'bg-cyan-50 text-cyan-700 border-cyan-100',
    invoice_spa_bill: 'bg-orange-50 text-orange-700 border-orange-100',
    id_card: 'bg-pink-50 text-pink-700 border-pink-100',
    daily_sheet: 'bg-amber-50 text-amber-700 border-amber-100',
    default: 'bg-gray-50 text-gray-700 border-gray-100'
  };

  const formatCategory = (category) => {
    if (!category) return 'Other';
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getCategoryClass = (category) => {
    return categoryStyles[category?.toLowerCase()] || categoryStyles.default;
  };

  return (
    <div className="w-full">
      {/* Desktop View (Table) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50/50">
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Certificate
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Candidate / Recipient
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Issued Date
              </th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {paginatedCertificates.map((cert) => (
              <tr key={cert.id} className="hover:bg-gray-50/80 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                      <HiOutlineDocumentText className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">#{cert.id}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryClass(cert.category || cert.certificate_data?.category)}`}>
                    {formatCategory(cert.category || cert.certificate_data?.category)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-600">
                    <HiOutlineUser className="h-4 w-4 mr-2 text-gray-400" />
                    {getCandidateName(cert)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-500">
                    <HiOutlineCalendar className="h-4 w-4 mr-2 text-gray-400" />
                    {new Date(cert.generated_at || cert.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onDownloadPDF(cert.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Download PDF"
                    >
                      <HiOutlineDownload className="h-5 w-5" />
                    </button>
                    {onDelete && (
                      <button
                        onClick={() => onDelete(cert.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Certificate"
                      >
                        <HiOutlineTrash className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View (Cards) */}
      <div className="md:hidden divide-y divide-gray-100">
        {paginatedCertificates.map((cert) => (
          <div key={cert.id} className="p-4 space-y-4 hover:bg-gray-50/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <HiOutlineDocumentText className="h-4 w-4" />
                </div>
                <span className="font-bold text-gray-900">#{cert.id}</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryClass(cert.category || cert.certificate_data?.category)}`}>
                {formatCategory(cert.category || cert.certificate_data?.category)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Recipient</p>
                <p className="text-sm font-medium text-gray-700 truncate">{getCandidateName(cert)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Issued On</p>
                <p className="text-sm font-medium text-gray-700">
                  {new Date(cert.generated_at || cert.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => onDownloadPDF(cert.id)}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold active:scale-95 transition-transform"
              >
                <HiOutlineDownload className="h-4 w-4" />
                Download
              </button>
              {onDelete && (
                <button
                  onClick={() => onDelete(cert.id)}
                  className="p-2 bg-red-50 text-red-500 rounded-xl active:scale-95 transition-transform"
                >
                  <HiOutlineTrash className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Footer */}
      <div className="px-6 py-4 bg-gray-50/30 border-t border-gray-100 flex items-center justify-between gap-4">
        <div className="text-sm text-gray-500">
          Showing <span className="font-bold text-gray-900">{startIndex + 1}</span> to <span className="font-bold text-gray-900">{endIndex}</span> of <span className="font-bold text-gray-900">{totalItems}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 disabled:opacity-50 disabled:bg-gray-50 hover:bg-gray-50 transition-colors"
          >
            <HiChevronLeft className="h-5 w-5" />
          </button>

          <div className="hidden sm:flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) pageNum = i + 1;
              else if (currentPage <= 3) pageNum = i + 1;
              else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = currentPage - 2 + i;

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${currentPage === pageNum
                      ? 'bg-blue-600 text-white shadow-blue-200 shadow-lg'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                    }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 disabled:opacity-50 disabled:bg-gray-50 hover:bg-gray-50 transition-colors"
          >
            <HiChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificateTable;
