import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  HiOutlineDocumentText, 
  HiOutlineDownload,
  HiOutlineEye,
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlinePrinter
} from 'react-icons/hi';
import { authApi } from '../../../api/Auth/authApi';
import { usersApi } from '../../../api/Users/usersApi';
import apiClient from '../../../utils/apiConfig';

/**
 * User Certificates Page
 * Shows only certificates created by the current user
 */
const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadCertificates();
    }
  }, [user, filters]);

  const loadUser = async () => {
    try {
      const response = await authApi.getCurrentUser();
      setUser(response.data);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadCertificates = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      // Get user's certificates from backend
      const response = await usersApi.getMyCertificates({ limit: 1000 });
      const myCertificates = Array.isArray(response.data) ? response.data : [];

      // Apply additional filters
      let filtered = myCertificates;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(cert => {
          const name = getCandidateName(cert).toLowerCase();
          return name.includes(searchLower);
        });
      }
      if (filters.category) {
        filtered = filtered.filter(cert => {
          const category = cert.certificate_data?.category || cert.category || '';
          return category === filters.category;
        });
      }
      if (filters.dateFrom) {
        filtered = filtered.filter(cert => {
          const certDate = new Date(cert.generated_at || cert.created_at);
          return certDate >= new Date(filters.dateFrom);
        });
      }
      if (filters.dateTo) {
        filtered = filtered.filter(cert => {
          const certDate = new Date(cert.generated_at || cert.created_at);
          return certDate <= new Date(filters.dateTo);
        });
      }

      setCertificates(filtered);
    } catch (error) {
      console.error('Error loading certificates:', error);
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async (certificateId) => {
    try {
      const response = await apiClient.get(
        `/certificates/generated/${certificateId}/download/pdf`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate_${certificateId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Failed to download certificate');
    }
  };

  const printPDF = async (certificateId) => {
    try {
      const response = await apiClient.get(
        `/certificates/generated/${certificateId}/download/pdf`,
        { responseType: 'blob' }
      );
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const printWindow = window.open(url, '_blank');
      
      if (printWindow) {
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
            // Close window after printing (optional, user can cancel)
            setTimeout(() => {
              printWindow.close();
              window.URL.revokeObjectURL(url);
            }, 1000);
          }, 500);
        };
      } else {
        // If popup blocked, fallback to download
        alert('Popup blocked. Please allow popups and try again, or use the download button.');
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error printing certificate:', error);
      alert('Failed to print certificate');
    }
  };

  const getCandidateName = (certificate) => {
    return certificate.candidate_name || 
           certificate.therapist_name || 
           certificate.employee_name || 
           certificate.manager_name || 
           certificate.customer_name || 
           'N/A';
  };

  const getCategoryName = (certificate) => {
    const category = certificate.certificate_data?.category || certificate.category || '';
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-secondary)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">My Certificates</h1>
          <p className="mt-2 text-[var(--color-text-secondary)]">
            View and manage certificates you've created
          </p>
        </div>

        {/* Filters */}
        <div className="bg-[var(--color-bg-primary)] rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search certificates..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                <option value="SPA_THERAPIST">Spa Therapist</option>
                <option value="MANAGER_SALARY">Manager Salary</option>
                <option value="EXPERIENCE_LETTER">Experience Letter</option>
                <option value="APPOINTMENT_LETTER">Appointment Letter</option>
                <option value="INVOICE_SPA_BILL">Invoice/Spa Bill</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Certificates List */}
        <div className="bg-[var(--color-bg-primary)] rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-[var(--color-text-secondary)]">Loading certificates...</p>
            </div>
          ) : certificates.length === 0 ? (
            <div className="p-12 text-center">
              <HiOutlineDocumentText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">No certificates found</h3>
              <p className="text-[var(--color-text-secondary)] mb-6">You haven't created any certificates yet.</p>

              
              <Link
                to="/certificates"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create  Certificate
              </Link>


            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[var(--color-bg-secondary)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Certificate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Candidate/Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[var(--color-bg-primary)] divide-y divide-gray-200">
                  {certificates.map((certificate) => (
                    <tr key={certificate.id} className="hover:bg-[var(--color-bg-secondary)]">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <HiOutlineDocumentText className="h-5 w-5 text-[var(--color-primary)] mr-2" />
                          <span className="text-sm font-medium text-[var(--color-text-primary)]">
                            Certificate #{certificate.id}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {getCategoryName(certificate)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <HiOutlineUser className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-[var(--color-text-primary)]">
                            {getCandidateName(certificate)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <HiOutlineCalendar className="h-4 w-4 mr-2" />
                          {new Date(certificate.generated_at || certificate.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/certificate/${certificate.id}`}
                            className="text-[var(--color-primary)] hover:text-blue-900"
                            title="View"
                          >
                            <HiOutlineEye className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => downloadPDF(certificate.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Download PDF"
                          >
                            <HiOutlineDownload className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => printPDF(certificate.id)}
                            className="text-purple-600 hover:text-purple-900"
                            title="Print Certificate"
                          >
                            <HiOutlinePrinter className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Certificates;

