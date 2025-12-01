import { Outlet } from 'react-router-dom';
import HrSidebar from '../pages/hr/Layouts/Sidebbar';

/**
 * HR Layout Component
 * Wraps HR pages with sidebar navigation
 */
const HrLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <HrSidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default HrLayout;

