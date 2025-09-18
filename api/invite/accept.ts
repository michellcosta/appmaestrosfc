import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../../lib/supabaseServer';

const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { token } = req.body || {};
    if (!token) return res.status(400).json({ error: 'token obrigatório' });

    const authHeader = req.headers.authorization || '';
    const jwt = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!jwt) return res.status(401).json({ error: 'não autenticado' });

    const { data: userData, error: userErr } = await supabasePublic.auth.getUser(jwt);
    if (userErr || !userData?.user) return res.status(401).json({ error: 'token inválido' });
    const userId = userData.user.id;
    const userEmail = (userData.user.email || '').toLowerCase();

    const { data: invite, error: invErr } = await supabaseAdmin
      .from('invites')
      .select('*')
      .eq('token', token)
      .single();

    if (invErr || !invite) return res.status(404).json({ error: 'convite não encontrado' });
    if (invite.status !== 'sent') return res.status(400).json({ error: 'convite já utilizado ou inválido' });
    if (invite.max_uses && invite.used_count >= invite.max_uses) return res.status(400).json({ error: 'convite esgotado' });
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) return res.status(400).json({ error: 'convite expirado' });

    const invitedEmail = String(invite.email || '').toLowerCase();
    if (invitedEmail !== userEmail) {
      return res.status(403).json({ error: 'convite não corresponde ao seu email' });
    }

    const { error: upErr } = await supabaseAdmin
      .from('invites')
      .update({
        status: 'accepted',
        used_count: (invite.used_count || 0) + 1,
        consumed_by: userId,
        consumed_at: new Date().toISOString()
      })
      .eq('id', invite.id);
    if (upErr) return res.status(500).json({ error: 'falha ao consumir convite' });

    const membership = invite.membership as 'mensalista'|'diarista';

    const { error: profErr } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        email: userEmail,
        membership,
        role: 'player',
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (profErr) return res.status(500).json({ error: 'falha ao atualizar perfil' });

    const routes = membership === 'mensalista'
      ? ['Jogos', 'Partida', 'Financeiro', 'Ranking', 'Perfil']
      : ['Jogos', 'Perfil'];

    return res.status(200).json({ ok: true, membership, routes });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'internal error' });
  }
}
