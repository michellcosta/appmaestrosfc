import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { useMatchTimer } from './matchTimerStore';

interface RealtimeState {
  isConnected: boolean;
  currentMatchId: string | null;
  events: any[];
  error: string | null;

  // Ações
  connect: (matchId: string) => void;
  disconnect: () => void;
  addEvent: (event: any) => void;
  clearEvents: () => void;
  setError: (error: string | null) => void;
}

export const useRealtime = create<RealtimeState>()(
  subscribeWithSelector((set, get) => ({
    isConnected: false,
    currentMatchId: null,
    events: [],
    error: null,

    connect: (matchId) => {
      const state = get();
      if (state.isConnected && state.currentMatchId === matchId) {
        return; // Já conectado
      }

      // Desconectar se já conectado a outra partida
      if (state.isConnected) {
        get().disconnect();
      }

      set({ currentMatchId: matchId, error: null });

      // REMOVIDO - Migração para Convex
      // Conectar ao canal da partida
      // const channel = supabase.channel(`match:${matchId}`, {
      //   config: {
      //     broadcast: { self: false },
      //     presence: { key: matchId }
      //   }
      // });

      // Mock do canal - será substituído por Convex realtime
      console.log(`🔌 Conectando ao canal da partida: ${matchId} (Mock - será substituído por Convex)`);
      const channel = {
        on: () => { },
        subscribe: (callback: any) => {
          setTimeout(() => callback('SUBSCRIBED'), 100);
          return { unsubscribe: () => { } };
        }
      };

      // Escutar eventos de partida
      channel.on('broadcast', { event: 'match_event' }, (payload) => {
        console.log('Received match event:', payload);
        get().addEvent(payload);

        // Atualizar cronômetro se necessário
        if (payload.type === 'START') {
          useMatchTimer.getState().setMatch(
            matchId,
            'live',
            payload.started_at,
            0
          );
        } else if (payload.type === 'PAUSE') {
          useMatchTimer.getState().setMatch(
            matchId,
            'paused',
            payload.started_at,
            payload.paused_ms
          );
        } else if (payload.type === 'RESET') {
          useMatchTimer.getState().reset();
        } else if (payload.type === 'END') {
          useMatchTimer.getState().setMatch(
            matchId,
            'ended',
            payload.started_at,
            payload.paused_ms
          );
        }
      });

      // Escutar mudanças de status da partida
      channel.on('broadcast', { event: 'match_status' }, (payload) => {
        console.log('Received match status:', payload);
        useMatchTimer.getState().setMatch(
          matchId,
          payload.status,
          payload.started_at,
          payload.paused_ms || 0
        );
      });

      // Gerenciar conexão
      channel.subscribe((status) => {
        console.log('Realtime status:', status);
        if (status === 'SUBSCRIBED') {
          set({ isConnected: true, error: null });
        } else if (status === 'CHANNEL_ERROR') {
          set({ isConnected: false, error: 'Connection error' });
        } else if (status === 'TIMED_OUT') {
          set({ isConnected: false, error: 'Connection timeout' });
        }
      });

      // Armazenar referência do canal
      (get() as any).channel = channel;
    },

    disconnect: () => {
      const state = get();
      if (state.isConnected && (state as any).channel) {
        // REMOVIDO - Migração para Convex
        // supabase.removeChannel((state as any).channel);
        console.log('🔌 Desconectando do canal (Mock - será substituído por Convex)');
        (state as any).channel = null;
      }

      set({
        isConnected: false,
        currentMatchId: null,
        error: null
      });
    },

    addEvent: (event) => {
      set((state) => ({
        events: [...state.events, { ...event, received_at: Date.now() }]
      }));
    },

    clearEvents: () => {
      set({ events: [] });
    },

    setError: (error) => {
      set({ error });
    }
  }))
);

// Auto-reconnect em caso de erro
useRealtime.subscribe(
  (state) => state.error,
  (error) => {
    if (error && useRealtime.getState().currentMatchId) {
      console.log('Attempting to reconnect...');
      setTimeout(() => {
        const { currentMatchId } = useRealtime.getState();
        if (currentMatchId) {
          useRealtime.getState().connect(currentMatchId);
        }
      }, 5000);
    }
  }
);
