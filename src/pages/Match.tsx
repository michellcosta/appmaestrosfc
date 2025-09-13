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
  author: string;
  assist: string | null; // opcional
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
const TeamBadge: React.FC<{ color: TeamColor; className?: string }> = ({ color, className }) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorChip[color]} ${className ?? ''}`}>
    {color}
  </span>
);

// permissões locais mock
const userRole: 'owner' | 'admin' | 'aux' | 'mensalista' | 'diarista' = 'owner';
const canEdit = (role: typeof userRole) => ['owner','admin','aux'].includes(role);

// jogadores mock por time
const defaultTeamPlayers: Record<TeamColor, string[]> = {
  Preto:    ['Michell', 'Thiago'],
  Verde:    ['Sérgio Jr', 'Oton'],
  Cinza:    ['Jorge', 'Yuri'],
  Vermelho: ['Maurício', 'Gabriel'],
};

// uuid v4 estável
function uuidv4(): string {
  // @ts-ignore
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  const b = new Uint8Array(16);
  // @ts-ignore
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(b);
  else for (let i=0;i<16;i++) b[i]=Math.floor(Math.random()*256);
  b[6]=(b[6]&0x0f)|0x40; b[8]=(b[8]&0x3f)|0x80;
  const h=Array.from(b).map(x=>x.toString(16).padStart(2,'0')).join('');
  return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
}

const Match: React.FC = () => {
  const [teamPlayers] = useState<Record<TeamColor, string[]>>(defaultTeamPlayers);

  const [round, setRound] = useState<RoundState>(() => ({
    number: 1,
    inPlay: ['Preto', 'Verde'],
    scores: { Preto: 0, Verde: 0, Cinza: 0, Vermelho: 0 },
    running: false,
  }));

  // timer mm:ss
  const [duracaoMin, setDuracaoMin] = useState<number>(10);
  const [elapsed, setElapsed] = useState<number>(0);
  useEffect(() => {
    if (!round.running) return;
    const id = setInterval(() => setElapsed(s => s+1), 1000);
    return () => clearInterval(id);
  }, [round.running]);
  const alvo = duracaoMin * 60;
  const atrasado = elapsed >= alvo;
  const mmss = useMemo(()=>{
    const m = Math.floor(elapsed/60).toString().padStart(2,'0');
    const s = (elapsed%60).toString().padStart(2,'0');
    return `${m}:${s}`;
  },[elapsed]);

  // eventos / histórico
  const [events, setEvents] = useState<GoalEvent[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyFilter, setHistoryFilter] = useState<FilterRange>('week');

  // modal gol (assistência opcional, sem autoassistência)
  const [goalOpen, setGoalOpen] = useState(false);
  const [goalTeam, setGoalTeam] = useState<TeamColor>('Preto');
  const [goalAuthor, setGoalAuthor] = useState<string>('');          // controlado
  const [goalAssist, setGoalAssist] = useState<string>('__none__');  // "__none__" = sem assistência (evita value="")

  const playerOptions = (team: TeamColor) => (teamPlayers?.[team]) ? teamPlayers[team] : [];

  const openGoal = (team: TeamColor) => {
    if (!round.running) return; // respeita regra
    setGoalTeam(team);
    const first = playerOptions(team)[0] ?? '';
    setGoalAuthor(first);           // autor pré-selecionado
    setGoalAssist('__none__');      // padrão = sem assistência
    setGoalOpen(true);
  };

  // se o autor mudar e a assistência for igual ao autor, força voltar para "sem assistência"
  useEffect(() => {
    if (!goalOpen) return;
    if (goalAssist !== '__none__' && goalAssist === goalAuthor) {
      setGoalAssist('__none__');
    }
  }, [goalAuthor, goalAssist, goalOpen]);

  const saveGoal = () => {
    if (!goalAuthor) return; // autor obrigatório
    const assistVal = goalAssist === '__none__' ? null : goalAssist;
    setRound(r => ({ ...r, scores: { ...r.scores, [goalTeam]: (r.scores[goalTeam] ?? 0) + 1 } }));
    setEvents(ev => [...ev, { id: uuidv4(), team: goalTeam, author: goalAuthor, assist: assistVal, ts: Date.now() }]);
    setGoalOpen(false);
  };

  const editGoal = (id: string, author: string, assist: string | null) => {
    if (!canEdit(userRole)) return;
    if (!author) return;
    // impede autoassistência no editar também
    const fixedAssist = assist && assist === author ? null : assist;
    setEvents(ev => ev.map(e => e.id===id ? { ...e, author, assist: fixedAssist } : e));
  };
  const removeGoal = (id: string) => {
    if (!canEdit(userRole)) return;
    const g = events.find(e=>e.id===id);
    if (g) setRound(r => ({ ...r, scores: { ...r.scores, [g.team]: Math.max((r.scores[g.team] ?? 0) - 1, 0) } }));
    setEvents(ev => ev.filter(e => e.id!==id));
  };

  // encerrar → histórico + próximo
  const [nextOpen, setNextOpen] = useState(false);
  const [nextCandidate, setNextCandidate] = useState<TeamColor | null>(null);

  const iniciar   = () => setRound(r=>({ ...r, running: true }));
  const pausar    = () => setRound(r=>({ ...r, running: false }));
  const recomeçar = () => { setRound(r=>({ ...r, scores:{Preto:0,Verde:0,Cinza:0,Vermelho:0} })); setElapsed(0); };
  const encerrar  = () => { setRound(r=>({ ...r, running: false })); setNextOpen(true); };

  const confirmarProximoTime = () => {
    const [left, right] = round.inPlay;
    const l = round.scores[left] ?? 0;
    const r = round.scores[right] ?? 0;
    const winner: TeamColor | 'Empate' = l===r ? 'Empate' : (l>r ? left : right);

    setHistory(h=>[...h, { round: round.number, left, right, leftScore: l, rightScore: r, winner, ts: Date.now() }]);

    const stay: TeamColor = winner === 'Empate' ? left : winner as TeamColor;
    const candidatos = (['Preto','Verde','Cinza','Vermelho'] as TeamColor[]).filter(t => t !== stay && t !== left && t !== right);
    const next = nextCandidate ?? (candidatos[0] ?? right);

    setElapsed(0);
    setRound(rd=>({
      number: rd.number + 1,
      inPlay: [stay, next],
      scores: { Preto:0, Verde:0, Cinza:0, Vermelho:0 },
      running: false,
    }));
    setNextCandidate(null);
    setNextOpen(false);
  };

  const [left, right] = round.inPlay;
  const leftScore  = round.scores[left]  ?? 0;
  const rightScore = round.scores[right] ?? 0;
  const candidatos = (['Preto','Verde','Cinza','Vermelho'] as TeamColor[]).filter(t => t !== left && t !== right);

  // estatísticas (gols e assistências)
  const stats = useMemo(() => {
    const table: Record<string, { g:number; a:number }> = {};
    for (const e of events) {
      if (e.author) {
        table[e.author] = table[e.author] || { g:0, a:0 };
        table[e.author].g += 1;
      }
      if (e.assist) {
        table[e.assist] = table[e.assist] || { g:0, a:0 };
        table[e.assist].a += 1;
      }
    }
    return Object.entries(table)
      .map(([name, ga]) => ({ name, g: ga.g, a: ga.a }))
      .sort((a,b)=> b.g - a.g || b.a - a.a || a.name.localeCompare(b.name));
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
            <div className={`text-5xl sm:text-6xl font-extrabold tabular-nums ${atrasado ? 'text-red-600 motion-safe:animate-pulse [animation-duration:500ms]' : ''}`}>
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
                  {/* +Gol só com cronômetro em andamento */}
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
                      <div><strong>{e.author}</strong></div>
                      {e.assist && <div className="text-xs text-zinc-500">assistência: {e.assist}</div>}
                    </div>
                  </div>
                  {canEdit(userRole) && (
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline" size="sm"
                        onClick={() => {
                          const author = prompt('Autor do gol:', e.author) || e.author;
                          let assist  = e.assist ?? '';
                          assist = prompt('Assistência (deixe vazio para nenhum):', assist) || '';
                          if (author === assist) assist = ''; // evita autoassistência
                          editGoal(e.id, author, assist || null);
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
                  {stats.map((row)=>(
                    <tr key={row.name} className="border-t">
                      <td className="py-1">{row.name}</td>
                      <td className="py-1 text-right">{row.g}</td>
                      <td className="py-1 text-right">{row.a}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs — Semana / Mês / Todos */}
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

      {/* Histórico de Partidas */}
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

      {/* Modal Gol (assistência opcional, sem autoassistência) */}
      {goalOpen && (
        <Dialog open={goalOpen} onOpenChange={setGoalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Gol</DialogTitle>
              <DialogDescription>Autor pré-selecionado; assistência é opcional.</DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="text-sm"><span className="mr-2">Time:</span><TeamBadge color={goalTeam} /></div>

              <div className="grid gap-2">
                <Label>Autor do gol</Label>
                <Select value={goalAuthor} onValueChange={(v)=>{ setGoalAuthor(v); if (goalAssist === v) setGoalAssist('__none__'); }}>
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
                <Select value={goalAssist} onValueChange={(v)=>setGoalAssist(v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione (opcional)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Sem assistência</SelectItem>
                    {playerOptions(goalTeam).filter(p => p !== goalAuthor).map((p)=>(
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={()=>setGoalOpen(false)}>Cancelar</Button>
              <Button type="button" onClick={saveGoal}>Salvar Gol</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal Próximo Adversário */}
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
