import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { User, TeamColor, TeamDraw } from '@/types'
import { supabase } from '@/lib/supabase'

export interface PlayerWithTeam extends User {
  team_color?: TeamColor;
  is_substitute?: boolean;
  substituted_at?: Date;
  substituted_by?: string;
}

interface PlayersStore {
  // Estado atual dos jogadores
  players: PlayerWithTeam[]
  teamDraw: TeamDraw | null
  currentMatchId: string | null
  loading: boolean
  error: string | null

  // Ações para gerenciar jogadores
  setCurrentMatch: (matchId: string) => void
  loadPlayersFromTeamDraw: (matchId: string) => Promise<void>
  drawTeams: (matchId: string) => Promise<void>
  
  // Gerenciamento de times
  getPlayersByTeam: (teamColor: TeamColor) => PlayerWithTeam[]
  getAvailablePlayersForTeam: (teamColor: TeamColor) => PlayerWithTeam[]
  getAllAvailablePlayers: () => PlayerWithTeam[]
  
  // Substituições
  substitutePlayer: (playerId: string, substituteId: string, teamColor: TeamColor) => void
  addPlayerToTeam: (player: User, teamColor: TeamColor) => void
  removePlayerFromTeam: (playerId: string) => void
  
  // Busca e filtros
  searchPlayers: (query: string) => PlayerWithTeam[]
  getPlayerById: (playerId: string) => PlayerWithTeam | undefined
  getPlayerByName: (name: string) => PlayerWithTeam | undefined
  
  // Validações
  canPlayerScore: (playerId: string, teamColor: TeamColor) => boolean
  canPlayerAssist: (playerId: string, assistedPlayerId: string, teamColor: TeamColor) => boolean
  
  // Reset e limpeza
  clearTeamDraw: () => void
  reset: () => void
  
  // Função para carregar dados de exemplo (para testes)
  loadExampleData: () => void
}

export const usePlayersStore = create<PlayersStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      players: [],
      teamDraw: null,
      currentMatchId: null,
      loading: false,
      error: null,

      // Definir partida atual
      setCurrentMatch: (matchId: string) => {
        set({ currentMatchId: matchId })
      },

      // Carregar jogadores do sorteio de times
      loadPlayersFromTeamDraw: async (matchId: string) => {
        set({ loading: true, error: null })
        
        try {
          // Buscar sorteio de times
          const { data: teamDrawData, error: teamDrawError } = await supabase
            .from('team_draw')
            .select('*')
            .eq('match_id', matchId)
            .single()

          if (teamDrawError) {
            throw new Error(`Erro ao carregar sorteio: ${teamDrawError.message}`)
          }

          if (!teamDrawData) {
            set({ teamDraw: null, players: [], loading: false })
            return
          }

          // Buscar dados dos usuários
          const allPlayerIds = Object.values(teamDrawData.teams).flat()
          const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('*')
            .in('id', allPlayerIds)

          if (usersError) {
            throw new Error(`Erro ao carregar usuários: ${usersError.message}`)
          }

          // Mapear jogadores com suas equipes
          const playersWithTeams: PlayerWithTeam[] = []
          
          Object.entries(teamDrawData.teams).forEach(([teamColor, players]) => {
            (players as User[]).forEach((player: User) => {
              const user = usersData?.find(u => u.id === player.id)
              if (user) {
                playersWithTeams.push({
                  ...user,
                  team_color: teamColor as TeamColor,
                  is_substitute: false
                })
              }
            })
          })

          set({ 
            teamDraw: teamDrawData,
            players: playersWithTeams,
            currentMatchId: matchId,
            loading: false 
          })

        } catch (error: any) {
          set({ 
            error: error.message || 'Erro ao carregar jogadores',
            loading: false 
          })
        }
      },

      // Sortear times
      drawTeams: async (matchId: string) => {
        set({ loading: true, error: null })
        
        try {
          const response = await fetch('/api/drawTeams', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ matchId })
          })

          if (!response.ok) {
            throw new Error('Erro ao sortear times')
          }

          // Recarregar jogadores após sorteio
          await get().loadPlayersFromTeamDraw(matchId)

        } catch (error: any) {
          set({ 
            error: error.message || 'Erro ao sortear times',
            loading: false 
          })
        }
      },

      // Obter jogadores por time
      getPlayersByTeam: (teamColor: TeamColor) => {
        return get().players.filter(p => p.team_color === teamColor)
      },

      // Obter jogadores ativos por time (não substitutos)
      getActivePlayersByTeam: (teamColor: TeamColor) => {
        return get().players.filter(p => 
          p.team_color === teamColor && !p.is_substitute
        )
      },

      // Obter jogadores disponíveis para um time (incluindo substitutos)
      getAvailablePlayersForTeam: (teamColor: TeamColor) => {
        return get().players.filter(p => p.team_color === teamColor)
      },

      // Obter todos os jogadores disponíveis
      getAllAvailablePlayers: () => {
        return get().players.filter(p => p.team_color)
      },

      // Substituir jogador
      substitutePlayer: (playerId: string, substituteId: string, teamColor: TeamColor) => {
        set(state => ({
          players: state.players.map(p => {
            if (p.id === playerId) {
              return { ...p, is_substitute: true, substituted_at: new Date() }
            }
            if (p.id === substituteId) {
              return { ...p, team_color: teamColor, is_substitute: false }
            }
            return p
          })
        }))
      },

      // Adicionar substituição (por nome)
      addSubstitution: (teamColor: TeamColor, playerOutName: string, playerInName: string) => {
        const state = get()
        
        // Validações avançadas
        const playerOut = state.getPlayerByName(playerOutName)
        const playerIn = state.getPlayerByName(playerInName)

        if (!playerOut) {
          throw new Error(`Jogador "${playerOutName}" não encontrado`)
        }

        if (!playerIn) {
          throw new Error(`Jogador "${playerInName}" não encontrado`)
        }

        if (playerOut.team_color !== teamColor) {
          throw new Error(`Jogador "${playerOutName}" não pertence ao time ${teamColor}`)
        }

        if (playerIn.team_color !== teamColor) {
          throw new Error(`Jogador "${playerInName}" não pertence ao time ${teamColor}`)
        }

        if (playerOut.is_substitute) {
          throw new Error(`Jogador "${playerOutName}" já está no banco`)
        }

        if (!playerIn.is_substitute) {
          throw new Error(`Jogador "${playerInName}" já está em campo`)
        }

        if (playerOutName === playerInName) {
          throw new Error('Jogador que sai deve ser diferente do que entra')
        }

        // Realizar a substituição
        state.substitutePlayer(playerOut.id, playerIn.id, teamColor)
      },

      // Adicionar jogador a um time
      addPlayerToTeam: (player: User, teamColor: TeamColor) => {
        set(state => ({
          players: [...state.players, { ...player, team_color: teamColor, is_substitute: false }]
        }))
      },

      // Remover jogador de time
      removePlayerFromTeam: (playerId: string) => {
        set(state => ({
          players: state.players.filter(p => p.id !== playerId)
        }))
      },

      // Buscar jogadores
      searchPlayers: (query: string) => {
        const lowerQuery = query.toLowerCase()
        return get().players.filter(p => 
          p.name.toLowerCase().includes(lowerQuery) ||
          p.position?.toLowerCase().includes(lowerQuery)
        )
      },

      // Obter jogador por ID
      getPlayerById: (playerId: string) => {
        return get().players.find(p => p.id === playerId)
      },

      // Obter jogador por nome
      getPlayerByName: (name: string) => {
        return get().players.find(p => 
          p.name.toLowerCase() === name.toLowerCase()
        )
      },

      // Validar se jogador pode marcar gol
      canPlayerScore: (playerId: string, teamColor: TeamColor) => {
        const player = get().getPlayerById(playerId)
        return player?.team_color === teamColor && !player?.is_substitute
      },

      // Validar se jogador pode dar assistência
      canPlayerAssist: (playerId: string, assistedPlayerId: string, teamColor: TeamColor) => {
        const player = get().getPlayerById(playerId)
        const assistedPlayer = get().getPlayerById(assistedPlayerId)
        
        // Não pode dar assistência para si mesmo
        if (playerId === assistedPlayerId) return false
        
        // Ambos devem estar no mesmo time
        return player?.team_color === teamColor && 
               assistedPlayer?.team_color === teamColor &&
               !player?.is_substitute &&
               !assistedPlayer?.is_substitute
      },

      // Limpar sorteio
      clearTeamDraw: () => {
        set({ teamDraw: null, players: [], currentMatchId: null })
      },

      // Reset completo
      reset: () => {
        set({
          players: [],
          teamDraw: null,
          currentMatchId: null,
          loading: false,
          error: null
        })
      },

      // Carregar dados de exemplo para testes
      loadExampleData: () => {
        const examplePlayers: PlayerWithTeam[] = [
          {
            id: '1',
            name: 'Michell',
            email: 'michell@example.com',
            team_color: 'Preto',
            is_substitute: false,
            position: 'Atacante',
            stars: 4
          },
          {
            id: '2',
            name: 'Thiago',
            email: 'thiago@example.com',
            team_color: 'Preto',
            is_substitute: false,
            position: 'Meia',
            stars: 3
          },
          {
            id: '3',
            name: 'Sérgio Jr',
            email: 'sergio@example.com',
            team_color: 'Verde',
            is_substitute: false,
            position: 'Zagueiro',
            stars: 4
          },
          {
            id: '4',
            name: 'Oton',
            email: 'oton@example.com',
            team_color: 'Verde',
            is_substitute: false,
            position: 'Goleiro',
            stars: 5
          },
          {
            id: '5',
            name: 'Jorge',
            email: 'jorge@example.com',
            team_color: 'Cinza',
            is_substitute: false,
            position: 'Meia',
            stars: 3
          },
          {
            id: '6',
            name: 'Yuri',
            email: 'yuri@example.com',
            team_color: 'Cinza',
            is_substitute: false,
            position: 'Atacante',
            stars: 4
          },
          {
            id: '7',
            name: 'Maurício',
            email: 'mauricio@example.com',
            team_color: 'Vermelho',
            is_substitute: false,
            position: 'Zagueiro',
            stars: 3
          },
          {
            id: '8',
            name: 'Gabriel',
            email: 'gabriel@example.com',
            team_color: 'Vermelho',
            is_substitute: false,
            position: 'Atacante',
            stars: 4
          }
        ]

        set({
          players: examplePlayers,
          currentMatchId: 'example-match',
          loading: false,
          error: null
        })
      }
    }),
    {
      name: 'players-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        players: state.players,
        teamDraw: state.teamDraw,
        currentMatchId: state.currentMatchId
      })
    }
  )
)