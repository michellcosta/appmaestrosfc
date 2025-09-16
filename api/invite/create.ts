import type { VercelRequest, VercelResponse } from '@vercel/node';

function randomToken(len = 32) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i=0;i<len;i++) out += chars[Math.floor(Math.random()*chars.length)];
  return out;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { email, membership } = req.body || {};
    if (!email || !membership) return res.status(400).json({ error: 'email e membership são obrigatórios' });

    // Em produção: gravar no Supabase (invites) com uso único, expiração, e email do convidado.
    const token = randomToken(40);
    const base = process.env.VERCEL_URL ? \https://\\ : 'http://localhost:5173';
    const url = \\/invite/\\;

    return res.status(200).json({ url, token });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'internal error' });
  }
}
