import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { DiaristRequest, DiaristRequestStatus } from '@/types';
import { useSessionProfile } from './useSessionProfile';

export function useDiaristRequests() {
  const [requests, setRequests] = useState<DiaristRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useSessionProfile();

  // Buscar solicitações do usuário atual
  const fetchUserRequests = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('diarist_requests')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar solicitações');
    } finally {
      setLoading(false);
    }
  };

  // Buscar todas as solicitações (para staff)
  const fetchAllRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('diarist_requests')
        .select(`
          *,
          user:profiles!user_id(id, email, role, membership),
          reviewer:profiles!reviewed_by(id, email, role)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar solicitações');
    } finally {
      setLoading(false);
    }
  };

  // Criar nova solicitação
  const createRequest = async (matchId: string) => {
    if (!profile?.id) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const { data, error } = await supabase
        .from('diarist_requests')
        .insert({
          user_id: profile.id,
          match_id: matchId,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Atualizar lista local
      setRequests(prev => [data, ...prev]);
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao criar solicitação');
    }
  };

  // Cancelar solicitação
  const cancelRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('diarist_requests')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .eq('user_id', profile?.id); // Segurança adicional

      if (error) throw error;

      // Atualizar lista local
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'cancelled' as DiaristRequestStatus }
            : req
        )
      );
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao cancelar solicitação');
    }
  };

  // Aprovar/rejeitar solicitação (para staff)
  const reviewRequest = async (
    requestId: string, 
    status: 'approved' | 'rejected',
    notes?: string
  ) => {
    if (!profile?.id) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const { error } = await supabase
        .from('diarist_requests')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: profile.id,
          notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      // Atualizar lista local
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { 
                ...req, 
                status,
                reviewed_at: new Date().toISOString(),
                reviewed_by: profile.id,
                notes
              }
            : req
        )
      );
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao revisar solicitação');
    }
  };

  // Verificar se já existe solicitação para uma partida
  const hasRequestForMatch = (matchId: string) => {
    return requests.some(req => 
      req.match_id === matchId && 
      req.status === 'pending'
    );
  };

  // Buscar solicitação específica para uma partida
  const getRequestForMatch = (matchId: string) => {
    return requests.find(req => 
      req.match_id === matchId && 
      req.status === 'pending'
    );
  };

  useEffect(() => {
    if (profile) {
      // Se é staff, busca todas as solicitações
      if (profile.role && ['owner', 'admin', 'aux'].includes(profile.role)) {
        fetchAllRequests();
      } else {
        // Se é diarista, busca apenas suas solicitações
        fetchUserRequests();
      }
    }
  }, [profile]);

  return {
    requests,
    loading,
    error,
    createRequest,
    cancelRequest,
    reviewRequest,
    hasRequestForMatch,
    getRequestForMatch,
    refetch: profile?.role && ['owner', 'admin', 'aux'].includes(profile.role) 
      ? fetchAllRequests 
      : fetchUserRequests
  };
}