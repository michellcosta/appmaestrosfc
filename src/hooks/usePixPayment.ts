import { useCallback, useState } from 'react';
import { toast } from 'sonner';

export interface PixTransaction {
  id: string;
  external_id: string;
  wallet_id?: string;
  user_id: string;
  type: 'payment' | 'deposit' | 'withdrawal';
  amount_brl: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'expired';
  pix_key?: string;
  pix_key_type?: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  qr_code?: string;
  qr_code_image?: string;
  txid?: string;
  end_to_end_id?: string;
  description?: string;
  metadata: Record<string, any>;
  provider_response?: Record<string, any>;
  expires_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PixConfiguration {
  id: string;
  provider: 'mercadopago' | 'pagseguro' | 'asaas' | 'gerencianet';
  name: string;
  config: Record<string, any>;
  is_active: boolean;
  is_sandbox: boolean;
  webhook_url?: string;
  webhook_secret?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface UserPixKey {
  id: string;
  user_id: string;
  pix_key: string;
  pix_key_type: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  is_verified: boolean;
  is_primary: boolean;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentHistory {
  id: string;
  user_id: string;
  match_id?: string;
  transaction_id?: string;
  type: 'mensalista' | 'diarista' | 'fine' | 'bonus' | 'refund';
  amount_brl: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  description?: string;
  reference_period?: string;
  reference_match_id?: string;
  created_at: string;
  completed_at?: string;
}

/**
 * Hook para sistema PIX completo com integração real
 */
export function usePixPayment() {
  const [transactions, setTransactions] = useState<PixTransaction[]>([]);
  const [configurations, setConfigurations] = useState<PixConfiguration[]>([]);
  const [userPixKeys, setUserPixKeys] = useState<UserPixKey[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar transações do usuário
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('pix_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTransactions(data || []);
    } catch (err) {
      console.error('❌ Erro ao carregar transações PIX:', err);
      setError('Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar configurações PIX
  const fetchConfigurations = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('pix_configurations')
        .select('*')
        .eq('is_active', true)
        .order('created_at');

      if (error) throw error;
      setConfigurations(data || []);
    } catch (err) {
      console.error('❌ Erro ao carregar configurações PIX:', err);
    }
  }, []);

  // Buscar chaves PIX do usuário
  const fetchUserPixKeys = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('user_pix_keys')
        .select('*')
        .order('is_primary', { ascending: false })
        .order('created_at');

      if (error) throw error;
      setUserPixKeys(data || []);
    } catch (err) {
      console.error('❌ Erro ao carregar chaves PIX:', err);
    }
  }, []);

  // Buscar histórico de pagamentos
  const fetchPaymentHistory = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('payment_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPaymentHistory(data || []);
    } catch (err) {
      console.error('❌ Erro ao carregar histórico de pagamentos:', err);
    }
  }, []);

  // Criar transação PIX
  const createPixTransaction = useCallback(async (transactionData: {
    type: 'payment' | 'deposit' | 'withdrawal';
    amount_brl: number;
    pix_key?: string;
    pix_key_type?: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
    description?: string;
    expires_in_hours?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc('create_pix_transaction', {
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_type: transactionData.type,
        p_amount_brl: transactionData.amount_brl,
        p_pix_key: transactionData.pix_key,
        p_pix_key_type: transactionData.pix_key_type,
        p_description: transactionData.description,
        p_expires_in_hours: transactionData.expires_in_hours || 24
      });

      if (error) throw error;

      // Buscar transação criada
      const { data: transaction, error: fetchError } = await supabase
        .from('pix_transactions')
        .select('*')
        .eq('id', data)
        .single();

      if (fetchError) throw fetchError;

      await fetchTransactions();
      toast.success('Transação PIX criada com sucesso!');
      return transaction;
    } catch (err) {
      console.error('❌ Erro ao criar transação PIX:', err);
      setError('Erro ao criar transação PIX');
      toast.error('Erro ao criar transação PIX');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchTransactions]);

  // Gerar QR Code PIX
  const generatePixQrCode = useCallback(async (transactionId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Buscar transação
      const { data: transaction, error: fetchError } = await supabase
        .from('pix_transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (fetchError) throw fetchError;

      // Buscar configuração ativa
      const { data: config, error: configError } = await supabase
        .from('pix_configurations')
        .select('*')
        .eq('is_active', true)
        .single();

      if (configError) throw configError;

      // Gerar QR Code via provedor
      const qrCodeData = await generateQrCodeWithProvider(transaction, config);

      // Atualizar transação com QR Code
      const { error: updateError } = await supabase
        .from('pix_transactions')
        .update({
          qr_code: qrCodeData.qr_code,
          qr_code_image: qrCodeData.qr_code_image,
          txid: qrCodeData.txid
        })
        .eq('id', transactionId);

      if (updateError) throw updateError;

      await fetchTransactions();
      toast.success('QR Code PIX gerado com sucesso!');
      return qrCodeData;
    } catch (err) {
      console.error('❌ Erro ao gerar QR Code PIX:', err);
      setError('Erro ao gerar QR Code PIX');
      toast.error('Erro ao gerar QR Code PIX');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchTransactions]);

  // Processar pagamento PIX
  const processPixPayment = useCallback(async (transactionId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Buscar transação
      const { data: transaction, error: fetchError } = await supabase
        .from('pix_transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (fetchError) throw fetchError;

      if (transaction.status !== 'pending') {
        throw new Error('Transação já processada');
      }

      // Buscar configuração ativa
      const { data: config, error: configError } = await supabase
        .from('pix_configurations')
        .select('*')
        .eq('is_active', true)
        .single();

      if (configError) throw configError;

      // Processar pagamento via provedor
      const paymentResult = await processPaymentWithProvider(transaction, config);

      // Atualizar status da transação
      const { error: updateError } = await supabase
        .from('pix_transactions')
        .update({
          status: paymentResult.status,
          provider_response: paymentResult.provider_response,
          txid: paymentResult.txid,
          end_to_end_id: paymentResult.end_to_end_id
        })
        .eq('id', transactionId);

      if (updateError) throw updateError;

      await fetchTransactions();
      toast.success('Pagamento PIX processado com sucesso!');
      return paymentResult;
    } catch (err) {
      console.error('❌ Erro ao processar pagamento PIX:', err);
      setError('Erro ao processar pagamento PIX');
      toast.error('Erro ao processar pagamento PIX');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchTransactions]);

  // Adicionar chave PIX do usuário
  const addUserPixKey = useCallback(async (pixKeyData: {
    pix_key: string;
    pix_key_type: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
    is_primary?: boolean;
  }) => {
    try {
      setLoading(true);
      setError(null);

      // Validar chave PIX
      const { data: isValid, error: validationError } = await supabase.rpc('validate_pix_key', {
        p_pix_key: pixKeyData.pix_key,
        p_pix_key_type: pixKeyData.pix_key_type
      });

      if (validationError) throw validationError;

      if (!isValid) {
        throw new Error('Chave PIX inválida');
      }

      // Se for chave primária, remover primária anterior
      if (pixKeyData.is_primary) {
        await supabase
          .from('user_pix_keys')
          .update({ is_primary: false })
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
      }

      // Criar nova chave PIX
      const { data, error } = await supabase
        .from('user_pix_keys')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          pix_key: pixKeyData.pix_key,
          pix_key_type: pixKeyData.pix_key_type,
          is_primary: pixKeyData.is_primary || false
        })
        .select()
        .single();

      if (error) throw error;

      await fetchUserPixKeys();
      toast.success('Chave PIX adicionada com sucesso!');
      return data;
    } catch (err) {
      console.error('❌ Erro ao adicionar chave PIX:', err);
      setError('Erro ao adicionar chave PIX');
      toast.error('Erro ao adicionar chave PIX');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUserPixKeys]);

  // Processar webhook PIX
  const processWebhook = useCallback(async (webhookData: {
    provider: string;
    event_type: string;
    payload: Record<string, any>;
    signature?: string;
  }) => {
    try {
      const { data, error } = await supabase.rpc('process_pix_webhook', {
        p_provider: webhookData.provider,
        p_event_type: webhookData.event_type,
        p_payload: webhookData.payload,
        p_signature: webhookData.signature
      });

      if (error) throw error;

      await fetchTransactions();
      return data;
    } catch (err) {
      console.error('❌ Erro ao processar webhook PIX:', err);
      throw err;
    }
  }, [fetchTransactions]);

  // Buscar transação por ID
  const getTransactionById = useCallback((id: string) => {
    return transactions.find(t => t.id === id);
  }, [transactions]);

  // Buscar transações por status
  const getTransactionsByStatus = useCallback((status: PixTransaction['status']) => {
    return transactions.filter(t => t.status === status);
  }, [transactions]);

  // Buscar transações por tipo
  const getTransactionsByType = useCallback((type: PixTransaction['type']) => {
    return transactions.filter(t => t.type === type);
  }, [transactions]);

  // Verificar se transação está expirada
  const isTransactionExpired = useCallback((transaction: PixTransaction) => {
    return new Date() > new Date(transaction.expires_at);
  }, []);

  // Gerar QR Code via provedor (implementação específica)
  const generateQrCodeWithProvider = async (transaction: PixTransaction, config: PixConfiguration) => {
    try {
      const { createPixProvider } = await import('@/utils/pixProviders');
      const provider = createPixProvider(config);

      const result = await provider.createPixTransaction(transaction);

      return {
        qr_code: result.qr_code,
        qr_code_image: result.qr_code_image,
        txid: result.txid,
        end_to_end_id: result.end_to_end_id
      };
    } catch (error) {
      console.error('❌ Erro ao gerar QR Code via provedor:', error);
      throw error;
    }
  };

  // Processar pagamento via provedor (implementação específica)
  const processPaymentWithProvider = async (transaction: PixTransaction, config: PixConfiguration) => {
    try {
      const { createPixProvider } = await import('@/utils/pixProviders');
      const provider = createPixProvider(config);

      const result = await provider.createPixTransaction(transaction);

      return {
        status: result.status,
        provider_response: result.provider_response,
        txid: result.txid,
        end_to_end_id: result.end_to_end_id
      };
    } catch (error) {
      console.error('❌ Erro ao processar pagamento via provedor:', error);
      throw error;
    }
  };

  return {
    // Estado
    transactions,
    configurations,
    userPixKeys,
    paymentHistory,
    loading,
    error,

    // Ações
    createPixTransaction,
    generatePixQrCode,
    processPixPayment,
    addUserPixKey,
    processWebhook,

    // Utilitários
    getTransactionById,
    getTransactionsByStatus,
    getTransactionsByType,
    isTransactionExpired,

    // Refresh
    fetchTransactions,
    fetchConfigurations,
    fetchUserPixKeys,
    fetchPaymentHistory
  };
}

