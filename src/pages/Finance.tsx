import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// Se existe no seu projeto; se nÃ£o, comente esta linha e os <PaymentButton/>
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

  return (
    <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 space-y-4">
      <h2 className="text-xl font-semibold">Financeiro</h2>

      <Card className="rounded-2xl">
        <CardContent className="p-4 space-y-3">
          <div className="text-sm font-semibold">Pagar agora</div>
          <div className="flex flex-wrap gap-2">
            {/* Se nÃ£o tiver PaymentButton ainda, comente estas linhas */}
            <PaymentButton type="mensalista" amount={99.90} period="2025-09" />
            <PaymentButton type="diarista" amount={20.00} />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardContent className="p-4 space-y-3">
          <div className="text-sm font-semibold">Minhas cobranÃ§as</div>
          <div className="space-y-2">
            {loading ? (
              <div className="text-sm text-zinc-500">Carregandoâ€¦</div>
            ) : rows.length === 0 ? (
              <div className="text-sm text-zinc-500">Sem cobranÃ§as.</div>
            ) : rows.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-2 rounded-xl border p-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium">
                    {c.type === 'mensalista' ? 'Mensalidade' : 'DiÃ¡ria'} {c.period ? `(${c.period})` : ''}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {new Date(c.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-semibold">R$ {c.amount.toFixed(2)}</div>
                  <Badge variant="secondary">{c.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


