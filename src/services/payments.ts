import type { DiaristRequest } from '@/types';

export const PAYMENT_WINDOW_MS = 30 * 60 * 1000; // 30:00

export function canShowPayButton(req: DiaristRequest): boolean {
  return req.state === 'approved';
}

export function startPaymentWindow(req: DiaristRequest, now = Date.now()): DiaristRequest {
  if (req.state !== 'approved') return req;
  return { ...req, state: 'paying', paymentStartedAt: now };
}

export function isPaymentWindowActive(req: DiaristRequest, now = Date.now()): boolean {
  if (req.state !== 'paying' || !req.paymentStartedAt) return false;
  return now - req.paymentStartedAt < PAYMENT_WINDOW_MS;
}

export function markPaid(req: DiaristRequest, now = Date.now()): DiaristRequest {
  if (req.state !== 'paying') return req;
  return { ...req, state: 'paid', paidAt: now };
}

export function markFull(req: DiaristRequest): DiaristRequest {
  // used when match becomes full BEFORE user clicks "Gerar Pix — Copiar"
  if (req.state === 'approved') return { ...req, state: 'full' };
  return req;
}

export function creditIfLate(req: DiaristRequest, now = Date.now()): DiaristRequest {
  // called after provider webhook confirms payment
  // if window expired OR match got full in the meantime, convert to credit
  const expired = req.paymentStartedAt ? (now - req.paymentStartedAt >= PAYMENT_WINDOW_MS) : false;
  if (req.state === 'paying' && (expired || req.state === 'full')) {
    return { ...req, state: 'credited', creditedAt: now };
  }
  return req;
}
