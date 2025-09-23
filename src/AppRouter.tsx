import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { OfflineAuthProvider } from './auth/OfflineAuthProvider';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/components/ui/toast';
import OneTimeInstallPopup from '@/components/OneTimeInstallPopup';
import UpdateNotification from '@/components/UpdateNotification';
import BottomNav from '@/components/layout/BottomNav';
import MobileHeader from '@/components/layout/MobileHeader';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

// Lazy loaded pages for better performance
const HomePage = React.lazy(() => import('@/pages/Home'));
const Match = React.lazy(() => import('@/pages/Match'));
const FinancePage = React.lazy(() => import('@/pages/Finance'));
const VotePage = React.lazy(() => import('@/pages/Vote'));
const InvitesApprovalsPage = React.lazy(() => import('@/pages/Admin/InvitesApprovals'));
const PerfilPage = React.lazy(() => import('@/pages/Perfil'));
const RankingPage = React.lazy(() => import('@/pages/Ranking'));
const OwnerDashboard = React.lazy(() => import('@/pages/OwnerDashboard'));
const TestAuth = React.lazy(() => import('@/pages/TestAuth'));
const SimpleLogin = React.lazy(() => import('@/pages/SimpleLogin'));
const CreateOwner = React.lazy(() => import('@/pages/CreateOwner'));
const CreateOwnerWithGoogle = React.lazy(() => import('@/pages/CreateOwnerWithGoogle'));
const CheckTables = React.lazy(() => import('@/pages/CheckTables'));
const DebugAuth = React.lazy(() => import('@/pages/DebugAuth'));
const SimpleAuth = React.lazy(() => import('@/pages/SimpleAuth'));
const OfflineAuth = React.lazy(() => import('@/pages/OfflineAuth'));
const TestGoogleAuth = React.lazy(() => import('@/pages/TestGoogleAuth'));
const TestGoogleOAuth = React.lazy(() => import('@/pages/TestGoogleOAuth'));
const CreateInvite = React.lazy(() => import('@/pages/CreateInvite'));
const AcceptInvite = React.lazy(() => import('@/pages/AcceptInvite'));
import RestrictedAccess from '@/pages/RestrictedAccess';
import ManageAdmins from '@/pages/ManageAdmins';
import ConfigureAccess from '@/pages/ConfigureAccess';
import ApproveParticipants from '@/pages/ApproveParticipants';
import TestPage from '@/pages/TestPage';
import SimpleTest from '@/pages/SimpleTest';
import TestRouteButton from '@/pages/TestRouteButton';

export default function AppRouter() {
  // Initialize performance monitoring
  usePerformanceMonitor(true);

  return (
    <ThemeProvider>
      <ToastProvider>
        <OfflineAuthProvider>
          <div className="min-h-[100dvh] bg-background text-foreground">
          {/* Install Popup - Aparece apenas uma vez */}
          <OneTimeInstallPopup />
          
          {/* Update Notification */}
          <UpdateNotification />
          
          <div className="mx-auto w-full max-w-4xl pb-20 pt-4">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/match" element={<Match />} />
                <Route path="/finance" element={<FinancePage />} />
                <Route path="/vote" element={<Navigate to="/ranking" replace />} />
                <Route path="/admin/invites" element={<InvitesApprovalsPage />} />
                <Route path="/ranking" element={<RankingPage />} />
                <Route path="/perfil" element={<PerfilPage />} />
                <Route path="/owner-dashboard" element={<OwnerDashboard />} />
                <Route path="/test-auth" element={<TestAuth />} />
                <Route path="/simple-login" element={<SimpleLogin />} />
                <Route path="/create-owner" element={<CreateOwner />} />
                <Route path="/create-owner-google" element={<CreateOwnerWithGoogle />} />
                <Route path="/check-tables" element={<CheckTables />} />
                <Route path="/debug-auth" element={<DebugAuth />} />
                <Route path="/simple-auth" element={<SimpleAuth />} />
                <Route path="/offline-auth" element={<OfflineAuth />} />
                <Route path="/test-google-auth" element={<TestGoogleAuth />} />
                <Route path="/test-google-oauth" element={<TestGoogleOAuth />} />
                <Route path="/create-invite" element={<CreateInvite />} />
                <Route path="/accept-invite" element={<AcceptInvite />} />
                <Route path="/restricted" element={<RestrictedAccess />} />
                <Route path="/manage-admins" element={<ManageAdmins />} />
                <Route path="/configure-access" element={<ConfigureAccess />} />
                <Route path="/approve-participants" element={<ApproveParticipants />} />
                <Route path="/test-page" element={<TestPage />} />
                <Route path="/simple-test" element={<SimpleTest />} />
                <Route path="/test-route-button" element={<TestRouteButton />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </div>
          
          {/* Bottom Navigation */}
          <BottomNav />
          </div>
        </OfflineAuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}