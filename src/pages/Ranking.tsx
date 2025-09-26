// src/pages/Ranking.tsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from '@/auth/OfflineAuthProvider';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from "@/components/ui/button";
import { Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RestrictedAccess from './RestrictedAccess';

export default function RankingPage() {
  const { user } = useAuth();
  const { canSeeRanking, canSeeVote } = usePermissions();
  const navigate = useNavigate();

  // Verificar permissão básica
  if (!canSeeRanking()) {
    return <RestrictedAccess />;
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 space-y-4 pb-20">
      {/* Header básico */}
      <Card className="bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700 shadow-sm rounded-lg mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-zinc-100">Ranking & Votações</h1>
              <p className="text-sm text-gray-600 dark:text-zinc-400">
                Rankings dos jogadores e votações ativas.
              </p>
            </div>
            
            {/* Crown button for owners */}
            {user?.role === 'owner' && (
              <button
                onClick={() => navigate('/owner-dashboard')}
                className="p-2 hover:bg-purple-100 hover:text-purple-700 transition-colors rounded-lg"
                title="Acesso rápido ao Dashboard do Owner"
              >
                <Crown className="w-4 h-4 text-purple-600" />
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo básico */}
      <Card className="rounded-2xl">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold mb-2">Ranking de Jogadores</h3>
          
          {/* Dados mock básicos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-xl border p-3 border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8">
                  <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">1</span>
                </div>
                <div className="flex-1">
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">João Silva</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 block mb-0.5">G</span>
                  <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">5</span>
                </div>
                <div className="text-center">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 block mb-0.5">A</span>
                  <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">3</span>
                </div>
                <div className="text-center px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 block">Total</span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">8</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border p-3 border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8">
                  <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">2</span>
                </div>
                <div className="flex-1">
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">Maria Santos</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 block mb-0.5">G</span>
                  <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">3</span>
                </div>
                <div className="text-center">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 block mb-0.5">A</span>
                  <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">4</span>
                </div>
                <div className="text-center px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 block">Total</span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">7</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border p-3 border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8">
                  <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">3</span>
                </div>
                <div className="flex-1">
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">Pedro Costa</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 block mb-0.5">G</span>
                  <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">2</span>
                </div>
                <div className="text-center">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 block mb-0.5">A</span>
                  <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">3</span>
                </div>
                <div className="text-center px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 block">Total</span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">5</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}