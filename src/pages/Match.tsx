// src/pages/Match.tsx
import React, { useState, useEffect } from 'react';
import { Play, Pause, StopCircle, Plus, Users, Shuffle, Trophy, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/illustrations/empty-state';
import { pt } from '@/i18n/pt';
import { cn } from '@/lib/utils';
import { TeamColor } from '@/types';

interface TeamScore { Preto: number; Verde: number; Cinza: number; Vermelho: number; }
interface Player { id: string; name: string; team: TeamColor }

export default function Match() {
  const [matchState, setMatchState] = useState<'idle' | 'running' | 'paused'>('idle');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [scores, setScores] = useState<TeamScore>({ Preto: 0, Verde: 0, Cinza: 0, Vermelho: 0 });

  // roster (mock)
  const [roster] = useState<Partial<Record<TeamColor, Player[]>>>({
    Preto: [{ id: 'p1', name: 'Michell', team: 'Preto' }, { id: 'p2', name: 'Rafael', team: 'Preto' }],
    Verde: [{ id: 'v1', name: 'Gui', team: 'Verde' }, { id: 'v2', name: 'Dudu', team: 'Verde' }],
    Cinza: [{ id: 'c1', name: 'João', team: 'Cinza' }, { id: 'c2', name: 'Pedro', team: 'Cinza' }],
    Vermelho: [{ id: 'r1', name: 'Lucas', team: 'Vermelho' }, { id: 'r2', name: 'Carlos', team: 'Vermelho' }],
  });

  // Goal modal
  const [isGoalOpen, setIsGoalOpen] = useState(false);
  const [goalTeam, setGoalTeam] = useState<TeamColor>('Preto');
  const [goalScorer, setGoalScorer] = useState<Player | null>(null);

  const [recentGoals, setRecentGoals] = useState<
    { team: TeamColor; player: string; time: string }[]
  >([]);

  // Timer
  useEffect(() => {
    let interval: any;
    if (matchState === 'running') {
      interval = setInterval(() => setElapsedTime((p) => p + 1), 1000);
    }
    return () => interval && clearInterval(interval);
  }, [matchState]);

  const formatTime = (s: number) =>
  '${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}';

  const handleStartPause = () => {
    if (matchState === 'idle') setMatchState('running');
    else if (matchState === 'running') setMatchState('paused');
    else setMatchState('running');
  };

  const handleRestart = () => {
    setElapsedTime(0);
    setMatchState('running');
  };

  const handleEnd = () => {
    setMatchState('idle');
    setElapsedTime(0);
    setCurrentRound((r) => r + 1);
  };

  const openGoalModal = (team: TeamColor) => {
    setGoalTeam(team);
    setGoalScorer(null);
    setIsGoalOpen(true);
  };

  const confirmGoal = (player: Player) => {
    setScores((prev) => ({ ...prev, [goalTeam]: prev[goalTeam] + 1 }));
    setRecentGoals((prev) => [
      { team: goalTeam, player: player.name, time: formatTime(elapsedTime) },
      ...prev,
    ]);
    setIsGoalOpen(false);
  };

  const getTeamColor = (team: TeamColor) =>
    ({ Preto: 'bg-team-black', Verde: 'bg-team-green', Cinza: 'bg-team-gray', Vermelho: 'bg-team-red' }[team]);

  return (
    <div className="p-4 space-y-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">{pt.match.matchLive}</h1>
        <p className="text-muted-foreground mt-1">
          {pt.match.round} {currentRound}
        </p>
      </header>

      {/* Cronômetro */}
      <Card className="p-8 text-center shadow-xl bg-gradient-card">
        <div
          className={cn(
            'text-6xl font-bold mb-4 transition-all duration-200',
            matchState === 'running' && 'text-primary',
            matchState === 'paused' && 'text-warning',
            matchState === 'idle' && 'text-muted-foreground'
          )}
        >
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
                <Pause className="w-5 h-5" /> {pt.match.pause}
              </>
            ) : (
              <>
                <Play className="w-5 h-5" /> {pt.match.start}
              </>
            )}
          </Button>

          {/* Recomeçar azul */}
          {matchState !== 'idle' && (
            <Button
              onClick={handleRestart}
              className="min-w-[140px] bg-blue-600 hover:bg-blue-700 text-white"
            >
              Recomeçar
            </Button>
          )}

          {/* Encerrar vermelho */}
          {matchState !== 'idle' && (
            <Button
              onClick={handleEnd}
              className="min-w-[140px] bg-red-600 hover:bg-red-700 text-white"
            >
              <StopCircle className="w-5 h-5" /> Encerrar
            </Button>
          )}
        </div>
      </Card>

      {/* Placar */}
      <Card className="p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" /> {pt.match.score}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {(Object.entries(scores) as [TeamColor, number][]).map(([team, score]) => (
            <div
              key={team}
              className="flex items-center justify-between p-4 rounded-xl bg-card border-2 border-border"
            >
              <div className="flex items-center gap-3">
                <div className={cn('w-8 h-8 rounded-full', getTeamColor(team))} />
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

      {/* Gols recentes */}
      <Card className="p-4 mt-6">
        <h3 className="font-semibold mb-3">Gols recentes</h3>
        {recentGoals.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum gol registrado ainda.</p>
        ) : (
          <ul className="space-y-2">
            {recentGoals.map((g, i) => (
              <li key={i} className="text-sm flex items-center justify-between gap-2">
                <div>
                  <span className="font-medium">{g.team}</span> – {g.player}{' '}
                  <span className="tabular-nums text-muted-foreground">{g.time}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Modal: registrar gol */}
      <Dialog open={isGoalOpen} onOpenChange={setIsGoalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quem fez o gol?</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-80 overflow-auto">
            {roster[goalTeam]?.map((pl) => (
              <Button
                key={pl.id}
                variant="outline"
                className="w-full justify-between"
                onClick={() => confirmGoal(pl)}
              >
                <span className="font-medium">{pl.name}</span>
                <Badge variant="secondary">{goalTeam}</Badge>
              </Button>
            )) || <p className="text-sm text-muted-foreground">Sem jogadores cadastrados</p>}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
