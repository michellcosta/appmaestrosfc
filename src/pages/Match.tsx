import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy } from 'lucide-react';

// UUID seguro (fallback p/ navegadores sem crypto.randomUUID)
function uuidv4(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    // @ts-ignore
    return (crypto as any).randomUUID();
  }
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && (crypto as any).getRandomValues) {
    (crypto as any).getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random()*256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant
  const h = Array.from(bytes).map(b => b.toString(16).padStart(2,"0")).join("");
  return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
}


export type TeamColor = 'Preto' | 'Verde' | 'Cinza' | 'Vermelho';
type FilterRange = 'week' | 'month' | 'all';

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
  author: string | null;
  assist: string | null;
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

/** Chips por cor */
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

/** Permissões locais (trocar por Auth real depois) */
const userRole: 'owner' | 'admin' | 'aux' | 'mensalista' | 'diarista' = 'owner';
const canEdit = (role: typeof userRole) => ['owner','admin','aux'].includes(role);

/** MOCK do sorteio: jogadores por time (nomes de teste) */
const defaultTeamPlayers: Record<TeamColor, string[]> = {
  Preto:    ['Michell', 'Thiago'],
  Verde:    ['Sérgio Jr', 'Oton'],
  Cinza:    ['Jorge', 'Yuri'],
  Vermelho: ['Maurício', 'Gabriel'],
};

const Match: React.FC = () => {
  const [teamPlayers] = useState<Record<TeamColor, string[]>>(defaultTeamPlayers);

  // estado da rodada
  const [round, setRound] = useState<RoundState>(() => ({
    number: 1,
    inPlay: ['Preto', 'Verde'],
    scores: { Preto: 0, Verde: 0, Cinza: 0, Vermelho: 0 },
    running: false,
  }));

  // ===== Timer MM:SS =====
  const [duracaoMin, setDuracaoMin] = useState<number>(10);
  const [elapsed, setElapsed] = useState<number>(0); // segundos
  useEffect(() => {
    if (!round.running) return;
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [round.running]);

  const target = duracaoMin * 60;
  const isOverTime = elapsed >= target;
  const mmss = useMemo(() => {
    const m = Math.floor(elapsed / 60).toString().padStart(2,'0');
    const s = (elapsed % 60).toString().padStart(2,'0');
    return `${m}:${s}`;
  }, [elapsed]);

  // ===== Gols / Histórico =====
  const [events, setEvents] = useState<GoalEvent[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyFilter, setHistoryFilter] = useState<FilterRange>('week');

  // modal de gol
  const [goalOpen, setGoalOpen] = useState(false);
  const [goalTeam, setGoalTeam] = useState<TeamColor>('Preto');
  const [goalAuthor, setGoalAuthor] = useState<string>('');  // sem pré-seleção
  const [goalAssist, setGoalAssist] = useState<string>('');
  const playerOptions = (team: TeamColor) => (teamPlayers && teamPlayers[team]) ? teamPlayers[team] : [];



  const openGoal = (team: TeamColor) => {
    setGoalTeam(team);
    setGoalAuthor('');   // não preenche autor automaticamente
    setGoalAssist('');
    setGoalOpen(true);
  };
  const saveGoal = () => {
    // exige autor
    if (!goalAuthor) return;
    setRound((r) => ({ ...r, scores: { ...r.scores, [goalTeam]: (r.scores[goalTeam] ?? 0) + 1 } }));
    setEvents((ev) => [...ev, { id: uuidv4(), team: goalTeam, author: goalAuthor || null, assist: goalAssist || null, ts: Date.now() }]);
    setGoalOpen(false);
  };
  const editGoal = (id: string, author: string | null, assist: string | null) => {
    if (!canEdit(userRole)) return;
    setEvents((ev) => ev.map((e) => (e.id === id ? { ...e, author, assist } : e)));
  };
  const removeGoal = (id: string) => {
    if (!canEdit(userRole)) return;
    const g = events.find((e) => e.id === id);
    if (g) setRound((r) => ({ ...r, scores: { ...r.scores, [g.team]: Math.max((r.scores[g.team] ?? 0) - 1, 0) } }));
    setEvents((ev) => ev.filter((e) => e.id !== id));
  };

  // encerrar → histórico + escolher próximo
  const [nextOpen, setNextOpen] = useState(false);
  const [nextCandidate, setNextCandidate] = useState<TeamColor | null>(null);

  const iniciar   = () => setRound((r)=>({ ...r, running:true }));
  const pausar    = () => setRound((r)=>({ ...r, running:false }));
  const recomeçar = () => { setRound((r)=>({ ...r, scores:{Preto:0,Verde:0,Cinza:0,Vermelho:0} })); setElapsed(0); };
  const encerrar  = () => { setRound((r)=>({ ...r, running:false })); setNextOpen(true); };

  const confirmarProximoTime = () => {
    const [left, right] = round.inPlay;
    const l = round.scores[left] ?? 0;
    const r = round.scores[right] ?? 0;
    const winner: TeamColor | 'Empate' = l===r ? 'Empate' : (l>r ? left : right);

    // histórico
    setHistory((h)=>[...h, { round: round.number, left, right, leftScore: l, rightScore: r, winner, ts: Date.now() }]);

    // próximo duelo
    const stay: TeamColor = winner === 'Empate' ? left : (winner as TeamColor);
    const next = nextCandidate ?? (['Preto','Verde','Cinza','Vermelho'].find(t => t!==stay && t!==left && t!==right) || right);

    // reset
    setElapsed(0);
    setRound((rd)=>({
      number: rd.number + 1,
      inPlay: [stay, next],
      scores: { Preto:0, Verde:0, Cinza:0, Vermelho:0 },
      running: false,
    }));
    setNextCandidate(null);
    setNextOpen(false);
  };

  // helpers
  const [left, right] = round.inPlay;
  const leftScore  = round.scores[left]  ?? 0;
  const rightScore = round.scores[right] ?? 0;
  const candidatos = (['Preto','Verde','Cinza','Vermelho'] as TeamColor[]).filter(t => t !== left && t !== right);

  // estatísticas da sessão
  const stats = useMemo(() => {
    const map = new Map<string, { g:number; a:number }>();
    for (const e of events) {
      if (e.author) { const cur = map.get(e.author) ?? {g:0,a:0}; cur.g += 1; map.set(e.author, cur); }
      if (e.assist) { const cur = map.get(e.assist) ?? {g:0,a:0}; cur.a += 1; map.set(e.assist, cur); }
    }
    return Array.from(map.entries()).map(([name, {g,a}]) => ({ name, g, a }))
      .sort((x,y)=> y.g - x.g || y.a - x.a);
  }, [events]);

  // filtro do histórico
  const filteredHistory = useMemo(() => {
    if (historyFilter === 'all') return history;
    const now = new Date();
    return history.filter((h) => {
      const d = new Date(h.ts);
      if (historyFilter === 'week') {
        const diff = (now.getTime() - d.getTime()) / (1000*60*60*24);
        return diff <= 7;
      }
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }, [history, historyFilter]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-5">
      <header className="mb-3">
        <h1 className="text-2xl font-semibold">Partida ao Vivo</h1>
        <p className="text-sm text-zinc-500">Rodada {round.number}</p>
      </header>

      {/* Cronômetro */}
      <Card className="mb-3 rounded-2xl border border-zinc-200 shadow-sm dark:border-zinc-800">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col items-center gap-3">
            <div className={`text-5xl sm:text-6xl font-extrabold tabular-nums ${isOverTime ? 'text-red-600 motion-safe:animate-pulse [animation-duration:500ms]' : ''}`}>
              {mmss}
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-sm text-zinc-600">Duração:</Label>
              <Select value={String(duracaoMin)} onValueChange={(v)=>setDuracaoMin(Number(v))} disabled={round.running}>
                <SelectTrigger className="w-[110px]"><SelectValue placeholder="Minutos" /></SelectTrigger>
                <SelectContent>
                  {[5,8,10,12,15].map(m => <SelectItem key={m} value={String(m)}>{m} min</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {!round.running ? (
                <Button type="button" onClick={iniciar}>Iniciar</Button>
              ) : (
                <Button type="button" className="bg-amber-500 hover:bg-amber-500/90" onClick={pausar}>Pausar</Button>
              )}
              <Button type="button" variant="outline" onClick={recomeçar}>Recomeçar</Button>
              <Button type="button" variant="secondary" onClick={encerrar}>Encerrar</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Placar (2 times) */}
      <Card className="rounded-2xl border border-zinc-200 shadow-sm dark:border-zinc-800 mb-3">
        <CardContent className="p-4 sm:p-5">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
            <Trophy className="h-4 w-4 text-emerald-600" /> Placar
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {[round.inPlay[0], round.inPlay[1]].map((team)=>(
              <div key={team} className="flex items-center justify-between gap-2 rounded-xl border px-3 py-2">
                <div className="flex items-center gap-2">
                  <TeamBadge color={team} />
                  <span className="text-sm">{team}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold tabular-nums">{round.scores[team] ?? 0}</span>
                  {/* Só permite registrar gol quando a rodada está em andamento */}
                  <Button type="button" variant="outline" size="sm" onClick={()=>openGoal(team)} disabled={!round.running}>+</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gols recentes */}
      <Card className="rounded-2xl border border-zinc-200 shadow-sm dark:border-zinc-800 mb-3">
        <CardContent className="p-4 sm:p-5">
          <h3 className="text-sm font-semibold mb-2">Gols recentes</h3>
          {events.length === 0 ? (
            <p className="text-sm text-zinc-500">Nenhum gol registrado ainda.</p>
          ) : (
            <ul className="space-y-2">
              {events.slice().reverse().map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2">
                  <div className="flex items-center gap-2">
                    <TeamBadge color={e.team} />
                    <div className="text-sm">
                      <div><strong>{e.author ?? 'Autor não informado'}</strong></div>
                      {e.assist && <div className="text-xs text-zinc-500">assistência: {e.assist}</div>}
                    </div>
                  </div>
                  {canEdit(userRole) && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline" size="sm"
                        onClick={() => {
                          const author = prompt('Autor do gol:', e.author ?? '') || '';
                          const assist = prompt('Assistência (opcional):', e.assist ?? '') || '';
                          editGoal(e.id, author || null, assist || null);
                        }}
                      >
                        Editar
                      </Button>
                      <Button type="button" variant="secondary" size="sm" onClick={() => removeGoal(e.id)}>Excluir</Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas (sessão) */}
      <Card className="rounded-2xl border border-zinc-200 shadow-sm dark:border-zinc-800 mb-3">
        <CardContent className="p-4 sm:p-5">
          <h3 className="text-sm font-semibold mb-2">Estatísticas dos jogadores (sessão)</h3>
          {events.length === 0 ? (
            <p className="text-sm text-zinc-500">Sem registros ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-zinc-500">
                  <tr>
                    <th className="text-left py-1">Jogador</th>
                    <th className="text-right py-1">G</th>
                    <th className="text-right py-1">A</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from(new Map(events.flatMap(e => [
                    e.author ? [[e.author, { g:1, a:0 }]] : [],
                    e.assist ? [[e.assist, { g:0, a:1 }]] : [],
                  ]).map).entries())
                    .reduce((acc:any, [name, val]: any) => {
                      const cur = acc.get(name) ?? { name, g:0, a:0 };
                      return acc.set(name, { name, g: cur.g + (val.g || 0), a: cur.a + (val.a || 0) });
                    }, new Map())
                  }
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs — Semana / Mês / Todos (igual Ranking/Financeiro) */}
      <Card className="rounded-2xl border border-zinc-200 shadow-sm dark:border-zinc-800 mb-3">
        <CardContent className="p-2 sm:p-3">
          <Tabs value={historyFilter} onValueChange={(v)=>setHistoryFilter(v as FilterRange)}>
            <TabsList className="grid grid-cols-3 w-full rounded-xl">
              <TabsTrigger value="week"  className="rounded-xl">Semana</TabsTrigger>
              <TabsTrigger value="month" className="rounded-xl">Mês</TabsTrigger>
              <TabsTrigger value="all"   className="rounded-xl">Todos</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Histórico de Partidas — maior e destacado */}
      <Card className="rounded-2xl border border-zinc-200 shadow-sm dark:border-zinc-800">
        <CardContent className="p-5 sm:p-7">
          <h3 className="text-base sm:text-lg font-semibold mb-3">Histórico de Partidas</h3>
          {filteredHistory.length === 0 ? (
            <p className="text-sm text-zinc-500">Sem registros ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[0.95rem]">
                <thead className="text-zinc-500">
                  <tr>
                    <th className="text-left py-2">Rodada</th>
                    <th className="text-left py-2">Duelo</th>
                    <th className="text-right py-2">Placar</th>
                    <th className="text-right py-2">Vencedor</th>
                    <th className="text-right py-2">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((h) => (
                    <tr key={h.round + '-' + h.ts} className="border-t">
                      <td className="py-2">#{h.round}</td>
                      <td className="py-2">{h.left} vs {h.right}</td>
                      <td className="py-2 text-right">{h.leftScore} - {h.rightScore}</td>
                      <td className="py-2 text-right">{h.winner}</td>
                      <td className="py-2 text-right">{new Date(h.ts).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal: Registrar Gol */}
      <Dialog open={goalOpen} onOpenChange={setGoalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Gol</DialogTitle>
            <DialogDescription>Selecione o autor e (opcional) a assistência do time.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="text-sm"><span className="mr-2">Time:</span><TeamBadge color={goalTeam} /></div>

            <div className="grid gap-2">
              <Label>Autor do gol</Label>
              <Select value={goalAuthor || undefined} onValueChange={setGoalAuthor}>
                <SelectTrigger><SelectValue placeholder="Selecione o autor" /></SelectTrigger>
                <SelectContent>
                  {playerOptions(goalTeam).map((p)=>(
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Assistência (opcional)</Label>
              <Select value={goalAssist || undefined} onValueChange={setGoalAssist}>
                <SelectTrigger><SelectValue placeholder="Selecione (opcional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma</SelectItem>
                  {playerOptions(goalTeam).map((p)=>(
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={()=>setGoalOpen(false)}>Cancelar</Button>
            <Button type="button" disabled={!goalAuthor} onClick={saveGoal}>Salvar Gol</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Próximo adversário ao Encerrar */}
      <Dialog open={nextOpen} onOpenChange={setNextOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escolher próximo time</DialogTitle>
            <DialogDescription>Vencedor permanece. Selecione o adversário da próxima rodada.</DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <div className="text-sm text-zinc-600">Candidatos:</div>
            <div className="flex flex-wrap gap-2">
              {candidatos.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={()=>setNextCandidate(t)}
                  className={`px-3 py-1 rounded-full text-sm border ${nextCandidate===t ? 'ring-2 ring-blue-500' : ''} ${colorChip[t]}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={()=>setNextOpen(false)}>Cancelar</Button>
            <Button type="button" disabled={!nextCandidate} onClick={confirmarProximoTime}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Match;
export { Match };
