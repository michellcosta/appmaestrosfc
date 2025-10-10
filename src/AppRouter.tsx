import { ErrorBoundary } from '@/components/ErrorBoundary';
import OneTimeInstallPopup from '@/components/OneTimeInstallPopup';
import UpdateNotification from '@/components/UpdateNotification';
import BottomNav from '@/components/layout/BottomNav';
import { ToastProvider } from '@/components/ui/toast';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { useUserSync } from '@/hooks/useUserSync';
import React, { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { OfflineAuthProvider } from './auth/OfflineAuthProvider';

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

// Lazy loaded pages com tratamento de erro robusto
const HomePage = React.lazy(() => import('@/pages/Home').catch(() => ({ default: () => <div>Erro ao carregar página</div> })));
const Match = React.lazy(() => import('@/pages/Match').catch(() => ({ default: () => <div>Erro ao carregar página</div> })));
const VotePage = React.lazy(() => import('@/pages/Vote').catch(() => ({ default: () => <div>Erro ao carregar página</div> })));
const InvitesApprovalsPage = React.lazy(() => import('@/pages/Admin/InvitesApprovals').catch(() => ({ default: () => <div>Erro ao carregar página</div> })));
const PerfilPage = React.lazy(() => import('@/pages/Perfil').catch(() => ({ default: () => <div>Erro ao carregar página</div> })));
const RankingPage = React.lazy(() => import('@/pages/Ranking').catch(() => ({ default: () => <div>Erro ao carregar página</div> })));
const OwnerDashboard = React.lazy(() => import('@/pages/OwnerDashboardMobile').catch(() => ({ default: () => <div>Erro ao carregar página</div> })));
const CreateOwner = React.lazy(() => import('@/pages/CreateOwner').catch(() => ({ default: () => <div>Erro ao carregar página</div> })));
const CreateOwnerWithGoogle = React.lazy(() => import('@/pages/CreateOwnerWithGoogle').catch(() => ({ default: () => <div>Erro ao carregar página</div> })));
const Login = React.lazy(() => import('@/pages/Login').catch(() => ({ default: () => <div>Erro ao carregar página</div> })));
const AuthCallback = React.lazy(() => import('@/pages/auth/callback').catch(() => ({ default: () => <div>Erro ao carregar página</div> })));
const CreateInvite = React.lazy(() => import('@/pages/CreateInvite').catch(() => ({ default: () => <div>Erro ao carregar página</div> })));
const AcceptInvite = React.lazy(() => import('@/pages/AcceptInvite').catch(() => ({ default: () => <div>Erro ao carregar página</div> })));
const RestrictedAccess = React.lazy(() => import('@/pages/RestrictedAccess').catch(() => ({ default: () => <div>Erro ao carregar página</div> })));
const ManageAdmins = React.lazy(() => import('@/pages/ManageAdmins').catch(() => ({ default: () => <div>Erro ao carregar página</div> })));
const ConfigureAccess = React.lazy(() => import('@/pages/ConfigureAccess').catch(() => ({ default: () => <div>Erro ao carregar página</div> })));
const ApproveParticipants = React.lazy(() => import('@/pages/ApproveParticipants').catch(() => ({ default: () => <div>Erro ao carregar página</div> })));
const ManagePlayers = React.lazy(() => import('@/pages/ManagePlayersConvex').catch(() => ({ default: () => <div>Erro ao carregar página</div> })));
const TeamDrawMobile = React.lazy(() => import('@/pages/TeamDrawMobile').catch(() => ({ default: () => <div>Erro ao carregar página</div> })));
const ListUsers = React.lazy(() => import('@/pages/ListUsers').catch(() => ({ default: () => <div>Erro ao carregar página</div> })));
const MigratePlayersToConvex = React.lazy(() => import('@/pages/MigratePlayersToConvex').catch(() => ({ default: () => <div>Erro ao carregar página</div> })));
const ForceUserSync = React.lazy(() => import('@/pages/ForceUserSync').catch(() => ({ default: () => <div>Erro ao carregar página</div> })));

export default function AppRouter() {
  // Initialize performance monitoring
  usePerformanceMonitor(true);

  // Sincronizar usuário automaticamente quando fizer login
  useUserSync();

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

              <div className="mx-auto w-full max-w-full sm:max-w-3xl lg:max-w-4xl pb-20 pt-4">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/fetch" element={<HomePage />} />
                    <Route path="/match" element={<Match />} />
                    {/* <Route path="/finance" element={<FinancePage />} /> */} {/* DESABILITADO - Sistema financeiro removido */}
                    <Route path="/vote" element={<Navigate to="/ranking" replace />} />
                    <Route path="/admin/invites" element={<InvitesApprovalsPage />} />
                    <Route path="/ranking" element={<RankingPage />} />
                    <Route path="/perfil" element={<PerfilPage />} />
                    <Route path="/owner-dashboard" element={<OwnerDashboard />} />
                    <Route path="/create-owner" element={<CreateOwner />} />
                    <Route path="/create-owner-google" element={<CreateOwnerWithGoogle />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/create-invite" element={<CreateInvite />} />
                    <Route path="/accept-invite" element={<AcceptInvite />} />
                    <Route path="/restricted" element={<RestrictedAccess />} />
                    <Route path="/manage-admins" element={<ManageAdmins />} />
                    <Route path="/configure-access" element={<ConfigureAccess />} />
                    <Route path="/approve-participants" element={<ApproveParticipants />} />
                    <Route path="/manage-players" element={<ManagePlayers />} />
                    <Route path="/migrate-players" element={<MigratePlayersToConvex />} />
                    <Route path="/force-sync" element={<ForceUserSync />} />
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