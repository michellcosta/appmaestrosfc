import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface DigitalWallet {
  id: string;
  group_id: string;
  responsible_user_id: string;
  group_name: string;
  balance_brl: number;
  total_received_brl: number;
  total_paid_brl: number;
  pix_key?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'transfer_in' | 'transfer_out';
  amount_brl: number;
  description: string;
  reference_type?: string;
  reference_id?: string;
  pix_transaction_id?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  created_by?: string;
  processed_at: string;
  created_at: string;
}

export interface PaymentOption {
  id: string;
  name: string;
  description: string;
  price_brl: number;
  category: 'monthly_fee' | 'game_fee' | 'prize' | 'service';
  is_active: boolean;
  group_id?: string;
  created_at: string;
  updated_at: string;
}

export interface WithdrawalRequest {
  id: string;
  wallet_id: string;
  amount_brl: number;
  pix_key: string;
  pix_key_type: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected';
  rejection_reason?: string;
  requested_at: string;
  approved_at?: string;
  processed_at?: string;
}

export function useDigitalWallet(userId: string, groupId?: string) {
  const [wallet, setWallet] = useState<DigitalWallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar carteira do usuário
  const fetchWallet = async () => {
    try {
      console.log('🔍 [DEBUG] Iniciando fetchWallet...');
      console.log('🔍 [DEBUG] userId:', userId);
      console.log('🔍 [DEBUG] groupId:', groupId);

      setLoading(true);
      setError(null);

      let query = supabase
        .from('digital_wallets')
        .select('*')
        .eq('responsible_user_id', userId)
        .eq('is_active', true);

      if (groupId) {
        query = query.eq('group_id', groupId);
        console.log('🔍 [DEBUG] Adicionando filtro groupId:', groupId);
      }

      console.log('🔍 [DEBUG] Executando query...');
      const { data, error } = await query.single();

      console.log('🔍 [DEBUG] Resultado da query:');
      console.log('🔍 [DEBUG] data:', data);
      console.log('🔍 [DEBUG] error:', error);

      if (error) {
        console.log('🔍 [DEBUG] Erro detectado, código:', error.code);
        if (error.code === 'PGRST116') {
          // Carteira não existe, criar uma nova
          console.log('🔍 [DEBUG] Carteira não existe, criando nova...');
          const tempGroupId = groupId || `user_${userId.slice(0, 8)}`;
          const tempGroupName = `Carteira de ${userId.slice(0, 8)}`;
          console.log('🔍 [DEBUG] tempGroupId:', tempGroupId);
          console.log('🔍 [DEBUG] tempGroupName:', tempGroupName);
          await createWallet(userId, tempGroupId, tempGroupName);
          return;
        }
        throw error;
      }

      console.log('🔍 [DEBUG] Carteira encontrada, definindo estado...');
      setWallet(data);
      console.log('🔍 [DEBUG] fetchWallet concluído com sucesso!');
    } catch (err) {
      console.error('❌ [DEBUG] Erro ao buscar carteira:', err);
      console.error('❌ [DEBUG] Detalhes do erro:', JSON.stringify(err, null, 2));
      setError('Erro ao carregar carteira');
    } finally {
      setLoading(false);
      console.log('🔍 [DEBUG] fetchWallet finalizado, loading = false');
    }
  };

  // Criar nova carteira
  const createWallet = async (userId: string, groupId?: string, groupName?: string) => {
    try {
      console.log('🏗️ [DEBUG] Iniciando createWallet...');
      console.log('🏗️ [DEBUG] userId:', userId);
      console.log('🏗️ [DEBUG] groupId:', groupId);
      console.log('🏗️ [DEBUG] groupName:', groupName);

      const walletData = {
        responsible_user_id: userId,
        group_id: groupId,
        group_name: groupName || 'Meu Grupo',
        balance_brl: 0,
        total_received_brl: 0,
        total_paid_brl: 0,
        is_active: true
      };

      console.log('🏗️ [DEBUG] Dados da carteira a ser criada:', walletData);

      const { data, error } = await supabase
        .from('digital_wallets')
        .insert(walletData)
        .select()
        .single();

      console.log('🏗️ [DEBUG] Resultado da criação:');
      console.log('🏗️ [DEBUG] data:', data);
      console.log('🏗️ [DEBUG] error:', error);

      if (error) throw error;

      console.log('🏗️ [DEBUG] Carteira criada com sucesso, definindo estado...');
      setWallet(data);
      toast.success('Carteira criada com sucesso!');
      console.log('🏗️ [DEBUG] createWallet concluído!');
    } catch (err) {
      console.error('❌ [DEBUG] Erro ao criar carteira:', err);
      console.error('❌ [DEBUG] Detalhes do erro:', JSON.stringify(err, null, 2));
      setError('Erro ao criar carteira');
      toast.error('Erro ao criar carteira');
    }
  };

  // Buscar transações (versão direta sem Edge Function)
  const fetchTransactions = async (limit: number = 50) => {
    if (!wallet) return;

    try {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('wallet_id', wallet.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      console.error('Erro ao buscar transações:', err);
      toast.error('Erro ao carregar transações');
    }
  };

  // Buscar opções de pagamento (versão direta sem Edge Function)
  const fetchPaymentOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_options')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setPaymentOptions(data || []);
    } catch (err) {
      console.error('Erro ao buscar opções de pagamento:', err);
      toast.error('Erro ao carregar opções de pagamento');
    }
  };

  // Buscar solicitações de saque
  const fetchWithdrawalRequests = async () => {
    if (!wallet) return;

    try {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('wallet_id', wallet.id)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      setWithdrawalRequests(data || []);
    } catch (err) {
      console.error('Erro ao buscar solicitações de saque:', err);
      toast.error('Erro ao carregar solicitações de saque');
    }
  };

  // Adicionar dinheiro à carteira (versão direta sem Edge Function)
  const addMoney = async (amount: number, pixKey?: string) => {
    const description = `Depósito via PIX${pixKey ? ` - Chave: ${pixKey}` : ''}`;
    const pixTransactionId = pixKey;
    if (!wallet) return false;

    try {
      // Criar transação
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          wallet_id: wallet.id,
          type: 'deposit',
          amount_brl: amount,
          description,
          reference_type: 'pix_payment',
          reference_id: pixTransactionId,
          pix_transaction_id: pixTransactionId,
          status: 'completed'
        });

      if (transactionError) throw transactionError;

      // Atualizar saldo da carteira
      const newBalance = wallet.balance_brl + amount;
      const { error: walletError } = await supabase
        .from('digital_wallets')
        .update({
          balance_brl: newBalance,
          total_received_brl: wallet.total_received_brl + amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', wallet.id);

      if (walletError) throw walletError;

      setWallet(prev => prev ? {
        ...prev,
        balance_brl: newBalance,
        total_received_brl: prev.total_received_brl + amount
      } : null);

      await fetchTransactions();
      toast.success(`R$ ${amount.toFixed(2)} adicionados à carteira!`);
      return true;
    } catch (err) {
      console.error('Erro ao adicionar dinheiro:', err);
      toast.error('Erro ao adicionar dinheiro');
      return false;
    }
  };

  // Processar pagamento - Implementação direta no banco
  const processPayment = async (paymentOptionId: string, quantity: number = 1) => {
    if (!wallet) return false;

    try {
      // Buscar opção de pagamento
      const { data: paymentOption, error: paymentError } = await supabase
        .from('payment_options')
        .select('*')
        .eq('id', paymentOptionId)
        .eq('is_active', true)
        .single();

      if (paymentError || !paymentOption) {
        toast.error('Opção de pagamento não encontrada');
        return false;
      }

      const totalAmount = paymentOption.price_brl * quantity;

      // Verificar saldo
      if (wallet.balance_brl < totalAmount) {
        toast.error('Saldo insuficiente');
        return false;
      }

      // Criar transação de pagamento
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          wallet_id: wallet.id,
          type: 'payment',
          amount_brl: -totalAmount,
          description: `Pagamento: ${paymentOption.name} (${quantity}x)`,
          reference_type: 'payment_option',
          reference_id: paymentOptionId,
          status: 'completed',
          processed_at: new Date().toISOString(),
          created_by: userId
        });

      if (transactionError) throw transactionError;

      // Atualizar saldo da carteira
      const newBalance = wallet.balance_brl - totalAmount;
      const { error: updateError } = await supabase
        .from('digital_wallets')
        .update({
          balance_brl: newBalance,
          total_paid_brl: wallet.total_paid_brl + totalAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', wallet.id);

      if (updateError) throw updateError;

      // Atualizar estado local
      setWallet(prev => prev ? {
        ...prev,
        balance_brl: newBalance,
        total_paid_brl: prev.total_paid_brl + totalAmount
      } : null);

      await fetchTransactions();
      toast.success(`Pagamento de R$ ${totalAmount.toFixed(2)} realizado!`);
      return true;
    } catch (err) {
      console.error('Erro ao processar pagamento:', err);
      toast.error('Erro ao processar pagamento');
      return false;
    }
  };

  // Processar pagamento genérico (compatível com WalletWithdrawal)
  const processGenericPayment = async (amount: number, description: string, metadata?: any) => {
    if (!wallet) return;

    try {
      // Verificar saldo
      if (wallet.balance_brl < amount) {
        toast.error('Saldo insuficiente');
        return;
      }

      // Criar transação
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          wallet_id: wallet.id,
          type: 'payment',
          amount_brl: amount,
          description,
          reference_type: metadata?.type || 'generic_payment',
          reference_id: metadata?.id,
          status: 'completed'
        });

      if (transactionError) throw transactionError;

      // Atualizar saldo da carteira
      const newBalance = wallet.balance_brl - amount;
      const { error: walletError } = await supabase
        .from('digital_wallets')
        .update({
          balance_brl: newBalance,
          total_paid_brl: wallet.total_paid_brl + amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', wallet.id);

      if (walletError) throw walletError;

      setWallet(prev => prev ? {
        ...prev,
        balance_brl: newBalance,
        total_paid_brl: prev.total_paid_brl + amount
      } : null);

      await fetchTransactions();
      toast.success(`Pagamento de R$ ${amount.toFixed(2)} realizado!`);
    } catch (err) {
      console.error('Erro ao processar pagamento:', err);
      toast.error('Erro ao processar pagamento');
    }
  };

  // Solicitar saque - Implementação direta no banco
  const requestWithdrawal = async (amount: number, pixKey: string) => {
    // Detectar tipo da chave PIX automaticamente
    const pixKeyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random' =
      /^\d{11}$/.test(pixKey) ? 'cpf' :
        /^\d{14}$/.test(pixKey) ? 'cnpj' :
          /@/.test(pixKey) ? 'email' :
            /^\d{10,11}$/.test(pixKey) ? 'phone' : 'random';
    if (!wallet) return false;

    try {
      // Verificar saldo
      if (wallet.balance_brl < amount) {
        toast.error('Saldo insuficiente para saque');
        return false;
      }

      // Criar solicitação de saque
      const { error: withdrawalError } = await supabase
        .from('withdrawal_requests')
        .insert({
          wallet_id: wallet.id,
          amount_brl: amount,
          pix_key: pixKey,
          pix_key_type: pixKeyType,
          status: 'pending',
          requested_at: new Date().toISOString()
        });

      if (withdrawalError) throw withdrawalError;

      await fetchWithdrawalRequests();
      toast.success(`Solicitação de saque de R$ ${amount.toFixed(2)} enviada!`);
      return true;
    } catch (err) {
      console.error('Erro ao solicitar saque:', err);
      toast.error('Erro ao solicitar saque');
      return false;
    }
  };

  // Transferir dinheiro entre carteiras - Implementação direta no banco
  const transferMoney = async (targetWalletId: string, amount: number, description: string) => {
    if (!wallet) return false;

    try {
      // Verificar saldo
      if (wallet.balance_brl < amount) {
        toast.error('Saldo insuficiente para transferência');
        return false;
      }

      // Buscar carteira de destino
      const { data: targetWallet, error: targetError } = await supabase
        .from('digital_wallets')
        .select('*')
        .eq('id', targetWalletId)
        .eq('is_active', true)
        .single();

      if (targetError || !targetWallet) {
        toast.error('Carteira de destino não encontrada');
        return false;
      }

      // Criar transação de débito (carteira atual)
      const { error: debitTransactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          wallet_id: wallet.id,
          type: 'transfer_out',
          amount_brl: -amount,
          description: `Transferência para: ${description}`,
          reference_type: 'transfer',
          reference_id: targetWalletId,
          status: 'completed',
          processed_at: new Date().toISOString(),
          created_by: userId
        });

      if (debitTransactionError) throw debitTransactionError;

      // Criar transação de crédito (carteira destino)
      const { error: creditTransactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          wallet_id: targetWalletId,
          type: 'transfer_in',
          amount_brl: amount,
          description: `Transferência de: ${wallet.group_name}`,
          reference_type: 'transfer',
          reference_id: wallet.id,
          status: 'completed',
          processed_at: new Date().toISOString(),
          created_by: userId
        });

      if (creditTransactionError) throw creditTransactionError;

      // Atualizar saldo da carteira atual
      const newBalance = wallet.balance_brl - amount;
      const { error: updateCurrentError } = await supabase
        .from('digital_wallets')
        .update({
          balance_brl: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', wallet.id);

      if (updateCurrentError) throw updateCurrentError;

      // Atualizar saldo da carteira de destino
      const { error: updateTargetError } = await supabase
        .from('digital_wallets')
        .update({
          balance_brl: targetWallet.balance_brl + amount,
          total_received_brl: targetWallet.total_received_brl + amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', targetWalletId);

      if (updateTargetError) throw updateTargetError;

      // Atualizar estado local
      setWallet(prev => prev ? { ...prev, balance_brl: newBalance } : null);
      await fetchTransactions();
      toast.success(`R$ ${amount.toFixed(2)} transferidos com sucesso!`);
      return true;
    } catch (err) {
      console.error('Erro ao transferir dinheiro:', err);
      toast.error('Erro ao transferir dinheiro');
      return false;
    }
  };

  // Formatar valor em reais
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  useEffect(() => {
    if (userId) {
      console.log('🚀 Inicializando carteira para usuário:', userId, 'grupo:', groupId);
      fetchWallet();
    } else {
      console.log('⚠️ userId inválido ou vazio!');
    }
  }, [userId, groupId]);

  useEffect(() => {
    if (wallet) {
      fetchTransactions();
      fetchPaymentOptions();
      fetchWithdrawalRequests();
    }
  }, [wallet]);

  return {
    wallet,
    transactions,
    paymentOptions,
    withdrawalRequests,
    loading,
    error,
    createWallet,
    addMoney,
    processPayment,
    processGenericPayment,
    requestWithdrawal,
    transferMoney,
    fetchTransactions,
    fetchPaymentOptions,
    fetchWithdrawalRequests,
    formatCurrency
  };
}