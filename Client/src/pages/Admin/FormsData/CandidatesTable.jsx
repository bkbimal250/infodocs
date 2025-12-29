import { Link } from 'react-router-dom';
import { useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import PrintApplicationDetails from './components/PrintApplicationDetails';
import PrintUdertakingDetails from './components/PrintUdertakingDetails';

/**
 * Candidates Table Component
 * Displays candidate forms in a table format
 */
const CandidatesTable = ({ candidates, loading, onEdit, onDelete }) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

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

  const handleDownloadPDF = async (candidate, type) => {
    if (!candidate) return;
    
    try {
      setDownloading(true);
      setDownloadingId(candidate.id);
      
      // Create a temporary container for the form
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      tempContainer.style.width = '210mm';
      document.body.appendChild(tempContainer);
      
      // Render the form component in the temp container
      const root = createRoot(tempContainer);
      
      const FormComponent = type === 'application' ? PrintApplicationDetails : PrintUdertakingDetails;
      root.render(
        <FormComponent 
          data={{ candidate }} 
          onDownload={null}
        />
      );
      
      // Wait for component to render and images to load
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get the form element
      const formElement = tempContainer.querySelector('.print-container') || tempContainer.querySelector('.a4-page') || tempContainer;
      
      if (!formElement) {
        throw new Error('Form element not found');
      }
      
      // Preload and convert all images to base64
      await preloadAndConvertImages(formElement);
      
      // Dynamically import html2pdf.js
      const html2pdf = await import('html2pdf.js');
      const html2pdfLib = html2pdf.default || html2pdf;
      
      const opt = {
        margin: 0.5,
        filename: `${type === 'application' ? 'Job_Application_Form' : 'Undertaking_Form'}_${candidate.id || 'form'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          logging: false,
          allowTaint: true,
          backgroundColor: '#ffffff',
          imageTimeout: 15000,
          removeContainer: true
        },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };

      await html2pdfLib().set(opt).from(formElement).save();
      
      // Cleanup
      root.unmount();
      document.body.removeChild(tempContainer);
    } catch (error) {
      console.error('PDF download error:', error);
      alert('PDF download failed. Please try again.');
    } finally {
      setDownloading(false);
      setDownloadingId(null);
    }
  };
  if (loading) {
    return (
      <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-[var(--color-gray-200)] rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!candidates || candidates.length === 0) {
    return (
      <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-md p-12 text-center">
        <svg
          className="w-24 h-24 mx-auto text-[var(--color-text-tertiary)] mb-4"
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
        <p className="text-[var(--color-text-secondary)] text-lg">No candidate forms found</p>
        <p className="text-[var(--color-text-tertiary)] text-sm mt-2">Candidates will appear here when they submit forms</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--color-border-primary)]">
          <thead className="bg-[var(--color-gray-50)]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
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
          <tbody className="bg-[var(--color-bg-primary)] divide-y divide-[var(--color-border-primary)]">
            {candidates.map((candidate) => (
              <tr key={candidate.id} className="hover:bg-[var(--color-gray-50)]">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-[var(--color-text-primary)]">
                    {candidate.first_name} {candidate.middle_name || ''} {candidate.last_name}
                  </div>
                  <div className="text-sm text-[var(--color-text-secondary)]">Age: {candidate.age}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[var(--color-text-primary)]">{candidate.phone_number}</div>
                  {candidate.alternate_number && (
                    <div className="text-sm text-[var(--color-text-secondary)]">{candidate.alternate_number}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[var(--color-text-primary)]">{candidate.position_applied_for}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[var(--color-text-primary)]">
                    {candidate.spa?.name || candidate.spa_name_text || 'N/A'}
                  </div>
                  {(candidate.spa?.city || candidate.city) && (
                    <div className="text-sm text-[var(--color-text-secondary)]">
                      {candidate.spa?.city || candidate.city}, {candidate.spa?.state || candidate.state}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[var(--color-text-primary)]">{candidate.work_experience}</div>
                  <div className="text-sm text-[var(--color-text-secondary)]">Therapist: {candidate.Therapist_experience}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-secondary)]">
                  {new Date(candidate.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      to={`/admin/forms-data/candidates/${candidate.id}`}
                      className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] font-medium inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-[var(--color-primary-light)]"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </Link>
                    <button
                      onClick={() => handleDownloadPDF(candidate, 'application')}
                      disabled={downloading && downloadingId === candidate.id}
                      className="text-[var(--color-success)] hover:text-[var(--color-success-dark)] font-medium inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-[var(--color-success-light)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {downloading && downloadingId === candidate.id ? 'Downloading...' : 'Download Job Form'}
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(candidate, 'undertaking')}
                      disabled={downloading && downloadingId === candidate.id}
                      className="text-[var(--color-secondary)] hover:text-[var(--color-secondary-dark)] font-medium inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-[var(--color-secondary-light)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {downloading && downloadingId === candidate.id ? 'Downloading...' : 'Download Undertaking'}
                    </button>
                    {onEdit && (
                      <button
                        onClick={() => onEdit(candidate)}
                        className="text-[var(--color-info)] hover:text-[var(--color-info-dark)] font-medium inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-[var(--color-info-light)]"
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
                        className="text-[var(--color-error)] hover:text-[var(--color-error-dark)] font-medium inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-[var(--color-error-light)]"
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

    </div>
  );
};

export default CandidatesTable;

