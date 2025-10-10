

export interface IdempotencyOptions {
  eventId?: string;
  idempotencyKey?: string;
  ttlMinutes?: number;
}

export class IdempotencyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IdempotencyError';
  }
}

export async function checkIdempotency(
  key: string,
  options: IdempotencyOptions = {}
): Promise<boolean> {
  try {
    const { eventId, idempotencyKey, ttlMinutes = 60 } = options;

    // Verificar se já existe um evento com este ID
    if (eventId) {
      const { data: existingEvent } = await supabase
        .from('events')
        .select('id')
        .eq('id', eventId)
        .single();

      if (existingEvent) {
        throw new IdempotencyError(`Event ${eventId} already exists`);
      }
    }

    // Verificar idempotency key no header
    if (idempotencyKey) {
      const { data: existingPayment } = await supabase
        .from('payments')
        .select('id')
        .eq('external_ref', idempotencyKey)
        .single();

      if (existingPayment) {
        throw new IdempotencyError(`Payment ${idempotencyKey} already exists`);
      }
    }

    return true;
  } catch (error) {
    if (error instanceof IdempotencyError) {
      throw error;
    }
    console.error('Error checking idempotency:', error);
    return false;
  }
}

export function generateEventId(): string {
  return crypto.randomUUID();
}

export function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}
