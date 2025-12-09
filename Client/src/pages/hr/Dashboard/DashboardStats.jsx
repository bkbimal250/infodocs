import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineDocumentText,
  HiOutlineClipboardList,
  HiOutlineDocument,
  HiOutlineBriefcase,
} from 'react-icons/hi';
import { hrApi } from '../../../api/hr/hrApi';

/**
 * HR Dashboard Statistics Component
 * Displays key metrics and statistics for HR dashboard
 */
const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalCertificates: 0,
    totalTemplates: 0,
    totalForms: 0,
    totalHiringForms: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Load all data in parallel
      const [certificatesRes, templatesRes, formsRes, hiringFormsRes] = await Promise.allSettled([
        hrApi.getCertificates({ skip: 0, limit: 1000 }),
        hrApi.getTemplates(),
        hrApi.getCandidateForms({ skip: 0, limit: 1 }),
        hrApi.getHiringForms({ skip: 0, limit: 1 }),
      ]);

      const newStats = {
        totalCertificates: 0,
        totalTemplates: 0,
        totalForms: 0,
        totalHiringForms: 0,
      };

      // Process certificates
      if (certificatesRes.status === 'fulfilled') {
        const certificates = certificatesRes.value.data?.results || certificatesRes.value.data || [];
        newStats.totalCertificates = Array.isArray(certificates) ? certificates.length : 0;
      }

      // Process templates
      if (templatesRes.status === 'fulfilled') {
        const templates = templatesRes.value.data || [];
        newStats.totalTemplates = Array.isArray(templates) ? templates.length : 0;
      }

      // Process forms (get total count)
      if (formsRes.status === 'fulfilled') {
        const forms = formsRes.value.data || [];
        newStats.totalForms = Array.isArray(forms) ? forms.length : 0;
        // If we got limited results, try to get a better count
        if (forms.length === 1) {
          try {
            const allFormsRes = await hrApi.getCandidateForms({ skip: 0, limit: 1000 });
            const allForms = allFormsRes.data || [];
            newStats.totalForms = Array.isArray(allForms) ? allForms.length : 0;
          } catch (e) {
            // Use the count we have
          }
        }
      }

      // Process hiring forms
      if (hiringFormsRes.status === 'fulfilled') {
        const hiringForms = hiringFormsRes.value.data || [];
        newStats.totalHiringForms = Array.isArray(hiringForms) ? hiringForms.length : 0;
        // If we got limited results, try to get a better count
        if (hiringForms.length === 1) {
          try {
            const allHiringFormsRes = await hrApi.getHiringForms({ skip: 0, limit: 1000 });
            const allHiringForms = allHiringFormsRes.data || [];
            newStats.totalHiringForms = Array.isArray(allHiringForms) ? allHiringForms.length : 0;
          } catch (e) {
            // Use the count we have
          }
        }
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
      title: 'Certificates',
      value: stats.totalCertificates,
      subtitle: 'Generated',
      icon: HiOutlineDocumentText,
      color: 'green',
      link: '/hr/certificates',
    },
    {
      title: 'Templates',
      value: stats.totalTemplates,
      subtitle: 'Available',
      icon: HiOutlineClipboardList,
      color: 'purple',
      link: '/hr/templates',
    },
    {
      title: 'Candidate Forms',
      value: stats.totalForms,
      subtitle: 'Submitted',
      icon: HiOutlineDocument,
      color: 'orange',
      link: '/hr/candidates',
    },
    {
      title: 'Hiring Requirements',
      value: stats.totalHiringForms,
      subtitle: 'From Users/Managers',
      icon: HiOutlineBriefcase,
      color: 'pink',
      link: '/hr/hiring-data',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[var(--color-bg-primary)] rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const colorClasses = {
    green: 'bg-[var(--color-success-light)] border-[var(--color-success-light)] text-[var(--color-success-dark)]',
    purple: 'bg-[var(--color-secondary-light)] border-[var(--color-secondary-light)] text-[var(--color-secondary-dark)]',
    orange: 'bg-[var(--color-warning-light)] border-[var(--color-warning-light)] text-[var(--color-warning-dark)]',
    pink: 'bg-[var(--color-secondary-light)] border-[var(--color-secondary-light)] text-[var(--color-secondary-dark)]',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card, index) => {
        const CardContent = (
          <div
            className={`bg-[var(--color-bg-primary)] rounded-lg shadow-md p-6 border-l-4 hover:shadow-lg transition-all cursor-pointer ${colorClasses[card.color]}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">{card.title}</h3>
              <card.icon className="text-2xl" />
            </div>
            <div className="text-3xl font-bold text-[var(--color-text-primary)] mb-1">{card.value}</div>
            <p className="text-sm text-[var(--color-text-secondary)]">{card.subtitle}</p>
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

