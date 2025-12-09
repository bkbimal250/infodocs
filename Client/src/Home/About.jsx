import { Link } from 'react-router-dom';
import {
  HiOutlineDocumentText,
  HiOutlineUserGroup,
  HiOutlineShieldCheck,
  HiOutlineChartBar,
} from 'react-icons/hi';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Hero / Header Section */}
      <section className="border-b border-slate-200 bg-white/70 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] items-center">
            {/* Text */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 mb-4">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span className="text-xs font-medium text-blue-700 tracking-wide uppercase">
                  About Infodocs
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 mb-4">
                Smart documents for
                <span className="text-blue-600"> SPA &amp; wellness teams</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0">
                Infodocs is a focused document management platform that helps SPA and wellness
                centers generate certificates, manage candidates, and streamline HR workflows
                — all in one secure place.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <div className="flex -space-x-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600/10 text-[11px] font-semibold text-blue-700">
                    Admin
                  </span>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600/10 text-[11px] font-semibold text-emerald-700">
                    HR
                  </span>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-purple-600/10 text-[11px] font-semibold text-purple-700">
                    Manager
                  </span>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-600/10 text-[11px] font-semibold text-amber-700">
                    User
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Role-based experience for every member of your organization.
                </p>
              </div>
            </div>

            {/* Side Card / Stats */}
            <div className="lg:justify-self-end">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 sm:p-7">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-3">
                  Why organizations choose Infodocs
                </p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold text-slate-900">4+</span>
                    <span className="text-[11px] text-slate-500 mt-0.5">
                      Core Roles
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold text-slate-900">∞</span>
                    <span className="text-[11px] text-slate-500 mt-0.5">
                      Certificates
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold text-slate-900">24/7</span>
                    <span className="text-[11px] text-slate-500 mt-0.5">
                      Access Anywhere
                    </span>
                  </div>
                </div>
                <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-600">
                  Designed specifically for SPA &amp; wellness centers to replace scattered
                  spreadsheets, manual templates, and paper-based workflows.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        {/* Project Overview */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 mb-10">
          <h2 className="text-2xl font-semibold text-slate-900 mb-3">
            Project Overview
          </h2>
          <p className="text-sm uppercase tracking-wide text-slate-400 mb-5">
            Built for modern SPA &amp; wellness operations
          </p>
          <div className="space-y-4 text-slate-700 leading-relaxed">
            <p>
              <strong className="text-slate-900">Infodocs</strong> is a modern, web-based
              document management system specifically built for SPA and wellness centers.
              The platform streamlines certificate generation, candidate management, hiring
              processes, and document workflows, helping organizations stay organized and compliant.
            </p>
            <p>
              Whether you&apos;re an administrator managing multiple locations, an HR professional
              handling recruitment, a manager overseeing daily operations, or a user submitting
              forms and certificates, Infodocs gives each role the right tools in a single, secure
              environment.
            </p>
          </div>
        </section>

        {/* Key Features */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                Key Features
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Everything you need to manage documents across your SPA &amp; wellness business.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Real-time, role-based workflows
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feature 1 */}
            <div className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                <HiOutlineDocumentText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1.5">
                  Certificate Management
                </h3>
                <p className="text-sm text-slate-600">
                  Generate professional certificates with customizable templates for appointment letters,
                  experience certificates, salary certificates, and more — all with consistent branding.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                <HiOutlineUserGroup className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1.5">
                  Candidate &amp; Hiring Forms
                </h3>
                <p className="text-sm text-slate-600">
                  Collect and manage candidate information through structured forms. Track applications,
                  share details with managers, and keep the entire hiring pipeline transparent and organized.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
                <HiOutlineShieldCheck className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1.5">
                  Role-Based Access Control
                </h3>
                <p className="text-sm text-slate-600">
                  Secure access controls with clear permission levels for administrators, HR teams,
                  SPA managers, and regular users. Each role sees only what they need to work.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                <HiOutlineChartBar className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1.5">
                  Analytics &amp; Dashboards
                </h3>
                <p className="text-sm text-slate-600">
                  Get a clear view of operations with dashboards and analytics — understand certificate
                  usage, hiring trends, and overall workflow performance at a glance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-[1px] mb-8">
          <div className="bg-white rounded-2xl px-6 py-8 sm:px-8 sm:py-9 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                Ready to streamline your document management?
              </h2>
              <p className="text-sm sm:text-base text-slate-600 max-w-xl">
                Create an account to start generating certificates, managing candidates, and organizing
                workflows with Infodocs.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                Create Account
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-full border border-blue-200 bg-white px-6 py-3 text-sm font-semibold text-blue-700 hover:bg-slate-50 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
