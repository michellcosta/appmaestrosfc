import { ErrorBoundary } from '@/components/ErrorBoundary';
import OneTimeInstallPopup from '@/components/OneTimeInstallPopup';
import UpdateNotification from '@/components/UpdateNotification';
import BottomNav from '@/components/layout/BottomNav';
import { ToastProvider } from '@/components/ui/toast';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import React, { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { OfflineAuthProvider } from './auth/OfflineAuthProvider';

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

// Lazy loaded pages com chunks otimizados para melhor performance
const HomePage = React.lazy(() => import(/* webpackChunkName: "pages-home" */ '@/pages/Home'));
const Match = React.lazy(() => import(/* webpackChunkName: "pages-match" */ '@/pages/Match'));
const FinancePage = React.lazy(() => import(/* webpackChunkName: "pages-finance" */ '@/pages/Finance'));
const VotePage = React.lazy(() => import(/* webpackChunkName: "pages-vote" */ '@/pages/Vote'));
const InvitesApprovalsPage = React.lazy(() => import(/* webpackChunkName: "pages-admin" */ '@/pages/Admin/InvitesApprovals'));
const PerfilPage = React.lazy(() => import(/* webpackChunkName: "pages-perfil" */ '@/pages/Perfil'));
const RankingPage = React.lazy(() => import(/* webpackChunkName: "pages-ranking" */ '@/pages/Ranking'));
const OwnerDashboard = React.lazy(() => import(/* webpackChunkName: "pages-owner" */ '@/pages/OwnerDashboardMobile'));
const CreateOwner = React.lazy(() => import(/* webpackChunkName: "pages-create" */ '@/pages/CreateOwner'));
const CreateOwnerWithGoogle = React.lazy(() => import(/* webpackChunkName: "pages-create-google" */ '@/pages/CreateOwnerWithGoogle'));
const Login = React.lazy(() => import(/* webpackChunkName: "pages-auth" */ '@/pages/Login'));
const CreateInvite = React.lazy(() => import(/* webpackChunkName: "pages-invite" */ '@/pages/CreateInvite'));
const AcceptInvite = React.lazy(() => import(/* webpackChunkName: "pages-accept" */ '@/pages/AcceptInvite'));
// Componentes administrativos com lazy loading
const RestrictedAccess = React.lazy(() => import(/* webpackChunkName: "pages-admin-restricted" */ '@/pages/RestrictedAccess'));
const ManageAdmins = React.lazy(() => import(/* webpackChunkName: "pages-admin-manage" */ '@/pages/ManageAdmins'));
const ConfigureAccess = React.lazy(() => import(/* webpackChunkName: "pages-admin-configure" */ '@/pages/ConfigureAccess'));
const ApproveParticipants = React.lazy(() => import(/* webpackChunkName: "pages-admin-approve" */ '@/pages/ApproveParticipants'));
const ManagePlayers = React.lazy(() => import(/* webpackChunkName: "pages-manage-players" */ '@/pages/ManagePlayersSimple'));
const TeamDrawMobile = React.lazy(() => import(/* webpackChunkName: "pages-team-draw" */ '@/pages/TeamDrawMobile'));
const ListUsers = React.lazy(() => import(/* webpackChunkName: "pages-list-users" */ '@/pages/ListUsers'));

export default function AppRouter() {
  // Initialize performance monitoring
  usePerformanceMonitor(true);

  return (
    <ErrorBoundary>
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
                    <Route path="/" element={<Login />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/fetch" element={<HomePage />} />
                    <Route path="/match" element={<Match />} />
                    <Route path="/finance" element={<FinancePage />} />
                    <Route path="/vote" element={<Navigate to="/ranking" replace />} />
                    <Route path="/admin/invites" element={<InvitesApprovalsPage />} />
                    <Route path="/ranking" element={<RankingPage />} />
                    <Route path="/perfil" element={<PerfilPage />} />
                    <Route path="/owner-dashboard" element={<OwnerDashboard />} />
                    <Route path="/create-owner" element={<CreateOwner />} />
                    <Route path="/create-owner-google" element={<CreateOwnerWithGoogle />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/create-invite" element={<CreateInvite />} />
                    <Route path="/accept-invite" element={<AcceptInvite />} />
                    <Route path="/restricted" element={<RestrictedAccess />} />
                    <Route path="/manage-admins" element={<ManageAdmins />} />
                    <Route path="/configure-access" element={<ConfigureAccess />} />
                    <Route path="/approve-participants" element={<ApproveParticipants />} />
                    <Route path="/manage-players" element={<ManagePlayers />} />
                    <Route path="/team-draw/:matchId" element={<TeamDrawMobile />} />
                    <Route path="/list-users" element={<ListUsers />} />
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
    </ErrorBoundary>
  );
}