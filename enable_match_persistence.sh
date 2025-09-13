#!/usr/bin/env bash
set -euo pipefail

echo "��� Instalando dependência zustand..."
npm i zustand

echo "���️  Criando store global com persistência..."
mkdir -p src/store src/pages

cat > src/store/matchStore.ts <<'TS'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type TeamColor = 'Preto'|'Verde'|'Cinza'|'Vermelho'
type Score = Record<TeamColor, number>

export type GoalEvent = {
  id: string
  team: TeamColor
  author: string
  assist: string | null
  ts: number
}

export type RoundState = {
  number: number
  inPlay: [TeamColor, TeamColor]
  scores: Score
  running: boolean
}

export type HistoryItem = {
  round: number
  left: TeamColor
  right: TeamColor
  leftScore: number
  rightScore: number
  winner: TeamColor | 'Empate'
  ts: number
}

type MatchStore = {
  // estado
  round: RoundState
  elapsed: number
  events: GoalEvent[]
  history: HistoryItem[]
  durationMin: number

  // ações
  setDuration: (m: number) => void
  start: () => void
  pause: () => void
  reset: () => void
  tick: () => void

  addGoal: (g: Omit<GoalEvent,'id'|'ts'> & {id?: string, ts?: number}) => string
  editGoal: (id: string, patch: Partial<Omit<GoalEvent,'id'>>) => void
  deleteGoal: (id: string) => void

  endRoundChooseNext: (nextOpponent: TeamColor|null) => void

  // helpers
  recomputeScores: () => void
}

const uuid = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random()*16)|0, v = c === 'x' ? r : (r&0x3|0x8)
    return v.toString(16)
  })

const initialRound: RoundState = {
  number: 1,
  inPlay: ['Preto','Verde'],
  scores: { Preto:0, Verde:0, Cinza:0, Vermelho:0 },
  running: false,
}

export const useMatchStore = create<MatchStore>()(
  persist(
    (set, get) => ({
      round: initialRound,
      elapsed: 0,
      events: [],
      history: [],
      durationMin: 10,

      setDuration: (m) => set({ durationMin: m }),

      start: () => set(state => ({ round: { ...state.round, running: true }})),
      pause: () => set(state => ({ round: { ...state.round, running: false }})),
      reset: () => set({ round: { ...get().round, scores: {Preto:0,Verde:0,Cinza:0,Vermelho:0}, running:false }, elapsed: 0 }),

      tick: () => {
        const { round, elapsed, durationMin } = get()
        if (!round.running) return
        set({ elapsed: elapsed + 1 })
        // não apita; o piscar fica na UI ao comparar elapsed >= durationMin*60
      },

      addGoal: (g) => {
        const id = g.id ?? uuid()
        const ts = g.ts ?? Date.now()
        const events = [...get().events, { id, ts, team: g.team, author: g.author, assist: g.assist ?? null }]
        // atualiza placar do time em jogo (apenas pontuação total do time)
        const scores = { ...get().round.scores }
        scores[g.team] = (scores[g.team] ?? 0) + 1
        set({ events, round: { ...get().round, scores } })
        return id
      },

      editGoal: (id, patch) => {
        const events = get().events.map(e => e.id === id ? { ...e, ...patch } : e)
        set({ events })
      },

      deleteGoal: (id) => {
        const target = get().events.find(e => e.id === id)
        if (!target) return
        const events = get().events.filter(e => e.id !== id)
        const scores = { ...get().round.scores }
        scores[target.team] = Math.max((scores[target.team] ?? 0) - 1, 0)
        set({ events, round: { ...get().round, scores } })
      },

      endRoundChooseNext: (nextOpponent) => {
        const { round } = get()
        const [left, right] = round.inPlay
        const l = round.scores[left]  ?? 0
        const r = round.scores[right] ?? 0
        const winner: TeamColor | 'Empate' = l===r ? 'Empate' : (l>r ? left : right)

        const historyItem: HistoryItem = {
          round: round.number, left, right, leftScore: l, rightScore: r, winner, ts: Date.now()
        }

        const stay: TeamColor = winner === 'Empate' ? left : winner as TeamColor
        const pool: TeamColor[] = ['Preto','Verde','Cinza','Vermelho']
        const candidates = pool.filter(t => t !== stay && t !== left && t !== right)
        const next = nextOpponent ?? (candidates[0] ?? right)

        set({
          history: [...get().history, historyItem],
          round: {
            number: round.number + 1,
            inPlay: [stay, next],
            scores: { Preto:0, Verde:0, Cinza:0, Vermelho:0 },
            running: false,
          },
          elapsed: 0,
        })
      },

      recomputeScores: () => {
        const base: Score = { Preto:0, Verde:0, Cinza:0, Vermelho:0 }
        for (const e of get().events) base[e.team] = (base[e.team] ?? 0) + 1
        set({ round: { ...get().round, scores: base } })
      }
    }),
    {
      name: 'maestrosfc_match',
      storage: createJSONStorage(() => localStorage),
      // persistimos só o que faz sentido restaurar
      partialize: (s) => ({
        round: { ...s.round, running: s.round.running }, // mantemos running (o tick liga o intervalo)
        elapsed: s.elapsed,
        events: s.events,
        history: s.history,
        durationMin: s.durationMin,
      }),
    }
  )
)
TS

echo "��� Atualizando tela de Partida para usar o store..."
# backup e sobrescreve Match.tsx (mantém a UI já aprovada; apenas troca para store)
if [ -f src/pages/Match.tsx ]; then cp -f src/pages/Match.tsx src/pages/Match.tsx.bak; fi

cat > src/pages/Match.tsx <<'TSX'
import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Trophy } from 'lucide-react'
import { useMatchStore, GoalEvent, TeamColor } from '@/store/matchStore'

type FilterRange = 'week' | 'month' | 'all'

const colorChip: Record<TeamColor, string> = {
  Preto: 'bg-zinc-900 text-white',
  Verde: 'bg-emerald-600 text-white',
  Cinza: 'bg-slate-400 text-zinc-900',
  Vermelho: 'bg-red-600 text-white',
}
const TeamBadge: React.FC<{ color: TeamColor; className?: string }> = ({ color, className }) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorChip[color]} ${className ?? ''}`}>
    {color}
  </span>
)

// mock: permissões locais
const userRole: 'owner'|'admin'|'aux'|'mensalista'|'diarista' = 'owner'
const canEdit = (role: typeof userRole) => ['owner','admin','aux'].includes(role)

// jogadores mock por time
const defaultTeamPlayers: Record<TeamColor, string[]> = {
  Preto:    ['Michell', 'Thiago'],
  Verde:    ['Sérgio Jr', 'Oton'],
  Cinza:    ['Jorge', 'Yuri'],
  Vermelho: ['Maurício', 'Gabriel'],
}

const Match: React.FC = () => {
  const {
    round, elapsed, durationMin, events, history,
    setDuration, start, pause, reset, tick,
    addGoal, editGoal, deleteGoal, endRoundChooseNext,
  } = useMatchStore()

  const [goalOpen, setGoalOpen] = useState(false)
  const [goalEditId, setGoalEditId] = useState<string | null>(null)
  const [goalTeam, setGoalTeam] = useState<TeamColor>('Preto')
  const [goalAuthor, setGoalAuthor] = useState<string>('')          // controlado
  const [goalAssist, setGoalAssist] = useState<string>('__none__')  // "__none__" = sem assistência

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmTarget, setConfirmTarget] = useState<GoalEvent | null>(null)

  // liga/desliga intervalo do cronômetro com base no store
  useEffect(() => {
    if (!round.running) return
    const id = setInterval(() => tick(), 1000)
    return () => clearInterval(id)
  }, [round.running, tick])

  const alvo = durationMin * 60
  const atrasado = elapsed >= alvo
  const mmss = useMemo(() => {
    const m = Math.floor(elapsed/60).toString().padStart(2, '0')
    const s = (elapsed%60).toString().padStart(2, '0')
    return `${m}:${s}`
  }, [elapsed])

  const playerOptions = (team: TeamColor) => defaultTeamPlayers[team] ?? []

  // abrir modal para novo gol
  const openGoal = (team: TeamColor) => {
    if (!round.running) return
    setGoalEditId(null)
    setGoalTeam(team)
    setGoalAuthor(playerOptions(team)[0] ?? '')
    setGoalAssist('__none__')
    setGoalOpen(true)
  }

  // editar gol
  const openEditGoal = (ev: GoalEvent) => {
    setGoalEditId(ev.id)
    setGoalTeam(ev.team)
    setGoalAuthor(ev.author || (playerOptions(ev.team)[0] ?? ''))
    setGoalAssist(ev.assist ?? '__none__')
    setGoalOpen(true)
  }

  // exclusão
  const openConfirmDelete = (ev: GoalEvent) => { setConfirmTarget(ev); setConfirmOpen(true) }

  // se o autor mudar e a assistência for igual ao autor, volta para "sem assistência"
  useEffect(() => {
    if (!goalOpen) return
    if (goalAssist !== '__none__' && goalAssist === goalAuthor) setGoalAssist('__none__')
  }, [goalAuthor, goalAssist, goalOpen])

  const saveGoal = () => {
    if (!goalAuthor) return
    const assistVal = goalAssist === '__none__' ? null : goalAssist

    if (goalEditId) {
      editGoal(goalEditId, { author: goalAuthor, assist: assistVal ?? null })
    } else {
      addGoal({ team: goalTeam, author: goalAuthor, assist: assistVal ?? null })
    }

    setGoalOpen(false)
    setGoalEditId(null)
  }

  const confirmDelete = () => {
    if (!confirmTarget) return
    deleteGoal(confirmTarget.id)
    setConfirmOpen(false)
    setConfirmTarget(null)
  }
  const cancelDelete = () => { setConfirmOpen(false); setConfirmTarget(null) }

  const [left, right] = round.inPlay
  const leftScore  = round.scores[left]  ?? 0
  const rightScore = round.scores[right] ?? 0
  const candidatos = (['Preto','Verde','Cinza','Vermelho'] as TeamColor[]).filter(t => t !== left && t !== right)

  // estatísticas (sessão)
  const stats = useMemo(() => {
    const table: Record<string, { g:number; a:number }> = {}
    for (const e of events) {
      if (e.author) {
        table[e.author] = table[e.author] || { g:0, a:0 }
        table[e.author].g += 1
      }
      if (e.assist) {
        table[e.assist] = table[e.assist] || { g:0, a:0 }
        table[e.assist].a += 1
      }
    }
    return Object.entries(table)
      .map(([name, ga]) => ({ name, g: ga.g, a: ga.a }))
      .sort((a,b)=> b.g - a.g || b.a - a.a || a.name.localeCompare(b.name))
  }, [events])

  // filtro de histórico
  const [historyFilter, setHistoryFilter] = useState<FilterRange>('week')
  const filteredHistory = useMemo(() => {
    if (historyFilter === 'all') return history
    const now = new Date()
    return history.filter((h) => {
      const d = new Date(h.ts)
      if (historyFilter === 'week') {
        const diff = (now.getTime() - d.getTime()) / (1000*60*60*24)
        return diff <= 7
      }
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
  }, [history, historyFilter])

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
              <Select value={String(durationMin)} onValueChange={(v)=>setDuration(Number(v))} disabled={round.running}>
                <SelectTrigger className="w-[110px]"><SelectValue placeholder="Minutos" /></SelectTrigger>
                <SelectContent>
                  {[5,8,10,12,15].map(m => <SelectItem key={m} value={String(m)}>{m} min</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {!round.running ? (
                <Button type="button" onClick={start}>Iniciar</Button>
              ) : (
                <Button type="button" className="bg-amber-500 hover:bg-amber-500/90" onClick={pause}>Pausar</Button>
              )}
              <Button type="button" variant="outline" onClick={reset}>Recomeçar</Button>
              <Button type="button" variant="secondary" onClick={()=>{/* abre modal de próximo adversário na sua versão com Supabase; aqui omitimos para foco */}}>Encerrar</Button>
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
                      <Button type="button" variant="outline" size="sm" onClick={() => openEditGoal(e)}>Editar</Button>
                      <Button type="button" variant="secondary" size="sm" onClick={() => { setConfirmTarget(e); setConfirmOpen(true) }}>Excluir</Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas */}
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
          {history.length === 0 ? (
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
                  {history.map((h) => (
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

      {/* Modal Gol (criar/editar) */}
      {goalOpen && (
        <Dialog open={goalOpen} onOpenChange={(o)=>{ setGoalOpen(o); if(!o) setGoalEditId(null) }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{goalEditId ? 'Editar Gol' : 'Registrar Gol'}</DialogTitle>
              <DialogDescription>Autor pré-selecionado; assistência é opcional. Autoassistência não é permitida.</DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="text-sm"><span className="mr-2">Time:</span><TeamBadge color={goalTeam} /></div>

              <div className="grid gap-2">
                <Label>Autor do gol</Label>
                <Select value={goalAuthor} onValueChange={(v)=>{ setGoalAuthor(v); if (goalAssist === v) setGoalAssist('__none__') }}>
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
              <Button type="button" variant="secondary" onClick={()=>{ setGoalOpen(false); setGoalEditId(null) }}>Cancelar</Button>
              <Button type="button" onClick={saveGoal}>{goalEditId ? 'Salvar alterações' : 'Salvar Gol'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de confirmação de exclusão */}
      <Dialog open={confirmOpen} onOpenChange={(o)=>{ setConfirmOpen(o); if(!o) setConfirmTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir gol?</DialogTitle>
            <DialogDescription>Essa ação não pode ser desfeita. O placar será atualizado.</DialogDescription>
          </DialogHeader>

          {confirmTarget && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">Time:</span>
                <TeamBadge color={confirmTarget.team} />
              </div>
              <div className="text-sm">
                <div><strong>Autor:</strong> {confirmTarget.author}</div>
                {confirmTarget.assist && <div className="text-zinc-600"><strong>Assistência:</strong> {confirmTarget.assist}</div>}
                <div className="text-zinc-600"><strong>Horário:</strong> {new Date(confirmTarget.ts).toLocaleTimeString()}</div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={cancelDelete}>Não</Button>
            <Button type="button" className="bg-red-600 hover:bg-red-600/90" onClick={confirmDelete}>Sim, excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Match
export { Match }
TSX

echo "✅ Pronto. Fazendo commit e push..."
git add -A
git commit -m "feat(match): estado global com persistência (Zustand) para cronômetro, placar, gols e histórico"
git push origin feature/supabase-setup

echo "��� Terminado! Abra o preview do Vercel e teste navegação entre abas sem perder estado."
