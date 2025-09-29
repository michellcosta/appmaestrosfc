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

    // Buscar partida atual
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', match_id)
      .single();

    if (matchError || !match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    if (match.status !== 'live') {
      return res.status(400).json({ error: 'Match is not live' });
    }

    // Calcular tempo pausado
    const now = new Date();
    const startedAt = new Date(match.started_at);
    const currentPausedMs = match.paused_ms || 0;
    const newPausedMs = currentPausedMs + (now.getTime() - startedAt.getTime());

    // Atualizar partida para 'paused'
    const { error: updateError } = await supabase
      .from('matches')
      .update({
        status: 'paused',
        paused_ms: newPausedMs
      })
      .eq('id', match_id);

    if (updateError) {
      throw updateError;
    }

    // Inserir evento PAUSE
    const { error: eventError } = await supabase
      .from('events')
      .insert({
        id: eventId,
        match_id,
        type: 'PAUSE',
        payload: { paused_at: now.toISOString() },
        created_by: userId
      });

    if (eventError) {
      throw eventError;
    }

    res.status(200).json({ 
      success: true, 
      event_id: eventId,
      paused_ms: newPausedMs 
    });

  } catch (error: any) {
    console.error('Error pausing match:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
