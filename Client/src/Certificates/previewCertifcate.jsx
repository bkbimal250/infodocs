import React, { useEffect, useRef, useState } from 'react';

/**
 * Preview Certificate Component
 * Displays the rendered HTML certificate preview in an iframe
 * with zoom controls and proper sandbox permissions
 */
const PreviewCertificate = ({ html, onClose }) => {
  const iframeRef = useRef(null);
  const [zoom, setZoom] = useState(100);
  const [isLoading, setIsLoading] = useState(true);

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
        
        // Wait for images to load
        setTimeout(() => {
          setIsLoading(false);
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
    setZoom(100);
  };

  if (!html) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500">
        <p>No preview available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-100">
      {/* Header with Controls */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
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

          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
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
          )}
        </div>
      </div>

      {/* Preview Container */}
      <div className="relative bg-gray-50 p-4 overflow-auto" style={{ maxHeight: '80vh' }}>
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
            maxWidth: '100%',
          }}
        >
          <iframe
            ref={iframeRef}
            title="Certificate Preview"
            className="border-0"
            style={{
              width: '100%  !important',
              minHeight: '100%  !important',
              display: 'block',
            }}
            sandbox="allow-same-origin allow-scripts allow-forms"
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
        <p>💡 Tip: Use zoom controls to adjust the preview size. The generated PDF will match this preview.</p>
      </div>
    </div>
  );
};

export default PreviewCertificate;
