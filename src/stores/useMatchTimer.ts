import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface MatchTimerState {
  // Estado da partida
  matchId: string | null;
  status: 'scheduled' | 'live' | 'paused' | 'ended';
  startedAt: string | null;
  pausedMs: number;
  duration: number; // em segundos
  
  // Estado do cronômetro
  elapsed: number; // em segundos
  isRunning: boolean;
  lastUpdate: number;
  
  // Ações
  setMatch: (matchId: string, status: string, startedAt: string | null, pausedMs: number) => void;
  updateElapsed: () => void;
  setDuration: (duration: number) => void;
  reset: () => void;
}

export const useMatchTimer = create<MatchTimerState>()(
  subscribeWithSelector((set, get) => ({
    // Estado inicial
    matchId: null,
    status: 'scheduled',
    startedAt: null,
    pausedMs: 0,
    duration: 600, // 10 minutos padrão
    elapsed: 0,
    isRunning: false,
    lastUpdate: Date.now(),
    
    // Ações
    setMatch: (matchId, status, startedAt, pausedMs) => {
      set({
        matchId,
        status: status as any,
        startedAt,
        pausedMs,
        isRunning: status === 'live'
      });
    },
    
    updateElapsed: () => {
      const state = get();
      if (!state.startedAt || state.status !== 'live') {
        set({ elapsed: 0, isRunning: false });
        return;
      }
      
      const now = Date.now();
      const startedAtMs = new Date(state.startedAt).getTime();
      const currentElapsed = Math.max(0, Math.floor((now - startedAtMs - state.pausedMs) / 1000));
      
      set({
        elapsed: currentElapsed,
        isRunning: true,
        lastUpdate: now
      });
    },
    
    setDuration: (duration) => {
      set({ duration });
    },
    
    reset: () => {
      set({
        matchId: null,
        status: 'scheduled',
        startedAt: null,
        pausedMs: 0,
        elapsed: 0,
        isRunning: false,
        lastUpdate: Date.now()
      });
    }
  }))
);

// Auto-update do cronômetro a cada 250ms quando ativo
let updateInterval: NodeJS.Timeout | null = null;

useMatchTimer.subscribe(
  (state) => state.isRunning,
  (isRunning) => {
    if (updateInterval) {
      clearInterval(updateInterval);
      updateInterval = null;
    }
    
    if (isRunning) {
      updateInterval = setInterval(() => {
        useMatchTimer.getState().updateElapsed();
      }, 250);
    }
  }
);
