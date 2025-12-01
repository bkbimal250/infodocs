import { Link } from 'react-router-dom';
import { useState, useRef } from 'react';
import PrintApplicationDetails from './components/PrintApplicationDetails';
import PrintUdertakingDetails from './components/PrintUdertakingDetails';

/**
 * Candidates Table Component
 * Displays candidate forms in a table format
 */
const CandidatesTable = ({ candidates, loading, onEdit, onDelete }) => {
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printType, setPrintType] = useState(null); // 'application' or 'undertaking'
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const printContentRef = useRef(null);

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
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!candidates || candidates.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <svg
          className="w-24 h-24 mx-auto text-gray-400 mb-4"
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
        <p className="text-gray-500 text-lg">No candidate forms found</p>
        <p className="text-gray-400 text-sm mt-2">Candidates will appear here when they submit forms</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SPA Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Experience
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submitted
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
                  <div className="text-sm text-gray-500">Age: {candidate.age}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{candidate.phone_number}</div>
                  {candidate.alternate_number && (
                    <div className="text-sm text-gray-500">{candidate.alternate_number}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{candidate.position_applied_for}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {candidate.spa?.name || candidate.spa_name_text || 'N/A'}
                  </div>
                  {(candidate.spa?.city || candidate.city) && (
                    <div className="text-sm text-gray-500">
                      {candidate.spa?.city || candidate.city}, {candidate.spa?.state || candidate.state}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{candidate.work_experience}</div>
                  <div className="text-sm text-gray-500">Therapist: {candidate.Therapist_experience}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(candidate.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      to={`/admin/forms-data/candidates/${candidate.id}`}
                      className="text-blue-600 hover:text-blue-900 font-medium inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </Link>
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
                    {onEdit && (
                      <button
                        onClick={() => onEdit(candidate)}
                        className="text-indigo-600 hover:text-indigo-900 font-medium inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-indigo-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(candidate.id)}
                        className="text-red-600 hover:text-red-900 font-medium inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
    </div>
  );
};

export default CandidatesTable;

