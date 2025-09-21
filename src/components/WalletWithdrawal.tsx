import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle } from 'lucide-react';
import PixIntegration from './PixIntegration';
import { DigitalWallet, PaymentOption, WithdrawalRequest } from '@/hooks/useDigitalWallet';

interface Props {
  wallet: DigitalWallet;
  paymentOptions: PaymentOption[];
  withdrawalRequests: WithdrawalRequest[];
  onProcessPayment: (amount: number, description: string, metadata?: any) => Promise<void>;
  onRequestWithdrawal: (amount: number, pixKey: string) => Promise<void>;
  onAddMoney: (amount: number, pixKey?: string) => Promise<void>;
  formatCurrency: (amount: number) => string;
}

const DigitalWalletComponent: React.FC<Props> = ({
  wallet,
  paymentOptions,
  withdrawalRequests,
  onProcessPayment,
  onRequestWithdrawal,
  onAddMoney,
  formatCurrency
}) => {
  const [loading, setLoading] = useState(false);

  const handleAddMoney = async (amount: number, pixKey?: string) => {
    setLoading(true);
    try {
      await onAddMoney(amount, pixKey);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestWithdrawal = async (amount: number, pixKey: string) => {
    setLoading(true);
    try {
      await onRequestWithdrawal(amount, pixKey);
    } finally {
      setLoading(false);
    }
  };

  const getWithdrawalStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getWithdrawalStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'pending':
        return 'Pendente';
      case 'failed':
        return 'Falhou';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Processando';
    }
  };

  return (
    <div className="space-y-6">
      {/* Saldo da Carteira */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Carteira Digital
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">Saldo disponível</p>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(wallet.balance_brl)}
            </p>
            <p className="text-xs text-gray-500">
              Última atualização: {new Date(wallet.updated_at).toLocaleString('pt-BR')}
            </p>
          </div>

          {/* Status da carteira */}
          <div className="mt-4 flex justify-center">
            <Badge variant={wallet.is_active ? 'default' : 'secondary'}>
              {wallet.is_active ? 'Ativa' : 'Inativa'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Integração PIX */}
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Saldo</CardTitle>
        </CardHeader>
        <CardContent>
          <PixIntegration
            onAddMoney={handleAddMoney}
            onRequestWithdrawal={handleRequestWithdrawal}
            formatCurrency={formatCurrency}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Opções de Pagamento Disponíveis */}
      {paymentOptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Opções de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentOptions.map((option) => (
                <div key={option.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{option.name}</p>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(option.price_brl)}</p>
                    <Badge variant={option.is_active ? 'default' : 'secondary'}>
                      {option.is_active ? 'Disponível' : 'Indisponível'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Solicitações de Saque */}
      {withdrawalRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              Solicitações de Saque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {withdrawalRequests.slice(0, 5).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getWithdrawalStatusIcon(request.status)}
                    <div>
                      <p className="font-medium">Saque via PIX</p>
                      <p className="text-sm text-gray-600">
                        {new Date(request.requested_at).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-xs text-gray-500">
                        Chave: {request.pix_key}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">
                      -{formatCurrency(request.amount_brl)}
                    </p>
                    <Badge variant="outline">
                      {getWithdrawalStatusText(request.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Recebido</p>
                <p className="font-semibold">{formatCurrency(wallet.total_received_brl || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Total Gasto</p>
                <p className="font-semibold">{formatCurrency(wallet.total_paid_brl || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DigitalWalletComponent;