import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

/** Times fixos (sem Coletes) */
export type TeamColor = 'Preto' | 'Verde' | 'Cinza' | 'Vermelho';

type Score = Record<TeamColor, number>;
type RoundState = {
  number: number;
  inPlay: [TeamColor, TeamColor];
  scores: Score;
  running: boolean;
};

type GoalEvent = {
  id: string;
  team: TeamColor;
  author?: string;
  assist?: string;
  ts: number;
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

/** Página da partida — 2 times em campo (mobile-first)
 * Regras atendidas:
 * - Botões: Iniciar / Encerrar / Recomeçar
 * - Encerrar = finaliza a partida atual e pergunta o próximo adversário; vencedor permanece
 * - +Gol abre modal para registrar autor e assistência (opcional), como no modelo anterior
 * - Fila preparada para vir do sorteio (drawTeams)
 */
const Match: React.FC = () => {
  // ======= FILA VINDO DO SORTEIO =======
  // TODO: quando ligar ao Supabase, substitua este estado por resultado de drawTeams (team_draw.teams)
  // e defina a ordem inicial conforme sorteio.
  const [queue, setQueue] = useState<TeamColor[]>(['Preto', 'Verde', 'Cinza', 'Vermelho']);

  // ======= ESTADO DA RODADA =======
  const [round, setRound] = useState<RoundState>(() => ({
    number: 1,
    inPlay: ['Preto', 'Verde'],
    scores: { Preto: 0, Verde: 0, Cinza: 0, Vermelho: 0 },
    running: false,
  }));

  // ======= TIMER 10:00 =======
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

  // ======= GOALS (LOG LOCAL) =======
  const [events, setEvents] = useState<GoalEvent[]>([]);

  // ======= MODAL: Registrar Gol =======
  const [goalOpen, setGoalOpen] = useState(false);
  const [goalTeam, setGoalTeam] = useState<TeamColor>('Preto');
  const [goalAuthor, setGoalAuthor] = useState('');
  const [goalAssist, setGoalAssist] = useState('');

  const openGoalModal = (team: TeamColor) => {
    setGoalTeam(team);
    setGoalAuthor('');
    setGoalAssist('');
    setGoalOpen(true);
  };

  const submitGoal = () => {
    // incrementa o placar do time selecionado
    setRound((r) => ({ ...r, scores: { ...r.scores, [goalTeam]: (r.scores[goalTeam] ?? 0) + 1 } }));
    // log local (futuro: persistir em events)
    setEvents((ev) => [
      ...ev,
      { id: crypto.randomUUID(), team: goalTeam, author: goalAuthor || undefined, assist: goalAssist || undefined, ts: Date.now() },
    ]);
    setGoalOpen(false);
  };

  // ======= MODAL: Escolher próximo time ao Encerrar =======
  const [nextOpen, setNextOpen] = useState(false);
  const [nextCandidate, setNextCandidate] = useState<TeamColor | null>(null);

  // ======= AÇÕES =======
  const iniciar = () => setRound((r) => ({ ...r, running: true }));
  const pausar = () => setRound((r) => ({ ...r, running: false }));

  const recomeçar = () => {
    // recomeça o mesmo jogo/rodada: zera apenas o placar e o tempo
    setRound((r) => ({
      ...r,
      scores: { Preto: 0, Verde: 0, Cinza: 0, Vermelho: 0 },
    }));
    setSeconds(10 * 60);
  };

  const encerrar = () => {
    // encerra a partida atual e abre o seletor de próximo time (vencedor permanece)
    setRound((r) => ({ ...r, running: false }));
    setNextOpen(true);
  };

  // Ao confirmar o próximo time:
  const confirmarProximoTime = () => {
    if (!nextCandidate) return;
    const [A, B] = round.inPlay;
    const a = round.scores[A] ?? 0;
    const b = round.scores[B] ?? 0;
    const winner: TeamColor = a === b ? (Math.random() < 0.5 ? A : B) : (a > b ? A : B);

    // monta nova fila (mantém ordem do sorteio, removendo quem perdeu — que será escolhido manualmente — é opcional)
    // aqui não mexemos na fila, pois o operador escolheu manualmente o próximo time
    const nextPair: [TeamColor, TeamColor] = [winner, nextCandidate];

    setRound((r) => ({
      number: r.number + 1,
      inPlay: nextPair,
      scores: { Preto: 0, Verde: 0, Cinza: 0, Vermelho: 0 },
      running: false,
    }));
    setSeconds(10 * 60);
    setNextOpen(false);
    setNextCandidate(null);
  };

  // ======= HELPERS UI =======
  const [left, right] = round.inPlay;
  const leftScore = round.scores[left] ?? 0;
  const rightScore = round.scores[right] ?? 0;

  const candidatos = queue.filter((t) => t !== left && t !== right); // fora os que já estão em campo

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-5">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Partida</h1>
        <p className="text-sm text-zinc-500">Rodada #{round.number} — apenas os 2 times em campo</p>
      </header>

      {/* Placar */}
      <Card className="rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 mb-4">
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-3 items-center gap-3">
            <div className="text-center">
              <TeamBadge color={left} />
              <div className="text-4xl sm:text-5xl font-bold mt-1 tabular-nums">{leftScore}</div>
              <Button
                variant="outline"
                className="mt-2 w-full"
                onClick={() => openGoalModal(left)}
                disabled={!round.running}
              >
                + Gol
              </Button>
            </div>

            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-extrabold tabular-nums">{mmss}</div>
              <div className="mt-3 flex items-center justify-center gap-2">
                {!round.running ? (
                  <Button className="px-4" onClick={iniciar}>Iniciar</Button>
                ) : (
                  <Button className="px-4 bg-amber-500 hover:bg-amber-500/90" onClick={pausar}>
                    Pausar
                  </Button>
                )}
                <Button variant="secondary" className="px-4" onClick={encerrar}>Encerrar</Button>
              </div>
            </div>

            <div className="text-center">
              <TeamBadge color={right} />
              <div className="text-4xl sm:text-5xl font-bold mt-1 tabular-nums">{rightScore}</div>
              <Button
                variant="outline"
                className="mt-2 w-full"
                onClick={() => openGoalModal(right)}
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
        <Button variant="outline" onClick={recomeçar}>Recomeçar</Button>
        {/* Botão "Encerrar Rodada → Rodízio" removido conforme pedido */}
      </div>

      {/* Fila (apenas visual; origem será drawTeams) */}
      <Card className="rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
        <CardContent className="p-4 sm:p-5">
          <h3 className="text-sm font-medium mb-2">Fila de Times (sorteio)</h3>
          <div className="flex flex-wrap gap-2">
            {queue.map((t) => <TeamBadge key={t} color={t} />)}
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            Em breve: esta ordem virá do sorteio (drawTeams). O vencedor permanece; o próximo adversário é escolhido ao encerrar.
          </p>
        </CardContent>
      </Card>

      {/* ===== MODAL Registrar Gol (time + autor + assistência) ===== */}
      <Dialog open={goalOpen} onOpenChange={setGoalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Gol</DialogTitle>
            <DialogDescription>Informe o autor e (opcional) a assistência.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="text-sm">
              <span className="mr-2">Time:</span>
              <TeamBadge color={goalTeam} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="author">Autor do gol</Label>
              <Input id="author" placeholder="ex.: João #9" value={goalAuthor} onChange={(e) => setGoalAuthor(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="assist">Assistência (opcional)</Label>
              <Input id="assist" placeholder="ex.: Pedro #10" value={goalAssist} onChange={(e) => setGoalAssist(e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setGoalOpen(false)}>Cancelar</Button>
            <Button onClick={submitGoal}>Salvar Gol</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== MODAL Próximo Adversário ao Encerrar ===== */}
      <Dialog open={nextOpen} onOpenChange={setNextOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escolher próximo time</DialogTitle>
            <DialogDescription>Selecione quem enfrenta o vencedor.</DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <div className="text-sm text-zinc-600">Vencedor permanece em campo.</div>
            <div className="flex flex-wrap gap-2">
              {candidatos.length === 0 && <span className="text-sm text-zinc-500">Sem candidatos (verifique a fila).</span>}
              {candidatos.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setNextCandidate(t)}
                  className={`px-3 py-1 rounded-full text-sm border ${nextCandidate === t ? 'ring-2 ring-blue-500' : ''} ${colorChip[t].replace('text-white','text-white')}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setNextOpen(false)}>Cancelar</Button>
            <Button disabled={!nextCandidate} onClick={confirmarProximoTime}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log simples de gols (debug visual) */}
      {events.length > 0 && (
        <div className="mt-4 text-sm text-zinc-600">
          <div className="font-medium mb-1">Gols registrados</div>
          <ul className="list-disc ml-5 space-y-1">
            {events.map((e) => (
              <li key={e.id}>
                <b>{e.team}</b> — {e.author || 'Autor não informado'}
                {e.assist ? ` (assistência: ${e.assist})` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Match;
// named export para compatibilidade com import { Match }
export { Match };
