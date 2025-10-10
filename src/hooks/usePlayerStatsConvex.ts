import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function usePlayerStats(playerId: string) {
  // Mock temporário - Convex playerStats não está funcionando corretamente
  const stats = null;
  const loading = false;
  const error = null;

  return {
    stats: stats ? {
      totalGoals: 0,
      totalAssists: 0,
      totalMatches: 0,
      victories: 0,
      draws: 0,
      defeats: 0,
      participation: 0,
      totalTimePlayed: 0,
      totalYellowCards: 0,
      totalRedCards: 0,
      averageRating: 0,
      goalsPerMatch: 0,
      assistsPerMatch: 0,
      manOfMatchCount: 0,
      lastMatchDate: null
    } : null,
    loading,
    error
  };
}

export function usePlayerRanking(sortBy: 'goals' | 'assists' | 'matches_played' = 'goals', limit: number = 10) {
  // Mock temporário
  return {
    ranking: [],
    loading: false,
    error: null
  };
}

export function useAggregatedStats() {
  // Mock temporário
  return {
    aggregated: {
      totalPlayers: 0,
      totalGoals: 0,
      totalAssists: 0,
      totalMatches: 0,
      totalVictories: 0,
      totalDraws: 0,
      totalDefeats: 0,
      averageGoalsPerPlayer: 0,
      averageAssistsPerPlayer: 0,
      averageMatchesPerPlayer: 0
    },
    loading: false,
    error: null
  };
}
