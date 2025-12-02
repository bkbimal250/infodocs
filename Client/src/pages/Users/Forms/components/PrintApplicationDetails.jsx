import React, { useRef, useState, useEffect } from "react";

const PrintApplicationDetails = ({ data = {}, onDownload }) => {
  // Map candidate data to print format
  const candidate = data.candidate || data;
  const printRef = useRef(null);
  const [imageCache, setImageCache] = useState({});
  
  const spaName = candidate.spa?.name || candidate.spa_name_text || "";
  const firstName = candidate.first_name || "";
  const middleName = candidate.middle_name || "";
  const lastName = candidate.last_name || "";
  const address = candidate.current_address || "";
  const cityStateZip = `${candidate.city || ""}, ${candidate.state || ""} ${candidate.zip_code || ""}`.trim();
  const phoneNumber = candidate.phone_number || "";
  const alternateNumber = candidate.alternate_number || "";
  const age = candidate.age || "";
  const ageProof = candidate.age_proof_document ? "Submitted" : "";
  const position = candidate.position_applied_for || "";
  const education = candidate.education_certificate_courses || "";
  const submissionDate = candidate.created_at ? new Date(candidate.created_at).toLocaleDateString() : "";

  const getFileUrl = (filePath) => {
    if (!filePath) return null;
    
    // Get API base URL from environment or use default
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://infodocs.api.d0s369.co.in/api';
    
    // Handle different file path formats
    let cleanPath = filePath;
    
    // Remove "uploads/" prefix if present
    if (filePath.startsWith('uploads/')) {
      cleanPath = filePath.replace('uploads/', '');
    } else if (filePath.startsWith('/uploads/')) {
      cleanPath = filePath.replace('/uploads/', '');
    }
    
    // Construct the file serving URL using the forms router endpoint
    const url = `${apiBaseUrl}/forms/files/${cleanPath}`;
    
    return url;
  };

  // Fetch image as blob and convert to data URL to bypass CORS
  const fetchImageAsDataUrl = async (filePath) => {
    if (!filePath) return null;
    
    // Check cache first
    if (imageCache[filePath]) {
      return imageCache[filePath];
    }

    try {
      const url = getFileUrl(filePath);
      if (!url) return null;

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        console.warn('Failed to fetch image:', url);
        return null;
      }

      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result;
          setImageCache(prev => ({ ...prev, [filePath]: dataUrl }));
          resolve(dataUrl);
        };
        reader.onerror = () => {
          console.warn('Failed to convert image to data URL:', url);
          resolve(null);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn('Error fetching image:', error);
      return null;
    }
  };

  // Preload images on mount
  useEffect(() => {
    const preloadImages = async () => {
      if (candidate.signature) {
        await fetchImageAsDataUrl(candidate.signature);
      }
    };
    preloadImages();
  }, [candidate.signature]);

  const handleDownload = () => {
    if (onDownload && printRef.current) {
      onDownload(printRef.current);
    }
  };

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm 20mm;
          }
          body {
            margin: 0;
            padding: 0;
          }
        }
        .a4-page {
          width: 210mm;
          min-height: 297mm;
          padding: 15mm 20mm;
          margin: 0 auto;
          background: white;
          box-sizing: border-box;
        }
        @media screen {
          .a4-page {
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
        }
      `}</style>
      <div className="print-container">
        <div ref={printRef} className="a4-page text-[13px] leading-tight font-[Times_New_Roman]">
          {/* HEADER */}
          <h2 className="text-center uppercase font-bold text-lg mb-3 mt-0">
            Job Application Form
          </h2>

          {/* SPA NAME */}
          <div className="mb-2">
            <span className="font-semibold">SPA NAME:</span>
            <div className="border-b border-black mt-0.5 min-h-[18px] pb-1">
              {spaName}
            </div>
          </div>

          {/* PERSONAL INFORMATION */}
          <div className="mb-2">
            <h3 className="font-semibold mb-1.5 text-[13px]">PERSONAL INFORMATION:</h3>
            
            <div className="mb-1">
              <span>First Name</span>
              <div className="border-b border-black mt-0.5 min-h-[18px] inline-block w-full pb-1">
                {firstName}
              </div>
            </div>

            <div className="mb-1">
              <span>Middle Name</span>
              <div className="border-b border-black mt-0.5 min-h-[18px] inline-block w-full pb-1">
                {middleName}
              </div>
            </div>

            <div className="mb-1">
              <span>Last Name</span>
              <div className="border-b border-black mt-0.5 min-h-[18px] inline-block w-full pb-1">
                {lastName}
              </div>
            </div>

            <div className="mb-1">
              <span>Address</span>
              <div className="border-b border-black mt-0.5 min-h-[18px] pb-1">
                {address}
              </div>
            </div>

            <div className="mb-1">
              <span>City, State, Zip Code</span>
              <div className="border-b border-black mt-0.5 min-h-[18px] pb-1">
                {cityStateZip}
              </div>
            </div>

            <div className="mb-1">
              <span>Phone Number and Alternate phone number</span>
              <div className="border-b border-black mt-0.5 min-h-[18px] inline-block w-full pb-1">
                {phoneNumber} {alternateNumber && ` / ${alternateNumber}`}
              </div>
            </div>

            <div className="mb-1 flex gap-4">
              <div className="flex-1">
                <span>AGE:</span>
                <div className="border-b border-black mt-0.5 min-h-[18px] inline-block w-full pb-1">
                  {age}
                </div>
              </div>
              <div className="flex-1">
                <span>AGE PROOF DOCUMENT:</span>
                <div className="border-b border-black mt-0.5 min-h-[18px] inline-block w-full pb-1">
                  {ageProof}
                </div>
              </div>
            </div>
          </div>

          {/* POSITION/AVAILABILITY */}
          <div className="mb-2">
            <h3 className="font-semibold mb-1.5 text-[13px]">POSITION/AVAILABILITY:</h3>
            <div className="mb-1">
              <span>Position Applied For</span>
              <div className="border-b border-black mt-0.5 min-h-[18px] inline-block w-full pb-1">
                {position}
              </div>
            </div>
          </div>

          {/* EDUCATION/ CERTIFIED COURSE */}
          <div className="mb-2">
            <h3 className="font-semibold mb-1.5 text-[13px]">EDUCATION/ CERTIFIED COURSE:</h3>
            <div className="mb-1">
              <span className="font-semibold">Skills and Qualifications: Skills, Training</span>
            </div>
            <div className="border-b border-black min-h-[35px] pb-1">
              {education}
            </div>
          </div>

          {/* DECLARATION */}
          <div className="mb-2">
            <p className="text-justify leading-tight text-[12px]">
              I certify that information contained in this application is true and complete. 
              I understand that false information may be grounds for not hiring me or for immediate 
              termination of employment at any point in the future if I am hired. I authorize the 
              verification of any or all information listed above.
            </p>
          </div>

          {/* SIGNATURES */}
          <div className="mt-3 flex gap-8">
            <div className="flex-1">
              <span>Signature</span>
              <div className="border-b border-black mt-0.5 min-h-[40px] pb-1 flex items-center">
                {candidate.signature && imageCache[candidate.signature] ? (
                  <img
                    src={imageCache[candidate.signature]}
                    alt="Signature"
                    className="max-h-[35px] max-w-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : candidate.signature ? (
                  <img
                    src={getFileUrl(candidate.signature)}
                    alt="Signature"
                    className="max-h-[35px] max-w-full object-contain"
                    onLoad={async (e) => {
                      // Try to convert to data URL after load
                      const dataUrl = await fetchImageAsDataUrl(candidate.signature);
                      if (dataUrl) {
                        e.target.src = dataUrl;
                      }
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <span>&nbsp;</span>
                )}
              </div>
            </div>
            <div className="flex-1">
              <span>Date</span>
              <div className="border-b border-black mt-0.5 min-h-[18px] pb-1">
                {submissionDate}
              </div>
            </div>
          </div>
        </div>

        {/* Download Button - Hidden in Print */}
        {onDownload && (
          <div className="text-center mt-4 print:hidden">
            <button
              onClick={handleDownload}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 mx-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default PrintApplicationDetails;

