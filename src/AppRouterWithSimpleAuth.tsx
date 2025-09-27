import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { OfflineAuthProvider } from './auth/OfflineAuthProvider';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/components/ui/toast';
import NoInstallPrompt from '@/components/NoInstallPrompt';
import UpdateNotification from '@/components/UpdateNotification';
import BottomNav from '@/components/layout/BottomNav';
import MobileDrawer, { useMobileDrawer } from '@/components/layout/MobileDrawer';
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
const CreateOwner = React.lazy(() => import('@/pages/CreateOwner'));
const CreateOwnerWithGoogle = React.lazy(() => import('@/pages/CreateOwnerWithGoogle'));
import CreateInvite from '@/pages/CreateInvite';
import AcceptInvite from '@/pages/AcceptInvite';
import RestrictedAccess from '@/pages/RestrictedAccess';
import ManageAdmins from '@/pages/ManageAdmins';
import ConfigureAccess from '@/pages/ConfigureAccess';
import ApproveParticipants from '@/pages/ApproveParticipants';
import DiaristPendingApproval from '@/pages/DiaristPendingApproval';
import DiaristHome from '@/pages/DiaristHome';
import AdminNotifications from '@/pages/AdminNotifications';
import PaymentConflicts from '@/pages/PaymentConflicts';
import DiaristRedirect from '@/components/DiaristRedirect';

export default function AppRouterWithSimpleAuth() {
  const { isOpen, openDrawer, closeDrawer } = useMobileDrawer();
  
  // Initialize performance monitoring
  usePerformanceMonitor(true);

  return (
    <ThemeProvider>
      <ToastProvider>
        <OfflineAuthProvider>
          <div className="min-h-[100dvh] bg-gray-100 text-gray-900">
          {/* Install Prompt - Completely Disabled */}
          <NoInstallPrompt />
          
          {/* Update Notification */}
          <UpdateNotification />
          
          {/* Mobile Header */}
          <MobileHeader 
            title="App Maestros FC" 
            subtitle="Sistema de Gestão"
            onMenuClick={openDrawer}
          />
          
          {/* Mobile Drawer */}
          <MobileDrawer 
            isOpen={isOpen} 
            onClose={closeDrawer} 
          />
          
          <div className="mx-auto w-full max-w-4xl pb-20 pt-20">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={
                  <DiaristRedirect>
                    <HomePage />
                  </DiaristRedirect>
                } />
                <Route path="/match" element={<Match />} />
                <Route path="/finance" element={<FinancePage />} />
                <Route path="/vote" element={<Navigate to="/ranking" replace />} />
                <Route path="/admin/invites" element={<InvitesApprovalsPage />} />
                <Route path="/ranking" element={<RankingPage />} />
                <Route path="/perfil" element={<PerfilPage />} />
                <Route path="/owner-dashboard" element={<OwnerDashboard />} />
                <Route path="/create-owner" element={<CreateOwner />} />
                <Route path="/create-owner-google" element={<CreateOwnerWithGoogle />} />
                <Route path="/create-invite" element={<CreateInvite />} />
                <Route path="/accept-invite" element={<AcceptInvite />} />
                <Route path="/restricted" element={<RestrictedAccess />} />
                <Route path="/manage-admins" element={<ManageAdmins />} />
                <Route path="/configure-access" element={<ConfigureAccess />} />
                <Route path="/approve-participants" element={<ApproveParticipants />} />
                <Route path="/diarist-pending" element={<DiaristPendingApproval />} />
                <Route path="/diarist-home" element={<DiaristHome />} />
                <Route path="/admin-notifications" element={<AdminNotifications />} />
                <Route path="/admin/payment-conflicts" element={<PaymentConflicts />} />
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
