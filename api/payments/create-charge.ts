import type { VercelRequest, VercelResponse } from '@vercel/node';

// BRCode Pix fake para desenvolvimento (substituir por criação real no PSP depois)
const FAKE_BRCODE = '00020126580014BR.GOV.BCB.PIX0136chave-pix-exemplo-aleatoria-123456789520400005303986540610.005802BR5920APP MAESTROS FC6009SAO PAULO62070503***6304ABCD';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { type, amount, period, matchId } = req.body || {};
    if (!type || !amount) return res.status(400).json({ error: 'type e amount são obrigatórios' });

    // Em produção: chamar PSP, criar cobrança dinâmica, receber txid + brcode
    const txid = \txid_\\;
    const chargeId = \charge_\\;

    // Salve no banco (Supabase) a cobrança com status 'pendente' aqui (abstraído)
    return res.status(200).json({
      chargeId,
      txid,
      brcode: FAKE_BRCODE,
      status: 'pendente'
    });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'internal error' });
  }
}
