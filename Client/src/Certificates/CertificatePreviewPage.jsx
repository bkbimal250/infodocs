import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { certificateApi } from '../api/Certificates/certificateApi';
import { generateCertificateFilename, downloadFile } from '../utils/certificateUtils';
import { FORM_STATES } from '../utils/certificateConstants';

/**
 * Certificate Preview Page
 * Standalone page that opens in a new window to show certificate preview
 * This preserves the state of the main form while showing the preview
 */
const CertificatePreviewPage = () => {
  const [searchParams] = useSearchParams();
  const previewId = searchParams.get('id');
  const iframeRef = useRef(null);
  const [zoom, setZoom] = useState(80);
  const [isLoading, setIsLoading] = useState(true);
  const [html, setHtml] = useState('');
  const [generationData, setGenerationData] = useState(null);
  const [state, setState] = useState(FORM_STATES.IDLE);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (previewId) {
      // Retrieve HTML from sessionStorage
      const storedHtml = sessionStorage.getItem(previewId);
      if (storedHtml) {
        setHtml(storedHtml);
        // Clean up after retrieving
        sessionStorage.removeItem(previewId);
      } else {
        console.error('Preview HTML not found');
      }
      
      // Retrieve generation data from sessionStorage
      const storedData = sessionStorage.getItem(`${previewId}_data`);
      if (storedData) {
        try {
          setGenerationData(JSON.parse(storedData));
          // Clean up after retrieving
          sessionStorage.removeItem(`${previewId}_data`);
        } catch (e) {
          console.error('Failed to parse generation data:', e);
        }
      }
    }
  }, [previewId]);

  useEffect(() => {
    if (iframeRef.current && html) {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDoc) {
        setIsLoading(true);
        // Get API base URL (without /api suffix)
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://infodocs.api.d0s369.co.in/api';
        const baseUrl = apiBaseUrl.replace('/api', '');
        
        // Replace file:// URLs with HTTP URLs for browser compatibility
        const processedHtml = html.replace(
          /file:\/\/\/[^"'\s)]+/g,
          (match) => {
            // Extract the path after Static/ or apps/Static/
            const pathMatch = match.match(/(?:apps\/)?Static\/(.+)$/);
            if (pathMatch) {
              const relativePath = pathMatch[1].replace(/\\/g, '/');
              return `${baseUrl}/static/${relativePath}`;
            }
            return match;
          }
        );

        iframeDoc.open();
        iframeDoc.write(processedHtml);
        iframeDoc.close();
        
        // Wait for images to load and adjust iframe height
        setTimeout(() => {
          setIsLoading(false);
          // Adjust iframe height to fit content
          if (iframe.contentWindow) {
            try {
              const iframeBody = iframe.contentWindow.document.body;
              const iframeHtml = iframe.contentWindow.document.documentElement;
              if (iframeBody && iframeHtml) {
                const height = Math.max(
                  iframeBody.scrollHeight,
                  iframeBody.offsetHeight,
                  iframeHtml.clientHeight,
                  iframeHtml.scrollHeight,
                  iframeHtml.offsetHeight
                );
                iframe.style.height = `${height}px`;
              }
            } catch (e) {
              console.warn('Could not access iframe content:', e);
            }
          }
        }, 500);
      }
    }
  }, [html]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50));
  };

  const handleResetZoom = () => {
    setZoom(80);
  };

  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.print();
    }
  };

  const handleGeneratePDF = async () => {
    if (!generationData) {
      setError('Generation data not available');
      return;
    }

    try {
      setState(FORM_STATES.GENERATING);
      setError(null);
      
      const response = await certificateApi.generateCertificate(generationData);
      
      const filename = generateCertificateFilename(
        'certificate',
        generationData.name || 'recipient'
      );
      downloadFile(response.data, filename);
      
      setSuccess('PDF generated successfully!');
    } catch (err) {
      setError('Failed to generate PDF. Please try again.');
      console.error('PDF generation error:', err);
    } finally {
      setState(FORM_STATES.IDLE);
    }
  };

  if (!html) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading preview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with Controls */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white shadow-sm sticky top-0 z-10">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Certificate Preview
        </h3>
        
        <div className="flex items-center gap-3">
          {/* Zoom Controls */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 py-1">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 50}
              className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </button>
            
            <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-center">
              {zoom}%
            </span>
            
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 200}
              className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Zoom In"
              aria-label="Zoom In"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            </button>
            
            <button
              onClick={handleResetZoom}
              className="p-1.5 rounded hover:bg-gray-200 transition-colors ml-1"
              title="Reset Zoom"
              aria-label="Reset Zoom"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Generate PDF Button */}
          <button
            onClick={handleGeneratePDF}
            disabled={state === FORM_STATES.GENERATING || !generationData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm font-medium"
            title="Generate PDF"
          >
            {state === FORM_STATES.GENERATING ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Generate PDF
              </>
            )}
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm font-medium"
            title="Print Certificate"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>

          {/* Close Button */}
          <button
            onClick={() => window.close()}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close preview"
            title="Close Preview"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Preview Container - Full height with proper scrolling */}
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading preview...</p>
            </div>
          </div>
        )}
        
        <div 
          className="bg-white shadow-lg mx-auto transition-transform duration-200"
          style={{ 
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            width: '210mm',
            minHeight: '297mm',
          }}
        >
          <iframe
            ref={iframeRef}
            title="Certificate Preview"
            className="border-0 w-full"
            style={{
              width: '210mm',
              height: 'auto',
              minHeight: '297mm',
              display: 'block',
              border: 'none',
            }}
            sandbox="allow-same-origin allow-scripts allow-forms"
            onLoad={() => {
              // Adjust iframe height after content loads to show full content
              setTimeout(() => {
                if (iframeRef.current?.contentWindow) {
                  try {
                    const iframeDoc = iframeRef.current.contentWindow.document;
                    const iframeBody = iframeDoc.body;
                    const iframeHtml = iframeDoc.documentElement;
                    if (iframeBody && iframeHtml) {
                      // Get the actual content height
                      const bodyHeight = Math.max(
                        iframeBody.scrollHeight,
                        iframeBody.offsetHeight
                      );
                      const htmlHeight = Math.max(
                        iframeHtml.scrollHeight,
                        iframeHtml.offsetHeight,
                        iframeHtml.clientHeight
                      );
                      const contentHeight = Math.max(bodyHeight, htmlHeight);
                      
                      // Convert mm to px (1mm = 3.779527559px at 96dpi)
                      const minHeightPx = 297 * 3.779527559; // A4 height in pixels
                      const finalHeight = Math.max(contentHeight, minHeightPx);
                      
                      if (iframeRef.current) {
                        iframeRef.current.style.height = `${finalHeight + 20}px`; // Add padding
                      }
                    }
                  } catch (e) {
                    console.warn('Could not access iframe content:', e);
                    // Fallback: set a reasonable height
                    if (iframeRef.current) {
                      iframeRef.current.style.height = `${297 * 3.779527559}px`;
                    }
                  }
                }
              }, 100);
            }}
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
        {error && (
          <div className="mb-2 p-2 bg-red-50 border border-red-200 text-red-700 rounded text-xs">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-2 p-2 bg-green-50 border border-green-200 text-green-700 rounded text-xs">
            {success}
          </div>
        )}
        <p className="text-xs text-gray-500">💡 Tip: Use zoom controls to adjust the preview size. The generated PDF will match this preview.</p>
      </div>
    </div>
  );
};

export default CertificatePreviewPage;

