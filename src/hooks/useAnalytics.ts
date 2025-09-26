import { useState, useEffect } from 'react';
import { useGamesStore } from '@/store/gamesStore';
import { useMatchStore } from '@/store/matchStore';
import { usePlayerStatsStore } from '@/store/playerStatsStore';

export interface AnalyticsData {
  // Métricas de Partidas
  totalMatches: number;
  upcomingMatches: number;
  completedMatches: number;
  averagePlayersPerMatch: number;
  
  // Métricas Financeiras
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  averagePaymentPerPlayer: number;
  
  // Métricas de Jogadores
  totalPlayers: number;
  activePlayers: number;
  newPlayersThisMonth: number;
  topPerformers: PlayerPerformance[];
  
  // Métricas de Engajamento
  participationRate: number;
  averageGoalsPerMatch: number;
  mostActiveDay: string;
  peakHour: string;
}

export interface PlayerPerformance {
  name: string;
  goals: number;
  assists: number;
  matches: number;
  performance: number; // Score calculado
}

export interface ChartData {
  label: string;
  value: number;
  color?: string;
}

export function useAnalytics() {
  const { matches } = useGamesStore();
  const { history } = useMatchStore();
  const { stats } = usePlayerStatsStore();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateAnalytics();
  }, [matches, history, stats]);

  const calculateAnalytics = () => {
    setLoading(true);
    
    try {
      // Métricas de Partidas
      const totalMatches = matches.length;
      const upcomingMatches = matches.filter(match => 
        new Date(match.date) > new Date()
      ).length;
      const completedMatches = totalMatches - upcomingMatches;
      
      const averagePlayersPerMatch = matches.length > 0 
        ? matches.reduce((sum, match) => sum + match.confirmedPlayers, 0) / matches.length
        : 0;

      // Métricas Financeiras (simuladas)
      const totalRevenue = matches.length * 50; // R$ 50 por partida
      const monthlyRevenue = matches.filter(match => {
        const matchDate = new Date(match.date);
        const now = new Date();
        return matchDate.getMonth() === now.getMonth() && 
               matchDate.getFullYear() === now.getFullYear();
      }).length * 50;
      
      const pendingPayments = matches.filter(match => 
        new Date(match.date) > new Date()
      ).length * 15; // R$ 15 pendentes por partida
      
      const averagePaymentPerPlayer = totalRevenue / Math.max(totalMatches * 20, 1);

      // Métricas de Jogadores
      const totalPlayers = 25; // Simulado
      const activePlayers = Math.min(totalPlayers, upcomingMatches * 20);
      const newPlayersThisMonth = Math.floor(Math.random() * 5) + 1;

      // Top Performers
      const topPerformers: PlayerPerformance[] = stats
        .map(player => ({
          name: player.name,
          goals: player.goals,
          assists: player.assists,
          matches: Math.floor(Math.random() * 10) + 1,
          performance: (player.goals * 2 + player.assists) / Math.max(matches.length, 1)
        }))
        .sort((a, b) => b.performance - a.performance)
        .slice(0, 5);

      // Métricas de Engajamento
      const participationRate = (activePlayers / totalPlayers) * 100;
      const totalGoals = history.reduce((sum, match) => 
        sum + (match.leftScore || 0) + (match.rightScore || 0), 0
      );
      const averageGoalsPerMatch = totalGoals / Math.max(completedMatches, 1);
      
      const mostActiveDay = 'Sábado'; // Simulado
      const peakHour = '20:00'; // Simulado

      const analyticsData: AnalyticsData = {
        totalMatches,
        upcomingMatches,
        completedMatches,
        averagePlayersPerMatch: Math.round(averagePlayersPerMatch),
        totalRevenue,
        monthlyRevenue,
        pendingPayments,
        averagePaymentPerPlayer: Math.round(averagePaymentPerPlayer),
        totalPlayers,
        activePlayers,
        newPlayersThisMonth,
        topPerformers,
        participationRate: Math.round(participationRate),
        averageGoalsPerMatch: Math.round(averageGoalsPerMatch * 10) / 10,
        mostActiveDay,
        peakHour
      };

      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Erro ao calcular analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Dados para gráficos
  const getRevenueChartData = (): ChartData[] => {
    if (!analytics) return [];
    
    return [
      { label: 'Receita Total', value: analytics.totalRevenue, color: '#10b981' },
      { label: 'Receita Mensal', value: analytics.monthlyRevenue, color: '#3b82f6' },
      { label: 'Pendente', value: analytics.pendingPayments, color: '#f59e0b' }
    ];
  };

  const getParticipationChartData = (): ChartData[] => {
    if (!analytics) return [];
    
    return [
      { label: 'Jogadores Ativos', value: analytics.activePlayers, color: '#10b981' },
      { label: 'Jogadores Inativos', value: analytics.totalPlayers - analytics.activePlayers, color: '#6b7280' }
    ];
  };

  const getMatchesChartData = (): ChartData[] => {
    if (!analytics) return [];
    
    return [
      { label: 'Partidas Realizadas', value: analytics.completedMatches, color: '#8b5cf6' },
      { label: 'Partidas Agendadas', value: analytics.upcomingMatches, color: '#06b6d4' }
    ];
  };

  const getTopPerformersData = (): ChartData[] => {
    if (!analytics) return [];
    
    return analytics.topPerformers.map((player, index) => ({
      label: player.name,
      value: player.performance,
      color: index === 0 ? '#fbbf24' : index === 1 ? '#9ca3af' : index === 2 ? '#cd7c2f' : '#6b7280'
    }));
  };

  const getPerformanceInsights = () => {
    if (!analytics) return [];
    
    const insights = [];
    
    if (analytics.participationRate > 80) {
      insights.push({
        type: 'success',
        title: 'Excelente Engajamento',
        message: `${analytics.participationRate}% dos jogadores estão ativos`
      });
    }
    
    if (analytics.averageGoalsPerMatch > 5) {
      insights.push({
        type: 'info',
        title: 'Partidas Animadas',
        message: `Média de ${analytics.averageGoalsPerMatch} gols por partida`
      });
    }
    
    if (analytics.monthlyRevenue > 1000) {
      insights.push({
        type: 'success',
        title: 'Receita Saudável',
        message: `R$ ${analytics.monthlyRevenue} arrecadados este mês`
      });
    }
    
    if (analytics.pendingPayments > 500) {
      insights.push({
        type: 'warning',
        title: 'Pagamentos Pendentes',
        message: `R$ ${analytics.pendingPayments} em pagamentos pendentes`
      });
    }
    
    return insights;
  };

  return {
    analytics,
    loading,
    getRevenueChartData,
    getParticipationChartData,
    getMatchesChartData,
    getTopPerformersData,
    getPerformanceInsights,
    refreshAnalytics: calculateAnalytics
  };
}
