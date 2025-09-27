import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  QrCode, 
  Copy, 
  Check, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Download,
  Smartphone,
  Banknote,
  ArrowUpDown,
  Settings,
  History,
  Key,
  Scan
} from 'lucide-react';
import { usePixPayment } from '@/hooks/usePixPayment';
import { toast } from 'sonner';
import * as QRCode from 'qrcode';

interface PixPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchId?: string;
  paymentType?: 'mensalista' | 'diarista';
  amount?: number;
  onPaymentComplete?: (transaction: any) => void;
}

export function PixPaymentModal({ 
  open, 
  onOpenChange, 
  matchId, 
  paymentType = 'diarista',
  amount,
  onPaymentComplete 
}: PixPaymentModalProps) {
  const {
    transactions,
    userPixKeys,
    paymentHistory,
    loading,
    createPixTransaction,
    generatePixQrCode,
    addUserPixKey,
    getTransactionsByStatus,
    isTransactionExpired
  } = usePixPayment();

  // Estados para diferentes tipos de pagamento
  const [paymentData, setPaymentData] = useState({
    type: paymentType,
    amount: amount || (paymentType === 'mensalista' ? 50 : 15),
    description: paymentType === 'mensalista' ? 'Mensalidade Maestros FC' : 'Pelada Maestros FC'
  });

  // Estados para depósito/saque
  const [depositData, setDepositData] = useState({
    amount: 0,
    description: 'Recarga de saldo'
  });

  const [withdrawalData, setWithdrawalData] = useState({
    amount: 0,
    pix_key: '',
    pix_key_type: 'cpf' as const,
    description: 'Saque para conta'
  });

  // Estados para chaves PIX
  const [newPixKey, setNewPixKey] = useState({
    pix_key: '',
    pix_key_type: 'cpf' as const,
    is_primary: false
  });

  // Estados da interface
  const [activeTab, setActiveTab] = useState('payment');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [qrCodeImage, setQrCodeImage] = useState<string>('');
  const [currentTransaction, setCurrentTransaction] = useState<any>(null);

  const pendingTransactions = getTransactionsByStatus('pending');
  const completedTransactions = getTransactionsByStatus('completed');

  useEffect(() => {
    if (open) {
      setPaymentData({
        type: paymentType,
        amount: amount || (paymentType === 'mensalista' ? 50 : 15),
        description: paymentType === 'mensalista' ? 'Mensalidade Maestros FC' : 'Pelada Maestros FC'
      });
    }
  }, [open, paymentType, amount]);

  const handleCreatePayment = async () => {
    try {
      const transaction = await createPixTransaction({
        type: 'payment',
        amount_brl: paymentData.amount,
        description: paymentData.description
      });

      // Gerar QR Code
      const qrData = await generatePixQrCode(transaction.id);
      
      setCurrentTransaction({ ...transaction, ...qrData });
      
      // Gerar imagem QR Code
      if (qrData.qr_code) {
        const qrImage = await QRCode.toDataURL(qrData.qr_code);
        setQrCodeImage(qrImage);
      }

      setActiveTab('qr-code');
      toast.success('Pagamento PIX criado! Escaneie o QR Code para pagar.');
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
    }
  };

  const handleCreateDeposit = async () => {
    try {
      const transaction = await createPixTransaction({
        type: 'deposit',
        amount_brl: depositData.amount,
        description: depositData.description
      });

      // Gerar QR Code
      const qrData = await generatePixQrCode(transaction.id);
      
      setCurrentTransaction({ ...transaction, ...qrData });
      
      // Gerar imagem QR Code
      if (qrData.qr_code) {
        const qrImage = await QRCode.toDataURL(qrData.qr_code);
        setQrCodeImage(qrImage);
      }

      setActiveTab('qr-code');
      toast.success('Depósito PIX criado! Escaneie o QR Code para pagar.');
    } catch (error) {
      console.error('Erro ao criar depósito:', error);
    }
  };

  const handleCreateWithdrawal = async () => {
    try {
      const transaction = await createPixTransaction({
        type: 'withdrawal',
        amount_brl: withdrawalData.amount,
        pix_key: withdrawalData.pix_key,
        pix_key_type: withdrawalData.pix_key_type,
        description: withdrawalData.description
      });

      setCurrentTransaction(transaction);
      setActiveTab('withdrawal-confirm');
      toast.success('Saque PIX solicitado! Aguarde processamento.');
    } catch (error) {
      console.error('Erro ao criar saque:', error);
    }
  };

  const handleAddPixKey = async () => {
    try {
      await addUserPixKey({
        pix_key: newPixKey.pix_key,
        pix_key_type: newPixKey.pix_key_type,
        is_primary: newPixKey.is_primary
      });

      setNewPixKey({
        pix_key: '',
        pix_key_type: 'cpf',
        is_primary: false
      });

      setActiveTab('pix-keys');
      toast.success('Chave PIX adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar chave PIX:', error);
    }
  };

  const copyToClipboard = async (text: string, transactionId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(transactionId);
      setTimeout(() => setCopiedCode(null), 2000);
      toast.success('Copiado para a área de transferência!');
    } catch (error) {
      console.error('Erro ao copiar:', error);
      toast.error('Erro ao copiar');
    }
  };

  const downloadQrCode = () => {
    if (qrCodeImage) {
      const link = document.createElement('a');
      link.download = `pix-qr-${currentTransaction?.external_id}.png`;
      link.href = qrCodeImage;
      link.click();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing': return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-gray-500" />;
      case 'expired': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Sistema PIX - Maestros FC
          </DialogTitle>
          <DialogDescription>
            Pagamentos, depósitos e saques via PIX
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="payment">Pagamento</TabsTrigger>
            <TabsTrigger value="deposit">Depósito</TabsTrigger>
            <TabsTrigger value="withdrawal">Saque</TabsTrigger>
            <TabsTrigger value="qr-code">QR Code</TabsTrigger>
            <TabsTrigger value="pix-keys">Chaves PIX</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          {/* Pagamento */}
          <TabsContent value="payment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="w-4 h-4" />
                  Criar Pagamento PIX
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="payment-type">Tipo de Pagamento</Label>
                    <Select 
                      value={paymentData.type} 
                      onValueChange={(value: any) => setPaymentData(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mensalista">Mensalista (R$ 50)</SelectItem>
                        <SelectItem value="diarista">Diarista (R$ 15)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Valor (R$)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData(prev => ({ 
                        ...prev, 
                        amount: parseFloat(e.target.value) || 0 
                      }))}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={paymentData.description}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição do pagamento"
                  />
                </div>

                <Button 
                  onClick={handleCreatePayment}
                  disabled={loading || paymentData.amount <= 0}
                  className="w-full"
                >
                  {loading ? 'Criando...' : `Criar Pagamento PIX - ${formatCurrency(paymentData.amount)}`}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Depósito */}
          <TabsContent value="deposit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4" />
                  Recarregar Saldo via PIX
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deposit-amount">Valor do Depósito (R$)</Label>
                  <Input
                    id="deposit-amount"
                    type="number"
                    value={depositData.amount}
                    onChange={(e) => setDepositData(prev => ({ 
                      ...prev, 
                      amount: parseFloat(e.target.value) || 0 
                    }))}
                    min="1"
                    step="0.01"
                    placeholder="Digite o valor"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deposit-description">Descrição</Label>
                  <Input
                    id="deposit-description"
                    value={depositData.description}
                    onChange={(e) => setDepositData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição do depósito"
                  />
                </div>

                <Button 
                  onClick={handleCreateDeposit}
                  disabled={loading || depositData.amount <= 0}
                  className="w-full"
                >
                  {loading ? 'Criando...' : `Gerar PIX para Depósito - ${formatCurrency(depositData.amount)}`}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Saque */}
          <TabsContent value="withdrawal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4" />
                  Solicitar Saque via PIX
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="withdrawal-amount">Valor do Saque (R$)</Label>
                  <Input
                    id="withdrawal-amount"
                    type="number"
                    value={withdrawalData.amount}
                    onChange={(e) => setWithdrawalData(prev => ({ 
                      ...prev, 
                      amount: parseFloat(e.target.value) || 0 
                    }))}
                    min="1"
                    step="0.01"
                    placeholder="Digite o valor"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pix-key-type">Tipo de Chave PIX</Label>
                    <Select 
                      value={withdrawalData.pix_key_type} 
                      onValueChange={(value: any) => setWithdrawalData(prev => ({ ...prev, pix_key_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cpf">CPF</SelectItem>
                        <SelectItem value="cnpj">CNPJ</SelectItem>
                        <SelectItem value="email">E-mail</SelectItem>
                        <SelectItem value="phone">Telefone</SelectItem>
                        <SelectItem value="random">Chave Aleatória</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pix-key">Chave PIX</Label>
                    <Input
                      id="pix-key"
                      value={withdrawalData.pix_key}
                      onChange={(e) => setWithdrawalData(prev => ({ ...prev, pix_key: e.target.value }))}
                      placeholder="Digite a chave PIX"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="withdrawal-description">Descrição</Label>
                  <Input
                    id="withdrawal-description"
                    value={withdrawalData.description}
                    onChange={(e) => setWithdrawalData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição do saque"
                  />
                </div>

                <Button 
                  onClick={handleCreateWithdrawal}
                  disabled={loading || withdrawalData.amount <= 0 || !withdrawalData.pix_key}
                  className="w-full"
                >
                  {loading ? 'Solicitando...' : `Solicitar Saque - ${formatCurrency(withdrawalData.amount)}`}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* QR Code */}
          <TabsContent value="qr-code" className="space-y-4">
            {currentTransaction && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="w-4 h-4" />
                    QR Code PIX
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="bg-white p-4 rounded-lg inline-block">
                      {qrCodeImage && (
                        <img 
                          src={qrCodeImage} 
                          alt="QR Code PIX" 
                          className="w-64 h-64 mx-auto"
                        />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Código PIX (Copiar e Colar)</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={currentTransaction.qr_code || ''} 
                        readOnly 
                        className="font-mono text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(currentTransaction.qr_code, currentTransaction.id)}
                      >
                        {copiedCode === currentTransaction.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button onClick={downloadQrCode} variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Baixar QR Code
                    </Button>
                    <Button onClick={() => setActiveTab('payment')} variant="outline">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Novo Pagamento
                    </Button>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Como pagar:</h4>
                    <ol className="text-sm text-blue-800 space-y-1">
                      <li>1. Abra o app do seu banco</li>
                      <li>2. Escaneie o QR Code ou copie o código PIX</li>
                      <li>3. Confirme o pagamento</li>
                      <li>4. Aguarde a confirmação automática</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Chaves PIX */}
          <TabsContent value="pix-keys" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Lista de chaves */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Suas Chaves PIX
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {userPixKeys.map(key => (
                    <div key={key.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{key.pix_key}</p>
                        <div className="flex gap-2">
                          <Badge variant="outline">{key.pix_key_type}</Badge>
                          {key.is_primary && <Badge>Primária</Badge>}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Adicionar chave */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Adicionar Chave PIX
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-pix-key-type">Tipo de Chave</Label>
                    <Select 
                      value={newPixKey.pix_key_type} 
                      onValueChange={(value: any) => setNewPixKey(prev => ({ ...prev, pix_key_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cpf">CPF</SelectItem>
                        <SelectItem value="cnpj">CNPJ</SelectItem>
                        <SelectItem value="email">E-mail</SelectItem>
                        <SelectItem value="phone">Telefone</SelectItem>
                        <SelectItem value="random">Chave Aleatória</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-pix-key">Chave PIX</Label>
                    <Input
                      id="new-pix-key"
                      value={newPixKey.pix_key}
                      onChange={(e) => setNewPixKey(prev => ({ ...prev, pix_key: e.target.value }))}
                      placeholder="Digite a chave PIX"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is-primary"
                      checked={newPixKey.is_primary}
                      onChange={(e) => setNewPixKey(prev => ({ ...prev, is_primary: e.target.checked }))}
                    />
                    <Label htmlFor="is-primary">Definir como chave primária</Label>
                  </div>

                  <Button 
                    onClick={handleAddPixKey}
                    disabled={loading || !newPixKey.pix_key}
                    className="w-full"
                  >
                    {loading ? 'Adicionando...' : 'Adicionar Chave PIX'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Histórico */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Histórico de Transações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {transactions.slice(0, 10).map(transaction => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{transaction.description}</p>
                          <Badge className={getStatusColor(transaction.status)}>
                            {getStatusIcon(transaction.status)}
                            <span className="ml-1">{transaction.status}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          {formatCurrency(transaction.amount_brl)} • {transaction.type}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(transaction.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      {transaction.qr_code && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(transaction.qr_code, transaction.id)}
                        >
                          {copiedCode === transaction.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
