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
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://infodocs.api.d0s369.co.in/api';
    let cleanPath = filePath;
    if (filePath.startsWith('uploads/')) {
      cleanPath = filePath.replace('uploads/', '');
    } else if (filePath.startsWith('/uploads/')) {
      cleanPath = filePath.replace('/uploads/', '');
    }
    const url = `${apiBaseUrl}/forms/files/${cleanPath}`;
    return url;
  };

  const fetchImageAsDataUrl = async (filePath) => {
    if (!filePath) return null;
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
            margin: 10mm 15mm;
          }
          body {
            margin: 0;
            padding: 0;
          }
          * {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .a4-page {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
        }
        .a4-page {
          width: 210mm;
          height: 297mm;
          max-height: 297mm;
          padding: 10mm 15mm;
          margin: 0 auto;
          background: white;
          box-sizing: border-box;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        @media screen {
          .a4-page {
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
        }
        .form-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
      `}</style>
      <div className="print-container">
        <div ref={printRef} className="a4-page text-[12px] leading-snug font-[Times_New_Roman]">
          <div className="form-content">
            <h2 className="text-center uppercase font-bold text-base mb-2 mt-0" style={{ fontSize: '16px', marginBottom: '8px' }}>
              Job Application Form
            </h2>
            <div className="mb-1.5" style={{ marginBottom: '6px' }}>
              <span className="font-semibold text-[12px]">SPA NAME:</span>
              <div className="border-b border-black mt-0.5 min-h-[16px] pb-0.5" style={{ minHeight: '14px', paddingBottom: '2px' }}>
                {spaName}
              </div>
            </div>
            <div className="mb-1.5" style={{ marginBottom: '6px' }}>
              <h3 className="font-semibold mb-1 text-[12px]" style={{ marginBottom: '4px', fontSize: '12px' }}>PERSONAL INFORMATION:</h3>
              <div className="mb-0.5" style={{ marginBottom: '2px' }}>
                <span className="text-[11px]">First Name</span>
                <div className="border-b border-black mt-0.5 min-h-[16px] inline-block w-full pb-0.5" style={{ minHeight: '14px', paddingBottom: '2px' }}>
                  {firstName}
                </div>
              </div>
              <div className="mb-0.5" style={{ marginBottom: '2px' }}>
                <span className="text-[11px]">Middle Name</span>
                <div className="border-b border-black mt-0.5 min-h-[16px] inline-block w-full pb-0.5" style={{ minHeight: '14px', paddingBottom: '2px' }}>
                  {middleName}
                </div>
              </div>
              <div className="mb-0.5" style={{ marginBottom: '2px' }}>
                <span className="text-[11px]">Last Name</span>
                <div className="border-b border-black mt-0.5 min-h-[16px] inline-block w-full pb-0.5" style={{ minHeight: '14px', paddingBottom: '2px' }}>
                  {lastName}
                </div>
              </div>
              <div className="mb-0.5" style={{ marginBottom: '2px' }}>
                <span className="text-[11px]">Address</span>
                <div className="border-b border-black mt-0.5 min-h-[16px] pb-0.5" style={{ minHeight: '14px', paddingBottom: '2px' }}>
                  {address}
                </div>
              </div>
              <div className="mb-0.5" style={{ marginBottom: '2px' }}>
                <span className="text-[11px]">City, State, Zip Code</span>
                <div className="border-b border-black mt-0.5 min-h-[16px] pb-0.5" style={{ minHeight: '14px', paddingBottom: '2px' }}>
                  {cityStateZip}
                </div>
              </div>
              <div className="mb-0.5" style={{ marginBottom: '2px' }}>
                <span className="text-[11px]">Phone Number and Alternate phone number</span>
                <div className="border-b border-black mt-0.5 min-h-[16px] inline-block w-full pb-0.5" style={{ minHeight: '14px', paddingBottom: '2px' }}>
                  {phoneNumber} {alternateNumber && ` / ${alternateNumber}`}
                </div>
              </div>
              <div className="mb-0.5 flex gap-4" style={{ marginBottom: '2px' }}>
                <div className="flex-1">
                  <span className="text-[11px]">AGE:</span>
                  <div className="border-b border-black mt-0.5 min-h-[16px] inline-block w-full pb-0.5" style={{ minHeight: '14px', paddingBottom: '2px' }}>
                    {age}
                  </div>
                </div>
                <div className="flex-1">
                  <span className="text-[11px]">AGE PROOF DOCUMENT:</span>
                  <div className="border-b border-black mt-0.5 min-h-[16px] inline-block w-full pb-0.5" style={{ minHeight: '14px', paddingBottom: '2px' }}>
                    {ageProof}
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-1.5" style={{ marginBottom: '6px' }}>
              <h3 className="font-semibold mb-1 text-[12px]" style={{ marginBottom: '4px', fontSize: '12px' }}>POSITION/AVAILABILITY:</h3>
              <div className="mb-0.5" style={{ marginBottom: '2px' }}>
                <span className="text-[11px]">Position Applied For</span>
                <div className="border-b border-black mt-0.5 min-h-[16px] inline-block w-full pb-0.5" style={{ minHeight: '14px', paddingBottom: '2px' }}>
                  {position}
                </div>
              </div>
            </div>
            <div className="mb-1.5" style={{ marginBottom: '6px' }}>
              <h3 className="font-semibold mb-1 text-[12px]" style={{ marginBottom: '4px', fontSize: '12px' }}>EDUCATION/ CERTIFIED COURSE:</h3>
              <div className="mb-0.5" style={{ marginBottom: '2px' }}>
                <span className="font-semibold text-[11px]">Skills and Qualifications: Skills, Training</span>
              </div>
              <div className="border-b border-black min-h-[28px] pb-0.5" style={{ minHeight: '24px', paddingBottom: '2px' }}>
                {education}
              </div>
            </div>
            <div className="mb-1.5 flex-1" style={{ marginBottom: '6px', flex: '1 1 auto' }}>
              <p className="text-justify leading-tight text-[10px]" style={{ fontSize: '10px', lineHeight: '1.3' }}>
                I certify that information contained in this application is true and complete. 
                I understand that false information may be grounds for not hiring me or for immediate 
                termination of employment at any point in the future if I am hired. I authorize the 
                verification of any or all information listed above.
              </p>
            </div>
            <div className="mt-2 flex gap-8" style={{ marginTop: '8px' }}>
              <div className="flex-1">
                <span className="text-[11px]">Signature</span>
                <div className="border-b border-black mt-0.5 min-h-[32px] pb-0.5 flex items-center" style={{ minHeight: '28px', paddingBottom: '2px' }}>
                  {candidate.signature && imageCache[candidate.signature] ? (
                    <img
                      src={imageCache[candidate.signature]}
                      alt="Signature"
                      className="max-h-[28px] max-w-full object-contain"
                      style={{ maxHeight: '26px' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : candidate.signature ? (
                    <img
                      src={getFileUrl(candidate.signature)}
                      alt="Signature"
                      className="max-h-[28px] max-w-full object-contain"
                      style={{ maxHeight: '26px' }}
                      onLoad={async (e) => {
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
                <span className="text-[11px]">Date</span>
                <div className="border-b border-black mt-0.5 min-h-[16px] pb-0.5" style={{ minHeight: '14px', paddingBottom: '2px' }}>
                  {submissionDate}
                </div>
              </div>
            </div>
          </div>
        </div>
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

