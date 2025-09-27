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
  goals: GoalEvent[] // Adicionado: gols da partida
}

type MatchStore = {
  round: RoundState
  // cronômetro baseado em relógio:
  runningSince: number | null     // ms desde que iniciou pela última vez (null se pausado)
  accumulatedSec: number          // segundos acumulados de execuções anteriores
  now: number                     // batida global (ms)

  events: GoalEvent[]             // Gols da rodada atual (reseta a cada rodada)
  allEvents: GoalEvent[]          // Todos os gols da partida (não reseta)
  history: HistoryItem[]
  durationMin: number

  // Ações cronômetro
  setDuration: (m: number) => void
  start: () => void
  pause: () => void
  reset: () => void

  // Helpers
  getElapsedSec: () => number

  // Gols
  addGoal: (g: Omit<GoalEvent,'id'|'ts'> & {id?: string, ts?: number}) => string
  editGoal: (id: string, patch: Partial<Omit<GoalEvent,'id'>>) => void
  deleteGoal: (id: string) => void
  
  // Estatísticas acumuladas
  getAllEvents: () => GoalEvent[]

  endRoundChooseNext: (nextOpponent: TeamColor|null) => void
  recomputeScores: () => void
  
  // Funções de reset para testes
  clearHistory: () => void
  clearEvents: () => void
  clearAll: () => void
  resetToInitialState: () => void
}

const uuid = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random()*16)|0, v = c === 'x' ? r : (r&0x3|0x8)
    return v.toString(16)
  })

const initialRound: RoundState = {
  number: 1,
  inPlay: ['Preto','Verde'],
  scores: { Preto:0,Verde:0,Cinza:0,Vermelho:0 },
  running: false,
}

export const useMatchStore = create<MatchStore>()(
  persist(
    (set, get) => ({
      round: initialRound,

      // cronômetro (wall-clock)
      runningSince: null,
      accumulatedSec: 0,
      now: Date.now(),

      events: [],
      allEvents: [],
      history: [],
      durationMin: 10,

      setDuration: (m) => set({ durationMin: m }),

      start: () => {
        const { round, runningSince } = get()
        if (round.running) return
        if (runningSince !== null) return
        set({
          round: { ...round, running: true },
          runningSince: Date.now(),
        })
      },

      pause: () => {
        const { round, runningSince, accumulatedSec } = get()
        if (!round.running) return
        const add = runningSince ? Math.floor((Date.now() - runningSince) / 1000) : 0
        set({
          round: { ...round, running: false },
          accumulatedSec: accumulatedSec + add,
          runningSince: null,
        })
      },

      reset: () => set({
        round: { ...get().round, scores: {Preto:0,Verde:0,Cinza:0,Vermelho:0}, running:false },
        accumulatedSec: 0,
        runningSince: null,
        // não zera history/events aqui
      }),

      getElapsedSec: () => {
        const { runningSince, accumulatedSec, now } = get()
        const live = runningSince ? Math.floor((now - runningSince) / 1000) : 0
        return accumulatedSec + live
      },

      addGoal: (g) => {
        const id = g.id ?? uuid()
        const ts = g.ts ?? Date.now()
        const newGoal = { id, ts, team: g.team, author: g.author, assist: g.assist ?? null }
        
        // Adicionar à rodada atual
        const events = [...get().events, newGoal]
        // Adicionar ao histórico total
        const allEvents = [...get().allEvents, newGoal]
        
        const scores = { ...get().round.scores }
        scores[g.team] = (scores[g.team] ?? 0) + 1
        set({ events, allEvents, round: { ...get().round, scores } })
        return id
      },

      editGoal: (id, patch) => {
        const events = get().events.map(e => e.id === id ? { ...e, ...patch } : e)
        const allEvents = get().allEvents.map(e => e.id === id ? { ...e, ...patch } : e)
        set({ events, allEvents })
      },

      deleteGoal: (id) => {
        const target = get().events.find(e => e.id === id)
        if (!target) return
        const events = get().events.filter(e => e.id !== id)
        const allEvents = get().allEvents.filter(e => e.id !== id)
        const scores = { ...get().round.scores }
        scores[target.team] = Math.max((scores[target.team] ?? 0) - 1, 0)
        set({ events, allEvents, round: { ...get().round, scores } })
      },

      endRoundChooseNext: (nextOpponent) => {
        const { round, events } = get()
        const [left, right] = round.inPlay
        const l = round.scores[left]  ?? 0
        const r = round.scores[right] ?? 0
        const winner: TeamColor | 'Empate' = l===r ? 'Empate' : (l>r ? left : right)

        const historyItem: HistoryItem = {
          round: round.number, left, right, leftScore: l, rightScore: r, winner, ts: Date.now(),
          goals: [...events] // Salva os gols da rodada
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
            scores: { Preto:0,Verde:0,Cinza:0,Vermelho:0 },
            running: false,
          },
          // reseta cronômetro da rodada:
          accumulatedSec: 0,
          runningSince: null,
          // RESETAR apenas gols da rodada atual:
          events: [], // Resetar lista de gols da rodada
          // MANTER todos os gols da partida para estatísticas:
          allEvents: [...get().allEvents], // Não resetar, manter para estatísticas
        })
      },

      getAllEvents: () => {
        return get().allEvents
      },

      recomputeScores: () => {
        const base: Score = { Preto:0, Verde:0, Cinza:0, Vermelho:0 } as any
        for (const e of get().events) {
          base[e.team] = (base[e.team] ?? 0) + 1
        }
        set({ round: { ...get().round, scores: base } })
      },

      // Funções de reset para testes
      clearHistory: () => {
        set({ history: [] })
      },

      clearEvents: () => {
        set({ 
          events: [],
          allEvents: [],
          round: { ...get().round, scores: { Preto:0, Verde:0, Cinza:0, Vermelho:0 } }
        })
      },

      clearAll: () => {
        set({ 
          events: [],
          allEvents: [],
          history: [],
          round: { ...get().round, scores: { Preto:0, Verde:0, Cinza:0, Vermelho:0 } }
        })
      },

      resetToInitialState: () => {
        set({
          round: initialRound,
          runningSince: null,
          accumulatedSec: 0,
          now: Date.now(),
          events: [],
          allEvents: [],
          history: [],
          durationMin: 10,
        })
      },
    }),
    {
      name: 'maestrosfc_match',
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted) => {
        try {
          const s = persisted as any;
          if (typeof s.accumulatedSec !== "number") s.accumulatedSec = 0;
          if (typeof s.now !== "number") s.now = Date.now();
          if (!s.round) s.round = { number:1, inPlay:["Preto","Verde"], scores:{Preto:0,Verde:0,Cinza:0,Vermelho:0}, running:false };
          if (!s.round.scores) s.round.scores = {Preto:0,Verde:0,Cinza:0,Vermelho:0};
          if (typeof s.round.running !== "boolean") s.round.running = false;
          return s;
        } catch { return persisted as any }
      },
      partialize: (s) => ({
        round: s.round,
        runningSince: s.runningSince,
        accumulatedSec: s.accumulatedSec,
        events: s.events,
        allEvents: s.allEvents,
        history: s.history,
        durationMin: s.durationMin,
      }),
    }
  )
)

// ♾️ batida global: mantém "now" atualizando mesmo fora da tela de Partida
let heartbeatStarted = false
export function ensureHeartbeat() {
  if (heartbeatStarted) return
  heartbeatStarted = true
  const { setState } = (useMatchStore as any)
  setInterval(() => {
    setState((prev: any) => ({ ...prev, now: Date.now() }))
  }, 1000)
}
ensureHeartbeat()
