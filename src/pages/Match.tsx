import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

type HistoryItem = {
  round: number;
  left: TeamColor;
  right: TeamColor;
  leftScore: number;
  rightScore: number;
  winner: TeamColor | 'Empate';
  ts: number;
};

const colorChip: Record<TeamColor, string> = {
  Preto: 'bg-zinc-900 text-white',
  Verde: 'bg-emerald-600 text-white',
  Cinza: 'bg-slate-400 text-zinc-900',
  Vermelho: 'bg-red-600 text-white',
};

const TeamBadge: React.FC<{ color: TeamColor }> = ({ color }) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorChip[color]}`}>
    {color}
  </span>
);

const userRole: 'owner' | 'admin' | 'aux' | 'mensalista' | 'diarista' = 'owner';
const canEdit = (role: typeof userRole) => ['owner','admin','aux'].includes(role);

const Match: React.FC = () => {
  const [queue] = useState<TeamColor[]>(['Preto', 'Verde', 'Cinza', 'Vermelho']);
  const [round, setRound] = useState<RoundState>(() => ({
    number: 1,
    inPlay: ['Preto', 'Verde'],
    scores: { Preto: 0, Verde: 0, Cinza: 0, Vermelho: 0 },
    running: false,
  }));

  const [duracaoMin, setDuracaoMin] = useState<number>(10);
  const [elapsed, setElapsed] = useState<number>(0);

  useEffect(() => {
    if (!round.running) return;
    const id = setInterval(() => {
      setElapsed((s) => s + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [round.running]);

  const target = duracaoMin * 60;
  const isOverTime = elapsed >= target;

  const mmss = useMemo(() => {
    const s = elapsed;
    const m = Math.floor(s / 60).toString().padStart(2,'0');
    const r = (s % 60).toString().padStart(2,'0');
    return `${m}:${r}`;
  }, [elapsed]);

  const [events, setEvents] = useState<GoalEvent[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const [goalOpen, setGoalOpen] = useState(false);
  const [goalTeam, setGoalTeam] = useState<TeamColor>('Preto');
  const [goalAuthor, setGoalAuthor] = useState('');
  const [goalAssist, setGoalAssist] = useState('');

  const openGoal = (team: TeamColor) => {
    setGoalTeam(team); setGoalAuthor(''); setGoalAssist('');
    setGoalOpen(true);
  };

  const saveGoal = () => {
    setRound((r) => ({ ...r, scores: { ...r.scores, [goalTeam]: (r.scores[goalTeam] ?? 0) + 1 } }));
    setEvents((ev) => [...ev, { id: crypto.randomUUID(), team: goalTeam, author: goalAuthor || undefined, assist: goalAssist || undefined, ts: Date.now() }]);
    setGoalOpen(false);
  };

  const removeGoal = (id: string) => {
    if (!canEdit(userRole)) return;
    const g = events.find(e => e.id === id);
    if (g) {
      setRound((r) => ({ ...r, scores: { ...r.scores, [g.team]: Math.max((r.scores[g.team] ?? 0) - 1, 0) } }));
    }
    setEvents((ev) => ev.filter(e => e.id !== id));
  };

  const [nextOpen, setNextOpen] = useState(false);
  const [nextCandidate, setNextCandidate] = useState<TeamColor | null>(null);

  const iniciar = () => setRound((r) => ({ ...r, running: true }));
  const pausar = () => setRound((r) => ({ ...r, running: false }));
  const recomeçar = () => { setElapsed(0); setRound((r)=>({ ...r, scores:{Preto:0,Verde:0,Cinza:0,Vermelho:0} })); };
  const encerrar = () => { setRound((r)=>({ ...r, running:false })); setNextOpen(true); };

  const confirmarProximoTime = () => {
    const [left, right] = round.inPlay;
    const l = round.scores[left] ?? 0;
    const r = round.scores[right] ?? 0;
    const winner: TeamColor | 'Empate' = l===r ? 'Empate' : (l>r ? left : right);

    setHistory((h) => [...h, { round: round.number, left, right, leftScore: l, rightScore: r, winner, ts: Date.now() }]);

    const stay: TeamColor = winner === 'Empate' ? left : (winner as TeamColor);
    const next = nextCandidate ?? (['Preto','Verde','Cinza','Vermelho'].find(t => t!==stay && t!==left && t!==right) || right);

    setElapsed(0);
    setRound((rd) => ({
      number: rd.number + 1,
      inPlay: [stay, next],
      scores: { Preto: 0, Verde: 0, Cinza: 0, Vermelho: 0 },
      running: false,
    }));
    setNextCandidate(null);
    setNextOpen(false);
  };

  const [left, right] = round.inPlay;
  const leftScore = round.scores[left] ?? 0;
  const rightScore = round.scores[right] ?? 0;
  const candidatos = ['Preto','Verde','Cinza','Vermelho'].filter(t => t !== left && t !== right) as TeamColor[];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-5">
      <header className="mb-3">
        <h1 className="text-2xl font-semibold">Partida ao Vivo</h1>
        <p className="text-sm text-zinc-500">Rodada {round.number}</p>
      </header>

      {/* Cronômetro */}
      <Card className="mb-3 rounded-2xl shadow-sm border">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col items-center gap-3">
            <div className={`text-5xl sm:text-6xl font-extrabold tabular-nums ${isOverTime ? 'text-red-600 animate-pulse' : ''}`}>
              {mmss}
            </div>

            <div className="flex items-center gap-2">
              <Label>Duração:</Label>
              <Select value={String(duracaoMin)} onValueChange={(v)=>setDuracaoMin(Number(v))} disabled={round.running}>
                <SelectTrigger className="w-[110px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[5,8,10,12,15].map(m => <SelectItem key={m} value={String(m)}>{m} min</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-2">
              {!round.running ? (
                <Button onClick={iniciar}>Iniciar</Button>
              ) : (
                <Button className="bg-amber-500" onClick={pausar}>Pausar</Button>
              )}
              <Button variant="outline" onClick={recomeçar}>Recomeçar</Button>
              <Button variant="secondary" onClick={encerrar}>Encerrar</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Match;
export { Match };
