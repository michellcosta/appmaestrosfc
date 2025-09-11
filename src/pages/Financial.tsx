import React, { useState } from 'react';
import { DollarSign, Copy, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/illustrations/empty-state';
import { pt } from '@/i18n/pt';
import { cn } from '@/lib/utils';

interface PaymentData {
  id: string;
  type: 'mensal' | 'diaria';
  status: 'pendente' | 'confirmado' | 'aguardando_aprovacao' | 'payment_in_progress';
  amount: number;
  dueDate?: Date;
  match?: { date: Date; venue: string };
  pixCode?: string;
}

export const Financial: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'mensal' | 'diaria'>('mensal');
  const [pixTimer, setPixTimer] = useState<number | null>(null);
  const [copiedPixCode, setCopiedPixCode] = useState<string | null>(null);

  // Mock data
  const payments: PaymentData[] = [
    {
      id: '1',
      type: 'mensal',
      status: 'pendente',
      amount: 50,
      dueDate: new Date('2025-09-15'),
    },
    {
      id: '2',
      type: 'diaria',
      status: 'aguardando_aprovacao',
      amount: 10,
      match: { date: new Date('2025-09-14'), venue: 'Campo do Maestros' },
    },
  ];

  const handleGeneratePix = (paymentId: string) => {
    // Iniciar timer de 30 minutos
    setPixTimer(30 * 60); // 30 minutos em segundos
    
    // Simular geração de código Pix
    const mockPixCode = '00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-426655440000';
    
    // TODO: Chamar edge function para gerar Pix real
    console.log('Generating Pix for payment:', paymentId);
  };

  const handleCopyPix = (pixCode: string) => {
    navigator.clipboard.writeText(pixCode);
    setCopiedPixCode(pixCode);
    
    setTimeout(() => {
      setCopiedPixCode(null);
    }, 2000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pendente: <Badge variant="outline" className="border-warning text-warning">{pt.financial.pending}</Badge>,
      confirmado: <Badge className="bg-success text-success-foreground">{pt.financial.paid}</Badge>,
      aguardando_aprovacao: <Badge variant="secondary">{pt.financial.awaitingApproval}</Badge>,
      payment_in_progress: <Badge className="bg-warning text-warning-foreground">{pt.financial.paymentInProgress}</Badge>,
    };
    return badges[status] || null;
  };

  const monthlyPayments = payments.filter(p => p.type === 'mensal');
  const dailyPayments = payments.filter(p => p.type === 'diaria');

  return (
    <div className="p-4 space-y-4">
      <header className="mb-6">
        <h1 className="text-2xl font-outfit font-bold text-foreground">
          {pt.navigation.financial}
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie seus pagamentos
        </p>
      </header>

      <Tabs defaultValue="mensal" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mensal">Mensalista</TabsTrigger>
          <TabsTrigger value="diaria">Diarista</TabsTrigger>
        </TabsList>

        <TabsContent value="mensal" className="mt-4 space-y-4">
          {monthlyPayments.length === 0 ? (
            <Card className="p-8">
              <div className="flex flex-col items-center justify-center">
                <EmptyState type="payments" className="text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  {pt.messages.noPayments}
                </p>
              </div>
            </Card>
          ) : (
            monthlyPayments.map((payment) => (
              <Card key={payment.id} className="p-6 shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-outfit font-semibold text-lg">
                      {pt.financial.monthlyPayment}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Referência: {payment.dueDate?.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  {getStatusBadge(payment.status)}
                </div>

                <div className="flex items-center justify-between p-4 bg-accent rounded-lg mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{pt.financial.dueDate}</p>
                    <p className="font-semibold">
                      {payment.dueDate?.toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Valor</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(payment.amount)}
                    </p>
                  </div>
                </div>

                {payment.status === 'pendente' && (
                  <Button
                    variant="warning"
                    size="lg"
                    className="w-full"
                    onClick={() => handleGeneratePix(payment.id)}
                  >
                    <DollarSign className="w-4 h-4" />
                    {pt.financial.pay} ({pt.financial.pixCopyPaste})
                  </Button>
                )}
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="diaria" className="mt-4 space-y-4">
          {dailyPayments.length === 0 ? (
            <Card className="p-8">
              <div className="flex flex-col items-center justify-center">
                <EmptyState type="payments" className="text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  {pt.messages.noPayments}
                </p>
              </div>
            </Card>
          ) : (
            dailyPayments.map((payment) => (
              <Card key={payment.id} className="p-6 shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-outfit font-semibold text-lg">
                      {pt.financial.dailyPayment}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {payment.match?.date.toLocaleDateString('pt-BR')} - {payment.match?.venue}
                    </p>
                  </div>
                  {getStatusBadge(payment.status)}
                </div>

                <div className="flex items-center justify-between p-4 bg-accent rounded-lg mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Valor da diária</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(payment.amount)}
                    </p>
                  </div>
                </div>

                {payment.status === 'aguardando_aprovacao' && (
                  <div className="flex items-center gap-2 p-3 bg-warning/10 rounded-lg border border-warning/20">
                    <AlertCircle className="w-5 h-5 text-warning" />
                    <span className="text-sm font-medium text-warning">
                      Aguardando aprovação do administrador
                    </span>
                  </div>
                )}

                {payment.status === 'payment_in_progress' && pixTimer && (
                  <>
                    <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20 mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary animate-pulse" />
                        <span className="text-sm font-medium text-primary">
                          Tempo restante
                        </span>
                      </div>
                      <span className="text-lg font-bold text-primary">
                        {formatTimer(pixTimer)}
                      </span>
                    </div>

                    <Button
                      variant="success"
                      size="lg"
                      className="w-full"
                      onClick={() => handleCopyPix('mock-pix-code')}
                    >
                      {copiedPixCode ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Código copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copiar código Pix
                        </>
                      )}
                    </Button>
                  </>
                )}
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};