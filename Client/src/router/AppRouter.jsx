import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ProtectedRoute from '../utils/ProtectedRoute';
import Layout from '../components/Layout';
import AdminLayout from '../components/AdminLayout';
import HrLayout from '../components/HrLayout';
import ManagerLayout from '../components/ManagerLayout';
import UserLayout from '../components/UserLayout';
import { FormSkeleton } from '../components/LoadingSkeleton';


// Lazy load components for code splitting
// const LazyCertifications = lazy(() => import('../Certificates/Certifications'));
const LazyCreateCertifications = lazy(() => import('../Certificates/CreateCertifications'));
const LazyViewCertificates = lazy(() => import('../Certificates/ViewCertificates'));
const LazyCertificatePreviewPage = lazy(() => import('../Certificates/CertificatePreviewPage'));
const LazyHome = lazy(() => import('../Home/Home'));
const LazyAbout = lazy(() => import('../Home/About'));

// Auth Pages - Lazy Loaded
const Login = lazy(() => import('../pages/auth').then(module => ({ default: module.Login })));
const Register = lazy(() => import('../pages/auth').then(module => ({ default: module.Register })));
const ForgotPassword = lazy(() => import('../pages/auth').then(module => ({ default: module.ForgotPassword })));
const VerityOtp = lazy(() => import('../pages/auth').then(module => ({ default: module.VerityOtp })));
const CreateNewpassord = lazy(() => import('../pages/auth').then(module => ({ default: module.CreateNewpassord })));

// Admin Pages - Lazy Loaded
const AdminDashboard = lazy(() => import('../pages/Admin').then(module => ({ default: module.AdminDashboard })));
const AdminTemplates = lazy(() => import('../pages/Admin').then(module => ({ default: module.AdminTemplates })));
const TemplatesList = lazy(() => import('../pages/Admin').then(module => ({ default: module.TemplatesList })));
const AddTemplatePage = lazy(() => import('../pages/Admin').then(module => ({ default: module.AddTemplatePage })));
const EditTemplatePage = lazy(() => import('../pages/Admin').then(module => ({ default: module.EditTemplatePage })));
const AdminUsers = lazy(() => import('../pages/Admin').then(module => ({ default: module.AdminUsers })));
const AddUserPage = lazy(() => import('../pages/Admin').then(module => ({ default: module.AddUserPage })));
const EditUserPage = lazy(() => import('../pages/Admin').then(module => ({ default: module.EditUserPage })));
const AdminCertificates = lazy(() => import('../pages/Admin').then(module => ({ default: module.AdminCertificates })));
const AdminHirings = lazy(() => import('../pages/Admin').then(module => ({ default: module.AdminHirings })));
const ViewHiringDetails = lazy(() => import('../pages/Admin').then(module => ({ default: module.ViewHiringDetails })));
const ViewSpaDetails = lazy(() => import('../pages/Admin').then(module => ({ default: module.ViewSpaDetails })));
const EditSpaPage = lazy(() => import('../pages/Admin').then(module => ({ default: module.EditSpaPage })));
const AddSpaPage = lazy(() => import('../pages/Admin').then(module => ({ default: module.AddSpaPage })));
const AdminSpas = lazy(() => import('../pages/Admin').then(module => ({ default: module.AdminSpas })));
const CreateUser = lazy(() => import('../pages/Admin').then(module => ({ default: module.CreateUser })));
const UsersDetails = lazy(() => import('../pages/Admin').then(module => ({ default: module.UsersDetails })));
const LastLoginHistory = lazy(() => import('../pages/Admin').then(module => ({ default: module.LastLoginHistory })));
const RecentNotification = lazy(() => import('../pages/Admin').then(module => ({ default: module.RecentNotification })));
const RecentActivity = lazy(() => import('../pages/Admin').then(module => ({ default: module.RecentActivity })));
const Queries = lazy(() => import('../pages/Admin').then(module => ({ default: module.Queries })));
const AddQuerytype = lazy(() => import('../pages/Admin').then(module => ({ default: module.AddQuerytype })));
const QueryTypeList = lazy(() => import('../pages/Admin').then(module => ({ default: module.QueryTypeList })));
const AdminTutorials = lazy(() => import('../pages/Admin').then(module => ({ default: module.AdminTutorials })));
const AdminStaffManage = lazy(() => import('../pages/Admin').then(module => ({ default: module.AdminStaffManage })));
const AdminAddStaffPage = lazy(() => import('../pages/Admin').then(module => ({ default: module.AddStaffPage })));
const AdminEditStaffPage = lazy(() => import('../pages/Admin').then(module => ({ default: module.EditStaffPage })));
const AdminViewStaffPage = lazy(() => import('../pages/Admin').then(module => ({ default: module.ViewStaffPage })));

// Manager Pages - Lazy Loaded
const ManagerDashboard = lazy(() => import('../pages/Manager').then(module => ({ default: module.ManagerDashboard })));
const ManagerCertificates = lazy(() => import('../pages/Manager').then(module => ({ default: module.ManagerCertificates })));
const ManagerCertificateCreation = lazy(() => import('../pages/Manager').then(module => ({ default: module.ManagerCertificateCreation })));
const ManagerHiring = lazy(() => import('../pages/Manager').then(module => ({ default: module.ManagerHiring })));


const ManagerViewHiringDetails = lazy(() => import('../pages/Manager/Hiring').then(module => ({ default: module.ViewHiringDetails })));
const ManagerProfile = lazy(() => import('../pages/Manager/Profiles').then(module => ({ default: module.ManagerProfile })));
const ManagerTutorials = lazy(() => import('../pages/Manager/tutorials/tutorials'));
const ManagerStaffManage = lazy(() => import('../pages/Manager').then(module => ({ default: module.ManagerStaffManage })));
const AddStaffPage = lazy(() => import('../pages/Manager').then(module => ({ default: module.AddStaffPage })));
const EditStaffPage = lazy(() => import('../pages/Manager').then(module => ({ default: module.EditStaffPage })));
const ViewStaffPage = lazy(() => import('../pages/Manager').then(module => ({ default: module.ViewStaffPage })));
const ManagerQuery = lazy(() => import('../pages/Manager/Query/Query'));

// HR Pages - Lazy Loaded
const HrDashboard = lazy(() => import('../pages/hr/Dashboard').then(module => ({ default: module.HrDashboard })));
const Hiringpages = lazy(() => import('../pages/hr/HiringData').then(module => ({ default: module.Hiringpages })));
const ViewData = lazy(() => import('../pages/hr/HiringData').then(module => ({ default: module.ViewData })));
const HrProfile = lazy(() => import('../pages/hr/Profiles').then(module => ({ default: module.HrProfile })));
const HrCertificates = lazy(() => import('../pages/hr/Certificates'));
const HrCertificateCreation = lazy(() => import('../pages/hr/CertificateCreation'));
const HrQuery = lazy(() => import('../pages/hr/Query/Query'));
const HrTutorials = lazy(() => import('../pages/hr/tutorials/tutorials'));

// Common Pages - Lazy Loaded
const CertificateCreation = lazy(() => import('../pages/common').then(module => ({ default: module.CertificateCreation })));
const Profile = lazy(() => import('../pages/common').then(module => ({ default: module.Profile })));
const Certifications = lazy(() => import('../Certificates/Certifications'));

// User Pages - Lazy Loaded
const UserDashboard = lazy(() => import('../pages/Users').then(module => ({ default: module.Dashboard })));
const UserCertificates = lazy(() => import('../pages/Users').then(module => ({ default: module.Certificates })));
const UserProfile = lazy(() => import('../pages/Users').then(module => ({ default: module.Profile })));
const UserForms = lazy(() => import('../pages/Users').then(module => ({ default: module.Forms })));
const UserJobHirings = lazy(() => import('../pages/Users').then(module => ({ default: module.JobHirings })));
const UserRecentNotification = lazy(() => import('../pages/Users').then(module => ({ default: module.RecentNotification })));
const UserRecentActivity = lazy(() => import('../pages/Users').then(module => ({ default: module.RecentActivity })));

const UserQuery = lazy(() => import('../pages/Users/Query/Query'));
const UserTutorials = lazy(() => import('../pages/Users/tutorials/tutorials'));
const UserViewHiringDetails = lazy(() => import('../pages/Users/JobHirings').then(module => ({ default: module.ViewHiringDetails })));

// Public Forms
// Public Forms - Lazy Loaded
const HiringForms = lazy(() => import('../publicforms').then(module => ({ default: module.HiringForms })));

// Home Pages
// Note: Certificates components are lazy-loaded for code splitting

/**
 * Main App Router
 * Defines all routes for the application
 */
const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<FormSkeleton />}>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <Layout>
                <Login />
              </Layout>
            }
          />
          <Route
            path="/register"
            element={
              <Layout>
                <Register />
              </Layout>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <Layout>
                <ForgotPassword />
              </Layout>
            }
          />
          <Route
            path="/verify-otp"
            element={
              <Layout>
                <VerityOtp />
              </Layout>
            }
          />
          <Route
            path="/create-new-password"
            element={
              <Layout>
                <CreateNewpassord />
              </Layout>
            }
          />
          <Route
            path="/certificates"
            element={
              <Layout>
                <Certifications />
              </Layout>
            }
          />

          <Route
            path="/certificate-creation"
            element={
              <ProtectedRoute allowedRoles={['user', 'admin', 'super_admin', 'spa_manager', 'hr']}>
                <Layout>
                  <Suspense fallback={<FormSkeleton />}>
                    <LazyCreateCertifications />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/certificate-preview"
            element={
              <Suspense fallback={<FormSkeleton />}>
                <LazyCertificatePreviewPage />
              </Suspense>
            }
          />
          <Route
            path="/certificate/:certificateId"
            element={
              <ProtectedRoute allowedRoles={['user', 'admin', 'super_admin', 'spa_manager', 'hr']}>
                <Layout>
                  <Suspense fallback={<FormSkeleton />}>
                    <LazyViewCertificates />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />


          <Route
            path="/hiring-forms"
            element={
              <ProtectedRoute allowedRoles={['user', 'admin', 'super_admin', 'spa_manager', 'hr']}>
                <Layout>
                  <HiringForms />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Admin */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/templates"
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin', 'spa_manager']}>
                <AdminLayout>
                  <AdminTemplates />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/certificates/templates"
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin', 'spa_manager']}>
                <AdminLayout>
                  <TemplatesList />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/certificates/templates/add"
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin', 'spa_manager']}>
                <AdminLayout>
                  <AddTemplatePage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/certificates/templates/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin', 'spa_manager']}>
                <AdminLayout>
                  <EditTemplatePage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/certificates"
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin', 'spa_manager']}>
                <AdminLayout>
                  <AdminCertificates />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/certificates/create"
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin', 'spa_manager']}>
                <AdminLayout>
                  <Certifications />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <AdminLayout>
                  <AdminUsers />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/add"
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <AdminLayout>
                  <AddUserPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/create"
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <AdminLayout>
                  <CreateUser />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <AdminLayout>
                  <EditUserPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/:userId/login-history"
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <AdminLayout>
                  <LastLoginHistory />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/:id"
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <AdminLayout>
                  <UsersDetails />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/login-history"
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <AdminLayout>
                  <LastLoginHistory />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/certificate-creation"
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin', 'spa_manager']}>
                <AdminLayout>
                  <AdminCertificates />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/hiring"
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin', 'spa_manager']}>
                <AdminLayout>
                  <AdminHirings />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/hiring/:id"
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin', 'spa_manager']}>
                <AdminLayout>
                  <ViewHiringDetails />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/spas"
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin', 'spa_manager']}>
                <AdminLayout>
                  <AdminSpas />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/spas/add"
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin', 'spa_manager']}>
                <AdminLayout>
                  <AddSpaPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/spas/:id"
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin', 'spa_manager']}>
                <AdminLayout>
                  <ViewSpaDetails />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/spas/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin', 'spa_manager']}>
                <AdminLayout>
                  <EditSpaPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/notifications"
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <AdminLayout>
                  <RecentNotification />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/activities"
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <AdminLayout>
                  <RecentActivity />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/queries"
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <AdminLayout>
                  <Queries />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/queries/add-query-type"
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <AdminLayout>
                  <AddQuerytype />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/queries/query-types"
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <AdminLayout>
                  <QueryTypeList />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tutorials"
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <AdminLayout>
                  <AdminTutorials />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/staff"
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <AdminLayout>
                  <AdminStaffManage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/staff/add"
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <AdminLayout>
                  <AdminAddStaffPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/staff/:id"
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <AdminLayout>
                  <AdminViewStaffPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/staff/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <AdminLayout>
                  <AdminEditStaffPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - HR */}
          <Route
            path="/hr"
            element={
              <ProtectedRoute allowedRoles={['hr', 'admin', 'super_admin']}>
                <HrLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<HrDashboard />} />

            <Route path="certificates" element={<HrCertificates />} />
            <Route path="certificate-creation" element={<HrCertificateCreation />} />
            <Route path="hiring-data" element={<Hiringpages />} />
            <Route path="hiring-data/:id" element={<ViewData />} />
            <Route path="profile" element={<HrProfile />} />
            <Route path="queries" element={<HrQuery />} />
            <Route path="tutorials" element={<HrTutorials />} />
            <Route path="notifications" element={<UserRecentNotification />} />
            <Route path="activities" element={<UserRecentActivity />} />
          </Route>

          {/* Protected Routes - Manager */}
          <Route
            path="/manager/dashboard"
            element={
              <ProtectedRoute allowedRoles={['spa_manager', 'admin', 'super_admin']}>
                <ManagerLayout>
                  <ManagerDashboard />
                </ManagerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/certificates"
            element={
              <ProtectedRoute allowedRoles={['spa_manager', 'admin', 'super_admin']}>
                <ManagerLayout>
                  <ManagerCertificates />
                </ManagerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/staff"
            element={
              <ProtectedRoute allowedRoles={['spa_manager', 'admin', 'super_admin']}>
                <ManagerLayout>
                  <ManagerStaffManage />
                </ManagerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/staff/add"
            element={
              <ProtectedRoute allowedRoles={['spa_manager', 'admin', 'super_admin']}>
                <ManagerLayout>
                  <AddStaffPage />
                </ManagerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/staff/:id"
            element={
              <ProtectedRoute allowedRoles={['spa_manager', 'admin', 'super_admin']}>
                <ManagerLayout>
                  <ViewStaffPage />
                </ManagerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/staff/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['spa_manager', 'admin', 'super_admin']}>
                <ManagerLayout>
                  <EditStaffPage />
                </ManagerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/certificate-creation"
            element={
              <ProtectedRoute allowedRoles={['spa_manager', 'admin', 'super_admin']}>
                <ManagerLayout>
                  <ManagerCertificateCreation />
                </ManagerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/hiring"
            element={
              <ProtectedRoute allowedRoles={['spa_manager', 'admin', 'super_admin']}>
                <ManagerLayout>
                  <ManagerHiring />
                </ManagerLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/manager/hiring/:id"
            element={
              <ProtectedRoute allowedRoles={['spa_manager', 'admin', 'super_admin']}>
                <ManagerLayout>
                  <ManagerViewHiringDetails />
                </ManagerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/notifications"
            element={
              <ProtectedRoute allowedRoles={['spa_manager', 'admin', 'super_admin']}>
                <ManagerLayout>
                  <UserRecentNotification />
                </ManagerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/activities"
            element={
              <ProtectedRoute allowedRoles={['spa_manager', 'admin', 'super_admin']}>
                <ManagerLayout>
                  <UserRecentActivity />
                </ManagerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/profile"
            element={
              <ProtectedRoute allowedRoles={['spa_manager', 'admin', 'super_admin']}>
                <ManagerLayout>
                  <ManagerProfile />
                </ManagerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/queries"
            element={
              <ProtectedRoute allowedRoles={['spa_manager', 'admin', 'super_admin']}>
                <ManagerLayout>
                  <ManagerQuery />
                </ManagerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/tutorials"
            element={
              <ProtectedRoute allowedRoles={['spa_manager', 'admin', 'super_admin']}>
                <ManagerLayout>
                  <ManagerTutorials />
                </ManagerLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - User (Regular Users) */}
          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute allowedRoles={['user', 'admin', 'super_admin', 'spa_manager', 'hr']}>
                <UserLayout>
                  <UserDashboard />
                </UserLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/certificates"
            element={
              <ProtectedRoute allowedRoles={['user', 'admin', 'super_admin', 'spa_manager', 'hr']}>
                <UserLayout>
                  <UserCertificates />
                </UserLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/profile"
            element={
              <ProtectedRoute>
                <UserLayout>
                  <UserProfile />
                </UserLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/forms"
            element={
              <ProtectedRoute allowedRoles={['user', 'admin', 'super_admin', 'spa_manager', 'hr']}>
                <UserLayout>
                  <UserForms />
                </UserLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/user/job-hirings"
            element={
              <ProtectedRoute allowedRoles={['user', 'admin', 'super_admin', 'spa_manager', 'hr']}>
                <UserLayout>
                  <UserJobHirings />
                </UserLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/job-hirings/:id"
            element={
              <ProtectedRoute allowedRoles={['user', 'admin', 'super_admin', 'spa_manager', 'hr']}>
                <UserLayout>
                  <UserViewHiringDetails />
                </UserLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/notifications"
            element={
              <ProtectedRoute allowedRoles={['user', 'admin', 'super_admin', 'spa_manager', 'hr']}>
                <UserLayout>
                  <UserRecentNotification />
                </UserLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/activities"
            element={
              <ProtectedRoute allowedRoles={['user', 'admin', 'super_admin', 'spa_manager', 'hr']}>
                <UserLayout>
                  <UserRecentActivity />
                </UserLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/queries"
            element={
              <ProtectedRoute allowedRoles={['user', 'admin', 'super_admin', 'spa_manager', 'hr']}>
                <UserLayout>
                  <UserQuery />
                </UserLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/tutorials"
            element={
              <ProtectedRoute allowedRoles={['user', 'admin', 'super_admin', 'spa_manager', 'hr']}>
                <UserLayout>
                  <UserTutorials />
                </UserLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Common (Authenticated Users) */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Root Route - Home Page */}
          <Route
            path="/"
            element={
              <Layout>
                <Suspense fallback={<FormSkeleton />}>
                  <LazyHome />
                </Suspense>
              </Layout>
            }
          />

          <Route
            path="/about"
            element={
              <Layout>
                <Suspense fallback={<FormSkeleton />}>
                  <LazyAbout />
                </Suspense>
              </Layout>
            }
          />
          {/* 404 Not Found */}
          <Route
            path="*"
            element={
              <Layout>
                <NotFoundPage />
              </Layout>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

/**
 * 404 Not Found Page Component
 */
const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page not found</p>
        <Link
          to="/"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default AppRouter;

