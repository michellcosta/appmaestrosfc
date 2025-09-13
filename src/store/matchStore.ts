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
