import { SyncService } from '@/services/syncService'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

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
        // Dados iniciais mockados
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
        const today = now.toISOString().split('T')[0] // YYYY-MM-DD

        return get().matches
          .filter(match => {
            // Validar se a data existe e está no formato correto
            if (!match.date || typeof match.date !== 'string') {
              console.warn('Partida com data inválida:', match);
              return false;
            }

            let matchDate: string;

            // Verificar se é formato DD/MM/YYYY
            if (match.date.includes('/')) {
              const dateParts = match.date.split('/');
              if (dateParts.length !== 3) {
                console.warn('Partida com formato de data inválido:', match.date);
                return false;
              }

              const [day, month, year] = dateParts;

              // Validar se os componentes são números válidos
              if (isNaN(Number(day)) || isNaN(Number(month)) || isNaN(Number(year))) {
                console.warn('Partida com componentes de data inválidos:', match.date);
                return false;
              }

              // Converter data DD/MM/YYYY para YYYY-MM-DD para comparação
              matchDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
            // Verificar se é formato YYYY-MM-DD
            else if (match.date.includes('-')) {
              const dateParts = match.date.split('-');
              if (dateParts.length !== 3) {
                console.warn('Partida com formato de data inválido:', match.date);
                return false;
              }

              const [year, month, day] = dateParts;

              // Validar se os componentes são números válidos
              if (isNaN(Number(year)) || isNaN(Number(month)) || isNaN(Number(day))) {
                console.warn('Partida com componentes de data inválidos:', match.date);
                return false;
              }

              // Já está no formato YYYY-MM-DD
              matchDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
            else {
              console.warn('Partida com formato de data não suportado:', match.date);
              return false;
            }

            // Filtrar apenas partidas futuras ou de hoje
            return matchDate >= today && match.status !== 'cancelled'
          })
          .sort((a, b) => {
            // Ordenar por data e horário
            let dateA: Date, dateB: Date;

            // Converter data A
            if (a.date.includes('/')) {
              const [dayA, monthA, yearA] = a.date.split('/');
              dateA = new Date(`${yearA}-${monthA.padStart(2, '0')}-${dayA.padStart(2, '0')}T${a.time}`);
            } else {
              dateA = new Date(`${a.date}T${a.time}`);
            }

            // Converter data B
            if (b.date.includes('/')) {
              const [dayB, monthB, yearB] = b.date.split('/');
              dateB = new Date(`${yearB}-${monthB.padStart(2, '0')}-${dayB.padStart(2, '0')}T${b.time}`);
            } else {
              dateB = new Date(`${b.date}T${b.time}`);
            }

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