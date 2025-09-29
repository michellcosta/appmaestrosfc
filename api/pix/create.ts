import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { generateIdempotencyKey } from '../../src/lib/idempotency';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount_brl, description, group_id, user_id, match_id } = req.body;
    const externalRef = generateIdempotencyKey();

    // Validar dados
    if (!amount_brl || amount_brl <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!group_id || !user_id) {
      return res.status(400).json({ error: 'group_id and user_id are required' });
    }

    // Criar registro de pagamento
    const amountCents = Math.round(amount_brl * 100);
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        group_id,
        user_id,
        match_id,
        provider: 'mercadopago',
        external_ref: externalRef,
        status: 'pending',
        amount_cents: amountCents,
        raw: { description }
      })
      .select()
      .single();

    if (paymentError) {
      throw paymentError;
    }

    // Chamar Mercado Pago (server-side)
    const mpResponse = await fetch(`${process.env.MP_BASE_URL}/v1/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': externalRef
      },
      body: JSON.stringify({
        transaction_amount: amount_brl,
        description,
        payment_method_id: 'pix',
        notification_url: `${process.env.APP_PUBLIC_BASE_URL}/api/pix/webhook`,
        external_reference: externalRef,
        payer: {
          email: user_id // Usar user_id como identificador
        }
      })
    });

    if (!mpResponse.ok) {
      throw new Error('Failed to create Mercado Pago payment');
    }

    const mpData = await mpResponse.json();

    // Atualizar pagamento com dados do MP
    await supabase
      .from('payments')
      .update({
        raw: mpData
      })
      .eq('id', payment.id);

    res.status(200).json({
      success: true,
      external_ref: externalRef,
      qr_code: mpData.point_of_interaction?.transaction_data?.qr_code,
      qr_code_base64: mpData.point_of_interaction?.transaction_data?.qr_code_base64
    });

  } catch (error: any) {
    console.error('Error creating PIX payment:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
