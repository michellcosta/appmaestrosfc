import React, { useMemo, useState } from 'react';
import type { GoalEvent, Player, TeamColor } from '@/types';
import { GoalModal } from '@/components/match/GoalModal';

const TEAMS: TeamColor[] = ['Preto', 'Verde', 'Cinza', 'Coletes'];

const mockPlayers: Player[] = [
  { id: 'p1', name: 'João', number: 9 },
  { id: 'p2', name: 'Maria', number: 10 },
  { id: 'p3', name: 'Ana', number: 7 },
  { id: 'p4', name: 'Carlos', number: 5 },
];

function formatMMSS(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export default function MatchPage() {
  const [events, setEvents] = useState<GoalEvent[]>([]);
  const [clock, setClock] = useState<number>(0); // segundos
  const [goalModal, setGoalModal] = useState<{ open: boolean; team: TeamColor }>({
    open: false,
    team: 'Preto',
  });

  // só para exemplo: avança 10s
  const tick10 = () => setClock((c) => c + 10);

  const abrirModal = (team: TeamColor) => setGoalModal({ open: true, team });
  const fecharModal = () => setGoalModal((m) => ({ ...m, open: false }));

  const confirmarGol = (author: Player, assist?: Player) => {
    const e: GoalEvent = {
      id: crypto.randomUUID?.() ?? `id_${Math.random().toString(36).slice(2)}`,
      scorerId: author.id,
      assistId: assist?.id,
      minute: Math.floor(clock / 60),
      createdAt: new Date().toISOString(),
      team: goalModal.team,
      authorName: author.name,
      assistName: assist?.name,
      ts: clock,
    };
    setEvents((prev) => [...prev, e]);
    fecharModal();
  };

  const ultimoGolDoTime = (team: TeamColor) => {
    const idx = [...events].reverse().findIndex((e) => e.team === team);
    if (idx === -1) return null;
    return [...events].reverse()[idx];
  };

  const placar = useMemo(() => {
    const score: Record<TeamColor, number> = {
      Preto: 0, Verde: 0, Cinza: 0, Coletes: 0,
      blue: 0, red: 0, green: 0, yellow: 0, purple: 0, orange: 0, gray: 0,
    };
    for (const e of events) {
      if (e.team) score[e.team] = (score[e.team] ?? 0) + 1;
    }
    return score;
  }, [events]);

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-xl font-semibold">Partida</h1>

      <div className="flex items-center gap-2">
        <button className="px-3 py-2 rounded bg-slate-600 text-white" onClick={tick10}>
          +10s
        </button>
        <div className="text-sm text-muted-foreground">Relógio: {formatMMSS(clock)}</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {TEAMS.map((t) => (
          <button
            key={t}
            onClick={() => abrirModal(t)}
            className="rounded-xl border p-3 hover:bg-muted/60 text-left"
          >
            <div className="font-semibold">{t}</div>
            <div className="text-sm text-muted-foreground">
              Gols: {placar[t] ?? 0}
              {ultimoGolDoTime(t) ? (
                <> — último: {formatMMSS(ultimoGolDoTime(t)!.ts ?? 0)}</>
              ) : null}
            </div>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <h2 className="font-semibold">Eventos</h2>
        {events.length === 0 ? (
          <div className="text-sm text-muted-foreground">Sem gols ainda.</div>
        ) : (
          <ul className="space-y-1">
            {events.map((e) => (
              <li key={e.id} className="text-sm">
                ⚽ <b>{e.authorName ?? e.scorerId}</b>
                {e.assistName ? <> (assist. {e.assistName})</> : null} — {e.team ?? '—'}
                <span className="text-muted-foreground"> — {formatMMSS(e.ts ?? 0)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <GoalModal
        open={goalModal.open}
        teamLabel={goalModal.team}
        onClose={fecharModal}
        players={mockPlayers}
        onConfirm={(author, assist) => confirmarGol(author, assist)}
      />
    </div>
  );
}
