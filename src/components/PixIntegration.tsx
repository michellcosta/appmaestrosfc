import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { QrCode, Copy, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface PixIntegrationProps {
  onAddMoney: (amount: number, pixKey?: string) => Promise<void>;
  onRequestWithdrawal: (amount: number, pixKey: string) => Promise<void>;
  formatCurrency: (amount: number) => string;
  loading?: boolean;
}

interface PixCharge {
  id: string;
  amount: number;
  brcode: string;
  qrCodeUrl?: string;
  status: 'pending' | 'paid' | 'expired';
  expiresAt: string;
}

const PixIntegration: React.FC<PixIntegrationProps> = ({
  onAddMoney,
  onRequestWithdrawal,
  formatCurrency,
  loading = false
}) => {
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawPixKey, setWithdrawPixKey] = useState('');
  const [pixCharge, setPixCharge] = useState<PixCharge | null>(null);
  const [processingDeposit, setProcessingDeposit] = useState(false);
  const [processingWithdraw, setProcessingWithdraw] = useState(false);

  const predefinedAmounts = [10, 20, 50, 100, 200, 500];

  const generatePixCharge = async (amount: number) => {
    setProcessingDeposit(true);
    try {
      const response = await fetch('/api/payments/create-pix-charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, type: 'wallet_deposit' })
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar cobrança PIX');
      }

      const data = await response.json();
      setPixCharge({
        id: data.id,
        amount,
        brcode: data.brcode,
        qrCodeUrl: data.qrCodeUrl,
        status: 'pending',
        expiresAt: data.expiresAt
      });

      // Iniciar polling para verificar status do pagamento
      startPaymentPolling(data.id);
    } catch (error) {
      console.error('Erro ao gerar PIX:', error);
      alert('Erro ao gerar cobrança PIX');
    } finally {
      setProcessingDeposit(false);
    }
  };

  const startPaymentPolling = (chargeId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/payments/check-pix-status/${chargeId}`);
        const data = await response.json();

        if (data.status === 'paid') {
          clearInterval(interval);
          setPixCharge(prev => prev ? { ...prev, status: 'paid' } : null);
          
          // Adicionar dinheiro à carteira
          await onAddMoney(pixCharge?.amount || 0);
          
          setTimeout(() => {
            setDepositOpen(false);
            setPixCharge(null);
            setDepositAmount('');
          }, 2000);
        } else if (data.status === 'expired') {
          clearInterval(interval);
          setPixCharge(prev => prev ? { ...prev, status: 'expired' } : null);
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      }
    }, 3000); // Verificar a cada 3 segundos

    // Parar polling após 10 minutos
    setTimeout(() => clearInterval(interval), 600000);
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Digite um valor válido');
      return;
    }

    if (amount < 1) {
      alert('Valor mínimo para depósito é R$ 1,00');
      return;
    }

    if (amount > 5000) {
      alert('Valor máximo para depósito é R$ 5.000,00');
      return;
    }

    await generatePixCharge(amount);
  };

  const handleWithdrawal = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Digite um valor válido');
      return;
    }

    if (!withdrawPixKey.trim()) {
      alert('Digite uma chave PIX válida');
      return;
    }

    if (amount < 10) {
      alert('Valor mínimo para saque é R$ 10,00');
      return;
    }

    setProcessingWithdraw(true);
    try {
      await onRequestWithdrawal(amount, withdrawPixKey);
      alert('Solicitação de saque enviada com sucesso!');
      setWithdrawOpen(false);
      setWithdrawAmount('');
      setWithdrawPixKey('');
    } catch (error) {
      console.error('Erro no saque:', error);
      alert('Erro ao solicitar saque');
    } finally {
      setProcessingWithdraw(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Código copiado!');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'expired':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Pago';
      case 'pending':
        return 'Aguardando pagamento';
      case 'expired':
        return 'Expirado';
      default:
        return 'Processando';
    }
  };

  return (
    <div className="space-y-4">
      {/* Botões principais */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          onClick={() => setDepositOpen(true)}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <QrCode className="w-4 h-4" />
          Adicionar Dinheiro
        </Button>

        <Button
          variant="outline"
          onClick={() => setWithdrawOpen(true)}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <Copy className="w-4 h-4" />
          Solicitar Saque
        </Button>
      </div>

      {/* Modal de Depósito */}
      <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Dinheiro via PIX</DialogTitle>
          </DialogHeader>

          {!pixCharge ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Valor do depósito</label>
                <Input
                  type="number"
                  placeholder="0,00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  min="1"
                  max="5000"
                  step="0.01"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Mínimo: R$ 1,00 | Máximo: R$ 5.000,00
                </p>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Valores rápidos:</p>
                <div className="grid grid-cols-3 gap-2">
                  {predefinedAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => setDepositAmount(amount.toString())}
                    >
                      {formatCurrency(amount)}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleDeposit}
                disabled={processingDeposit || !depositAmount}
                className="w-full"
              >
                {processingDeposit ? 'Gerando PIX...' : 'Gerar PIX'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {getStatusIcon(pixCharge.status)}
                  <span className="font-medium">{getStatusText(pixCharge.status)}</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(pixCharge.amount)}</p>
              </div>

              {pixCharge.status === 'pending' && (
                <>
                  {pixCharge.qrCodeUrl && (
                    <div className="text-center">
                      <img
                        src={pixCharge.qrCodeUrl}
                        alt="QR Code PIX"
                        className="mx-auto w-48 h-48 border rounded-lg"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Código PIX:</label>
                    <Textarea
                      readOnly
                      value={pixCharge.brcode}
                      className="min-h-[80px] text-xs"
                    />
                    <Button
                      variant="secondary"
                      onClick={() => copyToClipboard(pixCharge.brcode)}
                      className="w-full"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar código PIX
                    </Button>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      ⏱️ Aguardando pagamento. O código expira em alguns minutos.
                    </p>
                  </div>
                </>
              )}

              {pixCharge.status === 'paid' && (
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                  <p className="text-green-800 font-medium">
                    Pagamento confirmado! Dinheiro adicionado à sua carteira.
                  </p>
                </div>
              )}

              {pixCharge.status === 'expired' && (
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-2" />
                  <p className="text-red-800 font-medium">
                    Código PIX expirado. Gere um novo código.
                  </p>
                  <Button
                    onClick={() => setPixCharge(null)}
                    className="mt-2"
                  >
                    Gerar novo código
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Saque */}
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Solicitar Saque via PIX</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Valor do saque</label>
              <Input
                type="number"
                placeholder="0,00"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                min="10"
                step="0.01"
              />
              <p className="text-xs text-gray-600 mt-1">
                Valor mínimo: R$ 10,00
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Chave PIX</label>
              <Input
                type="text"
                placeholder="Digite sua chave PIX (CPF, e-mail, telefone ou chave aleatória)"
                value={withdrawPixKey}
                onChange={(e) => setWithdrawPixKey(e.target.value)}
              />
            </div>

            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Saques são processados em até 24 horas úteis.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setWithdrawOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              
              <Button
                onClick={handleWithdrawal}
                disabled={processingWithdraw || !withdrawAmount || !withdrawPixKey}
                className="flex-1"
              >
                {processingWithdraw ? 'Processando...' : 'Solicitar Saque'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PixIntegration;