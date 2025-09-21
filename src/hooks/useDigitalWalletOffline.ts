import { useState, useEffect } from 'react';
import { toast } from 'sonner';

// Interfaces (mesmas do hook original)
interface DigitalWallet {
  id: string;
  responsible_user_id: string;
  group_id: string;
  balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface WalletTransaction {
  id: string;
  wallet_id: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  from_user_id?: string;
  to_user_id?: string;
}

interface PaymentOption {
  id: string;
  name: string;
  type: 'pix' | 'credit_card' | 'bank_transfer';
  is_active: boolean;
  fee_percentage: number;
}

interface WithdrawalRequest {
  id: string;
  wallet_id: string;
  amount: number;
  pix_key: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

// Dados mock para demonstração
const MOCK_WALLET: DigitalWallet = {
  id: 'wallet_offline_demo',
  responsible_user_id: 'offline-1758433580763',
  group_id: 'group_33580763',
  balance: 150.75,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const MOCK_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'tx_1',
    wallet_id: 'wallet_offline_demo',
    type: 'deposit',
    amount: 100.00,
    description: 'Depósito inicial',
    status: 'completed',
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
  },
  {
    id: 'tx_2',
    wallet_id: 'wallet_offline_demo',
    type: 'payment',
    amount: -25.50,
    description: 'Pagamento de taxa',
    status: 'completed',
    created_at: new Date(Date.now() - 43200000).toISOString(), // 12 horas atrás
  },
  {
    id: 'tx_3',
    wallet_id: 'wallet_offline_demo',
    type: 'deposit',
    amount: 76.25,
    description: 'Recarga via PIX',
    status: 'completed',
    created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hora atrás
  },
];

const MOCK_PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: 'pix_option',
    name: 'PIX',
    type: 'pix',
    is_active: true,
    fee_percentage: 0,
  },
  {
    id: 'credit_card_option',
    name: 'Cartão de Crédito',
    type: 'credit_card',
    is_active: true,
    fee_percentage: 3.5,
  },
];

export const useDigitalWalletOffline = (userId?: string, groupId?: string) => {
  const [wallet, setWallet] = useState<DigitalWallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simular carregamento da carteira
  const fetchWallet = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [OFFLINE] Carregando carteira digital...');
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setWallet(MOCK_WALLET);
      console.log('✅ [OFFLINE] Carteira carregada:', MOCK_WALLET);
      
    } catch (err) {
      console.error('❌ [OFFLINE] Erro ao carregar carteira:', err);
      setError('Erro ao carregar carteira offline');
    } finally {
      setLoading(false);
    }
  };

  // Simular carregamento de transações
  const fetchTransactions = async () => {
    try {
      console.log('🔄 [OFFLINE] Carregando transações...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setTransactions(MOCK_TRANSACTIONS);
      console.log('✅ [OFFLINE] Transações carregadas:', MOCK_TRANSACTIONS.length);
      
    } catch (err) {
      console.error('❌ [OFFLINE] Erro ao carregar transações:', err);
    }
  };

  // Simular carregamento de opções de pagamento
  const fetchPaymentOptions = async () => {
    try {
      console.log('🔄 [OFFLINE] Carregando opções de pagamento...');
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setPaymentOptions(MOCK_PAYMENT_OPTIONS);
      console.log('✅ [OFFLINE] Opções de pagamento carregadas:', MOCK_PAYMENT_OPTIONS.length);
      
    } catch (err) {
      console.error('❌ [OFFLINE] Erro ao carregar opções de pagamento:', err);
    }
  };

  // Simular depósito
  const depositMoney = async (amount: number, paymentMethod: string) => {
    try {
      console.log('🔄 [OFFLINE] Processando depósito:', { amount, paymentMethod });
      
      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Criar nova transação
      const newTransaction: WalletTransaction = {
        id: `tx_${Date.now()}`,
        wallet_id: wallet?.id || '',
        type: 'deposit',
        amount: amount,
        description: `Depósito via ${paymentMethod}`,
        status: 'completed',
        created_at: new Date().toISOString(),
      };
      
      // Atualizar saldo
      if (wallet) {
        setWallet({
          ...wallet,
          balance: wallet.balance + amount,
          updated_at: new Date().toISOString(),
        });
      }
      
      // Adicionar transação
      setTransactions(prev => [newTransaction, ...prev]);
      
      toast.success(`Depósito de R$ ${amount.toFixed(2)} realizado com sucesso!`);
      console.log('✅ [OFFLINE] Depósito realizado:', newTransaction);
      
      return { success: true, transaction: newTransaction };
      
    } catch (err) {
      console.error('❌ [OFFLINE] Erro no depósito:', err);
      toast.error('Erro ao processar depósito');
      return { success: false, error: 'Erro no depósito offline' };
    }
  };

  // Simular saque
  const withdrawMoney = async (amount: number, pixKey: string) => {
    try {
      if (!wallet || wallet.balance < amount) {
        toast.error('Saldo insuficiente');
        return { success: false, error: 'Saldo insuficiente' };
      }
      
      console.log('🔄 [OFFLINE] Processando saque:', { amount, pixKey });
      
      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Criar nova transação
      const newTransaction: WalletTransaction = {
        id: `tx_${Date.now()}`,
        wallet_id: wallet.id,
        type: 'withdrawal',
        amount: -amount,
        description: `Saque via PIX: ${pixKey}`,
        status: 'completed',
        created_at: new Date().toISOString(),
      };
      
      // Atualizar saldo
      setWallet({
        ...wallet,
        balance: wallet.balance - amount,
        updated_at: new Date().toISOString(),
      });
      
      // Adicionar transação
      setTransactions(prev => [newTransaction, ...prev]);
      
      toast.success(`Saque de R$ ${amount.toFixed(2)} realizado com sucesso!`);
      console.log('✅ [OFFLINE] Saque realizado:', newTransaction);
      
      return { success: true, transaction: newTransaction };
      
    } catch (err) {
      console.error('❌ [OFFLINE] Erro no saque:', err);
      toast.error('Erro ao processar saque');
      return { success: false, error: 'Erro no saque offline' };
    }
  };

  // Simular transferência
  const transferMoney = async (amount: number, toUserId: string, description: string) => {
    try {
      if (!wallet || wallet.balance < amount) {
        toast.error('Saldo insuficiente');
        return { success: false, error: 'Saldo insuficiente' };
      }
      
      console.log('🔄 [OFFLINE] Processando transferência:', { amount, toUserId, description });
      
      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Criar nova transação
      const newTransaction: WalletTransaction = {
        id: `tx_${Date.now()}`,
        wallet_id: wallet.id,
        type: 'transfer',
        amount: -amount,
        description: description || `Transferência para ${toUserId}`,
        status: 'completed',
        created_at: new Date().toISOString(),
        from_user_id: userId,
        to_user_id: toUserId,
      };
      
      // Atualizar saldo
      setWallet({
        ...wallet,
        balance: wallet.balance - amount,
        updated_at: new Date().toISOString(),
      });
      
      // Adicionar transação
      setTransactions(prev => [newTransaction, ...prev]);
      
      toast.success(`Transferência de R$ ${amount.toFixed(2)} realizada com sucesso!`);
      console.log('✅ [OFFLINE] Transferência realizada:', newTransaction);
      
      return { success: true, transaction: newTransaction };
      
    } catch (err) {
      console.error('❌ [OFFLINE] Erro na transferência:', err);
      toast.error('Erro ao processar transferência');
      return { success: false, error: 'Erro na transferência offline' };
    }
  };

  // Função para formatar moeda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  // Inicializar dados quando o componente monta
  useEffect(() => {
    if (userId && groupId) {
      console.log('🚀 [OFFLINE] Inicializando carteira digital offline...');
      fetchWallet();
    }
  }, [userId, groupId]);

  // Carregar dados relacionados quando a carteira é carregada
  useEffect(() => {
    if (wallet) {
      console.log('🔄 [OFFLINE] Carregando dados relacionados...');
      fetchTransactions();
      fetchPaymentOptions();
    }
  }, [wallet]);

  return {
    // Estados
    wallet,
    transactions,
    paymentOptions,
    withdrawalRequests,
    loading,
    error,
    
    // Funções
    fetchWallet,
    fetchTransactions,
    fetchPaymentOptions,
    depositMoney,
    withdrawMoney,
    transferMoney,
    formatCurrency,
    
    // Informações úteis
    isOfflineMode: true,
    debugInfo: {
      userId,
      groupId,
      walletLoaded: !!wallet,
      transactionCount: transactions.length,
      lastUpdate: wallet?.updated_at,
    },
  };
};