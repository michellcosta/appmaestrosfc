import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { DiaristRequest } from '@/types';
import {
  canShowPayButton,
  startPaymentWindow,
  isPaymentWindowActive,
  markPaid,
  markFull,
  creditIfLate,
  PAYMENT_WINDOW_MS,
} from '@/services/payments';

// MOCK — substituir por dados do Supabase
const mockDiarist: DiaristRequest = {
  id: 'req1',
  userId: 'u1',
  matchId: 'm1',
  state: 'approved', // awaiting_approval | approved | paying | paid | full | credited
};

export const Financial: React.FC = () => {
  const [req, setReq] = useState<DiaristRequest>(mockDiarist);
  const [copied, setCopied] = useState(false);

  const remaining = useMemo(() => {
    if (!req.paymentStartedAt || req.state !== 'paying') return PAYMENT_WINDOW_MS;
    const diff = Date.now() - req.paymentStartedAt;
    return Math.max(PAYMENT_WINDOW_MS - diff, 0);
  }, [req]);

  const mmss = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${ss}`;
  };

  const gerarPix = () => {
    // inicia a janela de 30:00 SOMENTE no clique
    setReq((r) => startPaymentWindow(r));
    const copiaCola = '00020126580014BR.GOV.BCB.PIX...'; // mock
    navigator.clipboard.writeText(copiaCola).then(() => setCopied(true));
  };

  const confirmarPix = () => {
    // Simula webhook confirmando
    setReq((r) => {
      // se a partida encheu entre a aprovação e o clique, use markFull(r) em outro fluxo
      // se pagamento chegou depois da janela, vira crédito:
      const credited = creditIfLate(r);
      if (credited.state === 'credited') return credited;
      return markPaid(r);
    });
  };

  // Exemplo: jogo ficou cheio ANTES do clique
  const partidaFicouCheia = () => setReq((r) => markFull(r));

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-outfit font-bold">Financeiro</h1>

      {/* Mensalista (resumo) — lembretes e templates editáveis ficam em tela de Admin */}
      <Card className="p-4">
        <div className="font-semibold mb-2">Mensalista</div>
        <div className="text-sm text-muted-foreground">
          Vencimento: dia 15. Lembretes em 01, 10, 14, 15 e a cada 5 dias após o vencimento.  
          (Templates editáveis pelo Admin Principal.)
        </div>
      </Card>

      {/* Diarista */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold">Diarista</div>
          <Badge variant="outline">{req.state}</Badge>
        </div>

        {req.state === 'awaiting_approval' && (
          <div className="text-sm text-muted-foreground">Aguardando aprovação do Admin/Auxiliar…</div>
        )}

        {req.state === 'approved' && (
          <div className="grid gap-3">
            <div className="text-sm text-muted-foreground">
              Você foi aprovado. Gere o Pix (copia e cola). O contador inicia somente após o clique.
            </div>
            <div className="flex gap-2">
              <Button onClick={gerarPix}>Gerar Pix — Copiar</Button>
              <Button variant="outline" onClick={partidaFicouCheia}>Simular “Partida cheia” antes do clique</Button>
            </div>
          </div>
        )}

        {req.state === 'full' && (
          <div className="text-sm text-warning">
            Partida cheia — pagamento indisponível. Se pagar externamente e cair depois, vira **crédito**.
          </div>
        )}

        {req.state === 'paying' && (
          <div className="grid gap-3">
            <div className="text-sm">
              Tempo restante para pagamento: <b>{mmss(remaining)}</b>
            </div>
            <div className="flex gap-2">
              <Button onClick={confirmarPix}>Simular confirmação Pix</Button>
              <Button variant="secondary" disabled>{copied ? 'Pix copiado!' : 'Pix copia e cola'}</Button>
            </div>
            <div className="text-xs text-muted-foreground">
              Se o Pix for confirmado após o tempo expirar ou após a partida lotar, será gerado **crédito**.
            </div>
          </div>
        )}

        {req.state === 'paid' && (
          <div className="text-sm text-success">Pagamento confirmado. Presença garantida.</div>
        )}

        {req.state === 'credited' && (
          <div className="text-sm">
            Pagamento recebido após o limite/partida cheia. Um **crédito** foi criado para o próximo jogo.
          </div>
        )}
      </Card>
    </div>
  );
};
