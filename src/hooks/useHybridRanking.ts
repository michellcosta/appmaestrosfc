import { usePlayerStatsStore } from '@/store/playerStatsStore';
import { useMemo } from 'react';
import { useAggregatedStats, usePlayerRanking } from './usePlayerStatsConvex';
import { usePlayersConvex } from './usePlayersConvex';

export function useHybridRanking(sortBy: 'goals' | 'assists' | 'matches_played' = 'goals', limit: number = 10) {
    // Dados online (Convex)
    const { ranking: convexRanking, loading: convexLoading } = usePlayerRanking(sortBy, limit);
    const { aggregated: convexAggregated, loading: aggregatedLoading } = useAggregatedStats();
    const { players: convexPlayers } = usePlayersConvex();

    // Dados offline (LocalStorage)
    const { stats: offlineStats, getStats } = usePlayerStatsStore();

    // Combinar dados online e offline
    const hybridRanking = useMemo(() => {
        // Se temos dados do Convex, usar eles
        if (convexRanking && convexRanking.length > 0) {
            return convexRanking;
        }

        // Senão, usar dados offline
        const offlineRanking = getStats().map(stat => ({
            _id: `offline_${stat.name}`,
            player_id: `offline_${stat.name}`,
            goals: stat.goals,
            assists: stat.assists,
            matches_played: 1, // Aproximação
            victories: 0,
            draws: 0,
            defeats: 0,
            total_time_played: 90, // Aproximação
            yellow_cards: 0,
            red_cards: 0,
            average_rating: 5,
            man_of_match_count: 0,
            last_match_date: stat.lastUpdated,
            updated_at: stat.lastUpdated,
            player_name: stat.name,
            player_email: `${stat.name}@offline.com`,
            player_position: 'Campo'
        }));

        // Ordenar por critério
        return offlineRanking.sort((a, b) => {
            switch (sortBy) {
                case 'assists':
                    return b.assists - a.assists || b.goals - a.goals;
                case 'matches_played':
                    return b.matches_played - a.matches_played || b.goals - a.goals;
                default:
                    return b.goals - a.goals || b.assists - a.assists;
            }
        }).slice(0, limit);
    }, [convexRanking, getStats, sortBy, limit]);

    // Combinar estatísticas agregadas
    const hybridAggregated = useMemo(() => {
        if (convexAggregated && convexAggregated.totalPlayers > 0) {
            return convexAggregated;
        }

        // Calcular estatísticas offline
        const stats = getStats();
        const totalGoals = stats.reduce((sum, stat) => sum + stat.goals, 0);
        const totalAssists = stats.reduce((sum, stat) => sum + stat.assists, 0);

        return {
            totalPlayers: stats.length,
            totalGoals,
            totalAssists,
            totalMatches: stats.length, // Aproximação
            totalVictories: 0,
            totalDraws: 0,
            totalDefeats: 0,
            averageGoalsPerPlayer: stats.length > 0 ? totalGoals / stats.length : 0,
            averageAssistsPerPlayer: stats.length > 0 ? totalAssists / stats.length : 0,
            averageMatchesPerPlayer: 1
        };
    }, [convexAggregated, getStats]);

    return {
        ranking: hybridRanking,
        aggregated: hybridAggregated,
        players: convexPlayers || [],
        loading: convexLoading || aggregatedLoading,
        isOffline: !convexRanking || convexRanking.length === 0,
        offlineStatsCount: getStats().length
    };
}
