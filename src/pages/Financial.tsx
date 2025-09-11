import React, { useState } from 'react';
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

export default function Financial() {
  const [req, setReq] = useState<DiaristRequest>({
    id: 'req_1',
    amountCents: 5000,
    status: 'pending',
  });

  const iniciarJanela = () => setReq((r: DiaristRequest) => startPaymentWindow(r));
  const marcarPago = () => setReq((r: DiaristRequest) => markPaid(r));
  const marcarCheio = () => setReq((r: DiaristRequest) => markFull(r));
  const creditarSeAtraso = () => setReq((r: DiaristRequest) => creditIfLate(r));

  const janelaAtiva = isPaymentWindowActive(req);
  const podeMostrarBotao = canShowPayButton(req);

  return (
    <div className="max-w-xl mx-auto p-4 space-y-3">
      <h1 className="text-xl font-semibold">Financeiro</h1>
      <div className="text-sm text-muted-foreground">
        Janela de pagamento: {Math.round(PAYMENT_WINDOW_MS / 60000)} min
      </div>

      <pre className="bg-muted p-3 rounded">{JSON.stringify(req, null, 2)}</pre>

      <div className="flex flex-wrap gap-2">
        <button className="px-3 py-2 rounded bg-blue-600 text-white" onClick={iniciarJanela}>
          Iniciar janela
        </button>
        <button className="px-3 py-2 rounded bg-emerald-600 text-white" onClick={marcarPago}>
          Marcar pago
        </button>
        <button className="px-3 py-2 rounded bg-amber-600 text-white" onClick={marcarCheio}>
          Marcar cheio
        </button>
        <button className="px-3 py-2 rounded bg-slate-600 text-white" onClick={creditarSeAtraso}>
          Creditar se atraso
        </button>
      </div>

      <div className="text-sm">
        Janela ativa? <b>{janelaAtiva ? 'Sim' : 'Não'}</b> — Mostrar botão pagar?{' '}
        <b>{podeMostrarBotao ? 'Sim' : 'Não'}</b>
      </div>
    </div>
  );
}
