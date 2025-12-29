import { HiClock, HiCheckCircle, HiXCircle } from 'react-icons/hi';

/**
 * Status Badge Component
 * Displays query status with appropriate color and icon
 */
const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: HiClock },
    processing: { color: 'bg-blue-100 text-blue-800', icon: HiClock },
    resolved: { color: 'bg-green-100 text-green-800', icon: HiCheckCircle },
    closed: { color: 'bg-gray-100 text-gray-800', icon: HiXCircle },
  };
  
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3" />
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

export default StatusBadge;
