import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DollarSign, CreditCard, TrendingUp, CheckCircle, Clock, XCircle, Crown, Shield, Star, Zap, User, Calendar, Copy, QrCode } from 'lucide-react';
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

type MonthlyPayment = {
  id: string;
  month: string;
  year: number;
  amount: number;
  status: 'pendente'|'pago'|'vencido';
  due_date: string;
  paid_at?: string;
};

// Configurações de valores
const PAYMENT_CONFIG = {
  mensalista: 50.00, // R$ 50,00 por mês
  diarista: 15.00,   // R$ 15,00 por partida
};

export default function FinancePage() {
  const [rows, setRows] = useState<Charge[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthlyPayments, setMonthlyPayments] = useState<MonthlyPayment[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<MonthlyPayment | null>(null);
  const [pixCode, setPixCode] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  // Hook da carteira digital (versão offline)
  const {
    wallet,
    formatCurrency,
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

  // Função para determinar se o usuário é mensalista ou diarista
  const getUserPaymentType = () => {
    if (!user?.role) return 'diarista';
    return user.role === 'diarista' ? 'diarista' : 'mensalista';
  };

  // Função para gerar pagamentos mensais (apenas relevantes)
  const generateMonthlyPayments = () => {
    const currentDate = new Date();
    const payments: MonthlyPayment[] = [];
    
    // Gerar apenas: mês anterior, atual e próximo
    for (let i = -1; i <= 1; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const monthName = date.toLocaleDateString('pt-BR', { month: 'long' });
      const year = date.getFullYear();
      const dueDate = new Date(year, date.getMonth(), 5); // Vencimento dia 5
      
      const paymentType = getUserPaymentType();
      const amount = PAYMENT_CONFIG[paymentType];
      
      // Status baseado na data
      let status: 'pendente'|'pago'|'vencido' = 'pendente';
      if (i === -1) {
        // Mês anterior: pode estar pago ou vencido
        status = Math.random() > 0.3 ? 'pago' : 'vencido';
      } else if (i === 0) {
        // Mês atual: pendente (a vencer)
        status = 'pendente';
      } else {
        // Próximo mês: sempre pendente
        status = 'pendente';
      }
      
      payments.push({
        id: `${year}-${date.getMonth() + 1}`,
        month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        year,
        amount,
        status,
        due_date: dueDate.toISOString(),
        paid_at: status === 'pago' ? new Date(dueDate.getTime() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString() : undefined
      });
    }
    
    return payments.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  };

  // Função para abrir modal PIX
  const openPixModal = (payment: MonthlyPayment) => {
    setSelectedPayment(payment);
    // Gerar código PIX simulado
    const pixCode = `00020101021126580014br.gov.bcb.pix2536maestrosfc.com.br/pay/${payment.id}5204000053039865802BR5925MAESTROS FC PELADAS6009SAO PAULO62070503***6304${Math.random().toString().substr(2, 4)}`;
    setPixCode(pixCode);
    setPixModalOpen(true);
  };

  // Função para copiar código PIX
  const copyPixCode = () => {
    navigator.clipboard.writeText(pixCode);
    alert('Código PIX copiado!');
  };

  // Função para confirmar pagamento PIX
  const confirmPixPayment = async () => {
    if (!selectedPayment) return;
    
    setPaymentLoading(true);
    
    try {
      // Simular confirmação de pagamento PIX
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Atualizar o status do pagamento
      setMonthlyPayments(prev => 
        prev.map(p => 
          p.id === selectedPayment.id 
            ? { ...p, status: 'pago' as const, paid_at: new Date().toISOString() }
            : p
        )
      );
      
      alert(`Mensalidade de ${selectedPayment.month}/${selectedPayment.year} paga com sucesso via PIX!`);
      setPixModalOpen(false);
      setSelectedPayment(null);
    } catch (error) {
      alert('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setPaymentLoading(false);
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

  // Carregar pagamentos mensais
  useEffect(() => {
    if (user) {
      const payments = generateMonthlyPayments();
      setMonthlyPayments(payments);
    }
  }, [user]);

  return (
    <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 space-y-4 pb-20">
      <header className="bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700 shadow-sm rounded-lg mb-4">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-zinc-100">Financeiro</h1>
            <p className="text-sm text-gray-600 dark:text-zinc-400">Controle de pagamentos e mensalidades</p>
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

      {/* Conteúdo principal - Mensalidades */}
      <div className="space-y-4">
        {/* Informações do plano */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-purple-800 flex items-center gap-2">
                  {getRoleIcon(user?.role)}
                  Plano {getUserPaymentType() === 'diarista' ? 'Diarista' : 'Mensalista'}
                </h3>
                <p className="text-sm text-purple-600">
                  {getUserPaymentType() === 'diarista' 
                    ? `R$ ${PAYMENT_CONFIG.diarista.toFixed(2)} por partida`
                    : `R$ ${PAYMENT_CONFIG.mensalista.toFixed(2)} por mês`
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de mensalidades */}
        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {getUserPaymentType() === 'diarista' ? 'Pagamentos por Partida' : 'Mensalidades'}
              </h3>
              <p className="text-sm text-gray-600">
                {getUserPaymentType() === 'diarista' 
                  ? 'Histórico de pagamentos por partida jogada'
                  : 'Mensalidades que vão vencer, vencidas e pagas'
                }
              </p>
            </div>

            <div className="divide-y">
              {monthlyPayments.map((payment) => (
                <div key={payment.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          payment.status === 'pago' ? 'bg-green-500' :
                          payment.status === 'vencido' ? 'bg-red-500' : 'bg-yellow-500'
                        }`} />
                        <div>
                          <div className="font-medium">
                            {getUserPaymentType() === 'diarista' ? `Partida - ${payment.month}` : `${payment.month} ${payment.year}`}
                          </div>
                          <div className="text-sm text-gray-600">
                            Vencimento: {new Date(payment.due_date).toLocaleDateString('pt-BR')}
                            {payment.paid_at && (
                              <span className="ml-2 text-green-600">
                                • Pago em {new Date(payment.paid_at).toLocaleDateString('pt-BR')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-semibold">
                          {formatCurrency ? formatCurrency(payment.amount) : `R$ ${payment.amount.toFixed(2)}`}
                        </div>
                        <Badge 
                          variant={
                            payment.status === 'pago' ? 'default' :
                            payment.status === 'vencido' ? 'destructive' : 'secondary'
                          }
                          className="text-xs"
                        >
                          {payment.status === 'pago' ? 'Pago' :
                           payment.status === 'vencido' ? 'Vencido' : 'Pendente'}
                        </Badge>
                      </div>

                      {payment.status === 'pendente' && (
                        <Button
                          size="sm"
                          onClick={() => openPixModal(payment)}
                          disabled={paymentLoading}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          {paymentLoading ? 'Processando...' : 'Pagar'}
                        </Button>
                      )}

                      {payment.status === 'vencido' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openPixModal(payment)}
                          disabled={paymentLoading}
                        >
                          {paymentLoading ? 'Processando...' : 'Quitar'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {monthlyPayments.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum pagamento encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal PIX */}
      <Dialog open={pixModalOpen} onOpenChange={setPixModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-purple-600" />
              Pagamento via PIX
            </DialogTitle>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-4">
              {/* Informações do pagamento */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-center">
                  <h3 className="font-semibold text-purple-800">
                    {getUserPaymentType() === 'diarista' ? `Partida - ${selectedPayment.month}` : `${selectedPayment.month} ${selectedPayment.year}`}
                  </h3>
                  <div className="text-2xl font-bold text-purple-600 mt-1">
                    {formatCurrency ? formatCurrency(selectedPayment.amount) : `R$ ${selectedPayment.amount.toFixed(2)}`}
                  </div>
                  <div className="text-sm text-purple-600 mt-1">
                    Vencimento: {new Date(selectedPayment.due_date).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>

              {/* Código PIX */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Código PIX Copia e Cola:</label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyPixCode}
                    className="h-8 px-2"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copiar
                  </Button>
                </div>
                <div className="bg-gray-50 p-3 rounded border text-xs font-mono break-all">
                  {pixCode}
                </div>
              </div>

              {/* Instruções */}
              <div className="bg-blue-50 p-3 rounded text-sm">
                <h4 className="font-medium text-blue-800 mb-2">Como pagar:</h4>
                <ol className="text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Copie o código PIX acima</li>
                  <li>Abra o app do seu banco</li>
                  <li>Escolha "PIX Copia e Cola"</li>
                  <li>Cole o código e confirme o pagamento</li>
                  <li>Clique em "Confirmar Pagamento" abaixo</li>
                </ol>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPixModalOpen(false)}
              disabled={paymentLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmPixPayment}
              disabled={paymentLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {paymentLoading ? 'Confirmando...' : 'Confirmar Pagamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}