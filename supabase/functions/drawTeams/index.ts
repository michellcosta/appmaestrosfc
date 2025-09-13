import { getServiceClient, corsHeaders } from '../_client.ts';

// Em produção, você usaria critérios reais: ordem de chegada (checkins.ts), posição e estrelas.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders() });

  try {
    const { matchId } = await req.json();
    if (!matchId) return new Response(JSON.stringify({ ok:false, error:'missing matchId' }), { headers: corsHeaders(), status: 400 });

    const supabase = getServiceClient();

    // Exemplo simples: pega primeiros 20 check-ins e distribui round-robin nas 5 cores
    const { data:checkins, error:cErr } = await supabase
      .from('checkins')
      .select('user_id, ts')
      .eq('match_id', matchId)
      .order('ts', { ascending: true })
      .limit(20);
    if (cErr) throw cErr;

    const colors = ['Preto','Verde','Cinza','Coletes','Vermelho'] as const;
    const teams: Record<string,string[]> = { Preto:[], Verde:[], Cinza:[], Coletes:[], Vermelho:[] };
    checkins?.forEach((row, idx) => {
      const color = colors[idx % colors.length];
      teams[color].push(row.user_id);
    });

    // Salva em team_draw
    const { error:upErr } = await supabase.from('team_draw')
      .upsert({ match_id: matchId, seed: crypto.randomUUID(), criterios: { by:'checkin' }, teams }, { onConflict:'match_id' });
    if (upErr) throw upErr;

    return new Response(JSON.stringify({ ok:true, teams }), { headers: corsHeaders() });
  } catch (e) {
    return new Response(JSON.stringify({ ok:false, error: String(e?.message ?? e) }), { headers: corsHeaders(), status: 500 });
  }
});
