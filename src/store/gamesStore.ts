import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { SyncService } from '@/services/syncService'

export interface GameMatch {
  id: number
  date: string
  time: string
  location: string
  maxPlayers: number
  confirmedPlayers: number
  status: 'open' | 'closed' | 'cancelled'
  createdAt: number
}

interface GamesStore {
  matches: GameMatch[]
  addMatch: (match: Omit<GameMatch, 'id' | 'createdAt' | 'confirmedPlayers' | 'status'>) => void
  updateMatch: (id: number, updates: Partial<GameMatch>) => void
  deleteMatch: (id: number) => void
  getUpcomingMatches: () => GameMatch[]
  getMatchById: (id: number) => GameMatch | undefined
}

export const useGamesStore = create<GamesStore>()(
  persist(
    (set, get) => ({
      matches: [
        // Dados iniciais mockados - atualizados
        {
          id: 1,
          date: '2025-01-25',
          time: '20:00',
          location: 'R. Renato Bazin, 705-751 - Laranjal, São Gonçalo - RJ, 24725-140',
          maxPlayers: 25,
          confirmedPlayers: 18,
          status: 'open',
          createdAt: Date.now() - 86400000 // 1 dia atrás
        },
        {
          id: 2,
          date: '2025-01-27',
          time: '19:30',
          location: 'R. Renato Bazin, 705-751 - Laranjal, São Gonçalo - RJ, 24725-140',
          maxPlayers: 25,
          confirmedPlayers: 15,
          status: 'open',
          createdAt: Date.now() - 43200000 // 12 horas atrás
        }
      ],

      addMatch: (matchData) => {
        const newMatch: GameMatch = {
          ...matchData,
          id: Date.now(), // ID único baseado em timestamp
          confirmedPlayers: 0,
          status: 'open',
          createdAt: Date.now()
        }

        set((state) => {
          const newMatches = [...state.matches, newMatch];
          // Salvar no servidor em background
          SyncService.saveToServer(newMatches).catch(console.error);
          return { matches: newMatches };
        })
      },

      updateMatch: (id, updates) => {
        set((state) => {
          const newMatches = state.matches.map(match =>
            match.id === id ? { ...match, ...updates } : match
          );
          // Salvar no servidor em background
          SyncService.saveToServer(newMatches).catch(console.error);
          return { matches: newMatches };
        })
      },

      deleteMatch: (id) => {
        set((state) => {
          const newMatches = state.matches.filter(match => match.id !== id);
          // Salvar no servidor em background
          SyncService.saveToServer(newMatches).catch(console.error);
          return { matches: newMatches };
        })
      },

      getUpcomingMatches: () => {
        const now = new Date()
        const today = now.toISOString().split('T')[0]
        
        return get().matches
          .filter(match => {
            // Filtrar apenas partidas futuras ou de hoje
            return match.date >= today && match.status !== 'cancelled'
          })
          .sort((a, b) => {
            // Ordenar por data e horário
            const dateA = new Date(`${a.date}T${a.time}`)
            const dateB = new Date(`${b.date}T${b.time}`)
            return dateA.getTime() - dateB.getTime()
          })
      },

      getMatchById: (id) => {
        return get().matches.find(match => match.id === id)
      }
    }),
    {
      name: 'maestrosfc_games',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        matches: state.matches
      })
    }
  )
)