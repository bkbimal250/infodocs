import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../utils/ProtectedRoute';
import Layout from '../components/Layout';
import AdminLayout from '../components/AdminLayout';
import HrLayout from '../components/HrLayout';
import ManagerLayout from '../components/ManagerLayout';
import UserLayout from '../components/UserLayout';
import { FormSkeleton } from '../components/LoadingSkeleton';

// Lazy load components for code splitting
const LazyCertifications = lazy(() => import('../Certificates/Certifications'));
const LazyCreateCertifications = lazy(() => import('../Certificates/CreateCertifications'));
const LazyViewCertificates = lazy(() => import('../Certificates/ViewCertificates'));
const LazyCertificatePreviewPage = lazy(() => import('../Certificates/CertificatePreviewPage'));
const LazyHome = lazy(() => import('../Home/Home'));
const LazyAbout = lazy(() => import('../Home/About'));

// Auth Pages
import { Login, Register, ForgotPassword, VerityOtp, CreateNewpassord } from '../pages/auth';

// Admin Pages
import {
  AdminDashboard,
  AdminTemplates,
  TemplatesList,
  AddTemplatePage,
  EditTemplatePage,
  AdminUsers,
  AddUserPage,
  EditUserPage,
  AdminCertificates,
  AdminHirings,
  ViewHiringDetails,
  ViewSpaDetails,
  EditSpaPage,
  AddSpaPage,
  AdminSpas,
  FormsData,
  CandidatesData,
  CandidateViewDetails,
  HiringFormsData,
  CreateUser,
  UsersDetails,
  LastLoginHistory,
  RecentNotification,
  RecentActivity,
} from '../pages/Admin';

// Manager Pages
import {
  ManagerDashboard,
  ManagerCertificates,
  ManagerCandidates,
  ManagerCertificateCreation,
  ManagerHiring,
} from '../pages/Manager';
import ViewCandidatesDetails from '../pages/Manager/Candidates/ViewCandidatesDetails';
import { ViewHiringDetails as ManagerViewHiringDetails } from '../pages/Manager/Hiring';
import { ManagerProfile } from '../pages/Manager/Profiles';

// HR Pages
import { HrDashboard } from '../pages/hr/Dashboard';
import { Candidatespage, CandidateView } from '../pages/hr/Candidates';
import { Hiringpages, ViewData } from '../pages/hr/HiringData';
import { HrProfile } from '../pages/hr/Profiles';

// Common Pages
import {
  CertificateCreation,
  Profile,
} from '../pages/common';

// User Pages
import {
  Dashboard as UserDashboard,
  Certificates as UserCertificates,
  Profile as UserProfile,
  Forms as UserForms,
  JobHirings as UserJobHirings,
  RecentNotification as UserRecentNotification,
  RecentActivity as UserRecentActivity,
} from '../pages/Users';
import { ViewCandidatesDetails as UserViewCandidatesDetails } from '../pages/Users/Forms';
import { ViewHiringDetails as UserViewHiringDetails } from '../pages/Users/JobHirings';

// Public Forms
import { CandidateForm, HiringForms } from '../publicforms';

// Public Certificate Creation
import { Certifications, CreateCertifications, ViewCertificates } from '../Certificates';
import CertificatePreviewPage from '../Certificates/CertificatePreviewPage';

// Home Pages
import Home from '../Home/Home';
import About from '../Home/About';

/**
 * Main App Router
 * Defines all routes for the application
 */
const AppRouter = () => {
  return (
    <BrowserRouter>
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
              <Suspense fallback={<FormSkeleton />}>
                <LazyCertifications />
              </Suspense>
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
          path="/forms"
          element={
            <ProtectedRoute allowedRoles={['user', 'admin', 'super_admin', 'spa_manager', 'hr']}>
              <Layout>
                <CandidateForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate-form"
          element={
            <ProtectedRoute allowedRoles={['user', 'admin', 'super_admin', 'spa_manager', 'hr']}>
              <Layout>
                <CandidateForm />
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
          path="/admin/forms-data"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin', 'spa_manager']}>
              <AdminLayout>
                <FormsData />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/forms-data/candidates"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin', 'spa_manager']}>
              <AdminLayout>
                <CandidatesData />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/forms-data/candidates/:id"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin', 'spa_manager']}>
              <AdminLayout>
                <CandidateViewDetails />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/forms-data/hiring"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin', 'spa_manager']}>
              <AdminLayout>
                <HiringFormsData />
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
          <Route path="candidates" element={<Candidatespage />} />
          <Route path="candidates/:id" element={<CandidateView />} />
          <Route path="hiring-data" element={<Hiringpages />} />
          <Route path="hiring-data/:id" element={<ViewData />} />
          <Route path="profile" element={<HrProfile />} />
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
          path="/manager/candidates"
          element={
            <ProtectedRoute allowedRoles={['spa_manager', 'admin', 'super_admin']}>
              <ManagerLayout>
                <ManagerCandidates />
              </ManagerLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/candidates/:id"
          element={
            <ProtectedRoute allowedRoles={['spa_manager', 'admin', 'super_admin']}>
              <ManagerLayout>
                <ViewCandidatesDetails />
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
          path="/user/forms/candidates/:id"
          element={
            <ProtectedRoute allowedRoles={['user', 'admin', 'super_admin', 'spa_manager', 'hr']}>
              <UserLayout>
                <UserViewCandidatesDetails />
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
        <a
          href="/"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Go Home
        </a>
      </div>
    </div>
  );
};

export default AppRouter;

