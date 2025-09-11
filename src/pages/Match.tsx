import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GoalModal } from '@/components/match/GoalModal';
import type { GoalEvent, TeamColor, TiebreakerEvent, TiebreakerMethod } from '@/types';
import { cn } from '@/lib/utils';

// Helpers
const formatMMSS = (sec: number) => {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const TEAMS: TeamColor[] = ['Preto', 'Verde', 'Cinza', 'Coletes'];

export const Match: React.FC = () => {
  const [scores, setScores] = useState<Record<TeamColor, number>>({
    Preto: 0, Verde: 0, Cinza: 0, Coletes: 0
  });
  const [events, setEvents] = useState<GoalEvent[]>([]);
  const [tiebreaker, setTiebreaker] = useState<TiebreakerEvent | null>(null);

  const [running, setRunning] = useState(false);
  const [duration, setDuration] = useState(10 * 60); // 10min (editável)
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<number | null>(null);

  const [goalModal, setGoalModal] = useState<{ open: boolean; team: TeamColor }>({ open: false, team: 'Preto' });

  // Cronômetro
  useEffect(() => {
    if (!running) return;
    timerRef.current = window.setInterval(() => setElapsed((e) => e + 1), 1000) as unknown as number;
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, [running]);

  const handleStart = () => setRunning(true);
  const handlePause = () => setRunning(false);
  const handleReset = () => { setRunning(false); setElapsed(0); };

  // + Gol
  const openGoal = (team: TeamColor) => setGoalModal({ open: true, team });
  const confirmGoal = (authorName: string, assistName?: string) => {
    setScores((s) => ({ ...s, [goalModal.team]: s[goalModal.team] + 1 }));
    setEvents((ev) => [
      ...ev,
      {
        id: crypto.randomUUID(),
        ts: elapsed,
        team: goalModal.team,
        authorId: 'n/a',
        authorName,
        assistId: assistName ? 'n/a' : undefined,
        assistName,
        byUserId: 'admin-or-aux', // TODO: pegar do auth
      },
    ]);
    setGoalModal({ open: false, team: goalModal.team });
  };

  // Correção de gol (excluir último do time selecionado ou abrir UI de listagem)
  const removeLastGoal = (team: TeamColor) => {
    const idx = [...events].reverse().findIndex((e) => e.team === team);
    if (idx === -1) return;
    // posição real no array
    const pos = events.length - 1 - idx;
    const ev = events[pos];
    const copy = [...events];
    copy.splice(pos, 1);
    setEvents(copy);
    setScores((s) => ({ ...s, [team]: Math.max(0, s[team] - 1) }));
    // TODO: auditoria com byUserId
  };

  // Desempate (cara/coroa ou roleta)
  const doTiebreak = (method: TiebreakerMethod) => {
    // Animação curta (poderia setar um estado visual)
    const options: TeamColor[] = TEAMS; // em empate geral, escolher entre todos — ou filtrar os times empatados
    const winner = options[Math.floor(Math.random() * options.length)];
    const ev: TiebreakerEvent = {
      id: crypto.randomUUID(),
      method,
      winner,
      ts: elapsed,
      byUserId: 'admin-or-aux',
    };
    setTiebreaker(ev);
    // TODO: persistir no backend
  };

  return (
    <div className="p-4 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-outfit font-bold">Partida</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handleReset}>Reset</Button>
          {!running ? (
            <Button onClick={handleStart}>Iniciar</Button>
          ) : (
            <Button variant="outline" onClick={handlePause}>Pausar</Button>
          )}
        </div>
      </header>

      {/* Cronômetro */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Tempo</div>
          <div className="text-3xl font-bold">{formatMMSS(elapsed)} / {formatMMSS(duration)}</div>
        </div>
      </Card>

      {/* Placar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {TEAMS.map((t) => (
          <Card key={t} className="p-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{t}</div>
              <div className="text-2xl font-bold">{scores[t]}</div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button size="sm" onClick={() => openGoal(t)}>+ Gol</Button>
              <Button size="sm" variant="outline" onClick={() => removeLastGoal(t)}>Corrigir</Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Histórico */}
      <Card className="p-4">
        <div className="font-semibold mb-3">Histórico</div>
        {events.length === 0 ? (
          <div className="text-sm text-muted-foreground">Sem eventos ainda</div>
        ) : (
          <ul className="space-y-2 text-sm">
            {events.map((e) => (
              <li key={e.id} className="flex items-center justify-between">
                <span>
                  ⚽ <b>{e.authorName}</b>
                  {e.assistName ? <> (assist. {e.assistName})</> : null} — {e.team}
                </span>
                <span className="text-muted-foreground">{formatMMSS(e.ts)}</span>
              </li>
            ))}
          </ul>
        )}
        {tiebreaker && (
          <div className="mt-3 text-sm">
            Desempate: <b>{tiebreaker.method === 'cara_coroa' ? 'Cara ou Coroa' : 'Roleta'}</b> — vencedor <b>{tiebreaker.winner}</b>
          </div>
        )}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => doTiebreak('cara_coroa')}>Cara/Coroa</Button>
          <Button variant="secondary" onClick={() => doTiebreak('roleta')}>Roleta</Button>
        </div>
      </Card>

      {/* Modal + Gol */}
      <GoalModal
        open={goalModal.open}
        teamLabel={goalModal.team}
        onClose={() => setGoalModal((m) => ({ ...m, open: false }))}
        onConfirm={(author, assist) => confirmGoal(author, assist)}
      />
    </div>
  );
};
