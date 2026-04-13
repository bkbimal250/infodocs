// Admin Dashboard
export { AdminDashboard, DashboardStats } from './Dashboard';

// Admin Users
export { AdminUsers, CreateUser, UsersDetails, LastLoginHistory, AddUserPage, EditUserPage } from './Users';

// Admin Certificates
export {
  AdminCertificates,
  AdminTemplates,
  TemplatesList,
  AddTemplatePage,
  EditTemplatePage,
  CertificateStatistics,
  CertificateList,
  UserCertificateCounts
} from './Certificates';

// Admin Hiring
export { AdminHirings, HiringDataTable, ViewHiringDetails } from './Hiring';

// Admin SPA
export { AdminSpas, AddSpa, EditSpa, SpaTable, ViewSpaDetails, EditSpaPage, AddSpaPage } from './Spa';

// Admin Layouts
export { AdminSidebar } from './Layouts';

// Admin Notifications & Activities
export { RecentNotification } from './RecentNotification';
export { RecentActivity } from './RecentActivity';

// Admin Query
export { default as Queries } from './Query/Queries';
export { default as AddQuerytype } from './Query/AddQuerytype';
export { default as QueryTypeList } from './Query/QueryTypeList';

// Admin Tutorials
export { default as AdminTutorials } from './tutorials/Tutorials';

// Admin Staff Management
export { default as AdminStaffManage } from './StaffManage/AdminStaffManage';
export { default as AddStaffPage } from './StaffManage/AddStaffPage';
export { default as EditStaffPage } from './StaffManage/EditStaffPage';
export { default as ViewStaffPage } from './StaffManage/ViewStaffPage';

