import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/auth/FixedAuthProvider';
import BottomNav from '@/components/layout/BottomNav';

// Páginas
import Match from '@/pages/Match';
import FinancePage from '@/pages/Finance';
import VotePage from '@/pages/Vote';
import InvitesApprovalsPage from '@/pages/Admin/InvitesApprovals';
import HomePage from '@/pages/Home';
import PerfilPage from '@/pages/Perfil';
import RankingPage from '@/pages/Ranking';
import TestAuth from '@/pages/TestAuth';
import SimpleLogin from '@/pages/SimpleLogin';
import CreateOwner from '@/pages/CreateOwner';
import CheckTables from '@/pages/CheckTables';

export default function AppRouter() {
  return (
    <AuthProvider>
      <div className="min-h-[100dvh] bg-background text-foreground">
        <div className="mx-auto w-full max-w-4xl">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/match" element={<Match />} />
            <Route path="/finance" element={<FinancePage />} />
            <Route path="/vote" element={<VotePage />} />
            <Route path="/admin/invites" element={<InvitesApprovalsPage />} />
            <Route path="/ranking" element={<RankingPage />} />
            <Route path="/perfil" element={<PerfilPage />} />
            <Route path="/test-auth" element={<TestAuth />} />
            <Route path="/simple-login" element={<SimpleLogin />} />
            <Route path="/create-owner" element={<CreateOwner />} />
            <Route path="/check-tables" element={<CheckTables />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        {/* Bottom nav só no mobile */}
        <BottomNav />
      </div>
    </AuthProvider>
  );
}
