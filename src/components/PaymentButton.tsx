import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Wallet, CreditCard } from "lucide-react";
import { useAuth } from "@/auth/OfflineAuthProvider";
import { useDigitalWallet } from "@/hooks/useDigitalWallet";

type ChargeType = "mensalista" | "diarista";

interface Props {
  type: ChargeType;
  amount: number;
  period?: string;   // 'YYYY-MM' para mensalista
  matchId?: string;  // id do jogo (diarista)
}

const PaymentButton: React.FC<Props> = ({ type, amount, period, matchId }) => {
  const [open, setOpen] = useState(false);
  const [brcode, setBrcode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'pix'>('wallet');
  
  const { user } = useAuth();
  const { wallet, processGenericPayment, formatCurrency } = useDigitalWallet(user?.id || '', user?.group_id);

  const handleWalletPayment = async () => {
    if (!wallet || wallet.balance_brl < amount) {
      alert('Saldo insuficiente na carteira digital');
      return;
    }

    setLoading(true);
    try {
      const description = type === 'mensalista' 
        ? `Mensalidade ${period}` 
        : `Diária - Jogo ${matchId}`;
      
      await processGenericPayment(amount, description, {
        type,
        period,
        matchId
      });
      
      alert('Pagamento realizado com sucesso!');
      setOpen(false);
    } catch (error) {
      console.error('Erro no pagamento:', error);
      alert('Erro ao processar pagamento');
    } finally {
      setLoading(false);
    }
  };

  const createPixCharge = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/create-charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, amount, period, matchId })
      });
      const data = await res.json();
      setBrcode(data.brcode);
    } catch (error) {
      console.error('Erro ao gerar PIX:', error);
      alert('Erro ao gerar código PIX');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    if (paymentMethod === 'wallet') {
      handleWalletPayment();
    } else {
      createPixCharge();
    }
  };

  const canPayWithWallet = wallet && wallet.balance_brl >= amount;

  return (
    <>
      <Button onClick={() => setOpen(true)} disabled={loading}>
        {type === "mensalista" ? "Pagar mensalidade" : "Pagar diária"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {type === "mensalista" ? "Pagar Mensalidade" : "Pagar Diária"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{formatCurrency(amount)}</p>
              <p className="text-sm text-gray-600">
                {type === "mensalista" ? `Período: ${period}` : `Jogo: ${matchId}`}
              </p>
            </div>

            {/* Saldo da carteira */}
            {wallet && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Saldo na carteira:</span>
                  <span className="font-semibold">{formatCurrency(wallet.balance_brl)}</span>
                </div>
              </div>
            )}

            {/* Métodos de pagamento */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Escolha o método de pagamento:</p>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={paymentMethod === 'wallet' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('wallet')}
                  disabled={!canPayWithWallet}
                  className="flex items-center gap-2"
                >
                  <Wallet className="w-4 h-4" />
                  Carteira
                  {!canPayWithWallet && (
                    <Badge variant="destructive" className="text-xs">
                      Saldo insuficiente
                    </Badge>
                  )}
                </Button>
                
                <Button
                  variant={paymentMethod === 'pix' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('pix')}
                  className="flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  PIX
                </Button>
              </div>
            </div>

            {/* Código PIX */}
            {paymentMethod === 'pix' && brcode && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Código PIX:</p>
                <Textarea readOnly value={brcode} className="min-h-[100px] text-xs" />
                <Button
                  variant="secondary"
                  onClick={() => navigator.clipboard.writeText(brcode)}
                  className="w-full"
                >
                  Copiar código PIX
                </Button>
              </div>
            )}

            {/* Botão de ação */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              
              <Button
                onClick={handlePayment}
                disabled={loading || (paymentMethod === 'wallet' && !canPayWithWallet)}
                className="flex-1"
              >
                {loading ? "Processando..." : 
                 paymentMethod === 'wallet' ? "Pagar com Carteira" : "Gerar PIX"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PaymentButton;
