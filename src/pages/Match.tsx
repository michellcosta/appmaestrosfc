import React, { useEffect, useMemo, useState } from 'react';

/**
 * Times fixos e imutáveis (sem "Coletes")
 */
export type TeamColor = 'Preto' | 'Verde' | 'Cinza' | 'Vermelho';

type Score = Record<TeamColor, number>;

type RoundState = {
  number: number;                  // rodada atual (1, 2, 3…)
  inPlay: [TeamColor, TeamColor];  // os 2 times em campo
  scores: Score;                   // placar da rodada
  running: boolean;                // cronômetro/rodada ativa?
};

/**
 * Estilos simples por cor
 */
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

/**
 * Página da partida mostrando APENAS os 2 times atuais.
 * Regra: vencedor permanece; próximo da fila entra.
 */
export default function Match() {
  // Fila inicial (ajuste se quiser outra ordem de começo)
  const [queue, setQueue] = useState<TeamColor[]>(['Preto', 'Verde', 'Cinza', 'Vermelho']);

  // Estado da rodada
  const [round, setRound] = useState<RoundState>(() => ({
    number: 1,
    inPlay: ['Preto', 'Verde'], // primeiros 2 entram
    scores: { Preto: 0, Verde: 0, Cinza: 0, Vermelho: 0 },
    running: false,
  }));

  // Timer simples (opcional). Você pode remover se já tiver o seu timer.
  const [seconds, setSeconds] = useState(10 * 60); // 10:00 padrão
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

  /**
   * Reseta placar da rodada e cronômetro, mantendo as equipes em campo.
   */
  const resetClockAndScore = () => {
    setSeconds(10 * 60);
    setRound((r) => ({
      ...r,
      scores: { Preto: 0, Verde: 0, Cinza: 0, Vermelho: 0 },
    }));
  };

  const startRound = () => {
    setRound((r) => ({ ...r, running: true }));
  };
  const pauseRound = () => {
    setRound((r) => ({ ...r, running: false }));
  };
  const endRound = () => {
    setRound((r) => ({ ...r, running: false }));
  };

  /**
   * Marcar gol para um time que está em campo
   */
  const goal = (team: TeamColor) => {
    if (!round.inPlay.includes(team)) return;
    setRound((r) => ({ ...r, scores: { ...r.scores, [team]: (r.scores[team] ?? 0) + 1 } }));
  };

  /**
   * Define vencedor da rodada:
   * - Se empate, abre modal para Cara/Coroa ou Roleta (aqui um prompt simples).
   * - Vencedor permanece; próximo da fila entra no lugar do perdedor.
   * - Avança numero da rodada e reseta placar/tempo.
   */
  const closeRoundAndRotate = () => {
    const [A, B] = round.inPlay;
    const a = round.scores[A] ?? 0;
    const b = round.scores[B] ?? 0;

    let winner: TeamColor;
    let loser: TeamColor;

    if (a === b) {
      // Empate → tie-break (placeholder). Substitua por modal com animação.
      const choice = window.prompt('Empate! Digite o vencedor (A ou B) ou "coin" para Cara/Coroa', 'coin');
      if (!choice || choice.toLowerCase() === 'coin') {
        // Cara/Coroa simplificada
        winner = Math.random() < 0.5 ? A : B;
        loser = winner === A ? B : A;
      } else if (choice.toUpperCase() === 'A') {
        winner = A;
        loser = B;
      } else if (choice.toUpperCase() === 'B') {
        winner = B;
        loser = A;
      } else {
        // fallback seguro
        winner = Math.random() < 0.5 ? A : B;
        loser = winner === A ? B : A;
      }
      // ✨ aqui no futuro: gravar tiebreaker_event(method='coin'|'wheel', result_team=winner)
    } else if (a > b) {
      winner = A;
      loser = B;
    } else {
      winner = B;
      loser = A;
    }

    // Remove da fila quem perdeu e coloca no fim; o vencedor permanece (ordem: [winner, next])
    setQueue((q) => {
      const withoutLoser = q.filter((t) => t !== loser);
      return [...withoutLoser, loser];
    });

    // Definir novo par em campo: vencedor + próximo da fila que NÃO seja o vencedor
    setRound((r) => {
      const currentQueue = getNextQueueAfterLoser(queue, loser); // snapshot aproximado
      const nextOpponent = currentQueue.find((t) => t !== winner) ?? pickNextOpponent(queue, winner);
      const nextPair: [TeamColor, TeamColor] = [winner, nextOpponent];

      return {
        number: r.number + 1,
        inPlay: nextPair,
        scores: { Preto: 0, Verde: 0, Cinza: 0, Vermelho: 0 },
        running: false,
      };
    });

    resetClockAndScore();
  };

  /**
   * Helpers para escolher o próximo adversário:
   * - getNextQueueAfterLoser: representa a fila *após* mover o perdedor para o fim
   * - pickNextOpponent: fallback para escolher alguém diferente do vencedor
   */
  const getNextQueueAfterLoser = (q: TeamColor[], loser: TeamColor) => {
    const without = q.filter((t) => t !== loser);
    return [...without, loser];
  };
  const pickNextOpponent = (q: TeamColor[], winner: TeamColor): TeamColor => {
    // procura o primeiro da fila que não seja o vencedor
    for (const t of q) if (t !== winner) return t;
    return q[0]; // nunca deve chegar aqui com 4 times
  };

  /**
   * Render
   */
  const [left, right] = round.inPlay;
  const leftScore = round.scores[left] ?? 0;
  const rightScore = round.scores[right] ?? 0;

  return (
    <div className="max-w-screen-sm mx-auto p-4">
      <header className="mb-4">
        <h1 className="text-xl font-semibold">Partida</h1>
        <p className="text-sm text-zinc-500">Rodada #{round.number} — apenas os 2 times em campo</p>
      </header>

      {/* Placar compacto para mobile */}
      <div className="grid grid-cols-3 items-center gap-3 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 p-3 mb-4">
        <div className="text-center">
          <TeamBadge color={left} />
          <div className="text-3xl font-bold mt-1">{leftScore}</div>
          <button
            className="mt-2 w-full rounded-lg border px-2 py-1 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
            onClick={() => goal(left)}
            disabled={!round.running}
          >
            + Gol
          </button>
        </div>

        <div className="text-center">
          <div className="text-4xl font-extrabold tabular-nums">{mmss}</div>
          <div className="mt-2 flex items-center justify-center gap-2">
            {!round.running ? (
              <button className="rounded-lg bg-emerald-600 text-white px-3 py-1 text-sm" onClick={startRound}>
                Start
              </button>
            ) : (
              <button className="rounded-lg bg-amber-500 text-white px-3 py-1 text-sm" onClick={pauseRound}>
                Pause
              </button>
            )}
            <button className="rounded-lg bg-zinc-200 dark:bg-zinc-700 px-3 py-1 text-sm" onClick={endRound}>
              End
            </button>
          </div>
        </div>

        <div className="text-center">
          <TeamBadge color={right} />
          <div className="text-3xl font-bold mt-1">{rightScore}</div>
          <button
            className="mt-2 w-full rounded-lg border px-2 py-1 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
            onClick={() => goal(right)}
            disabled={!round.running}
          >
            + Gol
          </button>
        </div>
      </div>

      {/* Ações de rodada */}
      <div className="flex items-center gap-2 mb-4">
        <button
          className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-3 py-2 text-sm"
          onClick={() => {
            setRound((r) => ({ ...r, scores: { Preto: 0, Verde: 0, Cinza: 0, Vermelho: 0 } }));
          }}
        >
          Zerar Placar
        </button>
        <button
          className="rounded-lg bg-blue-600 text-white px-3 py-2 text-sm"
          onClick={closeRoundAndRotate}
        >
          Encerrar Rodada → Rodízio
        </button>
      </div>

      {/* Fila (visual) */}
      <section className="rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 p-3">
        <h3 className="text-sm font-medium mb-2">Fila de Times</h3>
        <div className="flex flex-wrap gap-2">
          {queue.map((t) => (
            <TeamBadge key={t} color={t} />
          ))}
        </div>
        <p className="text-xs text-zinc-500 mt-2">
          Regra: o vencedor permanece; o perdedor vai para o fim da fila; entra o próximo contra o vencedor.
        </p>
      </section>
    </div>
  );
}
