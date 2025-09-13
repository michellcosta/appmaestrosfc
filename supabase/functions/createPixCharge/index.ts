import { getServiceClient, corsHeaders } from '../_client.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() });
  }
  try {
    const body = await req.json();
    const { userId, tipo, matchId, mesRef, valor } = body || {};
    if (!userId || !tipo || (!matchId && !mesRef) || !valor) {
      return new Response(JSON.stringify({ ok:false, error:'missing fields' }), { headers: corsHeaders(), status: 400 });
    }

    // Aqui você integraria com o Mercado Pago para gerar o "copia_e_cola"
    // Para demo, vou mockar um "copia_e_cola" e "txid" previsível
    const copia_e_cola = `00020126...COPIA_E_COLA_DEMO_${crypto.randomUUID()}`;
    const txid = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30*60*1000).toISOString();

    const supabase = getServiceClient();
    // cria o registro de pagamento em 'pendente'
    const reference_text = tipo === 'mensal'
      ? `Pagamento Mensalista Maestros FC - ${mesRef ?? ''}`
      : `Pagamento Diarista Maestros FC - ${new Date().toLocaleDateString('pt-BR')}`;

    const { error:insErr } = await supabase.from('payments').insert({
      user_id: userId,
      tipo,
      mes_ref: mesRef ?? null,
      match_id: matchId ?? null,
      valor,
      status: 'pendente',
      provider: 'mercadopago',
      reference_text,
      txid,
      expires_at: expiresAt
    });
    if (insErr) throw insErr;

    return new Response(JSON.stringify({ ok:true, copia_e_cola, txid, expiresAt }), { headers: corsHeaders() });
  } catch (e) {
    return new Response(JSON.stringify({ ok:false, error: String(e?.message ?? e) }), { headers: corsHeaders(), status: 500 });
  }
});
