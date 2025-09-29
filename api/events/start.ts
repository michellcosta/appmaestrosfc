import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { checkIdempotency, generateEventId } from '../../src/lib/idempotency';
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
    const { match_id } = req.body;
    const eventId = generateEventId();
    const idempotencyKey = req.headers['x-idempotency-key'] as string;

    // Verificar idempotência
    await checkIdempotency(eventId, { idempotencyKey });

    // Rate limiting
    const userId = req.headers['x-user-id'] as string;
    await checkEventRateLimit(userId);

    // Verificar se a partida existe e está no estado correto
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', match_id)
      .single();

    if (matchError || !match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    if (match.status !== 'scheduled') {
      return res.status(400).json({ error: 'Match is not in scheduled status' });
    }

    // Atualizar partida para 'live' com started_at
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('matches')
      .update({
        status: 'live',
        started_at: now,
        paused_ms: 0
      })
      .eq('id', match_id);

    if (updateError) {
      throw updateError;
    }

    // Inserir evento START
    const { error: eventError } = await supabase
      .from('events')
      .insert({
        id: eventId,
        match_id,
        type: 'START',
        payload: { started_at: now },
        created_by: userId
      });

    if (eventError) {
      throw eventError;
    }

    res.status(200).json({ 
      success: true, 
      event_id: eventId,
      started_at: now 
    });

  } catch (error: any) {
    console.error('Error starting match:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
