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

// Admin Forms Data
export {
  FormsData,
  FormsStatistics,
  FormsBySpa,
  FormsByUser,
  AllFormsList,
  // Legacy exports
  CandidatesData,
  CandidatesTable,
  CandidateViewDetails,
  HiringFormsData,
} from './FormsData';

