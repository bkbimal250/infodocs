import React from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

/**
 * Premium Pagination Component
 * High-fidelity navigation for tables and lists with glassmorphism effects.
 */
const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems = 0,
  itemsPerPage = 10,
  showInfo = true
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1 && !showInfo) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-6 bg-white gap-4 border-t border-gray-100">
      {/* Items Counting Info */}
      {showInfo && (
        <div className="flex items-center gap-3">
          <div className="flex items-center -space-x-1">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
          </div>
          <p className="text-[10px] font-black text-gray-400  tracking-[0.2em]">
            Displaying <span className="text-gray-900">{startItem} — {endItem}</span> of <span className="text-gray-900">{totalItems}</span> personnel
          </p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <nav className="flex items-center gap-1.5" aria-label="Pagination">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2.5 rounded-xl border border-gray-100 bg-white text-gray-400 hover:text-gray-900 hover:border-gray-900 transition-all disabled:opacity-20 disabled:cursor-not-allowed active:scale-90"
            >
              <HiChevronLeft size={18} />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1.5 px-1.5">
              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' && handlePageChange(page)}
                  disabled={page === '...'}
                  className={`min-w-[40px] h-[40px] flex items-center justify-center rounded-xl text-[10px] font-black transition-all ${page === currentPage
                      ? 'bg-gray-900 text-white shadow-xl shadow-gray-200 scale-105 z-10'
                      : page === '...'
                        ? 'text-gray-300 cursor-default'
                        : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  {page}
                </button>
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2.5 rounded-xl border border-gray-100 bg-white text-gray-400 hover:text-gray-900 hover:border-gray-900 transition-all disabled:opacity-20 disabled:cursor-not-allowed active:scale-90"
            >
              <HiChevronRight size={18} />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default Pagination;
