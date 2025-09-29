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
    const { match_id, team, player_id, color } = req.body;
    const eventId = generateEventId();
    const idempotencyKey = req.headers['x-idempotency-key'] as string;

    // Verificar idempotência
    await checkIdempotency(eventId, { idempotencyKey });

    // Rate limiting
    const userId = req.headers['x-user-id'] as string;
    await checkEventRateLimit(userId);

    // Validar dados
    if (!team || !['home', 'away'].includes(team)) {
      return res.status(400).json({ error: 'Invalid team. Must be home or away' });
    }

    if (!color || !['yellow', 'red'].includes(color)) {
      return res.status(400).json({ error: 'Invalid card color. Must be yellow or red' });
    }

    // Inserir evento CARD
    const { error: eventError } = await supabase
      .from('events')
      .insert({
        id: eventId,
        match_id,
        type: 'CARD',
        payload: {
          team,
          player_id,
          color,
          carded_at: new Date().toISOString()
        },
        created_by: userId
      });

    if (eventError) {
      throw eventError;
    }

    res.status(200).json({ 
      success: true, 
      event_id: eventId 
    });

  } catch (error: any) {
    console.error('Error recording card:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
