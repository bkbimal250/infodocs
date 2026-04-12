import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { certificateApi } from '../api/Certificates/certificateApi';

/**
 * View Certificate Component
 * Public component to view and download generated certificates
 */
const ViewCertificates = () => {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (certificateId) {
      loadCertificate();
    }
  }, [certificateId]);

  const loadCertificate = async () => {
    try {
      setLoading(true);
      const response = await certificateApi.getCertificate(certificateId);
      setCertificate(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Certificate not found');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format = 'pdf') => {
    if (!certificate) return;

    try {
      setDownloading(true);
      const response = format === 'pdf'
        ? await certificateApi.downloadPDF(certificate.id)
        : await certificateApi.downloadImage(certificate.id);

      // Create blob and download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate_${certificate.id}.${format === 'pdf' ? 'pdf' : 'png'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download certificate');
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading certificate...</p>
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
            onClick={() => navigate('/certificate-creation')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Create New Certificate
          </button>
        </div>
      </div>
    );
  }

  if (!certificate) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 flex items-center justify-center">
      <div className="max-w-xl w-full">
        <div className="card shadow-soft p-0 overflow-hidden animate-in zoom-in-95 duration-500">
          <div className="bg-primary/5 px-8 py-5 border-b border-primary/10 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-black text-gray-900 leading-tight tracking-tighter">Document Details</h1>
              <p className="text-[10px] font-bold text-gray-400  tracking-widest mt-0.5">Verified Digital Export</p>
            </div>
            <button
              onClick={() => navigate('/certificates')}
              className="btn btn-ghost p-2 text-primary hover:bg-primary/5"
              title="Create New"
            >
              <HiPlus size={20} />
            </button>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-500">
                <p className="text-[8px] font-black text-gray-400  tracking-widest mb-1 leading-none">Recipient</p>
                <p className="text-sm font-black text-gray-900 leading-none">{certificate.candidate_name || 'Anonymous'}</p>
              </div>
              <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-500">
                <p className="text-[8px] font-black text-gray-400  tracking-widest mb-1 leading-none">Internal ID</p>
                <p className="text-sm font-black text-primary leading-none">#{certificate.id}</p>
              </div>
            </div>

            {certificate.qr_code && (
              <div className="relative group p-4 bg-white border border-gray-500 rounded-2xl shadow-soft flex flex-col items-center">
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  <span className="text-[8px] font-black text-gray-400  tracking-widest">Verifiable</span>
                </div>
                <img
                  src={certificate.qr_code}
                  alt="QR Code"
                  className="w-32 h-32 opacity-90 group-hover:opacity-100 transition-opacity"
                />
                <p className="text-[9px] font-bold text-gray-400  tracking-widest mt-3 text-center leading-none">Scan to authenticate document</p>
              </div>
            )}

            <div className="pt-4 border-t border-gray-500">
              <p className="text-[10px] font-black text-gray-900  tracking-widest mb-4 text-center leading-none">Official Export Options</p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDownload('pdf')}
                  disabled={downloading}
                  className="btn btn-primary flex-1 py-3"
                >
                  {downloading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-b-transparent mx-auto" />
                  ) : (
                    <>
                      <HiTemplate size={16} />
                      <span>Export PDF</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDownload('image')}
                  disabled={downloading}
                  className="btn btn-secondary flex-1 py-3"
                >
                  {downloading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-b-transparent mx-auto" />
                  ) : (
                    <>
                      <HiCloudDownload size={16} />
                      <span>Export Image</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="text-center">
              <p className="text-[9px] font-medium text-gray-400 italic">Generated on {new Date(certificate.generated_at).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

};

export default ViewCertificates;

