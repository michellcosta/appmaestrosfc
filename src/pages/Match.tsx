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
  // Substituições
  const [isSubOpen, setIsSubOpen] = useState(false);
  const [subTeam, setSubTeam] = useState<TeamColor>('Preto');
  const [subOut, setSubOut] = useState<string | null>(null);
  const [subIn, setSubIn] = useState<string | null>(null);
  const [subsPerRound, setSubsPerRound] = useState<Record<TeamColor, number>>({ Preto: 0, Verde: 0, Cinza: 0, Vermelho: 0 });
  const [subsHistory, setSubsHistory] = useState<{ team: TeamColor; outId: string; inId: string; time: string }[]>([]);

  // Desempate
  const [isTieOpen, setIsTieOpen] = useState(false);
  const [tieResult, setTieResult] = useState<TeamColor | null>(null);
  const [goalTeam, setGoalTeam] = useState<TeamColor>('Preto');
  const [goalStep, setGoalStep] = useState<'select_scorer' | 'select_assist'>('select_scorer');
  const [goalScorer, setGoalScorer] = useState<Player | null>(null);

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

  // Histórico unificado de eventos da partida
  interface MatchEvent {
    type: 'START' | 'GOAL' | 'SUB' | 'PAUSE' | 'END';
    time: string;
    team?: TeamColor;
    scorerId?: string;
    scorerName?: string;
    assistId?: string;
    assistName?: string;
    subOutId?: string;
    subOutName?: string;
    subInId?: string;
    subInName?: string;
    author?: 'Owner' | 'Admin' | 'Aux';
  }
  const [matchEvents, setMatchEvents] = useState<MatchEvent[]>([]);

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
    if (matchState === 'idle') {
      setMatchState('running');
      setMatchEvents(prev => [{ type: 'START', time: formatMMSS(elapsedTime), author: 'Owner' }, ...prev]);
    } else if (matchState === 'running') {
      setMatchState('paused');
      setMatchEvents(prev => [{ type: 'PAUSE', time: formatMMSS(elapsedTime), author: 'Owner' }, ...prev]);
    } else {
      setMatchState('running');
      setMatchEvents(prev => [{ type: 'START', time: formatMMSS(elapsedTime), author: 'Owner' }, ...prev]);
    }
  };

  
  const handleEnd = () => {
    // Registra fim antes de resetar o clock
    setMatchEvents(prev => [{ type: 'END', time: formatMMSS(elapsedTime), author: 'Owner' }, ...prev]);
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
    setMatchEvents(prev => [{ type: 'GOAL', time: formatMMSS(elapsedTime), team: goalTeam, scorerId: goalScorer.id, scorerName: goalScorer.name, assistId: assist?.id, assistName: assist?.name, author: 'Owner' }, ...prev]);
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

  
  // Regras básicas de substituição:
  // - Só libera se clock >= 5:00 (simplificado)
  // - Máximo 2 por rodada por time
  const canSubstituteNow = (team: TeamColor) => {
    if (elapsedTime < 300) return { ok: false, reason: 'Aguarde pelo menos 5:00 de jogo' };
    if (subsPerRound[team] >= 2) return { ok: false, reason: 'Limite de 2 substituições por rodada' };
    return { ok: true };
  };

  const confirmSubstitution = () => {
    if (!subTeam || !subOut || !subIn) return;
    const rule = canSubstituteNow(subTeam);
    if (!(rule as any).ok) {
      alert((rule as any).reason);
      return;
    }
    // Registra histórico (não alteramos roster neste MVP)
    const outName = (roster[subTeam] || []).find(p => p.id === subOut!)?.name || '';
    const inName = (roster[subTeam] || []).find(p => p.id === subIn!)?.name || '';
    setSubsHistory(prev => [{ team: subTeam, outId: subOut!, inId: subIn!, time: formatMMSS(elapsedTime) }, ...prev].slice(0, 12));
    setMatchEvents(prev => [{ type: 'SUB', time: formatMMSS(elapsedTime), team: subTeam, subOutId: subOut!, subOutName: outName, subInId: subIn!, subInName: inName, author: 'Owner' }, ...prev]);
    // Incrementa contador
    setSubsPerRound(prev => ({ ...prev, [subTeam]: (prev[subTeam] ?? 0) + 1 }));
    // Fecha modal
    setIsSubOpen(false);
    setSubOut(null);
    setSubIn(null);
  };

  const resetSubsForNextRound = () => {
    setSubsPerRound({ Preto: 0, Verde: 0, Cinza: 0, Vermelho: 0 });
  };

  // Chame no fim da rodada
  const endRoundAndResetSubs = () => {
    handleEnd();
    resetSubsForNextRound();
  };

  const runTiebreaker = () => {
    // encontra times com maior pontuação empatada
    const entries = Object.entries(scores) as [TeamColor, number][];
    const max = Math.max(...entries.map(([, n]) => n));
    const tied = entries.filter(([, n]) => n === max).map(([t]) => t);
    if (tied.length <= 1) {
      setTieResult(null);
    } else {
      const idx = Math.floor(Math.random() * tied.length);
      setTieResult(tied[idx]);
    }
  };


  // Ranking (sessão) – usa playerStats acumulados
  const renderRanking = () => {
    const allPlayers = Object.values(roster).flat().filter(Boolean) as Player[];
    const toList = (key: 'goals' | 'assists') => Object.entries(playerStats)
      .map(([pid, s]) => {
        const pl = allPlayers.find(p => p.id === pid);
        return { id: pid, name: pl?.name || 'Jogador', team: pl?.team, value: s[key] };
      })
      .filter(i => i.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    const topGoals = toList('goals');
    const topAssists = toList('assists');

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h4 className="font-semibold mb-3">Artilheiros</h4>
          {topGoals.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem gols registrados.</p>
          ) : (
            <ul className="space-y-2">
              {topGoals.map((p, i) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-6 justify-center">{i + 1}</Badge>
                    <span className="font-medium">{p.name}</span>
                    {p.team && <span className="text-xs text-muted-foreground">{p.team}</span>}
                  </div>
                  <span className="font-semibold">{p.value}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card className="p-4">
          <h4 className="font-semibold mb-3">Assistências</h4>
          {topAssists.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem assistências registradas.</p>
          ) : (
            <ul className="space-y-2">
              {topAssists.map((p, i) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-6 justify-center">{i + 1}</Badge>
                    <span className="font-medium">{p.name}</span>
                    {p.team && <span className="text-xs text-muted-foreground">{p.team}</span>}
                  </div>
                  <span className="font-semibold">{p.value}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    );
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


      {/* Histórico (partida atual) */}
      <Card className="p-4 mt-4">
        <h3 className="font-semibold mb-3">Histórico da partida</h3>
        {matchEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem eventos ainda.</p>
        ) : (
          <ul className="space-y-2">
            {matchEvents.map((e, i) => (
              <li key={i} className="text-sm flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{e.type}</Badge>
                  {e.type === 'GOAL' && (
                    <span>
                      <strong>{e.scorerName}</strong>
                      {e.assistName ? ` (assist.: ${e.assistName})` : ''}
                      {e.team ? ` — ${e.team}` : ''}
                    </span>
                  )}
                  {e.type === 'SUB' && (
                    <span>
                      Sai <strong>{e.subOutName}</strong> · Entra <strong>{e.subInName}</strong>
                      {e.team ? ` — ${e.team}` : ''}
                    </span>
                  )}
                  {e.type === 'START' && <span>Início / Retomada</span>}
                  {e.type === 'PAUSE' && <span>Pausa</span>}
                  {e.type === 'END' && <span>Fim da partida</span>}
                </div>
                <span className="tabular-nums text-muted-foreground">{e.time}</span>
              </li>
            ))}
          </ul>
        )}
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
            {renderRanking()}
          </Card>
        </TabsContent>
    
        
        
        <TabsContent value="month" className="mt-4">
          <Card className="p-6">
            <h3 className="font-outfit font-semibold mb-4">
              {pt.match.history} - {pt.time.month}
            </h3>
            {renderRanking()}
          </Card>
        </TabsContent>
    
        
        
        <TabsContent value="all" className="mt-4">
          <Card className="p-6">
            <h3 className="font-outfit font-semibold mb-4">
              {pt.match.history} - {pt.time.all}
            </h3>
            {renderRanking()}
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

      {/* Modal de Substituição */}
      <Dialog open={isSubOpen} onOpenChange={setIsSubOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Substituição</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2">
              {(['Preto','Verde','Cinza','Vermelho'] as TeamColor[]).map(c => (
                <Button key={c} variant={subTeam === c ? 'default' : 'outline'} onClick={() => setSubTeam(c)}>
                  {c}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-sm font-medium mb-2">Sai</div>
                <div className="space-y-2 max-h-56 overflow-auto">
                  {roster[subTeam]?.map(p => (
                    <Button key={p.id} variant={subOut === p.id ? 'default' : 'outline'} className="w-full justify-between" onClick={() => setSubOut(p.id)}>
                      <span>{p.name}</span>
                      <Badge>{subTeam}</Badge>
                    </Button>
                  )) || <p className="text-sm text-muted-foreground">Sem jogadores.</p>}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Entra</div>
                <div className="space-y-2 max-h-56 overflow-auto">
                  {roster[subTeam]?.map(p => (
                    <Button key={p.id} variant={subIn === p.id ? 'default' : 'outline'} className="w-full justify-between" onClick={() => setSubIn(p.id)}>
                      <span>{p.name}</span>
                      <Badge variant="secondary">{subTeam}</Badge>
                    </Button>
                  )) || <p className="text-sm text-muted-foreground">Sem jogadores.</p>}
                </div>
              </div>
            </div>

            <Button onClick={confirmSubstitution} className="w-full">Confirmar substituição</Button>
            <p className="text-xs text-muted-foreground">Regra: mínimo 5:00 de jogo · máx. 2 por rodada/time.</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Desempate */}
      <Dialog open={isTieOpen} onOpenChange={setIsTieOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desempate</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Seleciona aleatoriamente entre os times empatados no placar.</p>
            <Button onClick={runTiebreaker} className="w-full">Sortear</Button>
            {tieResult && (
              <div className="p-3 rounded-lg border mt-2 flex items-center gap-3">
                <div className={cn('w-5 h-5 rounded-full', getTeamColor(tieResult))} />
                <span className="font-medium">Time vencedor: {tieResult}</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};