import { getServiceClient, corsHeaders } from '../_client.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders() });

  try {
    // No mundo real: validar assinatura do Mercado Pago e garantir idempotência
    const payload = await req.json();
    const { txid, matchId } = payload || {};
    if (!txid) {
      return new Response(JSON.stringify({ ok:false, error:'missing txid' }), { headers: corsHeaders(), status: 400 });
    }

    const supabase = getServiceClient();

    // busca pagamento por txid
    const { data:pay, error:payErr } = await supabase
      .from('payments').select('id, match_id, status').eq('txid', txid).maybeSingle();
    if (payErr || !pay) {
      return new Response(JSON.stringify({ ok:false, error:'payment not found' }), { headers: corsHeaders(), status: 404 });
    }

    // Revalidar lotação (simplificado: vamos considerar que lotou se no payload veio full=true)
    const body = payload as any;
    const isFull = body?.full === true;

    if (isFull) {
      // cria crédito e marca pagamento como 'revisar'
      const { error:credErr } = await supabase.from('credits').insert({
        user_id: body.userId,
        origin_payment_id: pay.id,
        amount: body.amount ?? 0
      });
      if (credErr) throw credErr;

      const { error:updErr } = await supabase.from('payments').update({ status:'revisar' }).eq('id', pay.id);
      if (updErr) throw updErr;

      return new Response(JSON.stringify({ ok:true, credited:true }), { headers: corsHeaders() });
    }

    // confirmar pagamento
    const { error:cErr } = await supabase.from('payments').update({ status:'confirmado' }).eq('id', pay.id);
    if (cErr) throw cErr;

    // confirmar presença (use diarist_requests ou outra lógica conforme seu modelo)
    // omitido aqui para simplificar — ajuste conforme seu fluxo

    return new Response(JSON.stringify({ ok:true, confirmed:true }), { headers: corsHeaders() });
  } catch (e) {
    return new Response(JSON.stringify({ ok:false, error: String(e?.message ?? e) }), { headers: corsHeaders(), status: 500 });
  }
});
