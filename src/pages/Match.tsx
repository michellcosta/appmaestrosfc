diff --git a/src/pages/Match.tsx b/src/pages/Match.tsx
--- a/src/pages/Match.tsx
+++ b/src/pages/Match.tsx
@@
-import React, { useState, useEffect } from 'react';
+import React, { useState, useEffect } from 'react';
 import { Play, Pause, StopCircle, Plus, Users, Shuffle, Trophy, Clock } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Card } from '@/components/ui/card';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
-import { Badge } from '@/components/ui/badge';
+import { Badge } from '@/components/ui/badge';
+import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
 import { EmptyState } from '@/components/illustrations/empty-state';
 import { pt } from '@/i18n/pt';
 import { cn } from '@/lib/utils';
 import { TeamColor } from '@/types';
 
@@
-interface TeamScore {
+interface Player { id: string; name: string; team: TeamColor; }
+interface TeamScore {
   Preto: number;
   Verde: number;
   Cinza: number;
 }
@@
-  const [matchState, setMatchState] = useState<'idle' | 'running' | 'paused'>('idle');
+  const [matchState, setMatchState] = useState<'idle' | 'running' | 'paused'>('idle');
   const [elapsedTime, setElapsedTime] = useState(0);
   const [currentRound, setCurrentRound] = useState(1);
@@
-  const [scores, setScores] = useState<TeamScore>({
+  const [scores, setScores] = useState<TeamScore>({
     Preto: 0,
     Verde: 0,
     Cinza: 0,
   });
-  // ... (demais estados existentes)
+  // --- ELENCO (mock para testes – trocaremos por Supabase depois) ---
+  const [roster] = useState<Record<TeamColor, Player[]>>({
+    Preto: [
+      { id: 'p1', name: 'Michell', team: 'Preto' },
+      { id: 'p2', name: 'Rafael', team: 'Preto' },
+      { id: 'p3', name: 'Leo', team: 'Preto' },
+    ],
+    Verde: [
+      { id: 'v1', name: 'Gui', team: 'Verde' },
+      { id: 'v2', name: 'Dudu', team: 'Verde' },
+      { id: 'v3', name: 'Carlos', team: 'Verde' },
+    ],
+    Cinza: [
+      { id: 'c1', name: 'João', team: 'Cinza' },
+      { id: 'c2', name: 'Pedro', team: 'Cinza' },
+      { id: 'c3', name: 'Vini', team: 'Cinza' },
+    ],
+    Coletes: [],
+  });
+
+  // --- Fluxo 2 etapas: Gol -> Assistência ---
+  const [isGoalOpen, setIsGoalOpen] = useState(false);
+  const [goalTeam, setGoalTeam] = useState<TeamColor>('Preto');
+  const [goalStep, setGoalStep] = useState<'select_scorer' | 'select_assist'>('select_scorer');
+  const [goalScorer, setGoalScorer] = useState<Player | null>(null);
+  const [goalAssist, setGoalAssist] = useState<Player | null>(null);
+
+  // Histórico de gols e estatísticas por jogador (sessão)
+  const [recentGoals, setRecentGoals] = useState<
+    { team: TeamColor; player: string; assist?: string; time: string }[]
+  >([]);
+  const [playerStats, setPlayerStats] = useState<Record<string, { goals: number; assists: number }>>({});
@@
   const handleEnd = () => {
     setMatchState('idle');
     setElapsedTime(0);
     setCurrentRound(currentRound + 1);
   };
 
-  const handleGoal = (team: TeamColor) => {
-    // (implementação antiga, se existir)
-  };
+  // ---------- NOVO: fluxo de gol em 2 etapas ----------
+  const openGoalModal = (team: TeamColor) => {
+    setGoalTeam(team);
+    setGoalStep('select_scorer');
+    setGoalScorer(null);
+    setGoalAssist(null);
+    setIsGoalOpen(true);
+  };
+
+  const handleSelectScorer = (pl: Player) => {
+    setGoalScorer(pl);
+    setGoalStep('select_assist');
+  };
+
+  const formatMMSS = (totalSeconds: number) => {
+    const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
+    const ss = String(totalSeconds % 60).padStart(2, '0');
+    return `${mm}:${ss}`;
+  };
+
+  const confirmGoal = (assist: Player | null) => {
+    if (!goalScorer) return;
+    // 1) Placar
+    setScores(prev => ({ ...prev, [goalTeam]: (prev[goalTeam] ?? 0) + 1 }));
+    // 2) Histórico
+    setRecentGoals(prev => [
+      { team: goalTeam, player: goalScorer.name, assist: assist?.name, time: formatMMSS(elapsedTime) },
+      ...prev,
+    ].slice(0, 8));
+    // 3) Estatísticas
+    setPlayerStats(prev => ({
+      ...prev,
+      [goalScorer.id]: {
+        goals: (prev[goalScorer.id]?.goals ?? 0) + 1,
+        assists: prev[goalScorer.id]?.assists ?? 0,
+      },
+      ...(assist ? {
+        [assist.id]: {
+          goals: prev[assist.id]?.goals ?? 0,
+          assists: (prev[assist.id]?.assists ?? 0) + 1,
+        }
+      } : {}),
+    }));
+    setIsGoalOpen(false);
+  };
+
+  const handleSelectAssist = (pl: Player | null) => {
+    // null = sem assistência
+    if (pl && goalScorer && pl.id === goalScorer.id) return; // bloqueia auto-assistência
+    confirmGoal(pl);
+  };
@@
-        {/* botões existentes ... */}
-        <div className="grid grid-cols-3 gap-4">
-          <Button variant="outline" onClick={() => handleGoal('Preto' as TeamColor)}>Gol Preto</Button>
-          <Button variant="outline" onClick={() => handleGoal('Verde' as TeamColor)}>Gol Verde</Button>
-          <Button variant="outline" onClick={() => handleGoal('Cinza' as TeamColor)}>Gol Cinza</Button>
-        </div>
+        {/* GOL: abre fluxo 2 etapas */}
+        <div className="grid grid-cols-3 gap-4">
+          <Button variant="outline" onClick={() => openGoalModal('Preto' as TeamColor)}>Gol Preto</Button>
+          <Button variant="outline" onClick={() => openGoalModal('Verde' as TeamColor)}>Gol Verde</Button>
+          <Button variant="outline" onClick={() => openGoalModal('Cinza' as TeamColor)}>Gol Cinza</Button>
+        </div>
@@
-      {/* ... resto do conteúdo ... */}
+      {/* Histórico de gols (opcional) */}
+      <Card className="p-4 mt-6">
+        <h3 className="font-semibold mb-3">Gols recentes</h3>
+        {recentGoals.length === 0 ? (
+          <p className="text-sm text-muted-foreground">Nenhum gol registrado ainda.</p>
+        ) : (
+          <ul className="space-y-2">
+            {recentGoals.map((g, i) => (
+              <li key={i} className="text-sm flex items-center justify-between">
+                <span className="font-medium">{g.team}</span>
+                <span>{g.player}{g.assist ? ` (assist.: ${g.assist})` : ''}</span>
+                <span className="tabular-nums text-muted-foreground">{g.time}</span>
+              </li>
+            ))}
+          </ul>
+        )}
+      </Card>
+
+      {/* Estatísticas simples por jogador (sessão) */}
+      <Card className="p-4 mt-4">
+        <h3 className="font-semibold mb-3">Estatísticas dos jogadores (sessão)</h3>
+        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
+          {Object.entries(playerStats).length === 0 ? (
+            <p className="text-sm text-muted-foreground">Sem registros ainda.</p>
+          ) : (
+            Object.entries(playerStats).map(([pid, s]) => {
+              const pl = Object.values(roster).flat().find(p => p.id === pid);
+              if (!pl) return null;
+              return (
+                <div key={pid} className="flex items-center justify-between text-sm">
+                  <span className="font-medium">{pl.name}</span>
+                  <span className="text-muted-foreground">Gols: {s.goals} · Assist.: {s.assists}</span>
+                </div>
+              );
+            })
+          )}
+        </div>
+      </Card>
+
+      {/* Dialog: 2 etapas (artilheiro → assistência) */}
+      <Dialog open={isGoalOpen} onOpenChange={setIsGoalOpen}>
+        <DialogContent>
+          <DialogHeader>
+            <DialogTitle>{goalStep === 'select_scorer' ? 'Quem fez o gol?' : 'Quem deu a assistência?'}</DialogTitle>
+          </DialogHeader>
+          <div className="space-y-2 max-h-80 overflow-auto">
+            {roster[goalTeam]?.length ? (
+              roster[goalTeam].map(pl => (
+                <Button
+                  key={pl.id}
+                  variant="outline"
+                  className="w-full justify-between"
+                  onClick={() => {
+                    if (goalStep === 'select_scorer') {
+                      handleSelectScorer(pl);
+                    } else {
+                      if (goalScorer && pl.id === goalScorer.id) return; // bloqueia auto-assistência
+                      handleSelectAssist(pl);
+                    }
+                  }}
+                >
+                  <span className="font-medium">{pl.name}</span>
+                  <Badge variant="secondary">{goalTeam}</Badge>
+                </Button>
+              ))
+            ) : (
+              <p className="text-sm text-muted-foreground">Sem jogadores cadastrados para {goalTeam}.</p>
+            )}
+          </div>
+          {goalStep === 'select_assist' && (
+            <div className="flex items-center justify-between pt-2">
+              <Button variant="ghost" onClick={() => handleSelectAssist(null)}>
+                Registrar sem assistência
+              </Button>
+              <Button variant="outline" onClick={() => setIsGoalOpen(false)}>
+                Cancelar
+              </Button>
+            </div>
+          )}
+        </DialogContent>
+      </Dialog>
