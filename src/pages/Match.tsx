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

type FilterRange = 'week' | 'month' | 'all';

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

/** Permissões locais (trocar por Auth real) */
const userRole: 'owner' | 'admin' | 'aux' | 'mensalista' | 'diarista' = 'owner';
const canEdit = (role: typeof userRole) => ['owner','admin','aux'].includes(role);

/** ��� MOCK do sorteio: mapa de jogadores por time
 *  Depois: popular com o retorno real de team_draw.teams (drawTeams)
 */
const defaultTeamPlayers: Record<TeamColor, string[]> = {
  Preto:  ['João #9', 'Marco', 'Lipe', 'Dani', 'Rafa'],
  Verde:  ['Pedro #10', 'Caio', 'Beto', 'Guga', 'Nico'],
  Cinza:  ['Vini', 'Diogo', 'Hugo', 'Téo', 'Iuri'],
  Vermelho: ['Allan', 'Pablo', 'Leo', 'Roni', 'Alex'],
};

const Match: React.FC = () => {
  // Fila e jogadores (virão do sorteio)
  const [queue] = useState<TeamColor[]>(['Preto', 'Verde', 'Cinza', 'Vermelho']);
  const [teamPlayers, setTeamPlayers] = useState<Record<TeamColor, string[]>>(defaultTeamPlayers);

  // Estado da rodada
  const [round, setRound] = useState<RoundState>(() => ({
    number: 1,
    inPlay: ['Preto', 'Verde'],
    scores: { Preto: 0, Verde: 0, Cinza: 0, Vermelho: 0 },
    running: false,
  }));

  // Timer (00:00 → duração)
  const [duracaoMin, setDuracaoMin] = useState<number>(10);
  const [elapsed, setElapsed] = useState<number>(0);
  useEffect(() => {
    if (!round.running) return;
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [round.running]);

  const target = duracaoMin * 60;
  const isOverTime = elapsed >= target;

  const mmss = useMemo(() => {
    const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const s = (elapsed % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }, [elapsed]);

  // Eventos/Gols e Histórico
  const [events, setEvents] = useState<GoalEvent[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyFilter, setHistoryFilter] = useState<FilterRange>('week');

  // Modal: Gol
  const [goalOpen, setGoalOpen] = useState(false);
  const [goalTeam, setGoalTeam] = useState<TeamColor>('Preto');
  const [goalAuthor, setGoalAuthor] = useState<string>('');
  const [goalAssist, setGoalAssist] = useState<string>('');

  const openGoal = (team: TeamColor) => {
    setGoalTeam(team);
    setGoalAuthor('');
    setGoalAssist('');
    setGoalOpen(true);
  };

  const saveGoal = () => {
    setRound((r) => ({ ...r, scores: { ...r.scores, [goalTeam]: (r.scores[goalTeam] ?? 0) + 1 } }));
    setEvents((ev) => [
      ...ev,
      { id: crypto.randomUUID(), team: goalTeam, author: goalAuthor || null, assist: goalAssist || null, ts: Date.now() },
    ]);
    setGoalOpen(false);
  };

  const editGoal = (id: string, author: string | null, assist: string | null) => {
    if (!canEdit(userRole)) return;
    setEvents((ev) => ev.map((e) => (e.id === id ? { ...e, author, assist } : e)));
  };

  const removeGoal = (id: string) => {
    if (!canEdit(userRole)) return;
    const g = events.find((e) => e.id === id);
    if (g) {
      setRound((r) => ({ ...r, scores: { ...r.scores, [g.team]: Math.max((r.scores[g.team] ?? 0) - 1, 0) } }));
    }
    setEvents((ev) => ev.filter((e) => e.id !== id));
  };

  // Modal: Próximo adversário ao Encerrar
  const [nextOpen, setNextOpen] = useState(false);
  const [nextCandidate, setNextCandidate] = useState<TeamColor | null>(null);

  // Ações
  const iniciar   = () => setRound((r) => ({ ...r, running: true }));
  const pausar    = () => setRound((r) => ({ ...r, running: false }));
  const recomeçar = () => { setElapsed(0); setRound((r)=>({ ...r, scores:{Preto:0,Verde:0,Cinza:0,Vermelho:0} })); };
  const encerrar  = () => { setRound((r)=>({ ...r, running:false })); setNextOpen(true); };

  const confirmarProximoTime = () => {
    const [left, right] = round.inPlay;
    const l = round.scores[left] ?? 0;
    const r = round.scores[right] ?? 0;
    const winner: TeamColor | 'Empate' = l===r ? 'Empate' : (l>r ? left : right);

    // Histórico automático
    setHistory((h) => [...h, { round: round.number, left, right, leftScore: l, rightScore: r, winner, ts: Date.now() }]);

    // Próximo par (vencedor permanece; empate mantém left)
    const stay: TeamColor = winner === 'Empate' ? left : (winner as TeamColor);
    const next = nextCandidate ?? (['Preto','Verde','Cinza','Vermelho'].find(t => t!==stay && t!==left && t!==right) || right);

    // Reset rodada
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

  // Helpers
  const [left, right] = round.inPlay;
  const leftScore  = round.scores[left]  ?? 0;
  const rightScore = round.scores[right] ?? 0;
  const candidatos = (['Preto','Verde','Cinza','Vermelho'] as TeamColor[]).filter(t => t !== left && t !== right);

  // Estatísticas da sessão (G/A por jogador)
  const stats = useMemo(() => {
    const map = new Map<string, { g: number; a: number }>();
    for (const e of events) {
      if (e.author) {
        const cur = map.get(e.author) ?? { g:0, a:0 };
        cur.g += 1; map.set(e.author, cur);
      }
      if (e.assist) {
        const cur = map.get(e.assist) ?? { g:0, a:0 };
        cur.a += 1; map.set(e.assist, cur);
      }
    }
    return Array.from(map.entries())
      .map(([name, {g,a}]) => ({ name, g, a }))
      .sort((x,y) => y.g - x.g || y.a - x.a);
  }, [events]);

  // Filtro Semana/Mês/Todos para Histórico
  const filteredHistory = useMemo(() => {
    if (historyFilter === 'all') return history;
    const now = new Date();
    return history.filter((h) => {
      const d = new Date(h.ts);
      if (historyFilter === 'week') {
        const diff = (now.getTime() - d.getTime()) / (1000*60*60*24);
        return diff <= 7;
      }
      // month
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }, [history, historyFilter]);

  // options de autor/assistência conforme o time do gol
  const playerOptions = (team: TeamColor) => (teamPlayers[team] ?? []);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-5">
      <header className="mb-3">
        <h1 className="text-2xl font-semibold">Partida ao Vivo</h1>
        <p className="text-sm text-zinc-500">Rodada {round.number}</p>
      </header>

      {/* Cronômetro */}
      <Card className="mb-3 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col items-center gap-3">
            <div className={`text-5xl sm:text-6xl font-extrabold tabular-nums ${isOverTime ? 'text-red-600 animate-pulse' : ''}`}>
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
                <Button onClick={iniciar}>Iniciar</Button>
              ) : (
                <Button className="bg-amber-500 hover:bg-amber-500/90" onClick={pausar}>Pausar</Button>
              )}
              <Button variant="outline" onClick={recomeçar}>Recomeçar</Button>
              <Button variant="secondary" onClick={encerrar}>Encerrar</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Placar (apenas 2 times) */}
      <Card className="rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 mb-3">
        <CardContent className="p-4 sm:p-5">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">��� Placar</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {/* Left */}
            <div className="flex items-center justify-between gap-2 rounded-xl border px-3 py-2">
              <div className="flex items-center gap-2">
                <TeamBadge color={left} />
                <span className="text-sm">{left}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tabular-nums">{leftScore}</span>
                <Button variant="outline" size="sm" onClick={()=>openGoal(left)} disabled={!round.running}>+</Button>
              </div>
            </div>
            {/* Right */}
            <div className="flex items-center justify-between gap-2 rounded-xl border px-3 py-2">
              <div className="flex items-center gap-2">
                <TeamBadge color={right} />
                <span className="text-sm">{right}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tabular-nums">{rightScore}</span>
                <Button variant="outline" size="sm" onClick={()=>openGoal(right)} disabled={!round.running}>+</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gols recentes */}
      <Card className="rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 mb-3">
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
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const players = playerOptions(e.team);
                          const author = prompt('Autor do gol:', e.author ?? '') || '';
                          const assist = prompt('Assistência (opcional):', e.assist ?? '') || '';
                          editGoal(e.id, author || null, assist || null);
                        }}
                      >
                        Editar
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => removeGoal(e.id)}>Excluir</Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas (sessão) */}
      <Card className="rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 mb-3">
        <CardContent className="p-4 sm:p-5">
          <h3 className="text-sm font-semibold mb-2">Estatísticas dos jogadores (sessão)</h3>
          {stats.length === 0 ? (
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
                  {stats.map((row) => (
                    <tr key={row.name} className="border-t">
                      <td className="py-1">{row.name}</td>
                      <td className="py-1 text-right tabular-nums">{row.g}</td>
                      <td className="py-1 text-right tabular-nums">{row.a}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filtro: Semana / Mês / Todos + Histórico de Placar */}
      <div className="rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
        <div className="flex">
          <button
            className={`flex-1 text-sm py-2 rounded-tl-2xl ${historyFilter==='week' ? 'bg-zinc-100 dark:bg-zinc-800 font-medium' : ''}`}
            onClick={() => setHistoryFilter('week')}
          >
            Semana
          </button>
          <button
            className={`flex-1 text-sm py-2 ${historyFilter==='month' ? 'bg-zinc-100 dark:bg-zinc-800 font-medium' : ''}`}
            onClick={() => setHistoryFilter('month')}
          >
            Mês
          </button>
          <button
            className={`flex-1 text-sm py-2 rounded-tr-2xl ${historyFilter==='all' ? 'bg-zinc-100 dark:bg-zinc-800 font-medium' : ''}`}
            onClick={() => setHistoryFilter('all')}
          >
            Todos
          </button>
        </div>
        <Card className="rounded-t-none border-0">
          <CardContent className="p-4 sm:p-5">
            <h3 className="text-sm font-semibold mb-2">Histórico de Placar</h3>
            {filteredHistory.length === 0 ? (
              <p className="text-sm text-zinc-500">Sem registros ainda.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-zinc-500">
                    <tr>
                      <th className="text-left py-1">Rodada</th>
                      <th className="text-left py-1">Duelo</th>
                      <th className="text-right py-1">Placar</th>
                      <th className="text-right py-1">Vencedor</th>
                      <th className="text-right py-1">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((h) => (
                      <tr key={h.round + '-' + h.ts} className="border-t">
                        <td className="py-1">#{h.round}</td>
                        <td className="py-1">{h.left} vs {h.right}</td>
                        <td className="py-1 text-right">{h.leftScore} - {h.rightScore}</td>
                        <td className="py-1 text-right">{h.winner}</td>
                        <td className="py-1 text-right">{new Date(h.ts).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal: Registrar Gol (time -> autor/assist da lista do sorteio) */}
      <Dialog open={goalOpen} onOpenChange={setGoalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Gol</DialogTitle>
            <DialogDescription>Escolha o autor e (opcional) a assistência do time selecionado.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="text-sm"><span className="mr-2">Time:</span><TeamBadge color={goalTeam} /></div>

            <div className="grid gap-2">
              <Label>Autor do gol</Label>
              <Select value={goalAuthor} onValueChange={setGoalAuthor}>
                <SelectTrigger><SelectValue placeholder="Selecione o autor" /></SelectTrigger>
                <SelectContent>
                  {(playerOptions(goalTeam)).map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Assistência (opcional)</Label>
              <Select value={goalAssist} onValueChange={setGoalAssist}>
                <SelectTrigger><SelectValue placeholder="Selecione (opcional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma</SelectItem>
                  {(playerOptions(goalTeam)).map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={()=>setGoalOpen(false)}>Cancelar</Button>
            <Button disabled={!goalAuthor} onClick={saveGoal}>Salvar Gol</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Próximo time (ao Encerrar) */}
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
            <Button variant="secondary" onClick={()=>setNextOpen(false)}>Cancelar</Button>
            <Button disabled={!nextCandidate} onClick={confirmarProximoTime}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Match;
// compat com import { Match } usado no App.tsx
export { Match };
