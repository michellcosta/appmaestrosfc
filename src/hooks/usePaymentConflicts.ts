import { PaymentConflict } from '@/types';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

export interface MatchCapacity {
  match_id: string;
  current_participants: number;
  max_participants: number;
  is_full: boolean;
  pending_payments: number;
}

export function usePaymentConflicts() {
  const [conflicts, setConflicts] = useState<PaymentConflict[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar capacidade da partida
  const checkMatchCapacity = useCallback(async (matchId: string): Promise<MatchCapacity> => {
    try {
      // Buscar participantes confirmados
      const { data: participants, error: participantsError } = await supabase
        .from('match_participants')
        .select('id')
        .eq('match_id', matchId)
        .eq('status', 'confirmed');

      if (participantsError) throw participantsError;

      // Buscar pagamentos pendentes (aprovados mas não confirmados)
      const { data: pendingPayments, error: paymentsError } = await supabase
        .from('diarist_requests')
        .select('id')
        .eq('match_id', matchId)
        .eq('status', 'approved')
        .is('payment_confirmed_at', null);

      if (paymentsError) throw paymentsError;

      // Mock data para capacidade máxima - em produção viria da tabela matches
      const maxParticipants = 22;
      const currentParticipants = participants?.length || 0;
      const pendingCount = pendingPayments?.length || 0;

      return {
        match_id: matchId,
        current_participants: currentParticipants,
        max_participants: maxParticipants,
        is_full: currentParticipants >= maxParticipants,
        pending_payments: pendingCount
      };
    } catch (error) {
      console.error('Erro ao verificar capacidade da partida:', error);
      throw error;
    }
  }, []);

  // Detectar conflito de pagamento
  const detectPaymentConflict = useCallback(async (
    matchId: string,
    userId: string,
    paymentAmount: number,
    paymentMethod: string,
    paymentId: string
  ): Promise<PaymentConflict | null> => {
    try {
      const capacity = await checkMatchCapacity(matchId);

      // Se a partida está cheia, criar conflito
      if (capacity.is_full) {
        const conflict: Omit<PaymentConflict, 'id' | 'created_at'> = {
          match_id: matchId,
          user_id: userId,
          amount: paymentAmount,
          payment_method: paymentMethod,
          payment_id: paymentId,
          conflict_reason: 'match_full',
          status: 'pending'
        };

        const { data, error } = await supabase
          .from('payment_conflicts')
          .insert(conflict)
          .select()
          .single();

        if (error) throw error;

        return data;
      }

      return null;
    } catch (error) {
      console.error('Erro ao detectar conflito de pagamento:', error);
      throw error;
    }
  }, [checkMatchCapacity]);

  // Processar estorno automático
  const processAutomaticRefund = useCallback(async (conflictId: string): Promise<boolean> => {
    try {
      setLoading(true);

      // Buscar dados do conflito
      const { data: conflict, error: conflictError } = await supabase
        .from('payment_conflicts')
        .select('*')
        .eq('id', conflictId)
        .single();

      if (conflictError) throw conflictError;

      // Simular processamento de estorno
      // Em produção, aqui seria feita a integração com o gateway de pagamento
      const refundId = `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Simular delay do processamento
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Atualizar status do conflito
      const { error: updateError } = await supabase
        .from('payment_conflicts')
        .update({
          status: 'refunded',
          resolved_at: new Date().toISOString(),
          refund_id: refundId,
          notes: 'Estorno processado automaticamente devido à partida cheia'
        })
        .eq('id', conflictId);

      if (updateError) throw updateError;

      // Atualizar solicitação do diarista
      const { error: requestError } = await supabase
        .from('diarist_requests')
        .update({
          status: 'cancelled',
          notes: 'Solicitação cancelada automaticamente - partida cheia. Estorno processado.'
        })
        .eq('match_id', conflict.match_id)
        .eq('user_id', conflict.user_id);

      if (requestError) throw requestError;

      toast.success('Estorno processado automaticamente');
      return true;
    } catch (error) {
      console.error('Erro ao processar estorno:', error);
      toast.error('Erro ao processar estorno automático');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar conflitos pendentes
  const fetchConflicts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('payment_conflicts')
        .select(`
          *,
          user:profiles(email),
          match:matches(date, time, location)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setConflicts(data || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar conflitos';
      setError(errorMessage);
      console.error('Erro ao buscar conflitos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Resolver conflito manualmente
  const resolveConflict = useCallback(async (
    conflictId: string,
    resolution: 'refund' | 'approve',
    notes?: string
  ): Promise<boolean> => {
    try {
      setLoading(true);

      const updateData: any = {
        resolved_at: new Date().toISOString(),
        notes: notes || `Conflito resolvido manualmente: ${resolution}`
      };

      if (resolution === 'refund') {
        updateData.status = 'refunded';
        updateData.refund_id = `manual_refund_${Date.now()}`;
      } else {
        updateData.status = 'resolved';
      }

      const { error } = await supabase
        .from('payment_conflicts')
        .update(updateData)
        .eq('id', conflictId);

      if (error) throw error;

      toast.success(`Conflito ${resolution === 'refund' ? 'estornado' : 'aprovado'} com sucesso`);
      await fetchConflicts(); // Recarregar lista
      return true;
    } catch (error) {
      console.error('Erro ao resolver conflito:', error);
      toast.error('Erro ao resolver conflito');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchConflicts]);

  // Verificar se há conflitos para uma partida específica
  const hasConflictsForMatch = useCallback(async (matchId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('payment_conflicts')
        .select('id')
        .eq('match_id', matchId)
        .eq('status', 'pending')
        .limit(1);

      if (error) throw error;

      return (data?.length || 0) > 0;
    } catch (error) {
      console.error('Erro ao verificar conflitos:', error);
      return false;
    }
  }, []);

  return {
    conflicts,
    loading,
    error,
    checkMatchCapacity,
    detectPaymentConflict,
    processAutomaticRefund,
    fetchConflicts,
    resolveConflict,
    hasConflictsForMatch
  };
}