import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineDocumentText } from 'react-icons/hi';
import { authApi } from '../../../api/Auth/authApi';
import { managerApi } from '../../../api/manager/managerApi';
import apiClient from '../../../utils/apiConfig';
import CertificateTable from './certificateTable';

/**
 * Manager Certificates Page
 * Shows only certificates created by the current manager
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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
      // Get manager's certificates from backend
      const response = await managerApi.getMyCertificates({ limit: 1000 });
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
          const category = (cert.certificate_data?.category || cert.category || '').toLowerCase();
          return category === filters.category.toLowerCase();
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
      // Reset to first page when filters change
      setCurrentPage(1);
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
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate_${certificateId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Clean up the URL after a short delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to download certificate';
      alert(`Failed to download certificate: ${errorMessage}`);
    }
  };

  const downloadImage = async (certificateId) => {
    try {
      const response = await apiClient.get(
        `/certificates/generated/${certificateId}/download/image`,
        { responseType: 'blob' }
      );
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      const blob = new Blob([response.data], { type: 'image/png' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate_${certificateId}.png`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Clean up the URL after a short delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Error downloading certificate image:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to download certificate image';
      alert(`Failed to download certificate image: ${errorMessage}`);
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
        // Wait for PDF to load before printing
        printWindow.addEventListener('load', () => {
          setTimeout(() => {
            printWindow.print();
            // Clean up URL after a delay (user can cancel print dialog)
            setTimeout(() => {
              window.URL.revokeObjectURL(url);
            }, 1000);
          }, 500);
        });
        
        // Fallback: if window doesn't load, try printing anyway
        setTimeout(() => {
          if (printWindow && !printWindow.closed) {
            try {
              printWindow.print();
            } catch (e) {
              console.error('Error triggering print:', e);
            }
          }
        }, 1000);
      } else {
        // If popup blocked, fallback to download
        alert('Popup blocked. Please allow popups and try again, or use the download button.');
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error printing certificate:', error);
      alert('Failed to print certificate. Please try downloading instead.');
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
    // Return the raw category value for the table component to format
    return category || 'Unknown';
  };

  // Calculate pagination
  const totalPages = Math.ceil(certificates.length / itemsPerPage);
  const totalItems = certificates.length;

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
                <option value="spa_therapist">Spa Therapist</option>
                <option value="manager_salary">Manager Salary</option>
                <option value="experience_letter">Experience Letter</option>
                <option value="appointment_letter">Appointment Letter</option>
                <option value="invoice_spa_bill">Invoice/SPA Bill</option>
                <option value="id_card">ID Card</option>
                <option value="offer_letter">Offer Letter</option>
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
            <CertificateTable
              certificates={certificates}
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              onPageChange={setCurrentPage}
              onDownloadPDF={downloadPDF}
              onDownloadImage={downloadImage}
              onPrint={printPDF}
              getCandidateName={getCandidateName}
              getCategoryName={getCategoryName}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Certificates;
