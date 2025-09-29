import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { checkEventRateLimit } from '../../src/lib/rateLimit';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { event_id, is_valid } = req.body;
    const userId = req.headers['x-user-id'] as string;

    // Rate limiting
    await checkEventRateLimit(userId);

    // Validar dados
    if (!event_id) {
      return res.status(400).json({ error: 'event_id is required' });
    }

    if (typeof is_valid !== 'boolean') {
      return res.status(400).json({ error: 'is_valid must be a boolean' });
    }

    // Atualizar validade do evento
    const { error: updateError } = await supabase
      .from('events')
      .update({ is_valid: is_valid })
      .eq('id', event_id);

    if (updateError) {
      throw updateError;
    }

    // Refresh da view materializada (se necessário)
    if (!is_valid) {
      await supabase.rpc('refresh_match_score');
    }

    res.status(200).json({ 
      success: true,
      event_id,
      is_valid
    });

  } catch (error: any) {
    console.error('Error invalidating event:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
