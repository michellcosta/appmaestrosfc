// ===============================
// src/services/payments.ts
// ===============================
export type PixQR = { emv: string; qrUrl?: string; copyPaste?: string };
export type PaymentIntent = {
id: string;
amount: number; // em centavos
description?: string;
qr?: PixQR;
createdAt: string;
};


export type PaymentState =
| { status: "idle" }
| { status: "creating" }
| { status: "qr_ready"; intent: PaymentIntent }
| { status: "waiting_confirmation"; intent: PaymentIntent }
| { status: "confirmed"; intent: PaymentIntent; paidAt: string }
| { status: "failed"; error: string }
| { status: "expired"; intent: PaymentIntent }
| { status: "cancelled" };


export type PaymentEvents =
| { type: "CREATE"; amount: number; description?: string }
| { type: "CANCEL" }
| { type: "EXPIRE" }
| { type: "CONFIRM"; paidAt?: string };


export type TransitionListener = (state: PaymentState) => void;


export class PaymentMachine {
state: PaymentState = { status: "idle" };
private pollTimer: any = null;
private pollFn: ((intentId: string) => Promise<"PENDING" | "CONFIRMED" | "EXPIRED">) | null = null;
private listeners = new Set<TransitionListener>();


constructor(pollFn?: (intentId: string) => Promise<"PENDING" | "CONFIRMED" | "EXPIRED">) {
this.pollFn = pollFn ?? null;
}


on(event: 'transition', cb: TransitionListener) {
if (event !== 'transition') return () => {};
this.listeners.add(cb);
return () => this.listeners.delete(cb);
}
}
