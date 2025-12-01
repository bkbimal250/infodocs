import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineUsers,
  HiOutlineDocumentText,
  HiOutlineClipboardList,
  HiOutlineDocument,
  HiOutlineOfficeBuilding,
  HiOutlineBriefcase,
} from 'react-icons/hi';
import { adminApi } from '../../../api/Admin/adminApi';

/**
 * Dashboard Statistics Component
 * Displays key metrics and statistics for admin dashboard
 */
const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCertificates: 0,
    totalTemplates: 0,
    totalForms: 0,
    totalSpas: 0,
    totalHiringForms: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Load all data in parallel
      const [usersRes, certificatesRes, templatesRes, formsRes, spasRes, hiringFormsRes, analyticsRes] = await Promise.allSettled([
        adminApi.users.getUsers(),
        adminApi.certificates.getGeneratedCertificates(),
        adminApi.certificates.getTemplates(),
        adminApi.forms.getCandidateForms(0, 1),
        adminApi.forms.getAllSpas(),
        adminApi.forms.getHiringForms(0, 1),
        adminApi.analytics.getAnalytics(),
      ]);

      const newStats = {
        totalUsers: 0,
        activeUsers: 0,
        totalCertificates: 0,
        totalTemplates: 0,
        totalForms: 0,
        totalSpas: 0,
        totalHiringForms: 0,
      };

      // Process users
      if (usersRes.status === 'fulfilled') {
        const users = usersRes.value.data || [];
        newStats.totalUsers = users.length;
        newStats.activeUsers = users.filter((u) => u.is_active).length;
      }

      // Process certificates
      if (certificatesRes.status === 'fulfilled') {
        const certificates = certificatesRes.value.data?.results || certificatesRes.value.data || [];
        newStats.totalCertificates = Array.isArray(certificates) ? certificates.length : 0;
      }

      // Process templates
      if (templatesRes.status === 'fulfilled') {
        const templates = templatesRes.value.data?.results || templatesRes.value.data || [];
        newStats.totalTemplates = Array.isArray(templates) ? templates.length : 0;
      }

      // Process forms (get total count - need to fetch all)
      if (formsRes.status === 'fulfilled') {
        const forms = formsRes.value.data || [];
        newStats.totalForms = Array.isArray(forms) ? forms.length : 0;
        // If we got limited results, try to get a better count
        if (forms.length === 1) {
          // Likely got only 1 result, try fetching more
          try {
            const allFormsRes = await adminApi.forms.getCandidateForms(0, 1000);
            const allForms = allFormsRes.data || [];
            newStats.totalForms = Array.isArray(allForms) ? allForms.length : 0;
          } catch (e) {
            // Use the count we have
          }
        }
      }

      // Process SPAs
      if (spasRes.status === 'fulfilled') {
        const spas = spasRes.value.data || [];
        newStats.totalSpas = Array.isArray(spas) ? spas.length : 0;
      }

      // Process hiring forms
      if (hiringFormsRes.status === 'fulfilled') {
        const hiringForms = hiringFormsRes.value.data || [];
        newStats.totalHiringForms = Array.isArray(hiringForms) ? hiringForms.length : 0;
        // If we got limited results, try to get a better count
        if (hiringForms.length === 1) {
          try {
            const allHiringFormsRes = await adminApi.forms.getHiringForms(0, 1000);
            const allHiringForms = allHiringFormsRes.data || [];
            newStats.totalHiringForms = Array.isArray(allHiringForms) ? allHiringForms.length : 0;
          } catch (e) {
            // Use the count we have
          }
        }
      }

      // Use analytics if available
      if (analyticsRes.status === 'fulfilled' && analyticsRes.value.data) {
        const analytics = analyticsRes.value.data;
        if (analytics.total_forms !== undefined) newStats.totalForms = analytics.total_forms;
        if (analytics.total_certificates !== undefined)
          newStats.totalCertificates = analytics.total_certificates;
        if (analytics.active_users !== undefined) newStats.activeUsers = analytics.active_users;
      }

      setStats(newStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      subtitle: `${stats.activeUsers} active`,
      icon: HiOutlineUsers,
      color: 'blue',
    },
    {
      title: 'Certificates',
      value: stats.totalCertificates,
      subtitle: 'Generated',
      icon: HiOutlineDocumentText,
      color: 'green',
    },
    {
      title: 'Templates',
      value: stats.totalTemplates,
      subtitle: 'Available',
      icon: HiOutlineClipboardList,
      color: 'purple',
    },
    {
      title: 'Candidate Forms',
      value: stats.totalForms,
      subtitle: 'Submitted',
      icon: HiOutlineDocument,
      color: 'orange',
      link: '/admin/forms-data/candidates',
    },
    {
      title: 'SPA Locations',
      value: stats.totalSpas,
      subtitle: 'Registered',
      icon: HiOutlineOfficeBuilding,
      color: 'indigo',
      link: '/admin/spas',
    },
    {
      title: 'Hiring Forms',
      value: stats.totalHiringForms || 0,
      subtitle: 'Submitted',
      icon: HiOutlineBriefcase,
      color: 'pink',
      link: '/admin/forms-data/hiring-forms',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    pink: 'bg-pink-50 border-pink-200 text-pink-700',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {statCards.map((card, index) => {
        const CardContent = (
          <div
            className={`bg-white rounded-lg shadow-md p-6 border-l-4 hover:shadow-lg transition-all cursor-pointer ${colorClasses[card.color]}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">{card.title}</h3>
              <card.icon className="text-2xl" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{card.value}</div>
            <p className="text-sm text-gray-500">{card.subtitle}</p>
          </div>
        );

        return card.link ? (
          <Link key={index} to={card.link} className="block">
            {CardContent}
          </Link>
        ) : (
          <div key={index}>{CardContent}</div>
        );
      })}
    </div>
  );
};

export default DashboardStats;

