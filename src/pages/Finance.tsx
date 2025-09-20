import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DollarSign, CreditCard, TrendingUp, CheckCircle, Clock, XCircle } from 'lucide-react';
import PaymentButton from '@/components/PaymentButton';

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
      <div>
        <h1 className="text-xl font-semibold">Financeiro</h1>
        <p className="text-sm text-zinc-500">Controle de pagamentos e mensalidades</p>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-zinc-500">Total Pago</p>
                <p className="text-lg font-semibold">R$ 1.250,00</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-zinc-500">Pendente</p>
                <p className="text-lg font-semibold">R$ 180,00</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-zinc-500">Este Mês</p>
                <p className="text-lg font-semibold">R$ 320,00</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Abas de Navegação */}
      <Tabs defaultValue="payments" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="payments">Pagamentos</TabsTrigger>
          <TabsTrigger value="monthly">Mensalidades</TabsTrigger>
          <TabsTrigger value="daily">Diárias</TabsTrigger>
        </TabsList>
        
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">Histórico de Pagamentos</h3>
              {loading ? (
                <p className="text-sm text-zinc-500">Carregando...</p>
              ) : rows.length === 0 ? (
                <p className="text-sm text-zinc-500">Nenhum pagamento encontrado</p>
              ) : (
                <div className="space-y-3">
                  {rows.map((row) => (
                    <div key={row.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(row.status)}
                        <div>
                          <p className="font-medium">
                            {row.type === 'mensalista' ? 'Mensalidade' : 'Diária'} - {row.period || 'N/A'}
                          </p>
                          <p className="text-sm text-zinc-500">
                            {new Date(row.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">R$ {row.amount.toFixed(2)}</p>
                        <Badge className={getStatusColor(row.status)}>
                          {row.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="monthly" className="space-y-4">
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