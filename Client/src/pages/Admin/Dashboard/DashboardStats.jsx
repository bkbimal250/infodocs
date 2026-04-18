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
    totalStaff: 0,
    activeStaff: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await adminApi.analytics.getOverview();
      const data = res.data?.overall || {};
      
      setStats({
        totalUsers: data.total_users || 0,
        activeUsers: data.active_users || 0,
        totalCertificates: data.total_certificates || 0,
        totalTemplates: data.total_templates || 0,
        totalForms: data.total_forms || 0, 
        totalSpas: data.total_spas || 0,
        totalHiringForms: data.total_hiring_forms || 0,
        totalStaff: data.total_staff || 0,
        activeStaff: data.active_staff || 0,
      });
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
      title: 'Total Staff',
      value: stats.totalStaff,
      subtitle: `${stats.activeStaff} active`,
      icon: HiOutlineUsers, // Using standard users icon for now
      color: 'orange',
      link: '/admin/staff',
    },
    {
      title: 'Certificates',
      value: stats.totalCertificates,
      subtitle: 'Generated',
      icon: HiOutlineDocumentText,
      color: 'green',
      link: '/admin/certificates',
    },
    {
      title: 'Templates',
      value: stats.totalTemplates,
      subtitle: 'Available',
      icon: HiOutlineClipboardList,
      color: 'purple',
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
      link: '/admin/hiring',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {[...Array(6)].map((_, i) => (
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
    orange: 'bg-[var(--color-warning-light)] border-[var(--color-warning-light)] text-[var(--color-warning-dark)]',
    indigo: 'bg-[var(--color-primary-light)] border-[var(--color-primary-light)] text-[var(--color-primary-dark)]',
    pink: 'bg-[var(--color-secondary-light)] border-[var(--color-secondary-light)] text-[var(--color-secondary-dark)]',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
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

