import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { OfflineAuthProvider } from './auth/OfflineAuthProvider';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/components/ui/toast';
import OneTimeInstallPopup from '@/components/OneTimeInstallPopup';
import UpdateNotification from '@/components/UpdateNotification';
import BottomNav from '@/components/layout/BottomNav';
import MobileHeader from '@/components/layout/MobileHeader';

// Páginas
import Match from '@/pages/Match';
import FinancePage from '@/pages/Finance';
import VotePage from '@/pages/Vote';
import InvitesApprovalsPage from '@/pages/Admin/InvitesApprovals';
import HomePage from '@/pages/Home';
import PerfilPage from '@/pages/Perfil';
import RankingPage from '@/pages/Ranking';
import OwnerDashboard from '@/pages/OwnerDashboard';
import TestAuth from '@/pages/TestAuth';
import SimpleLogin from '@/pages/SimpleLogin';
import CreateOwner from '@/pages/CreateOwner';
import CreateOwnerWithGoogle from '@/pages/CreateOwnerWithGoogle';
import CheckTables from '@/pages/CheckTables';
import DebugAuth from '@/pages/DebugAuth';
import SimpleAuth from '@/pages/SimpleAuth';
import OfflineAuth from '@/pages/OfflineAuth';
import TestGoogleAuth from '@/pages/TestGoogleAuth';
import TestGoogleOAuth from '@/pages/TestGoogleOAuth';
import CreateInvite from '@/pages/CreateInvite';
import AcceptInvite from '@/pages/AcceptInvite';
import RestrictedAccess from '@/pages/RestrictedAccess';
import ManageAdmins from '@/pages/ManageAdmins';
import ConfigureAccess from '@/pages/ConfigureAccess';
import ApproveParticipants from '@/pages/ApproveParticipants';
import TestPage from '@/pages/TestPage';
import SimpleTest from '@/pages/SimpleTest';

export default function AppRouter() {

  return (
    <ThemeProvider>
      <ToastProvider>
        <OfflineAuthProvider>
          <div className="min-h-[100dvh] bg-gray-100 text-gray-900">
          {/* Install Popup - Aparece apenas uma vez */}
          <OneTimeInstallPopup />
          
          {/* Update Notification */}
          <UpdateNotification />
          
          <div className="mx-auto w-full max-w-4xl pb-20 pt-4">
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
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          
          {/* Bottom Navigation */}
          <BottomNav />
          </div>
        </OfflineAuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}