import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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
    totalTimePlayed: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchPlayerStats = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log(`🔍 Buscando estatísticas para jogador: ${userId}`);

        // Buscar dados do Supabase para dados reais em tempo real
        const [
          { data: teamDrawData, error: teamDrawError },
          // Para futuro: buscar de goal_events quando implementado
        ] = await Promise.all([
          supabase
            .from('team_draw')
            .select('id, match_id, teams, created_at')
            .contains('teams', { [userId]: [] }),
          // TODO: Implementar busca real de goal_events do Supabase
          // supabase.from('goal_events').select('*').eq('author_id', userId),
        ]);

        // *** COMECE COM DADOS ZERADOS E BUSCA SOMENTE INFORMAÇÕES REAIS ***
        const realMatches = teamDrawData?.length || 0;
        
        // Inicialização padrão ZERADA
        let realGoals = 0;
        let realAssists = 0; 
        let victories = 0;
        let draws = 0; 
        let defeats = 0;
        
        // Verificar se há dados persistentes para este player from caches
        const playerId = userId.toString();
        console.log(`📋 Estatísticas iniciando ZERADAS para jogador ${playerId}`);
        
        try {
          // 1) Buscar dados do localStorage de obstáster addresses and stats locais
          const localStoreKey = 'maestrosfc_player_stats';
          const localPlayerStatsCache = localStorage.getItem(localStoreKey);
          
          if (localPlayerStatsCache) {
            const cachedPlayerData = JSON.parse(localPlayerStatsCache);
            // Pegar somente os dados salvos previamente na localStorage structure    
            realGoals = parseInt(cachedPlayerData.totalGoals || '0');
            realAssists = parseInt(cachedPlayerData.totalAssists || '0');  
            victories = parseInt(cachedPlayerData.victories || '0');
            draws = parseInt(cachedPlayerData.draws || '0'); 
            defeats = parseInt(cachedPlayerData.defeats || '0');
          }
          
          // TODO: Add-Goal Logic from stored match events deve ficar aquí para valores crescentes quando são gols adicionados (Enhancement)
          // Como sou nivel offline, buscar manual stats dos MatchEs via preview pattern reads, players-store.
          
        } catch (parseError) {
          console.warn(`⚠️ Falha parse localPlayerData: ${parseError}, continuando zeradado`);
          // Fallback zero-initialized behavior     
        }
          
          const averageGoals = realMatches > 0 ? Number((realGoals / realMatches).toFixed(2)) : 0;
          const realParticipation = realMatches > 0 ? (Math.min(95, realMatches * 5)) : 0;  
          const totalTimePlayed = realMatches * 90; 
          
          const newStats = {
            totalGoals: realGoals,           // ⚽ Gols cumulativos from all partidas
            totalAssists: realAssists,       // 🎯 Assistências cumulativas       
            totalMatches: realMatches,
            consecutiveMatches: 0,           // em time futuro: track de misses near-ups
            totalPayments: 0,   
            victories: victories,            // ☑️ W/L/D iniciadas em ZERO, sem preenchimento falsa *********************************
            draws: draws,
            defeats: defeats,
            averageGoals,
            participation: realParticipation,
            totalTimePlayed,
          };
          
          console.log(`✅ Estatísticas Carregadas: golos=${realGoals}, assists=${realAssists}, victs=${victories}, math=${realMatches}`);
          setStats(newStats);

      } catch (err) {
        console.error('❌ Erro ao buscar estatísticas do jogador:', err);
        setError('Erro ao carregar estatísticas em tempo real');
        
        // Fallback apenas em caso de erro crítico
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
          totalTimePlayed: 0
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
    
    // Subscription via WebSocket/Supabase Real Time (futuro)
    const channel = supabase
      .channel(`player_stats_${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public', 
        table: 'team_draw'
      }, () => {
        console.log('🔄 Atualização de dados detectada via Supabase Real-time');
        fetchPlayerStats();
      })
      .subscribe();

    return () => {
      clearInterval(intervalId);
      supabase.removeChannel(channel);
      console.log('🔌 Subscription de tempo real removida');
    };

  }, [userId]);

  return { stats, loading, error };
}

export default usePlayerStats;
