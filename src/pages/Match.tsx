import React, { useState, useEffect } from 'react';
import { Play, Pause, StopCircle, Plus, Users, Shuffle, Trophy, Clock, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/illustrations/empty-state';
import { pt } from '@/i18n/pt';
import { cn } from '@/lib/utils';
import { TeamColor } from '@/types';

interface TeamScore {
  Preto: number;
  Verde: number;
  Cinza: number;
  Vermelho: number;
}

interface Player { id: string; name: string; team: TeamColor }

export const Match: React.FC = () => {
  const [matchState, setMatchState] = useState<'idle' | 'running' | 'paused'>('idle');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [scores, setScores] = useState<TeamScore>({
    Preto: 0,
    Verde: 0,
    Cinza: 0,
    Vermelho: 0,
  });

  // Elenco (mock); depois trocar por Supabase
  const [roster] = useState<Partial<Record<TeamColor, Player[]>>>({
    Preto: [
      { id: 'p1', name: 'Michell', team: 'Preto' },
      { id: 'p2', name: 'Rafael', team: 'Preto' },
      { id: 'p3', name: 'Leo', team: 'Preto' },
    ],
    Verde: [
      { id: 'v1', name: 'Gui', team: 'Verde' },
      { id: 'v2', name: 'Dudu', team: 'Verde' },
      { id: 'v3', name: 'Carlos', team: 'Verde' },
    ],
    Cinza: [
      { id: 'c1', name: 'João', team: 'Cinza' },
      { id: 'c2', name: 'Pedro', team: 'Cinza' },
      { id: 'c3', name: 'Vini', team: 'Cinza' },
    ],
    Vermelho: [
      { id: 'r1', name: 'André', team: 'Vermelho' },
      { id: 'r2', name: 'Felipe', team: 'Vermelho' },
      { id: 'r3', name: 'Thiago', team: 'Vermelho' },
    ],
  });

  // Modal de gol
  const [isGoalOpen, setIsGoalOpen] = useState(false);
  const [goalTeam, setGoalTeam] = useState<TeamColor>('Preto');
  const [goalStep, setGoalStep] = useState<'select_scorer' | 'select_assist'>('select_scorer');
  const [goalScorer, setGoalScorer] = useState<Player | null>(null);
  const [goalAssist, setGoalAssist] = useState<Player | null>(null);

  // Histórico/estatísticas (sessão)
  const [recentGoals, setRecentGoals] = useState<{
    team: TeamColor;
    player: string;
    playerId?: string;
    assist?: string;
    assistId?: string;
    time: string;
  }[]>([]);
  const [playerStats, setPlayerStats] = useState<Record<string, { goals: number; assists: number }>>({});
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Cronômetro
  useEffect(() => {
    let interval: any;
    if (matchState === 'running') {
      interval = setInterval(() => setElapsedTime((prev) => prev + 1), 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [matchState]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatMMSS = (totalSeconds: number) => {
    const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const ss = String(totalSeconds % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  const handleStartPause = () => {
    if (matchState === 'idle') setMatchState('running');
    else if (matchState === 'running') setMatchState('paused');
    else setMatchState('running');
  };

  const handleEnd = () => {
    setMatchState('idle');
    setElapsedTime(0);
    setCurrentRound((r) => r + 1);
  };

  const openGoalModal = (team: TeamColor) => {
    setGoalTeam(team);
    setGoalStep('select_scorer');
    setGoalScorer(null);
    setGoalAssist(null);
    setEditingIndex(null);
    setIsGoalOpen(true);
  };

  const handleSelectScorer = (pl: Player) => {
    setGoalScorer(pl);
    setGoalStep('select_assist');
  };

  const confirmGoal = (assist: Player | null) => {
    if (!goalScorer) return;

    if (editingIndex !== null) {
      // Edição: ajusta estatísticas antigas e substitui item mantendo time/tempo
      setRecentGoals(prev => {
        const old = prev[editingIndex];
        if (!old) return prev;

        setPlayerStats(ps => {
          const next = { ...ps };
          const decGoal = (id?: string) => {
            if (!id) return;
            if (next[id]) next[id] = { goals: Math.max(0, (next[id].goals ?? 0) - 1), assists: next[id].assists ?? 0 };
          };
          const decAssist = (id?: string) => {
            if (!id) return;
            if (next[id]) next[id] = { goals: next[id].goals ?? 0, assists: Math.max(0, (next[id].assists ?? 0) - 1) };
          };
          decGoal(old.playerId);
          decAssist(old.assistId);

          const sid = goalScorer.id;
          next[sid] = { goals: (next[sid]?.goals ?? 0) + 1, assists: next[sid]?.assists ?? 0 };
          if (assist) {
            const aid = assist.id;
            next[aid] = { goals: next[aid]?.goals ?? 0, assists: (next[aid]?.assists ?? 0) + 1 };
          }
          return next;
        });

        const updated = { team: old.team, player: goalScorer.name, playerId: goalScorer.id, assist: assist?.name, assistId: assist?.id, time: old.time };
        const arr = [...prev];
        arr[editingIndex] = updated;
        return arr;
      });
      setIsGoalOpen(false);
      setEditingIndex(null);
      return;
    }

    // Inclusão normal
    setScores(prev => ({ ...prev, [goalTeam]: (prev[goalTeam] ?? 0) + 1 }));
    setRecentGoals(prev => [
      { team: goalTeam, player: goalScorer.name, playerId: goalScorer.id, assist: assist?.name, assistId: assist?.id, time: formatMMSS(elapsedTime) },
      ...prev,
    ].slice(0, 8));
    setPlayerStats(prev => ({
      ...prev,
      [goalScorer.id]: {
        goals: (prev[goalScorer.id]?.goals ?? 0) + 1,
        assists: prev[goalScorer.id]?.assists ?? 0,
      },
      ...(assist ? {
        [assist.id]: {
          goals: prev[assist.id]?.goals ?? 0,
          assists: (prev[assist.id]?.assists ?? 0) + 1,
        }
      } : {}),
    }));
    setIsGoalOpen(false);
  };

  const handleSelectAssist = (pl: Player | null) => {
    if (pl && goalScorer && pl.id === goalScorer.id) return; // evita auto-assistência
    confirmGoal(pl);
  };

  const removeGoalAt = (index: number) => {
    setRecentGoals(prev => {
      const item = prev[index];
      if (!item) return prev;
      // Atualiza placar
      setScores(s => ({ ...s, [item.team]: Math.max(0, (s[item.team] ?? 0) - 1) }));
      // Atualiza estatísticas
      setPlayerStats(ps => {
        const next = { ...ps };
        const findIdByName = (name?: string) => {
          if (!name) return undefined;
          const pl = Object.values(roster).flat().find(p => p?.name === name);
          return pl?.id;
        };
        const scorerId = item.playerId ?? findIdByName(item.player);
        if (scorerId && next[scorerId]) {
          next[scorerId] = { goals: Math.max(0, (next[scorerId].goals ?? 0) - 1), assists: next[scorerId].assists ?? 0 };
        }
        const assistId = item.assistId ?? findIdByName(item.assist);
        if (assistId && next[assistId]) {
          next[assistId] = { goals: next[assistId].goals ?? 0, assists: Math.max(0, (next[assistId].assists ?? 0) - 1) };
        }
        return next;
      });
      // Remove item
      const arr = [...prev];
      arr.splice(index, 1);
      return arr;
    });
  };

  const editGoalAt = (index: number) => {
    const item = recentGoals[index];
    if (!item) return;
    setGoalTeam(item.team);
    const players = roster[item.team] || [];
    const byId = item.playerId ? players.find(p => p.id === item.playerId) : undefined;
    const byName = players.find(p => p.name === item.player);
    setGoalScorer(byId || byName || null);
    setGoalStep('select_scorer');
    setGoalAssist(null);
    setEditingIndex(index);
    setIsGoalOpen(true);
  };

  const getTeamColor = (team: TeamColor) => {
    const colors: Record<TeamColor, string> = {
      Preto: 'bg-team-black',
      Verde: 'bg-team-green',
      Cinza: 'bg-team-gray',
      Vermelho: 'bg-team-red',
    };
    return colors[team];
  };

  return (
    <div className="p-4 space-y-4">
      <header className="mb-6">
        <h1 className="text-2xl font-outfit font-bold text-foreground">
          {pt.match.matchLive}
        </h1>
        <p className="text-muted-foreground mt-1">
          {pt.match.round} {currentRound}
        </p>
      </header>

      {/* Cronômetro Principal */}
      <Card className="p-8 text-center shadow-xl bg-gradient-card">
        <div className={cn(
          "text-6xl font-outfit font-bold mb-4 transition-all duration-200",
          matchState === 'running' && "text-primary animate-pulse",
          matchState === 'paused' && "text-warning",
          matchState === 'idle' && "text-muted-foreground"
        )}>
          {formatTime(elapsedTime)}
        </div>
        
        <div className="flex gap-3 justify-center">
          <Button
            variant={matchState === 'running' ? 'warning' : 'success'}
            size="xl"
            onClick={handleStartPause}
            className="min-w-[140px]"
          >
            {matchState === 'running' ? (
              <>
                <Pause className="w-5 h-5" />
                {pt.match.pause}
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                {pt.match.start}
              </>
            )}
          </Button>
          
          {matchState !== 'idle' && (
            <Button
              variant="destructive"
              size="xl"
              onClick={handleEnd}
            >
              <StopCircle className="w-5 h-5" />
              {pt.match.end}
            </Button>
          )}
        </div>
      </Card>

      {/* Placar */}
      <Card className="p-6 shadow-lg">
        <h2 className="text-lg font-outfit font-semibold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          {pt.match.score}
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          {(Object.entries(scores) as [TeamColor, number][]).map(([team, score]) => (
            <div
              key={team}
              className="flex items-center justify-between p-4 rounded-xl bg-card border-2 border-border hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full",
                  getTeamColor(team)
                )} />
                <span className="font-medium">{team}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{score}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openGoalModal(team)}
                  className="h-8 w-8"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Gols recentes + Estatísticas */}
      <Card className="p-4 mt-6">
        <h3 className="font-semibold mb-3">Gols recentes</h3>
        {recentGoals.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum gol registrado ainda.</p>
        ) : (
          <ul className="space-y-2">
            {recentGoals.map((g, i) => (
              <li key={i} className="text-sm flex items-center justify-between gap-2">
                <div className="flex items-center gap-4">
                  <span className="font-medium">{g.team}</span>
                  <span>{g.player}{g.assist ? ` (assist.: ${g.assist})` : ''}</span>
                  <span className="tabular-nums text-muted-foreground">{g.time}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => editGoalAt(i)} title="Editar gol">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeGoalAt(i)} title="Remover gol">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="p-4 mt-4">
        <h3 className="font-semibold mb-3">Estatísticas dos jogadores (sessão)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(playerStats).length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem registros ainda.</p>
          ) : (
            Object.entries(playerStats).map(([pid, s]) => {
              const pl = Object.values(roster).flat().find(p => p?.id === pid);
              if (!pl) return null;
              return (
                <div key={pid} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{pl.name}</span>
                  <span className="text-muted-foreground">Gols: {s.goals} · Assist.: {s.assists}</span>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Tabs para Histórico */}
      <Tabs defaultValue="week" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="week">{pt.time.week}</TabsTrigger>
          <TabsTrigger value="month">{pt.time.month}</TabsTrigger>
          <TabsTrigger value="all">{pt.time.all}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="week" className="mt-4">
          <Card className="p-6">
            <h3 className="font-outfit font-semibold mb-4">
              {pt.match.history} - {pt.time.week}
            </h3>
            <div className="space-y-3">
              {/* Mock data - será substituído por dados reais */}
              <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <div className="text-sm">
                  <div className="font-medium">Rodada 1</div>
                  <div className="text-muted-foreground">Preto 3 x 2 Verde</div>
                </div>
                <Badge variant="secondary">10 min</Badge>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="month">
          <Card className="p-6">
            <div className="flex flex-col items-center justify-center py-8">
              <EmptyState type="ranking" className="text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {pt.messages.noRanking}
              </p>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="all">
          <Card className="p-6">
            <div className="flex flex-col items-center justify-center py-8">
              <EmptyState type="ranking" className="text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {pt.messages.noRanking}
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog do gol (2 etapas) */}
      <Dialog open={isGoalOpen} onOpenChange={setIsGoalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{goalStep === 'select_scorer' ? 'Quem fez o gol?' : 'Quem deu a assistência?'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-80 overflow-auto">
            {roster[goalTeam]?.length ? (
              roster[goalTeam]!.map(pl => (
                <Button
                  key={pl.id}
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => {
                    if (goalStep === 'select_scorer') {
                      handleSelectScorer(pl);
                    } else {
                      if (goalScorer && pl.id === goalScorer.id) return;
                      handleSelectAssist(pl);
                    }
                  }}
                >
                  <span className="font-medium">{pl.name}</span>
                  <Badge variant="secondary">{goalTeam}</Badge>
                </Button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Sem jogadores cadastrados para {goalTeam}.</p>
            )}
          </div>
          {goalStep === 'select_assist' && (
            <div className="flex items-center justify-between pt-2">
              <Button variant="ghost" onClick={() => handleSelectAssist(null)}>
                Registrar sem assistência
              </Button>
              <Button variant="outline" onClick={() => setIsGoalOpen(false)}>
                Cancelar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};