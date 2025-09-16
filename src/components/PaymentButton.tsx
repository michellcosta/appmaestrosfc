import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

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

  const createCharge = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/create-charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, amount, period, matchId })
      });
      const data = await res.json();
      setBrcode(data.brcode);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={createCharge} disabled={loading}>
        {loading ? "Gerando..." : (type === "mensalista" ? "Pagar mensalidade" : "Pagar diária")}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pix copia e cola</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Textarea readOnly value={brcode ?? ""} className="min-h-[140px]" />
            <div className="flex justify-end">
              <Button
                variant="secondary"
                onClick={()=> brcode && navigator.clipboard.writeText(brcode)}
              >
                Copiar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PaymentButton;
