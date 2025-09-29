import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const signature = req.headers['x-signature'] as string;
    const payload = JSON.stringify(req.body);

    // Verificar assinatura do webhook (se configurado)
    if (process.env.PROVIDER_WEBHOOK_SECRET && process.env.PROVIDER_WEBHOOK_SECRET !== 'trocar-ou-desabilitar') {
      if (!verifyWebhookSignature(payload, signature, process.env.PROVIDER_WEBHOOK_SECRET)) {
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    const { type, data } = req.body;

    if (type !== 'payment') {
      return res.status(200).json({ received: true });
    }

    const { id: mpPaymentId } = data;

    // Buscar pagamento pelo external_reference
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('external_ref', mpPaymentId)
      .single();

    if (paymentError || !payment) {
      console.error('Payment not found:', mpPaymentId);
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Verificar se já foi processado
    if (payment.status === 'paid') {
      return res.status(200).json({ received: true, already_processed: true });
    }

    // Buscar detalhes do pagamento no Mercado Pago
    const mpResponse = await fetch(`${process.env.MP_BASE_URL}/v1/payments/${mpPaymentId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`
      }
    });

    if (!mpResponse.ok) {
      throw new Error('Failed to fetch payment details from Mercado Pago');
    }

    const mpPayment = await mpResponse.json();

    // Verificar se o pagamento foi aprovado
    if (mpPayment.status !== 'approved') {
      await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('id', payment.id);
      
      return res.status(200).json({ received: true, status: 'not_approved' });
    }

    // Atualizar status do pagamento
    await supabase
      .from('payments')
      .update({ 
        status: 'paid',
        raw: mpPayment
      })
      .eq('id', payment.id);

    // Creditar carteira do grupo
    const { error: walletError } = await supabase
      .from('wallet_ledger')
      .insert({
        group_id: payment.group_id,
        delta_cents: payment.amount_cents,
        reason: 'payment',
        ref_id: payment.id
      });

    if (walletError) {
      console.error('Error crediting wallet:', walletError);
    }

    // Atualizar saldo da carteira
    await supabase.rpc('update_wallet_balance', {
      group_id: payment.group_id,
      delta_cents: payment.amount_cents
    });

    res.status(200).json({ received: true, status: 'paid' });

  } catch (error: any) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
