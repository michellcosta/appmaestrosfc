/**
 * Database Helpers - Supabase
 * Funções tipadas para operações de banco relacionadas a:
 * - Jogadores
 * - Partidas (Matches)
 * - Times (Teams)
 * - Gols (Goals)
 */

import { supabase } from './supabase';
import { TeamColor, User } from '@/types';

// ==================== TIPOS ====================

export interface Player {
  id: string;
  name: string;
  email?: string;
  position?: string;
  stars?: number;
  active: boolean;
  created_at?: string;
}

export interface Match {
  id: string;
  group_id?: string | null;
  status: 'draft' | 'ongoing' | 'finished';
  started_at?: string | null;
  finished_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  match_id: string;
  name: string; // 'Preto', 'Verde', 'Cinza', 'Vermelho'
  color?: string | null;
  created_at: string;
}

export interface MatchPlayer {
  match_id: string;
  team_id: string;
  player_id: string;
  starter: boolean;
  substituted_at?: string | null;
  created_at: string;
}

export interface Goal {
  id: string;
  match_id: string;
  team_id?: string | null;
  player_id?: string | null;
  assist_player_id?: string | null;
  minute?: number | null;
  round?: number | null;
  created_at: string;
}

export interface MatchBundle {
  match: Match;
  teams: Team[];
  players: MatchPlayer[];
}

export interface MatchStats {
  scoreboard: { teamId: string; teamName: string; goals: number }[];
  goals: Goal[];
}

// ==================== JOGADORES ====================

/**
 * Buscar jogadores por grupo (ou todos se groupId não fornecido)
 */
export async function getPlayersByGroup(groupId?: string): Promise<Player[]> {
  try {
    let query = supabase
      .from('players')
      .select('*')
      .eq('active', true);

    if (groupId) {
      // Se houver implementação de group_players, adicionar join aqui
      // Por ora, retorna todos os jogadores ativos
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar jogadores:', error);
      throw new Error(`Erro ao buscar jogadores: ${error.message}`);
    }

    return (data || []) as Player[];
  } catch (error: any) {
    console.error('Erro em getPlayersByGroup:', error);
    throw error;
  }
}

// ==================== CRIAR PARTIDA COM TIMES ====================

export interface CreateMatchParams {
  groupId?: string;
  teamCount: number; // 2, 3 ou 4
  players: { id: string; name: string }[]; // jogadores selecionados (presentes)
  playersPerTeam?: number; // 5 ou 6 (opcional, default: distribuir igualmente)
}

/**
 * Criar partida com times e jogadores distribuídos
 * Retorna o ID da partida criada
 */
export async function createMatchWithTeams(params: CreateMatchParams): Promise<{ matchId: string }> {
  const { groupId, teamCount, players, playersPerTeam } = params;

  try {
    // 1. Criar a partida
    const { data: matchData, error: matchError } = await supabase
      .from('matches')
      .insert({
        group_id: groupId,
        status: 'ongoing',
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (matchError || !matchData) {
      throw new Error(`Erro ao criar partida: ${matchError?.message || 'Dados não retornados'}`);
    }

    const matchId = matchData.id;

    // 2. Criar os times
    const teamNames: TeamColor[] = ['Preto', 'Verde', 'Cinza', 'Vermelho'];
    const teamsToCreate = teamNames.slice(0, teamCount);

    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .insert(
        teamsToCreate.map(name => ({
          match_id: matchId,
          name,
          color: name // pode ajustar cores hex aqui se necessário
        }))
      )
      .select();

    if (teamsError || !teamsData) {
      throw new Error(`Erro ao criar times: ${teamsError?.message || 'Dados não retornados'}`);
    }

    // 3. Embaralhar jogadores (snake draft se skill disponível)
    const shuffledPlayers = shuffleArray([...players]);

    // 4. Distribuir jogadores nos times (round-robin)
    const playersPerTeamCalc = playersPerTeam || Math.floor(shuffledPlayers.length / teamCount);
    const matchPlayers: Omit<MatchPlayer, 'created_at'>[] = [];

    let playerIndex = 0;
    for (let i = 0; i < teamCount; i++) {
      const team = teamsData[i];
      const playersToAdd = Math.min(playersPerTeamCalc, shuffledPlayers.length - playerIndex);

      for (let j = 0; j < playersToAdd; j++) {
        const player = shuffledPlayers[playerIndex];
        matchPlayers.push({
          match_id: matchId,
          team_id: team.id,
          player_id: player.id,
          starter: true
        });
        playerIndex++;
      }
    }

    // Distribuir jogadores restantes (se houver)
    while (playerIndex < shuffledPlayers.length) {
      for (let i = 0; i < teamCount && playerIndex < shuffledPlayers.length; i++) {
        const team = teamsData[i];
        const player = shuffledPlayers[playerIndex];
        matchPlayers.push({
          match_id: matchId,
          team_id: team.id,
          player_id: player.id,
          starter: true
        });
        playerIndex++;
      }
    }

    // 5. Inserir jogadores nos times
    if (matchPlayers.length > 0) {
      const { error: playersError } = await supabase
        .from('match_players')
        .insert(matchPlayers);

      if (playersError) {
        throw new Error(`Erro ao adicionar jogadores: ${playersError.message}`);
      }
    }

    return { matchId };

  } catch (error: any) {
    console.error('Erro em createMatchWithTeams:', error);
    throw error;
  }
}

// ==================== BUSCAR PARTIDA COM TIMES ====================

/**
 * Buscar partida completa com times e jogadores
 */
export async function getMatchWithTeams(matchId: string): Promise<MatchBundle> {
  try {
    // 1. Buscar partida
    const { data: matchData, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (matchError || !matchData) {
      throw new Error(`Erro ao buscar partida: ${matchError?.message || 'Partida não encontrada'}`);
    }

    // 2. Buscar times da partida
    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .eq('match_id', matchId);

    if (teamsError) {
      throw new Error(`Erro ao buscar times: ${teamsError.message}`);
    }

    // 3. Buscar jogadores da partida
    const { data: playersData, error: playersError } = await supabase
      .from('match_players')
      .select('*')
      .eq('match_id', matchId);

    if (playersError) {
      throw new Error(`Erro ao buscar jogadores: ${playersError.message}`);
    }

    return {
      match: matchData as Match,
      teams: (teamsData || []) as Team[],
      players: (playersData || []) as MatchPlayer[]
    };

  } catch (error: any) {
    console.error('Erro em getMatchWithTeams:', error);
    throw error;
  }
}

// ==================== ADICIONAR GOL ====================

export interface AddGoalInput {
  matchId: string;
  teamId: string;
  playerId: string;
  assistPlayerId?: string | null;
  minute?: number | null;
  round?: number | null;
}

/**
 * Adicionar gol na partida
 */
export async function addGoal(input: AddGoalInput): Promise<void> {
  try {
    const { error } = await supabase
      .from('goals')
      .insert({
        match_id: input.matchId,
        team_id: input.teamId,
        player_id: input.playerId,
        assist_player_id: input.assistPlayerId || null,
        minute: input.minute || null,
        round: input.round || null
      });

    if (error) {
      throw new Error(`Erro ao adicionar gol: ${error.message}`);
    }

  } catch (error: any) {
    console.error('Erro em addGoal:', error);
    throw error;
  }
}

// ==================== ESTATÍSTICAS DA PARTIDA ====================

/**
 * Buscar estatísticas da partida (placar e gols)
 */
export async function getMatchStats(matchId: string): Promise<MatchStats> {
  try {
    // 1. Buscar times da partida
    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .select('id, name')
      .eq('match_id', matchId);

    if (teamsError) {
      throw new Error(`Erro ao buscar times: ${teamsError.message}`);
    }

    // 2. Buscar gols da partida
    const { data: goalsData, error: goalsError } = await supabase
      .from('goals')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true });

    if (goalsError) {
      throw new Error(`Erro ao buscar gols: ${goalsError.message}`);
    }

    // 3. Calcular placar por time
    const scoreboard: { teamId: string; teamName: string; goals: number }[] = [];

    (teamsData || []).forEach((team) => {
      const teamGoals = (goalsData || []).filter(g => g.team_id === team.id).length;
      scoreboard.push({
        teamId: team.id,
        teamName: team.name,
        goals: teamGoals
      });
    });

    return {
      scoreboard,
      goals: (goalsData || []) as Goal[]
    };

  } catch (error: any) {
    console.error('Erro em getMatchStats:', error);
    throw error;
  }
}

// ==================== HELPER: EMBARALHAR ARRAY ====================

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ==================== HELPER: OBTER GRUPO ATUAL ====================

/**
 * Obter grupo atual do usuário (placeholder - implementar lógica real)
 * Por enquanto retorna null (todos os jogadores)
 */
export function getCurrentGroupId(): string | undefined {
  // TODO: Implementar lógica real de obter grupo do contexto/URL/store
  // Exemplo: obter de localStorage, contexto de autenticação, etc.
  return undefined;
}
