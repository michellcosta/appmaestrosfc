import React, { useState } from 'react';
import { useAuth } from '@/auth/OfflineAuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreditCard, Copy, Check, Loader2, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentData {
  amount_brl: number;
  description: string;
  group_id: string;
  user_id: string;
  match_id?: string;
}

interface PixResponse {
  success: boolean;
  external_ref: string;
  qr_code: string;
  qr_code_base64: string;
}

export default function PayPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData>({
    amount_brl: 0,
    description: '',
    group_id: user?.group_id || '',
    user_id: user?.id || ''
  });
  const [pixResponse, setPixResponse] = useState<PixResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const predefinedAmounts = [10, 20, 50, 100, 200, 500];

  const handleAmountChange = (amount: number) => {
    setPaymentData(prev => ({ ...prev, amount_brl: amount }));
  };

  const handleCreatePix = async () => {
    if (!paymentData.amount_brl || !paymentData.description) {
      toast({
        title: 'Dados incompletos',
        description: 'Preencha o valor e a descrição.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/pix/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });

      const data = await response.json();
      
      if (data.success) {
        setPixResponse(data);
        toast({
          title: 'PIX gerado!',
          description: 'Copie o código PIX para pagar.',
        });
      } else {
        toast({
          title: 'Erro ao gerar PIX',
          description: data.error || 'Tente novamente.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error creating PIX:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao processar pagamento. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const copyPixCode = async () => {
    if (pixResponse?.qr_code) {
      try {
        await navigator.clipboard.writeText(pixResponse.qr_code);
        setCopied(true);
        toast({
          title: 'Código copiado!',
          description: 'Cole no seu app de pagamento.',
        });
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Error copying PIX code:', error);
        toast({
          title: 'Erro ao copiar',
          description: 'Tente copiar manualmente.',
          variant: 'destructive'
        });
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Pagamento PIX</h1>
          <p className="text-gray-600">Gere um PIX para pagar sua participação</p>
        </div>

        {/* Formulário de pagamento */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Pagamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                placeholder="0,00"
                value={paymentData.amount_brl || ''}
                onChange={(e) => handleAmountChange(parseFloat(e.target.value) || 0)}
                className="text-lg"
              />
            </div>

            <div>
              <Label>Valores pré-definidos</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {predefinedAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant={paymentData.amount_brl === amount ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleAmountChange(amount)}
                    className="text-sm"
                  >
                    R$ {amount}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label>Descrição</Label>
              <Textarea
                placeholder="Ex: Mensalidade Janeiro 2024"
                value={paymentData.description}
                onChange={(e) => setPaymentData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <Button
              onClick={handleCreatePix}
              disabled={loading || !paymentData.amount_brl || !paymentData.description}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando PIX...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Gerar PIX
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* PIX gerado */}
        {pixResponse && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                PIX Gerado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Valor:</span>
                  <Badge variant="outline" className="text-lg">
                    {formatCurrency(paymentData.amount_brl)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Referência:</span>
                  <span className="text-xs text-gray-500">
                    {pixResponse.external_ref.slice(-8)}
                  </span>
                </div>
              </div>

              <div>
                <Label>Código PIX (Copia e Cola)</Label>
                <div className="flex space-x-2">
                  <Textarea
                    value={pixResponse.qr_code}
                    readOnly
                    className="font-mono text-xs"
                    rows={4}
                  />
                  <Button
                    onClick={copyPixCode}
                    variant="outline"
                    size="sm"
                    className="h-auto"
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {pixResponse.qr_code_base64 && (
                <div className="text-center">
                  <Label>QR Code</Label>
                  <div className="mt-2 p-4 bg-white rounded-lg inline-block">
                    <img
                      src={`data:image/png;base64,${pixResponse.qr_code_base64}`}
                      alt="QR Code PIX"
                      className="w-32 h-32"
                    />
                  </div>
                </div>
              )}

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Instruções:</strong>
                </p>
                <ol className="text-xs text-blue-700 mt-1 space-y-1">
                  <li>1. Copie o código PIX acima</li>
                  <li>2. Abra seu app de pagamento</li>
                  <li>3. Cole o código e confirme o pagamento</li>
                  <li>4. Aguarde a confirmação automática</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informações adicionais */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Wallet className="w-8 h-8 mx-auto text-gray-400" />
              <p className="text-sm text-gray-600">
                O pagamento será processado automaticamente
              </p>
              <p className="text-xs text-gray-500">
                Você receberá uma notificação quando o pagamento for confirmado
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
