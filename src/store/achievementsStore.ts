import { create } from 'zustand';

export interface Achievement {
  id: string;
  name: string;
  emoji: string;
  description: string;
  requirement: number;
  current: number;
  unlocked: boolean;
  color: string;
  borderColor: string;
  category: 'performance' | 'attendance' | 'financial' | 'special';
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
}

interface AchievementsStore {
  // Real-time sync para achievements/statistics update 
  lastUpdate: number;
  isRealtime: boolean;
  
  // Player subscription tracking 
  subscribedPlayers: string[];
  achievementListeners: { [playerId: string]: () => void };
  
  // Function para sincronizar com dados reais em tempo real
  subscribePlayerUpdates: (playerId: string) => void;
  unsubscribePlayerUpdates: (playerId: string) => void;
  triggerStatsUpdate: (playerId: string) => void;
  
  // Live status 
  loading: { [playerId: string]: boolean };
}

export const useAchievementsStore = create<AchievementsStore>()((set, get) => ({
  // Estado de ativação de real time
  lastUpdate: Date.now(),
  isRealtime: false,
  
  subscribedPlayers: [],  
  achievementListeners: {},
  
  subscribePlayerUpdates: (playerId: string) => {
    console.log(`🔗 Subscription ativada para jogador ${playerId} achievements realtime`);
    
    set(state => ({
      subscribedPlayers: [...state.subscribedPlayers.filter(id => id !== playerId), playerId],
      isRealtime: true
    }));

    // Will be connected to host sockets for updates later
  },

  unsubscribePlayerUpdates: (playerId: string) => {
    set(state => ({
      subscribedPlayers: state.subscribedPlayers.filter(id => id !== playerId),
      achievementListeners: Object.fromEntries(
        Object.entries(state.achievementListeners).filter(([uid]) => uid !== playerId)
      )
    }));
  },

  triggerStatsUpdate: (playerId: string) => {
    console.log(`⚡ Stats update requested for player ${playerId}`);
    // Will emit to subscribed listeners when realgame event occurs
  },

  loading: {},
  // loading: {} observableData tbd
}));
