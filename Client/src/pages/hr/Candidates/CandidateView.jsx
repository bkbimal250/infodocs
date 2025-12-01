import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { hrApi } from '../../../api/hr/hrApi';
import PrintApplicationDetails from './components/PrintApplicationDetails';
import PrintUdertakingDetails from './components/PrintUdertakingDetails';

/**
 * Candidate View Details Component
 * Display detailed information about a candidate form submission
 */
const CandidateView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printType, setPrintType] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const printContentRef = useRef(null);

  useEffect(() => {
    if (id) {
      loadCandidateDetails();
    }
  }, [id]);

  const loadCandidateDetails = async () => {
    try {
      setLoading(true);
      const response = await hrApi.getCandidateForm(id);
      setCandidate(response.data);
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to load candidate details';
      setError(errorMessage);
      console.error('Load candidate details error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (type) => {
    setPrintType(type);
    setShowPrintModal(true);
  };

  const handleClosePrintModal = () => {
    setShowPrintModal(false);
    setPrintType(null);
  };

  const handlePrintPage = () => {
    window.print();
  };

  const preloadAndConvertImages = async (element) => {
    const images = element.querySelectorAll('img');
    
    const loadPromises = Array.from(images).map((img) => {
      return new Promise((resolve) => {
        if (!img.src) {
          resolve();
          return;
        }
        
        if (img.src.startsWith('data:')) {
          resolve();
          return;
        }
        
        if (img.complete && img.naturalHeight !== 0) {
          resolve();
          return;
        }

        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    });

    await Promise.all(loadPromises);
    await new Promise(resolve => setTimeout(resolve, 800));

    const convertPromises = Array.from(images).map((img) => {
      return new Promise((resolve) => {
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
            console.warn('Failed to convert image to base64 (CORS issue):', error);
            resolve();
          }
        };
        
        newImg.onerror = () => {
          console.warn('Failed to load image for conversion:', img.src);
          resolve();
        };
        
        newImg.src = img.src;
      });
    });

    await Promise.all(convertPromises);
    await new Promise(resolve => setTimeout(resolve, 300));
  };

  const handleDownloadPDF = async (element) => {
    if (!element) return;
    
    try {
      setDownloading(true);
      
      await preloadAndConvertImages(element);
      
      const html2pdf = await import('html2pdf.js');
      const html2pdfLib = html2pdf.default || html2pdf;
      
      const opt = {
        margin: 0.5,
        filename: `${printType === 'application' ? 'Job_Application_Form' : 'Undertaking_Form'}_${candidate?.id || 'form'}.pdf`,
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

      await html2pdfLib().set(opt).from(element).save();
    } catch (error) {
      console.error('PDF download error:', error);
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
          <p className="mt-4 text-gray-600">Loading candidate details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <button
            onClick={() => navigate('/hr/candidates')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Candidates
          </button>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return null;
  }

  const getFileUrl = (filePath) => {
    if (!filePath) return null;
    
    // Get API base URL from environment or use default
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    
    // Handle different file path formats
    // Files are stored as "uploads/candidate_forms/uuid.jpg" or "candidate_forms/uuid.jpg"
    let cleanPath = filePath;
    
    // Remove "uploads/" prefix if present
    if (filePath.startsWith('uploads/')) {
      cleanPath = filePath.replace('uploads/', '');
    } else if (filePath.startsWith('/uploads/')) {
      cleanPath = filePath.replace('/uploads/', '');
    }
    
    // Construct the file serving URL using the forms router endpoint
    const url = `${apiBaseUrl}/forms/files/${cleanPath}`;
    
    // Debug logging (remove in production)
    if (import.meta.env.DEV) {
      console.log('File URL:', { original: filePath, clean: cleanPath, url });
    }
    
    return url;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Candidate Details</h1>
              <p className="text-gray-600 mt-1">Form ID: #{candidate.id}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handlePrint('application')}
                className="text-green-600 hover:text-green-700 font-semibold flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-green-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Job Form
              </button>
              <button
                onClick={() => handlePrint('undertaking')}
                className="text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-purple-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Undertaking
              </button>
              <Link
                to="/hr/candidates"
                className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Candidates
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8 space-y-8">
          {/* Personal Information */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-gray-500 block mb-1">Full Name</label>
                <p className="text-lg font-semibold text-gray-900">
                  {candidate.first_name} {candidate.middle_name || ''} {candidate.last_name}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-gray-500 block mb-1">Age</label>
                <p className="text-lg font-semibold text-gray-900">{candidate.age} years</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-gray-500 block mb-1">Phone Number</label>
                <p className="text-lg font-semibold text-gray-900">{candidate.phone_number}</p>
              </div>
              {candidate.alternate_number && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-sm font-medium text-gray-500 block mb-1">Alternate Number</label>
                  <p className="text-lg font-semibold text-gray-900">{candidate.alternate_number}</p>
                </div>
              )}
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Address Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                <label className="text-sm font-medium text-gray-500 block mb-1">Current Address</label>
                <p className="text-gray-900">{candidate.current_address}</p>
              </div>
              {candidate.aadhar_address && (
                <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                  <label className="text-sm font-medium text-gray-500 block mb-1">Aadhar Address</label>
                  <p className="text-gray-900">{candidate.aadhar_address}</p>
                </div>
              )}
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-gray-500 block mb-1">City</label>
                <p className="text-gray-900">{candidate.city}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-gray-500 block mb-1">State</label>
                <p className="text-gray-900">{candidate.state}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-gray-500 block mb-1">Zip Code</label>
                <p className="text-gray-900">{candidate.zip_code}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-gray-500 block mb-1">Country</label>
                <p className="text-gray-900">{candidate.country}</p>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Professional Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-gray-500 block mb-1">Position Applied For</label>
                <p className="text-lg font-semibold text-gray-900">{candidate.position_applied_for}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-gray-500 block mb-1">SPA Location</label>
                <p className="text-lg font-semibold text-gray-900">
                  {candidate.spa?.name || candidate.spa_name_text || 'N/A'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-gray-500 block mb-1">Work Experience</label>
                <p className="text-gray-900">{candidate.work_experience}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-gray-500 block mb-1">Therapist Experience</label>
                <p className="text-gray-900">{candidate.Therapist_experience}</p>
              </div>
              {candidate.education_certificate_courses && (
                <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                  <label className="text-sm font-medium text-gray-500 block mb-1">Education & Certificates</label>
                  <p className="text-gray-900">{candidate.education_certificate_courses}</p>
                </div>
              )}
            </div>
          </div>

          {/* Documents */}
          {(candidate.passport_size_photo || candidate.age_proof_document || candidate.aadhar_card_front || 
            candidate.aadhar_card_back || candidate.pan_card || candidate.signature) && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Documents
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {candidate.passport_size_photo && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-sm font-medium text-gray-500 block mb-2">Passport Size Photo</label>
                    <div className="relative">
                      <img
                        src={getFileUrl(candidate.passport_size_photo)}
                        alt="Passport Photo"
                        className="w-full h-48 object-contain rounded-lg border border-gray-300 bg-white"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const errorMsg = e.target.nextElementSibling;
                          if (errorMsg) errorMsg.style.display = 'block';
                        }}
                      />
                      <p className="text-sm text-gray-500 mt-2 text-center" style={{ display: 'none' }}>
                        Image not available
                      </p>
                    </div>
                    <a
                      href={getFileUrl(candidate.passport_size_photo)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Open in new tab
                    </a>
                  </div>
                )}
                {candidate.signature && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-sm font-medium text-gray-500 block mb-2">Signature</label>
                    <div className="relative">
                      <img
                        src={getFileUrl(candidate.signature)}
                        alt="Signature"
                        className="w-full h-48 object-contain rounded-lg border border-gray-300 bg-white"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const errorMsg = e.target.nextElementSibling;
                          if (errorMsg) errorMsg.style.display = 'block';
                        }}
                      />
                      <p className="text-sm text-gray-500 mt-2 text-center" style={{ display: 'none' }}>
                        Image not available
                      </p>
                    </div>
                    <a
                      href={getFileUrl(candidate.signature)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Open in new tab
                    </a>
                  </div>
                )}
                {candidate.aadhar_card_front && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-sm font-medium text-gray-500 block mb-2">Aadhar Card (Front)</label>
                    <div className="relative">
                      <img
                        src={getFileUrl(candidate.aadhar_card_front)}
                        alt="Aadhar Front"
                        className="w-full h-48 object-contain rounded-lg border border-gray-300 bg-white"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const errorMsg = e.target.nextElementSibling;
                          if (errorMsg) errorMsg.style.display = 'block';
                        }}
                      />
                      <p className="text-sm text-gray-500 mt-2 text-center" style={{ display: 'none' }}>
                        Image not available
                      </p>
                    </div>
                    <a
                      href={getFileUrl(candidate.aadhar_card_front)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Open in new tab
                    </a>
                  </div>
                )}
                {candidate.aadhar_card_back && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-sm font-medium text-gray-500 block mb-2">Aadhar Card (Back)</label>
                    <div className="relative">
                      <img
                        src={getFileUrl(candidate.aadhar_card_back)}
                        alt="Aadhar Back"
                        className="w-full h-48 object-contain rounded-lg border border-gray-300 bg-white"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const errorMsg = e.target.nextElementSibling;
                          if (errorMsg) errorMsg.style.display = 'block';
                        }}
                      />
                      <p className="text-sm text-gray-500 mt-2 text-center" style={{ display: 'none' }}>
                        Image not available
                      </p>
                    </div>
                    <a
                      href={getFileUrl(candidate.aadhar_card_back)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Open in new tab
                    </a>
                  </div>
                )}
                {candidate.pan_card && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-sm font-medium text-gray-500 block mb-2">PAN Card</label>
                    <div className="relative">
                      <img
                        src={getFileUrl(candidate.pan_card)}
                        alt="PAN Card"
                        className="w-full h-48 object-contain rounded-lg border border-gray-300 bg-white"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const errorMsg = e.target.nextElementSibling;
                          if (errorMsg) errorMsg.style.display = 'block';
                        }}
                      />
                      <p className="text-sm text-gray-500 mt-2 text-center" style={{ display: 'none' }}>
                        Image not available
                      </p>
                    </div>
                    <a
                      href={getFileUrl(candidate.pan_card)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Open in new tab
                    </a>
                  </div>
                )}
                {candidate.age_proof_document && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-sm font-medium text-gray-500 block mb-2">Age Proof Document</label>
                    <div className="relative">
                      <img
                        src={getFileUrl(candidate.age_proof_document)}
                        alt="Age Proof"
                        className="w-full h-48 object-contain rounded-lg border border-gray-300 bg-white"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const errorMsg = e.target.nextElementSibling;
                          if (errorMsg) errorMsg.style.display = 'block';
                        }}
                      />
                      <p className="text-sm text-gray-500 mt-2 text-center" style={{ display: 'none' }}>
                        Image not available
                      </p>
                    </div>
                    <a
                      href={getFileUrl(candidate.age_proof_document)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Open in new tab
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submission Info */}
          <div className="border-t pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-gray-500 block mb-1">Submitted On</label>
                <p className="text-gray-900">{new Date(candidate.created_at).toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-gray-500 block mb-1">Last Updated</label>
                <p className="text-gray-900">{new Date(candidate.updated_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Print Modal */}
        {showPrintModal && candidate && (
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
                      data={{ candidate }} 
                      onDownload={handleDownloadPDF}
                    />
                  ) : (
                    <PrintUdertakingDetails 
                      data={{ candidate }} 
                      onDownload={handleDownloadPDF}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateView;

