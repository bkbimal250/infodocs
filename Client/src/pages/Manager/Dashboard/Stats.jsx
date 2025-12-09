import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineDocumentText,
  HiOutlineUsers,
  HiOutlineBriefcase,
} from 'react-icons/hi';
import { managerApi } from '../../../api/Manager/managerApi';

/**
 * Manager Dashboard Statistics Component
 * Displays key metrics and statistics for manager dashboard
 */
const Stats = () => {
  const [stats, setStats] = useState({
    totalCertificates: 0,
    totalCandidates: 0,
    totalHiringForms: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Load all data in parallel
      const [certsRes, candidatesRes, hiringRes] = await Promise.allSettled([
        managerApi.getMyCertificates({ skip: 0, limit: 1000 }),
        managerApi.getMyCandidateForms({ skip: 0, limit: 1000 }),
        managerApi.getMyHiringForms({ skip: 0, limit: 1000 }),
      ]);

      const newStats = {
        totalCertificates: 0,
        totalCandidates: 0,
        totalHiringForms: 0,
      };

      // Process certificates
      if (certsRes.status === 'fulfilled') {
        const certificates = certsRes.value.data?.results || certsRes.value.data || [];
        newStats.totalCertificates = Array.isArray(certificates) ? certificates.length : 0;
      }

      // Process candidate forms
      if (candidatesRes.status === 'fulfilled') {
        const candidates = candidatesRes.value.data?.results || candidatesRes.value.data || [];
        newStats.totalCandidates = Array.isArray(candidates) ? candidates.length : 0;
      }

      // Process hiring forms
      if (hiringRes.status === 'fulfilled') {
        const hiringForms = hiringRes.value.data?.results || hiringRes.value.data || [];
        newStats.totalHiringForms = Array.isArray(hiringForms) ? hiringForms.length : 0;
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
      title: 'Total Certificates',
      value: stats.totalCertificates,
      subtitle: 'Generated',
      icon: HiOutlineDocumentText,
      color: 'blue',
      link: '/manager/certificates',
    },
    {
      title: 'Total Candidates',
      value: stats.totalCandidates,
      subtitle: 'Applications',
      icon: HiOutlineUsers,
      color: 'green',
      link: '/manager/candidates',
    },
    {
      title: 'Total Hiring Forms',
      value: stats.totalHiringForms,
      subtitle: 'Submitted',
      icon: HiOutlineBriefcase,
      color: 'purple',
      link: '/manager/hiring',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-[var(--color-bg-primary)] rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-[var(--color-gray-200)] rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-[var(--color-gray-200)] rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-[var(--color-gray-200)] rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const colorClasses = {
    blue: 'bg-[var(--color-primary-light)] border-[var(--color-primary-light)] text-[var(--color-primary)]',
    green: 'bg-[var(--color-success-light)] border-[var(--color-success-light)] text-[var(--color-success-dark)]',
    purple: 'bg-[var(--color-secondary-light)] border-[var(--color-secondary-light)] text-[var(--color-secondary-dark)]',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

export default Stats;
