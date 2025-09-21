import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, userData } = req.body;

    if (!token || !userData) {
      return res.status(400).json({ error: 'Token and user data are required' });
    }

    // Verificar se o convite existe e é válido
    const { data: invite, error: inviteError } = await supabase
      .from('invites')
      .select('*')
      .eq('token', token)
      .eq('status', 'sent')
      .single();

    if (inviteError || !invite) {
      return res.status(404).json({ error: 'Invite not found or invalid' });
    }

    // Verificar se o convite não expirou
    const now = new Date();
    const expiresAt = new Date(invite.expires_at);
    
    if (now > expiresAt) {
      return res.status(400).json({ error: 'Invite has expired' });
    }

    // Criar o usuário
    const { data: user, error: userError } = await supabase.auth.admin.createUser({
      email: invite.email,
      password: Math.random().toString(36).slice(-8), // Senha temporária
      email_confirm: true,
      user_metadata: {
        name: userData.name,
        phone: userData.phone,
        role: invite.membership,
        invite_id: invite.id
      }
    });

    if (userError) {
      return res.status(400).json({ error: 'Failed to create user', details: userError.message });
    }

    // Marcar convite como aceito
    await supabase
      .from('invites')
      .update({ 
        status: 'accepted',
        consumed_at: new Date().toISOString(),
        used_count: (invite.used_count || 0) + 1
      })
      .eq('id', invite.id);

    // Criar perfil do usuário
    await supabase
      .from('profiles')
      .insert({
        id: user.user?.id,
        email: invite.email,
        name: userData.name,
        phone: userData.phone,
        role: invite.membership,
        status: invite.membership === 'mensalista' ? 'active' : 'pending'
      });

    return res.status(200).json({ 
      success: true, 
      message: 'Invite accepted successfully',
      user: {
        id: user.user?.id,
        email: invite.email,
        name: userData.name,
        role: invite.membership
      }
    });

  } catch (error) {
    console.error('Error accepting invite:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}