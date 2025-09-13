#!/usr/bin/env bash
set -euo pipefail

# Pastas
mkdir -p src/auth
mkdir -p supabase/functions/createPixCharge
mkdir -p supabase/functions/onPixWebhook
mkdir -p supabase/functions/drawTeams

########################################
# 1) Front: Auth Provider + Hook + Botões
########################################
cat > src/auth/AuthProvider.tsx <<'EOF'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';

type AppUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: 'owner'|'admin'|'aux'|'mensalista'|'diarista';
};

type AuthCtx = {
  user: AppUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<AppUser|null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    // Tenta ler perfil na tabela users (pode ajustar conforme seu schema)
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, role')
      .eq('auth_id', uid)
      .limit(1)
      .maybeSingle();
    if (!error && data) {
      setUser({
        id: data.id,
        email: (data as any).email ?? null,
        name: (data as any).name ?? null,
        role: (data as any).role,
      });
    } else {
      // perfil ainda não criado; exponha só o auth user id
      setUser({ id: uid, email: null, name: null, role: undefined });
    }
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!isMounted) return;
      if (session?.user?.id) {
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_evt, session) => {
      if (session?.user?.id) {
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
      }
    });
    return () => { sub.subscription.unsubscribe(); isMounted = false; };
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const refreshProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) await fetchProfile(session.user.id);
  };

  const value = useMemo(()=>({ user, loading, signInWithGoogle, signOut, refreshProfile }),[user,loading]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useAuth = () => useContext(Ctx);
EOF

cat > src/auth/AuthButtons.tsx <<'EOF'
import React from 'react';
import { useAuth } from './AuthProvider';
import { Button } from '@/components/ui/button';

export const GoogleLoginButton: React.FC = () => {
  const { signInWithGoogle, loading } = useAuth();
  return (
    <Button disabled={loading} onClick={signInWithGoogle}>
      Entrar com Google
    </Button>
  );
};

export const LogoutButton: React.FC = () => {
  const { signOut } = useAuth();
  return <Button variant="secondary" onClick={signOut}>Sair</Button>;
};
EOF

########################################
# 2) Edge Functions: _client util + CORS
########################################
cat > supabase/functions/_client.ts <<'EOF'
/**
 * Cliente para chamar o PostgREST com Service Role (apenas dentro da Edge Function)
 * NUNCA exponha SERVICE_ROLE_KEY no front!
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

export function getServiceClient() {
  const url = Deno.env.get('SUPABASE_URL')!;
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(url, key, { auth: { persistSession: false } });
}

export function corsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}
EOF

########################################
# 3) Function: createPixCharge
########################################
cat > supabase/functions/createPixCharge/index.ts <<'EOF'
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
EOF

########################################
# 4) Function: onPixWebhook
########################################
cat > supabase/functions/onPixWebhook/index.ts <<'EOF'
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
EOF

########################################
# 5) Function: drawTeams
########################################
cat > supabase/functions/drawTeams/index.ts <<'EOF'
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
EOF

echo "✅ Auth + Functions adicionados."
echo "��� Próximos passos:"
echo "1) No front, envolver sua árvore com <AuthProvider> (veja instruções)."
echo "2) Instalar supabase CLI (opcional) e publicar functions se quiser testar online."
