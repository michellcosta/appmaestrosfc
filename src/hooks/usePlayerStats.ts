import { useEffect, useState } from 'react';

export interface PlayerStats {
  totalGoals: number;
  totalAssists: number;
  totalMatches: number;
  consecutiveMatches: number;
  totalPayments: number;
  victories: number;
  draws: number;
  defeats: number;
  averageGoals: number;
  participation: number;
  totalTimePlayed: number; // em minutos
  totalYellowCards: number;
  totalRedCards: number;
  averageRating: number;
  goalsPerMatch: number;
  assistsPerMatch: number;
  manOfMatchCount: number;
  lastMatchDate: string | null;
}

export interface GoalEvent {
  id: string;
  match_id: string;
  player_id: string;
  assist_player_id?: string;
  team_color: string;
  minute: number;
  round_number: number;
  is_own_goal: boolean;
  is_penalty: boolean;
  created_at: string;
}

export interface PlayerMatch {
  id: string;
  player_id: string;
  match_id: string;
  team_color: string;
  position: string;
  minutes_played: number;
  goals_scored: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  rating: number;
  is_man_of_match: boolean;
  created_at: string;
  updated_at: string;
}

export function usePlayerStats(userId: string) {
  const [stats, setStats] = useState<PlayerStats>({
    totalGoals: 0,
    totalAssists: 0,
    totalMatches: 0,
    consecutiveMatches: 0,
    totalPayments: 0,
    victories: 0,
    draws: 0,
    defeats: 0,
    averageGoals: 0,
    participation: 0,
    totalTimePlayed: 0,
    totalYellowCards: 0,
    totalRedCards: 0,
    averageRating: 0,
    goalsPerMatch: 0,
    assistsPerMatch: 0,
    manOfMatchCount: 0,
    lastMatchDate: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [goalEvents, setGoalEvents] = useState<GoalEvent[]>([]);
  const [playerMatches, setPlayerMatches] = useState<PlayerMatch[]>([]);

  useEffect(() => {
    if (!userId) return;

    const fetchPlayerStats = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log(`🔍 Buscando estatísticas REAIS para jogador: ${userId}`);

        // MOCK TEMPORÁRIO - Substituir por dados do Convex quando disponível
        const aggregatedStats = null;
        const statsError = null;

        // MOCK TEMPORÁRIO - Substituir por dados do Convex quando disponível  
        const goalsData = [];
        const goalsError = null;

        // MOCK TEMPORÁRIO - Substituir por dados do Convex quando disponível
        const assistsData = [];
        const assistsError = null;

        // MOCK TEMPORÁRIO - Substituir por dados do Convex quando disponível
        const matchesData = [];
        const matchesError = null;

        if (statsError && statsError.code !== 'PGRST116') {
          console.warn('⚠️ Erro ao buscar estatísticas agregadas:', statsError);
        }

        if (goalsError) {
          console.warn('⚠️ Erro ao buscar gols:', goalsError);
        }

        if (assistsError) {
          console.warn('⚠️ Erro ao buscar assistências:', assistsError);
        }

        if (matchesError) {
          console.warn('⚠️ Erro ao buscar partidas:', matchesError);
        }

        // Usar dados agregados se disponíveis, senão calcular manualmente
        const finalStats: PlayerStats = aggregatedStats ? {
          totalGoals: aggregatedStats.total_goals || 0,
          totalAssists: aggregatedStats.total_assists || 0,
          totalMatches: aggregatedStats.total_matches || 0,
          consecutiveMatches: 0, // TODO: Implementar cálculo de partidas consecutivas
          totalPayments: 0, // TODO: Implementar quando sistema de pagamentos estiver completo
          victories: aggregatedStats.wins || 0,
          draws: aggregatedStats.draws || 0,
          defeats: aggregatedStats.losses || 0,
          averageGoals: aggregatedStats.goals_per_match || 0,
          participation: aggregatedStats.total_matches > 0 ? Math.min(95, aggregatedStats.total_matches * 5) : 0,
          totalTimePlayed: aggregatedStats.total_minutes_played || 0,
          totalYellowCards: aggregatedStats.total_yellow_cards || 0,
          totalRedCards: aggregatedStats.total_red_cards || 0,
          averageRating: aggregatedStats.average_rating || 0,
          goalsPerMatch: aggregatedStats.goals_per_match || 0,
          assistsPerMatch: aggregatedStats.assists_per_match || 0,
          manOfMatchCount: aggregatedStats.man_of_match_count || 0,
          lastMatchDate: aggregatedStats.last_match_date || null
        } : {
          // Fallback: calcular manualmente dos dados brutos
          totalGoals: goalsData?.length || 0,
          totalAssists: assistsData?.length || 0,
          totalMatches: matchesData?.length || 0,
          consecutiveMatches: 0,
          totalPayments: 0,
          victories: 0,
          draws: 0,
          defeats: 0,
          averageGoals: matchesData?.length > 0 ? Number(((goalsData?.length || 0) / matchesData.length).toFixed(2)) : 0,
          participation: matchesData?.length > 0 ? Math.min(95, matchesData.length * 5) : 0,
          totalTimePlayed: matchesData?.reduce((sum, match) => sum + (match.minutes_played || 0), 0) || 0,
          totalYellowCards: matchesData?.reduce((sum, match) => sum + (match.yellow_cards || 0), 0) || 0,
          totalRedCards: matchesData?.reduce((sum, match) => sum + (match.red_cards || 0), 0) || 0,
          averageRating: matchesData?.length > 0 ? Number((matchesData.reduce((sum, match) => sum + (match.rating || 0), 0) / matchesData.length).toFixed(1)) : 0,
          goalsPerMatch: matchesData?.length > 0 ? Number(((goalsData?.length || 0) / matchesData.length).toFixed(2)) : 0,
          assistsPerMatch: matchesData?.length > 0 ? Number(((assistsData?.length || 0) / matchesData.length).toFixed(2)) : 0,
          manOfMatchCount: matchesData?.filter(match => match.is_man_of_match).length || 0,
          lastMatchDate: matchesData?.[0]?.created_at || null
        };

        setGoalEvents(goalsData || []);
        setPlayerMatches(matchesData || []);
        setStats(finalStats);

        console.log(`✅ Estatísticas REAIS carregadas:`, finalStats);

      } catch (err) {
        console.error('❌ Erro ao buscar estatísticas do jogador:', err);
        setError('Erro ao carregar estatísticas em tempo real');

        // Fallback para dados zerados
        setStats({
          totalGoals: 0,
          totalAssists: 0,
          totalMatches: 0,
          consecutiveMatches: 0,
          totalPayments: 0,
          victories: 0,
          draws: 0,
          defeats: 0,
          averageGoals: 0,
          participation: 0,
          totalTimePlayed: 0,
          totalYellowCards: 0,
          totalRedCards: 0,
          averageRating: 0,
          goalsPerMatch: 0,
          assistsPerMatch: 0,
          manOfMatchCount: 0,
          lastMatchDate: null
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerStats();

    // Configurar subscription para atualizações em tempo real 
    const intervalId = setInterval(() => {
      fetchPlayerStats();
    }, 30000); // Verificar a cada 30 segundos

    // Subscription via WebSocket/Supabase Real Time - TEMPORARIAMENTE DESABILITADA
    // const channel = supabase
    //   .channel(`player_stats_${userId}`)
    //   .on('postgres_changes', {
    //     event: '*',
    //     schema: 'public', 
    //     table: 'team_draw'
    //   }, () => {
    //     console.log('🔄 Atualização de dados detectada via Supabase Real-time');
    //     fetchPlayerStats();
    //   })
    //   .subscribe();

    return () => {
      clearInterval(intervalId);
      // supabase.removeChannel(channel); // Desabilitado junto com a subscription
      console.log('🔌 Subscription de tempo real removida');
    };

  }, [userId]);

  // Função para adicionar um gol - MOCK TEMPORÁRIO
  const addGoal = async (matchId: string, playerId: string, assistPlayerId?: string, teamColor: string = 'Preto', minute: number = 0, roundNumber: number = 1, isOwnGoal: boolean = false, isPenalty: boolean = false) => {
    try {
      // MOCK TEMPORÁRIO - Substituir por Convex quando disponível
      const data = { id: `goal_${Date.now()}` };
      const error = null;

      if (error) throw error;

      // Atualizar estatísticas locais
      setStats(prev => ({
        ...prev,
        totalGoals: prev.totalGoals + 1,
        goalsPerMatch: prev.totalMatches > 0 ? Number(((prev.totalGoals + 1) / prev.totalMatches).toFixed(2)) : 0
      }));

      // Recarregar estatísticas completas
      await fetchPlayerStats();

      return data;
    } catch (err) {
      console.error('❌ Erro ao adicionar gol:', err);
      throw err;
    }
  };

  // Função para adicionar participação em partida - MOCK TEMPORÁRIO
  const addPlayerMatch = async (matchId: string, playerId: string, teamColor: string, position: string = 'field', minutesPlayed: number = 90) => {
    try {
      // MOCK TEMPORÁRIO - Substituir por Convex quando disponível
      const data = { id: `match_${Date.now()}` };
      const error = null;

      if (error) throw error;

      // Atualizar estatísticas locais
      setStats(prev => ({
        ...prev,
        totalMatches: prev.totalMatches + 1,
        totalTimePlayed: prev.totalTimePlayed + minutesPlayed
      }));

      // Recarregar estatísticas completas
      await fetchPlayerStats();

      return data;
    } catch (err) {
      console.error('❌ Erro ao adicionar participação em partida:', err);
      throw err;
    }
  };

  // Função para atualizar estatísticas manualmente
  const refreshStats = async () => {
    await fetchPlayerStats();
  };

  return {
    stats,
    loading,
    error,
    goalEvents,
    playerMatches,
    addGoal,
    addPlayerMatch,
    refreshStats
  };
}

export default usePlayerStats;
