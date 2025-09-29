import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { metersBetween, isAccuracyAcceptable } from '../../src/lib/haversine';
import { checkCheckinRateLimit } from '../../src/lib/rateLimit';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { match_id, lat, lng, accuracy, device_id, pin } = req.body;
    const userId = req.headers['x-user-id'] as string;

    // Rate limiting
    await checkCheckinRateLimit(userId);

    // Buscar dados da partida
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select(`
        *,
        venues (
          lat,
          lng,
          radius_m
        )
      `)
      .eq('id', match_id)
      .single();

    if (matchError || !match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    let isValidCheckin = false;
    let method = '';

    // Verificar PIN (se fornecido)
    if (pin) {
      // Buscar PIN válido (implementar lógica de PIN temporário)
      const { data: validPin } = await supabase
        .from('match_pins')
        .select('*')
        .eq('match_id', match_id)
        .eq('pin', pin)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (validPin) {
        isValidCheckin = true;
        method = 'pin';
      }
    }

    // Verificar geolocalização (se não foi PIN)
    if (!isValidCheckin && lat && lng && accuracy !== undefined) {
      // Verificar precisão
      if (!isAccuracyAcceptable(accuracy)) {
        return res.status(400).json({ 
          error: 'GPS accuracy too low',
          accuracy,
          required: 25
        });
      }

      // Verificar distância do local
      if (match.venue) {
        const distance = metersBetween(lat, lng, match.venue.lat, match.venue.lng);
        const maxDistance = match.venue.radius_m || 30;

        if (distance <= maxDistance) {
          isValidCheckin = true;
          method = 'geo';
        } else {
          return res.status(400).json({ 
            error: 'Too far from venue',
            distance: Math.round(distance),
            max_distance: maxDistance
          });
        }
      }
    }

    if (!isValidCheckin) {
      return res.status(400).json({ 
        error: 'Invalid check-in. Provide valid PIN or be within venue radius' 
      });
    }

    // Registrar check-in
    const { error: checkinError } = await supabase
      .from('checkins')
      .insert({
        match_id,
        user_id: userId,
        lat: method === 'geo' ? lat : null,
        lng: method === 'geo' ? lng : null,
        accuracy: method === 'geo' ? accuracy : null,
        device_id,
        method
      });

    if (checkinError) {
      throw checkinError;
    }

    res.status(200).json({ 
      success: true,
      method,
      checked_in_at: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error processing check-in:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
