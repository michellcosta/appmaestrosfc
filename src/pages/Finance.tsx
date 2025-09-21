import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DollarSign, CreditCard, TrendingUp, CheckCircle, Clock, XCircle, Crown, Shield, Star, Zap, User, Wallet } from 'lucide-react';
import PaymentButton from '@/components/PaymentButton';
import DigitalWalletComponent from '@/components/WalletWithdrawal';
import { useAuth } from '@/auth/OfflineAuthProvider';
import { useDigitalWalletOffline } from '@/hooks/useDigitalWalletOffline';

type Charge = {
  id: string;
  type: 'mensalista'|'diarista';
  amount: number;
  status: 'pendente'|'pago'|'cancelado';
  period: string|null;
  created_at: string;
};

export default function FinancePage() {
  const [rows, setRows] = useState<Charge[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Hook da carteira digital (versão offline)
  const {
    wallet,
    transactions,
    paymentOptions,
    withdrawalRequests,
    loading: walletLoading,
    error: walletError,
    depositMoney,
    withdrawMoney,
    transferMoney,
    formatCurrency,
    isOfflineMode,
    debugInfo
  } = useDigitalWalletOffline(user?.id || '', user?.group_id);

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'owner': return <Crown className='w-4 h-4 text-role-owner' />;
      case 'admin': return <Shield className='w-4 h-4 text-role-admin' />;
      case 'aux': return <Zap className='w-4 h-4 text-role-aux' />;
      case 'mensalista': return <Star className='w-4 h-4 text-role-mensalista' />;
      case 'diarista': return <Zap className='w-4 h-4 text-role-diarista' />;
      default: return <User className='w-4 h-4 text-role-default' />;
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('charges')
        .select('id,type,amount,status,period,created_at')
        .order('created_at', { ascending: false });
      if (!error) setRows((data as any) ?? []);
      setLoading(false);
    })();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pago': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pendente': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'cancelado': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'bg-success text-success-foreground';
      case 'pendente': return 'bg-warning text-warning-foreground';
      case 'cancelado': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 space-y-4 pb-20">
      <header className="bg-white border-b border-gray-200 shadow-sm rounded-lg mb-4">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Financeiro</h1>
            <p className="text-sm text-gray-600">Controle de pagamentos e carteira digital</p>
          </div>
          
          <div className="flex items-center space-x-2">
            {user?.role === 'owner' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/owner-dashboard')}
              className="p-2 hover:bg-purple-100 hover:text-purple-700 transition-colors"
              title="Acesso rápido ao Dashboard do Owner"
            >
              <Crown className="w-4 h-4 text-purple-600" />
            </Button>
          )}
            
            {user?.role && user.role !== 'owner' && (
              <div className="flex items-center space-x-1 text-sm text-maestros-green">
                {getRoleIcon(user.role)}
                <span className="hidden sm:inline font-medium">
                  {user.role === 'admin' ? 'Admin' : 
                   user.role === 'aux' ? 'Auxiliar' : 
                   user.role === 'mensalista' ? 'Mensalista' : 
                   user.role === 'diarista' ? 'Diarista' : 
                   'Usuário'}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      <Tabs defaultValue="wallet" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="wallet" className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Carteira Digital
          </TabsTrigger>
          <TabsTrigger value="charges" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Cobranças
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wallet" className="space-y-4">
          {/* Debug da carteira digital */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <h4 className="font-semibold text-green-800 mb-2">🔍 Debug da Carteira Digital (OFFLINE)</h4>
              <div className="text-sm space-y-1">
                <p><strong>Modo:</strong> {isOfflineMode ? '🟢 OFFLINE' : '🔴 ONLINE'}</p>
                <p><strong>Usuário ID:</strong> {user?.id || 'Não encontrado'}</p>
                <p><strong>Grupo ID:</strong> {user?.group_id || 'Não encontrado'}</p>
                <p><strong>Loading:</strong> {walletLoading ? 'Sim' : 'Não'}</p>
                <p><strong>Erro:</strong> {walletError || 'Nenhum'}</p>
                <p><strong>Carteira:</strong> {wallet ? 'Carregada' : 'Não carregada'}</p>
                <p><strong>Transações:</strong> {transactions.length}</p>
                {wallet && (
                  <div className="mt-2 p-2 bg-white rounded border">
                    <p><strong>Saldo:</strong> {formatCurrency(wallet.balance)}</p>
                    <p><strong>ID da Carteira:</strong> {wallet.id}</p>
                    <p><strong>Ativa:</strong> {wallet.is_active ? 'Sim' : 'Não'}</p>
                    <p><strong>Última Atualização:</strong> {new Date(wallet.updated_at).toLocaleString()}</p>
                  </div>
                )}
                <div className="flex gap-2 mt-3">
                  <Button
                    onClick={async () => {
                      try {
                        console.log('🧪 Testando depósito...');
                        const result = await depositMoney(25.50, 'PIX');
                        alert(`Teste de depósito: ${result.success ? 'SUCESSO - R$ 25,50 adicionados!' : 'ERRO - ' + result.error}`);
                      } catch (err) {
                        console.error('❌ Erro no teste:', err);
                        alert('Erro no teste: ' + err.message);
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1"
                  >
                    💰 Testar Depósito (+R$ 25,50)
                  </Button>
                  <Button
                    onClick={async () => {
                      try {
                        console.log('🧪 Testando saque...');
                        const result = await withdrawMoney(10.00, 'teste@email.com');
                        alert(`Teste de saque: ${result.success ? 'SUCESSO - R$ 10,00 sacados!' : 'ERRO - ' + result.error}`);
                      } catch (err) {
                        console.error('❌ Erro no teste:', err);
                        alert('Erro no teste: ' + err.message);
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1"
                  >
                    💸 Testar Saque (-R$ 10,00)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {walletLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              </CardContent>
            </Card>
          ) : wallet ? (
            <DigitalWalletComponent
              wallet={wallet}
              paymentOptions={paymentOptions}
              withdrawalRequests={withdrawalRequests}
              onProcessPayment={depositMoney}
              onRequestWithdrawal={withdrawMoney}
              onAddMoney={depositMoney}
              formatCurrency={formatCurrency}
            />
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-600">Erro ao carregar carteira digital</p>
                {walletError && <p className="text-red-600 text-sm mt-2">{walletError}</p>}
              </CardContent>
            </Card>
          )}

          {/* Transações Recentes */}
          {transactions.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Transações Recentes</h3>
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          transaction.type === 'deposit' ? 'bg-green-500' :
                          transaction.type === 'payment' ? 'bg-red-500' :
                          transaction.type === 'withdrawal' ? 'bg-orange-500' :
                          'bg-blue-500'
                        }`} />
                        <div>
                          <p className="font-medium text-sm">{transaction.description}</p>
                          <p className="text-xs text-gray-600">
                            {new Date(transaction.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          transaction.type === 'deposit' || transaction.type === 'transfer_in' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'deposit' || transaction.type === 'transfer_in' ? '+' : '-'}
                          {formatCurrency(transaction.amount_brl)}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {transaction.status === 'completed' ? 'Concluído' : 
                           transaction.status === 'pending' ? 'Pendente' : 
                           transaction.status === 'failed' ? 'Falhou' : 
                           'Cancelado'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="charges" className="space-y-4">
          {/* Existing charges content */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">Mensalidades</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="font-medium">Mensalidade Setembro 2024</p>
                      <p className="text-sm text-zinc-500">Pago em 15/09/2024</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">R$ 50,00</p>
                    <Badge className="bg-success text-success-foreground">Pago</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <div>
                      <p className="font-medium">Mensalidade Outubro 2024</p>
                      <p className="text-sm text-zinc-500">Vence em 15/10/2024</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">R$ 50,00</p>
                    <Badge className="bg-warning text-warning-foreground">Pendente</Badge>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <PaymentButton type="mensalista" amount={50} period="2024-10" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">Diárias</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-maestros-green" />
                    <div>
                      <p className="font-medium">Jogo - 14/09/2024</p>
                      <p className="text-sm text-zinc-500">Pago em 14/09/2024</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">R$ 15,00</p>
                    <Badge className="bg-success text-success-foreground">Pago</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-warning" />
                    <div>
                      <p className="font-medium">Jogo - 21/09/2024</p>
                      <p className="text-sm text-zinc-500">Pendente</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">R$ 15,00</p>
                    <Badge className="bg-warning text-warning-foreground">Pendente</Badge>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <PaymentButton type="diarista" amount={15} matchId="match-21-09" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}