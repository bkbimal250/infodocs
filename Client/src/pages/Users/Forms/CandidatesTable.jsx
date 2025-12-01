import { useState, useEffect, useRef } from 'react';
import { usersApi } from '../../../api/Users/usersApi';
import { Link } from 'react-router-dom';
import { HiPencil, HiTrash } from 'react-icons/hi';
import toast from 'react-hot-toast';
import PrintApplicationDetails from './components/PrintApplicationDetails';
import PrintUdertakingDetails from './components/PrintUdertakingDetails';
import EditData from './EditData';
import Pagination from '../../common/Pagination';

/**
 * Users Candidates Table Component
 * View user's own candidate forms
 */
const CandidatesTable = ({ onEdit, onDelete }) => {
  const [candidates, setCandidates] = useState([]);
  const [allCandidates, setAllCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printType, setPrintType] = useState(null); // 'application' or 'undertaking'
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const printContentRef = useRef(null);

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getMyCandidateForms({ skip: 0, limit: 1000 });
      setAllCandidates(response.data || []);
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to load candidate forms';
      setError(errorMessage);
      console.error('Load candidates error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Apply pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCandidates(allCandidates.slice(startIndex, endIndex));
  }, [allCandidates, currentPage]);

  const handlePrint = (candidate, type) => {
    setSelectedCandidate(candidate);
    setPrintType(type);
    setShowPrintModal(true);
  };

  const handleClosePrintModal = () => {
    setShowPrintModal(false);
    setSelectedCandidate(null);
    setPrintType(null);
  };

  const handlePrintPage = () => {
    window.print();
  };

  const preloadAndConvertImages = async (element) => {
    const images = element.querySelectorAll('img');
    
    // First, ensure all images are loaded (including data URLs)
    const loadPromises = Array.from(images).map((img) => {
      return new Promise((resolve) => {
        if (!img.src) {
          resolve();
          return;
        }
        
        // If already a data URL, it's ready
        if (img.src.startsWith('data:')) {
          resolve();
          return;
        }
        
        // If image is already loaded
        if (img.complete && img.naturalHeight !== 0) {
          resolve();
          return;
        }

        // Wait for image to load
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Continue even if image fails
      });
    });

    await Promise.all(loadPromises);
    await new Promise(resolve => setTimeout(resolve, 800)); // Wait longer for images to render and convert

    // Now convert to base64 if not already a data URL
    const convertPromises = Array.from(images).map((img) => {
      return new Promise((resolve) => {
        // Skip if already a data URL
        if (!img.src || img.src.startsWith('data:')) {
          resolve();
          return;
        }

        const newImg = new Image();
        newImg.crossOrigin = 'anonymous';
        
        newImg.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = newImg.width;
            canvas.height = newImg.height;
            ctx.drawImage(newImg, 0, 0);
            const dataURL = canvas.toDataURL('image/png');
            img.src = dataURL;
            resolve();
          } catch (error) {
            // If conversion fails due to CORS, try without conversion
            console.warn('Failed to convert image to base64 (CORS issue):', error);
            resolve(); // Continue - html2canvas will try to handle it
          }
        };
        
        newImg.onerror = () => {
          console.warn('Failed to load image for conversion:', img.src);
          resolve(); // Continue even if image fails
        };
        
        newImg.src = img.src;
      });
    });

    await Promise.all(convertPromises);
    // Final wait to ensure all images are rendered
    await new Promise(resolve => setTimeout(resolve, 300));
  };

  const handleDownloadPDF = async (element) => {
    if (!element) return;
    
    try {
      setDownloading(true);
      
      // Preload and convert all images to base64
      await preloadAndConvertImages(element);
      
      // Dynamically import html2pdf.js
      const html2pdf = await import('html2pdf.js');
      const html2pdfLib = html2pdf.default || html2pdf;
      
      const opt = {
        margin: 0.5,
        filename: `${printType === 'application' ? 'Job_Application_Form' : 'Undertaking_Form'}_${selectedCandidate?.id || 'form'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          logging: false,
          allowTaint: true, // Allow taint if base64 conversion fails
          backgroundColor: '#ffffff',
          imageTimeout: 15000,
          removeContainer: true
        },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };

      await html2pdfLib().set(opt).from(element).save();
    } catch (error) {
      console.error('PDF download error:', error);
      // Fallback to print if html2pdf fails
      alert('PDF download failed. Please use the Print button instead.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading candidates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Candidate Forms</h1>
          <p className="mt-2 text-gray-600">View candidate forms you have submitted</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {candidates.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No candidate forms</h3>
            <p className="mt-1 text-sm text-gray-500">You haven't submitted any candidate forms yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SPA Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {candidates.map((candidate) => (
                    <tr key={candidate.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {candidate.first_name} {candidate.middle_name || ''} {candidate.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {candidate.position_applied_for || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {candidate.phone_number || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {candidate.spa?.name || candidate.spa_name_text || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(candidate.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            to={`/user/forms/candidates/${candidate.id}`}
                            className="text-blue-600 hover:text-blue-900 font-medium inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </Link>
                          {onEdit && (
                            <button
                              onClick={() => {
                                setEditingCandidate(candidate);
                                setShowEditModal(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900 font-medium inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-indigo-50"
                              title="Edit Form"
                            >
                              <HiPencil className="w-4 h-4" />
                              Edit
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(candidate.id)}
                              className="text-red-600 hover:text-red-900 font-medium inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50"
                              title="Delete Form"
                            >
                              <HiTrash className="w-4 h-4" />
                              Delete
                            </button>
                          )}
                          <button
                            onClick={() => handlePrint(candidate, 'application')}
                            className="text-green-600 hover:text-green-900 font-medium inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-green-50"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Print Job Form
                          </button>
                          <button
                            onClick={() => handlePrint(candidate, 'undertaking')}
                            className="text-purple-600 hover:text-purple-900 font-medium inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-purple-50"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Print Undertaking
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {allCandidates.length > itemsPerPage && (
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(allCandidates.length / itemsPerPage)}
                onPageChange={setCurrentPage}
                totalItems={allCandidates.length}
                itemsPerPage={itemsPerPage}
              />
            )}
          </div>
        )}

        {/* Print Modal */}
        {showPrintModal && selectedCandidate && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 print:hidden">
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b bg-gray-50 print:hidden">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {printType === 'application' ? 'Job Application Form' : 'Undertaking Form'}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const element = printContentRef.current;
                        if (element) handleDownloadPDF(element);
                      }}
                      disabled={downloading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {downloading ? 'Downloading...' : 'Download PDF'}
                    </button>
                    <button
                      onClick={handlePrintPage}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Print
                    </button>
                    <button
                      onClick={handleClosePrintModal}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Close
                    </button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="overflow-y-auto flex-1 bg-white" ref={printContentRef}>
                  {printType === 'application' ? (
                    <PrintApplicationDetails 
                      data={{ candidate: selectedCandidate }} 
                      onDownload={handleDownloadPDF}
                    />
                  ) : (
                    <PrintUdertakingDetails 
                      data={{ candidate: selectedCandidate }} 
                      onDownload={handleDownloadPDF}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Candidate Form Modal */}
        <EditData
          candidate={editingCandidate}
          isOpen={showEditModal}
          onSuccess={() => {
            setShowEditModal(false);
            setEditingCandidate(null);
            loadCandidates();
          }}
          onCancel={() => {
            setShowEditModal(false);
            setEditingCandidate(null);
          }}
        />
      </div>
    </div>
  );
};

export default CandidatesTable;

