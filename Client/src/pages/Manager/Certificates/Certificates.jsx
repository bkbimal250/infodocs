import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineDocumentText,
  HiOutlinePlus,
  HiOutlineChartPie,
  HiOutlineCalendar,
  HiOutlineCollection
} from 'react-icons/hi';
import { authApi } from '../../../api/Auth/authApi';
import { managerApi } from '../../../api/Manager/managerApi';
import apiClient from '../../../utils/apiConfig';
import CertificateTable from './certificateTable';
import CertificateFilter from './Components/CertificateFilter';

/**
 * Manager Certificates Page
 * Shows only certificates created by the current manager with a professional dashboard
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
  }, [user]); // We only reload from API when user changes or initially. Filters are client-side now.

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
      const response = await managerApi.getMyCertificates({ limit: 1000 });
      setCertificates(Array.isArray(response.data) ? response.data : []);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error loading certificates:', error);
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  const getCandidateName = (certificate) => {
    const category = (certificate.certificate_data?.category || certificate.category || '').toLowerCase();
    if (category === 'daily_sheet') {
      return certificate.certificate_data?.spa?.name || certificate.spa?.name || 'N/A';
    }
    return certificate.candidate_name ||
      certificate.therapist_name ||
      certificate.employee_name ||
      certificate.manager_name ||
      certificate.customer_name ||
      'N/A';
  };

  // Memoized Filtered List
  const filteredCertificates = useMemo(() => {
    return certificates.filter(cert => {
      const matchesSearch = !filters.search ||
        getCandidateName(cert).toLowerCase().includes(filters.search.toLowerCase());

      const certCategory = (cert.certificate_data?.category || cert.category || '').toLowerCase();
      const matchesCategory = !filters.category ||
        certCategory === filters.category.toLowerCase();

      const certDate = new Date(cert.generated_at || cert.created_at);
      const matchesDateFrom = !filters.dateFrom || certDate >= new Date(filters.dateFrom);
      const matchesDateTo = !filters.dateTo || certDate <= new Date(filters.dateTo);

      return matchesSearch && matchesCategory && matchesDateFrom && matchesDateTo;
    });
  }, [certificates, filters]);

  // Dashboard Stats
  const stats = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const categories = certificates.reduce((acc, cert) => {
      const cat = cert.category || cert.certificate_data?.category || 'Unknown';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return [
      {
        label: 'Total Certificates',
        value: certificates.length,
        icon: HiOutlineCollection,
        color: 'blue'
      },
      {
        label: 'This Month',
        value: certificates.filter(c => new Date(c.generated_at || c.created_at) >= startOfMonth).length,
        icon: HiOutlineCalendar,
        color: 'green'
      },
      {
        label: 'This Week',
        value: certificates.filter(c => new Date(c.generated_at || c.created_at) >= startOfWeek).length,
        icon: HiOutlineChartPie,
        color: 'purple'
      },
      {
        label: 'Top Category',
        value: topCategory.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        icon: HiOutlineDocumentText,
        color: 'orange'
      }
    ];
  }, [certificates]);

  const downloadPDF = async (certificateId) => {
    try {
      const response = await apiClient.get(`/certificates/generated/${certificateId}/download/pdf`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate_${certificateId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download certificate');
    }
  };

  const handleClearFilters = () => {
    setFilters({ search: '', category: '', dateFrom: '', dateTo: '' });
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 animate-pulse font-medium">Preparing your certificates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Certificate Manager</h1>
            <p className="text-gray-500 mt-1">Manage, download, and track your generated certificates</p>
          </div>
          <Link
            to="/certificates"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow-md font-medium gap-2"
          >
            <HiOutlinePlus className="h-5 w-5" />
            Create Certificate
          </Link>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:border-blue-200 transition-colors">
              <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:bg-${stat.color}-100 transition-colors`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <h3 className="text-xl font-bold text-gray-900 mt-0.5">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <CertificateFilter
          filters={filters}
          setFilters={setFilters}
          onClear={handleClearFilters}
        />

        {/* Main List Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-20 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500 font-medium">Updating list...</p>
            </div>
          ) : filteredCertificates.length === 0 ? (
            <div className="p-20 text-center">
              <div className="inline-flex items-center justify-center p-4 bg-gray-50 rounded-full mb-4">
                <HiOutlineDocumentText className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No certificates matching filters</h3>
              <p className="text-gray-500 max-w-xs mx-auto mt-2">Try adjusting your search or filters to find what you're looking for.</p>
              <button
                onClick={handleClearFilters}
                className="mt-6 text-blue-600 font-medium hover:text-blue-700"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <CertificateTable
              certificates={filteredCertificates}
              currentPage={currentPage}
              totalPages={Math.ceil(filteredCertificates.length / itemsPerPage)}
              itemsPerPage={itemsPerPage}
              totalItems={filteredCertificates.length}
              onPageChange={setCurrentPage}
              onDownloadPDF={downloadPDF}
              getCandidateName={getCandidateName}
              getCategoryName={(c) => c.category || c.certificate_data?.category}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Certificates;

