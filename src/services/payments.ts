// src/services/payments.ts
import type { DiaristRequest } from '@/types';

// janela de pagamento (ajuste conforme regra do negócio)
export const PAYMENT_WINDOW_MS = 15 * 60 * 1000; // 15 min

export function startPaymentWindow(r: DiaristRequest): DiaristRequest {
  return { ...r, windowStartedAt: Date.now(), status: r.status ?? 'pending' };
}

export function isPaymentWindowActive(r: DiaristRequest): boolean {
  if (!r.windowStartedAt) return false;
  return Date.now() - r.windowStartedAt < PAYMENT_WINDOW_MS;
}

export function canShowPayButton(r: DiaristRequest): boolean {
  return r.status !== 'paid' && !isPaymentWindowActive(r);
}

export function markPaid(r: DiaristRequest): DiaristRequest {
  return { ...r, status: 'paid', updatedAt: new Date().toISOString() };
}

export function markFull(r: DiaristRequest): DiaristRequest {
  return { ...r, status: 'full', updatedAt: new Date().toISOString() };
}

// regra placeholder: conceder crédito se janela expirou e ainda pending
export function creditIfLate(r: DiaristRequest): DiaristRequest {
  if (r.status === 'pending' && r.windowStartedAt && !isPaymentWindowActive(r)) {
    // aplique lógica real aqui se necessário
    return { ...r, updatedAt: new Date().toISOString() };
  }
  return r;
}
