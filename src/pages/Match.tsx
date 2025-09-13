import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/** Times fixos (sem Coletes) */
export type TeamColor = 'Preto' | 'Verde' | 'Cinza' | 'Vermelho';

type Score = Record<TeamColor, number>;
type RoundState = {
  number: number;
  inPlay: [TeamColor, TeamColor];
  scores: Score;
  running: boolean;
};

/** Chips por cor (cores do app) */
const colorChip: Record<TeamColor, string> = {
  Preto: 'bg-zinc-900 text-white',
  Verde: 'bg-emerald-600 text-white',
  Cinza: 'bg-slate-400 text-zinc-900',
  Vermelho: 'bg-red-600 text-white',
};

const TeamBadge: React.FC<{ color: TeamColor; className?: string }> = ({ color, className }) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorChip[color]} ${className ?? ''}`}>
    {color}
  </span>
);

/** Página da partida — mostra apenas 2 times em campo (mobile-first)
 * Regra: vencedor permanece; perdedor vai para o fim da fila; entra o próximo.
 */
const Match: React.FC = () => {
  // fila inicial
  const [queue, setQueue] = useState<TeamColor[]>(['Preto', 'Verde', 'Cinza', 'Vermelho']);

  // estado da rodada
  const [round, setRound] = useState<RoundState>(() => ({
    number: 1,
    inPlay: ['Preto', 'Verde'],
    scores: { Preto: 0, Verde: 0, Cinza: 0, Vermelho: 0 },
    running: false,
  }));

  // timer 10:00 padrão
  const [seconds, setSeconds] = useState(10 * 60);
  useEffect(() => {
    if (!round.running) return;
    const id = setInterval(() => setSeconds((s) => Math.max(s - 1, 0)), 1000);
    return () => clearInterval(id);
  }, [round.running]);

  const mmss = useMemo(() => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }, [seconds]);

  const startRound = () => setRound((r) => ({ ...r, running: true }));
  const pauseRound = () => setRound((r) => ({ ...r, running: false }));
  const endRound = () => setRound((r) => ({ ...r, running: false }));
  const resetScore = () =>
    setRound((r) => ({ ...r, scores: { Preto: 0, Verde: 0, Cinza: 0, Vermelho: 0 } }));

  const goal = (team: TeamColor) => {
    if (!round.inPlay.includes(team)) return;
    setRound((r) => ({ ...r, scores: { ...r.scores, [team]: (r.scores[team] ?? 0) + 1 } }));
  };

  const getNextQueueAfterLoser = (q: TeamColor[], loser: TeamColor) => {
    const without = q.filter((t) => t !== loser);
    return [...without, loser];
  };
  const pickNextOpponent = (q: TeamColor[], winner: TeamColor): TeamColor => {
    for (const t of q) if (t !== winner) return t;
    return q[0];
  };

  /** Encerrar rodada + rodízio */
  const closeRoundAndRotate = () => {
    const [A, B] = round.inPlay;
    const a = round.scores[A] ?? 0;
    const b = round.scores[B] ?? 0;

    let winner: TeamColor;
    let loser: TeamColor;

    if (a === b) {
      // placeholder: cara/coroa simples (trocaremos por modal animado)
      const choice = window.prompt('Empate! Digite A ou B (ou "coin" p/ Cara/Coroa):', 'coin');
      if (!choice || choice.toLowerCase() === 'coin') {
        winner = Math.random() < 0.5 ? A : B;
        loser = winner === A ? B : A;
      } else if (choice.toUpperCase() === 'A') {
        winner = A; loser = B;
      } else if (choice.toUpperCase() === 'B') {
        winner = B; loser = A;
      } else {
        winner = Math.random() < 0.5 ? A : B;
        loser = winner === A ? B : A;
      }
      // futuro: gravar tiebreaker_event(method, result_team)
    } else if (a > b) {
      winner = A; loser = B;
    } else {
      winner = B; loser = A;
    }

    // atualiza fila (perdedor vai pro fim)
    setQueue((q) => {
      const withoutLoser = q.filter((t) => t !== loser);
      return [...withoutLoser, loser];
    });

    // define novo par (winner + próximo da fila ≠ winner)
    setRound((r) => {
      const currentQueue = getNextQueueAfterLoser(queue, loser);
      const nextOpponent = currentQueue.find((t) => t !== winner) ?? pickNextOpponent(queue, winner);
      return {
        number: r.number + 1,
        inPlay: [winner, nextOpponent],
        scores: { Preto: 0, Verde: 0, Cinza: 0, Vermelho: 0 },
        running: false,
      };
    });

    // reseta tempo/placar
    setSeconds(10 * 60);
    resetScore();
  };

  const [left, right] = round.inPlay;
  const leftScore = round.scores[left] ?? 0;
  const rightScore = round.scores[right] ?? 0;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-5">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Partida</h1>
        <p className="text-sm text-zinc-500">Rodada #{round.number} — apenas os 2 times em campo</p>
      </header>

      {/* Placar (Card shadcn, cantos 2xl, sombra suave) */}
      <Card className="rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 mb-4">
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-3 items-center gap-3">
            <div className="text-center">
              <TeamBadge color={left} />
              <div className="text-4xl sm:text-5xl font-bold mt-1 tabular-nums">{leftScore}</div>
              <Button
                variant="outline"
                className="mt-2 w-full"
                onClick={() => goal(left)}
                disabled={!round.running}
              >
                + Gol
              </Button>
            </div>

            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-extrabold tabular-nums">{mmss}</div>
              <div className="mt-3 flex items-center justify-center gap-2">
                {!round.running ? (
                  <Button className="px-4" onClick={startRound}>Start</Button>
                ) : (
                  <Button className="px-4 bg-amber-500 hover:bg-amber-500/90" onClick={pauseRound}>
                    Pause
                  </Button>
                )}
                <Button variant="secondary" className="px-4" onClick={endRound}>End</Button>
              </div>
            </div>

            <div className="text-center">
              <TeamBadge color={right} />
              <div className="text-4xl sm:text-5xl font-bold mt-1 tabular-nums">{rightScore}</div>
              <Button
                variant="outline"
                className="mt-2 w-full"
                onClick={() => goal(right)}
                disabled={!round.running}
              >
                + Gol
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Button variant="outline" onClick={resetScore}>Zerar Placar</Button>
        <Button className="bg-blue-600 hover:bg-blue-600/90" onClick={closeRoundAndRotate}>
          Encerrar Rodada → Rodízio
        </Button>
      </div>

      {/* Fila (Card shadcn) */}
      <Card className="rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
        <CardContent className="p-4 sm:p-5">
          <h3 className="text-sm font-medium mb-2">Fila de Times</h3>
          <div className="flex flex-wrap gap-2">
            {queue.map((t) => <TeamBadge key={t} color={t} />)}
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            Regra: o vencedor permanece; o perdedor vai para o fim da fila; entra o próximo contra o vencedor.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Match;
// named export para compatibilidade com import { Match }
export { Match };
