import { useEffect, useState } from 'react'
import { usePlayersStore, PlayerWithTeam } from '@/store/playersStore'
import { TeamColor, TeamDraw, User } from '@/types'
import { supabase } from '@/lib/supabase'

export interface UseTeamDrawReturn {
  // Estado
  players: PlayerWithTeam[]
  teamDraw: TeamDraw | null
  loading: boolean
  error: string | null
  
  // Funções de times
  getPlayersByTeam: (teamColor: TeamColor) => PlayerWithTeam[]
  getAvailablePlayersForTeam: (teamColor: TeamColor) => PlayerWithTeam[]
  getAllAvailablePlayers: () => PlayerWithTeam[]
  
  // Ações
  loadTeamDraw: (matchId: string) => Promise<void>
  drawTeams: (matchId: string, playersPerTeam?: 6 | 7) => Promise<void>
  refreshTeamDraw: () => Promise<void>
  
  // Substituições
  substitutePlayer: (playerId: string, substituteId: string, teamColor: TeamColor) => void
  addPlayerToTeam: (player: User, teamColor: TeamColor) => void
  
  // Busca
  searchPlayers: (query: string) => PlayerWithTeam[]
  getPlayerById: (playerId: string) => PlayerWithTeam | undefined
  getPlayerByName: (name: string) => PlayerWithTeam | undefined
  
  // Validações
  canPlayerScore: (playerId: string, teamColor: TeamColor) => boolean
  canPlayerAssist: (playerId: string, assistedPlayerId: string, teamColor: TeamColor) => boolean
  
  // Estatísticas
  getTeamStats: () => Record<TeamColor, { total: number; active: number; substitutes: number }>
  hasTeamDraw: boolean
  isTeamDrawComplete: boolean
}

export const useTeamDraw = (matchId?: string): UseTeamDrawReturn => {
  const {
    players,
    teamDraw,
    currentMatchId,
    loading,
    error,
    setCurrentMatch,
    loadPlayersFromTeamDraw,
    drawTeams: storeDrawTeams,
    getPlayersByTeam,
    getAvailablePlayersForTeam,
    getAllAvailablePlayers,
    substitutePlayer,
    addPlayerToTeam,
    searchPlayers,
    getPlayerById,
    getPlayerByName,
    canPlayerScore,
    canPlayerAssist,
    clearTeamDraw
  } = usePlayersStore()

  const [isInitialized, setIsInitialized] = useState(false)

  // Inicializar com matchId se fornecido
  useEffect(() => {
    if (matchId && matchId !== currentMatchId) {
      setCurrentMatch(matchId)
      loadTeamDraw(matchId)
    }
    setIsInitialized(true)
  }, [matchId, currentMatchId])

  // Carregar sorteio de times
  const loadTeamDraw = async (targetMatchId: string) => {
    try {
      await loadPlayersFromTeamDraw(targetMatchId)
    } catch (error) {
      console.error('Erro ao carregar sorteio de times:', error)
    }
  }

  // Sortear times
  const drawTeams = async (targetMatchId: string, playersPerTeam: 6 | 7 = 6) => {
    try {
      // Usar implementação local para desenvolvimento
      await storeDrawTeams(targetMatchId, playersPerTeam)
      
      // Recarregar dados após sorteio
      await loadTeamDraw(targetMatchId)
      
      return { success: true }
    } catch (error: any) {
      console.error('Erro ao sortear times:', error)
      throw error
    }
  }

  // Atualizar sorteio atual
  const refreshTeamDraw = async () => {
    if (currentMatchId) {
      await loadTeamDraw(currentMatchId)
    }
  }

  // Obter estatísticas dos times
  const getTeamStats = () => {
    const stats: Record<TeamColor, { total: number; active: number; substitutes: number }> = {
      Preto: { total: 0, active: 0, substitutes: 0 },
      Verde: { total: 0, active: 0, substitutes: 0 },
      Cinza: { total: 0, active: 0, substitutes: 0 },
      Vermelho: { total: 0, active: 0, substitutes: 0 }
    }

    players.forEach(player => {
      if (player.team_color) {
        stats[player.team_color].total++
        if (player.is_substitute) {
          stats[player.team_color].substitutes++
        } else {
          stats[player.team_color].active++
        }
      }
    })

    return stats
  }

  // Verificar se há sorteio de times
  const hasTeamDraw = Boolean(teamDraw && players.length > 0)

  // Verificar se sorteio está completo (pelo menos 2 times com jogadores)
  const isTeamDrawComplete = () => {
    if (!hasTeamDraw) return false
    
    const stats = getTeamStats()
    const teamsWithPlayers = Object.values(stats).filter(stat => stat.active > 0).length
    
    return teamsWithPlayers >= 2
  }

  return {
    // Estado
    players,
    teamDraw,
    loading,
    error,
    
    // Funções de times
    getPlayersByTeam,
    getAvailablePlayersForTeam,
    getAllAvailablePlayers,
    
    // Ações
    loadTeamDraw,
    drawTeams,
    refreshTeamDraw,
    
    // Substituições
    substitutePlayer,
    addPlayerToTeam,
    
    // Busca
    searchPlayers,
    getPlayerById,
    getPlayerByName,
    
    // Validações
    canPlayerScore,
    canPlayerAssist,
    
    // Estatísticas
    getTeamStats,
    hasTeamDraw,
    isTeamDrawComplete: isTeamDrawComplete()
  }
}

// Hook específico para modal de gol
export const useGoalModal = (matchId?: string) => {
  const teamDraw = useTeamDraw(matchId)
  
  // Obter opções de jogadores para seletor
  const getPlayerOptions = (teamColor: TeamColor) => {
    const players = teamDraw.getPlayersByTeam(teamColor)
    return players.map(player => ({
      value: player.id,
      label: player.name,
      position: player.position,
      stars: player.stars
    }))
  }

  // Obter opções de assistência (mesmo time, exceto o autor)
  const getAssistOptions = (teamColor: TeamColor, authorId?: string) => {
    const players = teamDraw.getPlayersByTeam(teamColor)
    return players
      .filter(player => player.id !== authorId)
      .map(player => ({
        value: player.id,
        label: player.name,
        position: player.position,
        stars: player.stars
      }))
  }

  // Validar gol
  const validateGoal = (authorId: string, assistId: string | null, teamColor: TeamColor) => {
    const errors: string[] = []

    // Verificar se autor pode marcar
    if (!teamDraw.canPlayerScore(authorId, teamColor)) {
      errors.push('Jogador não pode marcar gol para este time')
    }

    // Verificar assistência se fornecida
    if (assistId && !teamDraw.canPlayerAssist(assistId, authorId, teamColor)) {
      errors.push('Jogador não pode dar assistência para este gol')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  return {
    ...teamDraw,
    getPlayerOptions,
    getAssistOptions,
    validateGoal
  }
}