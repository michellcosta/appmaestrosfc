import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface GoalEventData {
  match_id: string;
  player_id: string;
  assist_player_id?: string;
  team_color: string;
  minute: number;
  round_number: number;
  is_own_goal?: boolean;
  is_penalty?: boolean;
}

export interface CardEventData {
  match_id: string;
  player_id: string;
  team_color: string;
  card_type: 'yellow' | 'red';
  minute: number;
  round_number: number;
  reason?: string;
}

export interface SubstitutionEventData {
  match_id: string;
  player_out_id: string;
  player_in_id: string;
  team_color: string;
  minute: number;
  round_number: number;
  reason?: string;
}

export interface PlayerMatchData {
  player_id: string;
  match_id: string;
  team_color: string;
  position?: string;
  minutes_played?: number;
  goals_scored?: number;
  assists?: number;
  yellow_cards?: number;
  red_cards?: number;
  rating?: number;
  is_man_of_match?: boolean;
}

/**
 * Hook para gerenciar eventos de partida (gols, cartões, substituições)
 */
export function useMatchEvents() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Adicionar gol
  const addGoal = useCallback(async (goalData: GoalEventData) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('goal_events')
        .insert({
          ...goalData,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      // Atualizar player_matches se necessário
      await updatePlayerMatchStats(goalData.match_id, goalData.player_id, {
        goals_scored: 1
      });

      if (goalData.assist_player_id) {
        await updatePlayerMatchStats(goalData.match_id, goalData.assist_player_id, {
          assists: 1
        });
      }

      toast.success(`⚽ Gol registrado! ${goalData.assist_player_id ? '(com assistência)' : ''}`);
      return data;
    } catch (err) {
      console.error('❌ Erro ao adicionar gol:', err);
      setError('Erro ao registrar gol');
      toast.error('Erro ao registrar gol');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Adicionar cartão
  const addCard = useCallback(async (cardData: CardEventData) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('card_events')
        .insert({
          ...cardData,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      // Atualizar player_matches
      const fieldName = cardData.card_type === 'yellow' ? 'yellow_cards' : 'red_cards';
      await updatePlayerMatchStats(cardData.match_id, cardData.player_id, {
        [fieldName]: 1
      });

      const cardEmoji = cardData.card_type === 'yellow' ? '🟨' : '🟥';
      toast.success(`${cardEmoji} Cartão ${cardData.card_type} registrado!`);
      return data;
    } catch (err) {
      console.error('❌ Erro ao adicionar cartão:', err);
      setError('Erro ao registrar cartão');
      toast.error('Erro ao registrar cartão');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Adicionar substituição
  const addSubstitution = useCallback(async (subData: SubstitutionEventData) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('substitution_events')
        .insert({
          ...subData,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      // Atualizar player_matches
      await updatePlayerMatchStats(subData.match_id, subData.player_out_id, {
        position: 'substitute'
      });

      await updatePlayerMatchStats(subData.match_id, subData.player_in_id, {
        position: 'field'
      });

      toast.success('🔄 Substituição registrada!');
      return data;
    } catch (err) {
      console.error('❌ Erro ao adicionar substituição:', err);
      setError('Erro ao registrar substituição');
      toast.error('Erro ao registrar substituição');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Adicionar participação em partida
  const addPlayerMatch = useCallback(async (playerMatchData: PlayerMatchData) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('player_matches')
        .insert(playerMatchData)
        .select()
        .single();

      if (error) throw error;

      toast.success('👤 Jogador adicionado à partida!');
      return data;
    } catch (err) {
      console.error('❌ Erro ao adicionar jogador à partida:', err);
      setError('Erro ao adicionar jogador');
      toast.error('Erro ao adicionar jogador');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Atualizar estatísticas de jogador na partida
  const updatePlayerMatchStats = useCallback(async (matchId: string, playerId: string, updates: Partial<PlayerMatchData>) => {
    try {
      const { data, error } = await supabase
        .from('player_matches')
        .update(updates)
        .eq('match_id', matchId)
        .eq('player_id', playerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('❌ Erro ao atualizar estatísticas do jogador:', err);
      throw err;
    }
  }, []);

  // Buscar eventos de uma partida
  const getMatchEvents = useCallback(async (matchId: string) => {
    try {
      setLoading(true);
      setError(null);

      const [goalsResult, cardsResult, substitutionsResult] = await Promise.all([
        supabase
          .from('goal_events')
          .select(`
            *,
            player:auth.users!goal_events_player_id_fkey(full_name, avatar_url),
            assist_player:auth.users!goal_events_assist_player_id_fkey(full_name, avatar_url)
          `)
          .eq('match_id', matchId)
          .order('created_at', { ascending: true }),
        
        supabase
          .from('card_events')
          .select(`
            *,
            player:auth.users!card_events_player_id_fkey(full_name, avatar_url)
          `)
          .eq('match_id', matchId)
          .order('created_at', { ascending: true }),
        
        supabase
          .from('substitution_events')
          .select(`
            *,
            player_out:auth.users!substitution_events_player_out_id_fkey(full_name, avatar_url),
            player_in:auth.users!substitution_events_player_in_id_fkey(full_name, avatar_url)
          `)
          .eq('match_id', matchId)
          .order('created_at', { ascending: true })
      ]);

      if (goalsResult.error) throw goalsResult.error;
      if (cardsResult.error) throw cardsResult.error;
      if (substitutionsResult.error) throw substitutionsResult.error;

      return {
        goals: goalsResult.data || [],
        cards: cardsResult.data || [],
        substitutions: substitutionsResult.data || []
      };
    } catch (err) {
      console.error('❌ Erro ao buscar eventos da partida:', err);
      setError('Erro ao carregar eventos');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar estatísticas de jogadores de uma partida
  const getMatchPlayerStats = useCallback(async (matchId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('player_matches')
        .select(`
          *,
          player:auth.users!player_matches_player_id_fkey(full_name, avatar_url)
        `)
        .eq('match_id', matchId)
        .order('team_color', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (err) {
      console.error('❌ Erro ao buscar estatísticas dos jogadores:', err);
      setError('Erro ao carregar estatísticas');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    addGoal,
    addCard,
    addSubstitution,
    addPlayerMatch,
    updatePlayerMatchStats,
    getMatchEvents,
    getMatchPlayerStats
  };
}
