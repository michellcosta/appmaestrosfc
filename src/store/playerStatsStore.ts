import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface PlayerStats {
  name: string
  goals: number
  assists: number
  lastUpdated: number
}

interface PlayerStatsStore {
  stats: PlayerStats[]
  lastResetDate: string | null // Data da última partida que zerou as estatísticas
  addGoal: (playerName: string) => void
  addAssist: (playerName: string) => void
  removeGoal: (playerName: string) => void
  removeAssist: (playerName: string) => void
  resetStats: (nextMatchDate: string) => void
  clearStats: () => void
  getStats: () => PlayerStats[]
  shouldResetStats: (nextMatchDate: string) => boolean
}

export const usePlayerStatsStore = create<PlayerStatsStore>()(
  persist(
    (set, get) => ({
      stats: [],
      lastResetDate: null,

      addGoal: (playerName: string) => {
        set((state) => {
          const existingPlayer = state.stats.find(p => p.name === playerName)

          if (existingPlayer) {
            return {
              stats: state.stats.map(p =>
                p.name === playerName
                  ? { ...p, goals: p.goals + 1, lastUpdated: Date.now() }
                  : p
              )
            }
          } else {
            return {
              stats: [...state.stats, {
                name: playerName,
                goals: 1,
                assists: 0,
                lastUpdated: Date.now()
              }]
            }
          }
        })
      },

      addAssist: (playerName: string) => {
        set((state) => {
          const existingPlayer = state.stats.find(p => p.name === playerName)

          if (existingPlayer) {
            return {
              stats: state.stats.map(p =>
                p.name === playerName
                  ? { ...p, assists: p.assists + 1, lastUpdated: Date.now() }
                  : p
              )
            }
          } else {
            return {
              stats: [...state.stats, {
                name: playerName,
                goals: 0,
                assists: 1,
                lastUpdated: Date.now()
              }]
            }
          }
        })
      },

      removeGoal: (playerName: string) => {
        set((state) => {
          const existingPlayer = state.stats.find(p => p.name === playerName)

          if (existingPlayer && existingPlayer.goals > 0) {
            return {
              stats: state.stats.map(p =>
                p.name === playerName
                  ? { ...p, goals: Math.max(0, p.goals - 1), lastUpdated: Date.now() }
                  : p
              )
            }
          }
          return state
        })
      },

      removeAssist: (playerName: string) => {
        set((state) => {
          const existingPlayer = state.stats.find(p => p.name === playerName)

          if (existingPlayer && existingPlayer.assists > 0) {
            return {
              stats: state.stats.map(p =>
                p.name === playerName
                  ? { ...p, assists: Math.max(0, p.assists - 1), lastUpdated: Date.now() }
                  : p
              )
            }
          }
          return state
        })
      },

      resetStats: (nextMatchDate: string) => {
        set({
          stats: [],
          lastResetDate: nextMatchDate
        })
      },

      clearStats: () => {
        set({
          stats: [],
          lastResetDate: null
        })
      },

      getStats: () => {
        const { stats } = get()
        return stats
          .filter(p => p.goals > 0 || p.assists > 0) // Filtrar jogadores com pelo menos 1 gol ou 1 assistência
          .sort((a, b) => b.goals - a.goals || b.assists - a.assists || a.name.localeCompare(b.name))
      },

      shouldResetStats: (nextMatchDate: string) => {
        const { lastResetDate } = get()

        if (!lastResetDate) return false

        // Se a próxima partida é diferente da última que resetou, deve resetar
        return nextMatchDate !== lastResetDate
      }
    }),
    {
      name: 'maestrosfc_player_stats',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        stats: state.stats,
        lastResetDate: state.lastResetDate
      })
    }
  )
)
