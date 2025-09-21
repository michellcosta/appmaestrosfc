import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface CreditWallet {
  id: string;
  user_id: string;
  group_id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  group_name: string;
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  wallet_id: string;
  type: 'earned' | 'spent' | 'bonus' | 'penalty';
  amount: number;
  description: string;
  option_id?: string;
  quantity?: number;
  created_at: string;
}

export interface CreditUsageOption {
  id: string;
  name: string;
  description: string;
  cost_per_unit: number;
  category: 'monthly_fee' | 'event' | 'discount' | 'prize';
  is_active: boolean;
  group_id: string;
}

export function useCreditWallet(userId: string, groupId?: string) {
  const [wallet, setWallet] = useState<CreditWallet | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [usageOptions, setUsageOptions] = useState<CreditUsageOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar carteira do usuário
  const fetchWallet = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('credit_wallets')
        .select(`
          *,
          groups!inner(name)
        `)
        .eq('user_id', userId);

      if (groupId) {
        query = query.eq('group_id', groupId);
      }

      const { data, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Carteira não existe, criar uma nova
          await createWallet(userId, groupId);
          return;
        }
        throw error;
      }

      setWallet({
        ...data,
        group_name: data.groups?.name || 'Grupo'
      });
    } catch (err) {
      console.error('Erro ao buscar carteira:', err);
      setError('Erro ao carregar carteira');
    } finally {
      setLoading(false);
    }
  };

  // Criar nova carteira
  const createWallet = async (userId: string, groupId?: string) => {
    try {
      const { data, error } = await supabase
        .from('credit_wallets')
        .insert({
          user_id: userId,
          group_id: groupId,
          balance: 0,
          total_earned: 0,
          total_spent: 0
        })
        .select(`
          *,
          groups!inner(name)
        `)
        .single();

      if (error) throw error;

      setWallet({
        ...data,
        group_name: data.groups?.name || 'Grupo'
      });
    } catch (err) {
      console.error('Erro ao criar carteira:', err);
      setError('Erro ao criar carteira');
    }
  };

  // Buscar transações
  const fetchTransactions = async (walletId: string) => {
    try {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('wallet_id', walletId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      console.error('Erro ao buscar transações:', err);
    }
  };

  // Buscar opções de uso
  const fetchUsageOptions = async (groupId?: string) => {
    try {
      let query = supabase
        .from('credit_usage_options')
        .select('*')
        .eq('is_active', true);

      if (groupId) {
        query = query.eq('group_id', groupId);
      }

      const { data, error } = await query.order('cost_per_unit');

      if (error) throw error;
      setUsageOptions(data || []);
    } catch (err) {
      console.error('Erro ao buscar opções de uso:', err);
    }
  };

  // Usar créditos
  const useCredits = async (optionId: string, quantity: number = 1) => {
    if (!wallet) {
      toast.error('Carteira não encontrada');
      return;
    }

    const option = usageOptions.find(opt => opt.id === optionId);
    if (!option) {
      toast.error('Opção não encontrada');
      return;
    }

    const totalCost = option.cost_per_unit * quantity;

    try {
      const { data, error } = await supabase.functions.invoke('manageCreditWallet', {
        body: {
          operation: {
            walletId: wallet.id,
            amount: totalCost,
            type: 'spend',
            description: `${option.name} (${quantity}x)`,
            optionId: optionId,
            quantity: quantity
          }
        }
      });

      if (error) throw error;

      if (data.success) {
        setWallet(prev => prev ? {
          ...prev,
          balance: data.wallet.balance,
          total_spent: data.wallet.total_spent
        } : null);
        
        setTransactions(data.recentTransactions);
        toast.success(`${option.name} resgatado com sucesso!`);
      }
    } catch (err) {
      console.error('Erro ao usar créditos:', err);
      toast.error('Erro ao usar créditos');
    }
  };

  // Ganhar créditos
  const earnCredits = async (amount: number, description: string) => {
    if (!wallet) return;

    try {
      const { data, error } = await supabase.functions.invoke('manageCreditWallet', {
        body: {
          operation: {
            walletId: wallet.id,
            amount: amount,
            type: 'earn',
            description: description
          }
        }
      });

      if (error) throw error;

      if (data.success) {
        setWallet(prev => prev ? {
          ...prev,
          balance: data.wallet.balance,
          total_earned: data.wallet.total_earned
        } : null);
        
        setTransactions(data.recentTransactions);
        toast.success(`+${amount} créditos adicionados!`);
      }
    } catch (err) {
      console.error('Erro ao ganhar créditos:', err);
      toast.error('Erro ao adicionar créditos');
    }
  };

  // Adicionar bônus
  const addBonus = async (amount: number, description: string) => {
    if (!wallet) return;

    try {
      const { data, error } = await supabase.functions.invoke('manageCreditWallet', {
        body: {
          operation: {
            walletId: wallet.id,
            amount: amount,
            type: 'bonus',
            description: description
          }
        }
      });

      if (error) throw error;

      if (data.success) {
        setWallet(prev => prev ? {
          ...prev,
          balance: data.wallet.balance,
          total_earned: data.wallet.total_earned
        } : null);
        
        setTransactions(data.recentTransactions);
        toast.success(`Bônus de ${amount} créditos adicionado!`);
      }
    } catch (err) {
      console.error('Erro ao adicionar bônus:', err);
      toast.error('Erro ao adicionar bônus');
    }
  };

  // Aplicar penalidade
  const applyPenalty = async (amount: number, description: string) => {
    if (!wallet) return;

    try {
      const { data, error } = await supabase.functions.invoke('manageCreditWallet', {
        body: {
          operation: {
            walletId: wallet.id,
            amount: amount,
            type: 'penalty',
            description: description
          }
        }
      });

      if (error) throw error;

      if (data.success) {
        setWallet(prev => prev ? {
          ...prev,
          balance: data.wallet.balance,
          total_spent: data.wallet.total_spent
        } : null);
        
        setTransactions(data.recentTransactions);
        toast.info(`Penalidade de ${amount} créditos aplicada`);
      }
    } catch (err) {
      console.error('Erro ao aplicar penalidade:', err);
      toast.error('Erro ao aplicar penalidade');
    }
  };

  // Recarregar dados
  const refresh = async () => {
    if (wallet) {
      await fetchWallet();
      await fetchTransactions(wallet.id);
      await fetchUsageOptions(wallet.group_id);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchWallet();
    }
  }, [userId, groupId]);

  useEffect(() => {
    if (wallet) {
      fetchTransactions(wallet.id);
      fetchUsageOptions(wallet.group_id);
    }
  }, [wallet?.id]);

  return {
    wallet,
    transactions,
    usageOptions,
    loading,
    error,
    useCredits,
    earnCredits,
    addBonus,
    applyPenalty,
    refresh
  };
}