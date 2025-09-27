import { useEffect, useState, useCallback } from 'react';
import { useMatchStore } from '@/store/matchStore';
import { useGamesStore } from '@/store/gamesStore';
import { usePlayerStats } from '@/hooks/usePlayerStats';
import { generateAllFigurinhas, type Figurinha, type PlayerStats } from '@/utils/figurinhas';

interface AchievementNotification {
  id: string;
  figurinha: Figurinha;
  timestamp: number;
  isNew: boolean;
}

interface AchievementTracker {
  notifications: AchievementNotification[];
  newAchievements: Figurinha[];
  checkAchievements: () => void;
  markAsRead: (notificationId: string) => void;
  clearAllNotifications: () => void;
}

export function useAchievementTracker(userId: string, userRole?: string): AchievementTracker {
  const [notifications, setNotifications] = useState<AchievementNotification[]>([]);
  const [newAchievements, setNewAchievements] = useState<Figurinha[]>([]);
  const [previousStats, setPreviousStats] = useState<PlayerStats | null>(null);
  
  const { events, allEvents, round } = useMatchStore();
  const { matches } = useGamesStore();
  const { stats: playerStats } = usePlayerStats(userId);

  // Rastrear mudanças nas estatísticas para detectar novas conquistas - SIMPLIFICADO
  const checkAchievements = useCallback(() => {
    if (!playerStats) return;

    const currentStats: PlayerStats = {
      totalGoals: playerStats.totalGoals || 0,
      totalAssists: playerStats.totalAssists || 0,
      totalMatches: playerStats.totalMatches || 0,
      totalPayments: playerStats.totalPayments || 0,
      consecutiveMatches: playerStats.consecutiveMatches || 0,
      victories: playerStats.victories || 0,
      // Estatísticas de performance simplificadas
      fastestGoal: 45,
      goalAccuracy: 85,
      cleanSheets: 3,
      hatTricks: 1,
      perfectAssists: 2,
      mvpCount: 5,
      monthlyGoals: 8,
      monthlyMatches: 6,
      loginDays: 15
    };

    const currentFigurinhas = generateAllFigurinhas(currentStats, userRole);
    const previousFigurinhas = previousStats ? generateAllFigurinhas(previousStats, userRole) : [];

    // Detectar novas conquistas
    const newlyUnlocked = currentFigurinhas.filter(current => {
      const previous = previousFigurinhas.find(p => p.id === current.id);
      return current.unlocked && (!previous || !previous.unlocked);
    });

    if (newlyUnlocked.length > 0) {
      setNewAchievements(newlyUnlocked);
      
      // Criar notificações
      const newNotifications = newlyUnlocked.map(figurinha => ({
        id: `notification-${Date.now()}-${figurinha.id}`,
        figurinha,
        timestamp: Date.now(),
        isNew: true
      }));

      setNotifications(prev => [...newNotifications, ...prev]);
    }

    setPreviousStats(currentStats);
  }, [playerStats, userRole, previousStats]);

  // Funções de cálculo removidas para evitar loops infinitos
  // Em implementação futura, podem ser reativadas com otimizações adequadas

  // Verificar conquistas quando as estatísticas mudam - OTIMIZADO
  useEffect(() => {
    if (playerStats) {
      checkAchievements();
    }
  }, [playerStats]); // Removido checkAchievements das dependências

  // Verificar conquistas quando eventos de partida mudam - OTIMIZADO
  useEffect(() => {
    if (events.length > 0 || allEvents.length > 0) {
      checkAchievements();
    }
  }, [events, allEvents]); // Removido checkAchievements das dependências

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isNew: false }
          : notif
      )
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    newAchievements,
    checkAchievements,
    markAsRead,
    clearAllNotifications
  };
}
