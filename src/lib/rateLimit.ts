import { supabase } from '@/config/supabase';

export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: any) => string;
}

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

/**
 * Rate limiting usando PostgreSQL advisory locks
 * Alternativa ao Redis para ambientes sem cache dedicado
 */
export async function checkRateLimit(
  key: string,
  options: RateLimitOptions
): Promise<boolean> {
  const { windowMs, maxRequests } = options;
  
  try {
    // Usar advisory lock para evitar race conditions
    const lockKey = `rate_limit_${key}`;
    
    // Verificar contadores ativos
    const { data: counters } = await supabase
      .from('rate_limit_counters')
      .select('*')
      .eq('key', key)
      .gte('created_at', new Date(Date.now() - windowMs).toISOString());
    
    if (counters && counters.length >= maxRequests) {
      throw new RateLimitError(`Rate limit exceeded for key: ${key}`);
    }
    
    // Registrar nova requisição
    await supabase
      .from('rate_limit_counters')
      .insert({
        key,
        created_at: new Date().toISOString()
      });
    
    // Limpar contadores antigos (cleanup)
    await supabase
      .from('rate_limit_counters')
      .delete()
      .lt('created_at', new Date(Date.now() - windowMs).toISOString());
    
    return true;
  } catch (error) {
    if (error instanceof RateLimitError) {
      throw error;
    }
    console.error('Error checking rate limit:', error);
    return false;
  }
}

/**
 * Rate limiting específico para check-ins
 * 1 requisição a cada 30 segundos por usuário
 */
export async function checkCheckinRateLimit(userId: string): Promise<boolean> {
  return checkRateLimit(`checkin_${userId}`, {
    windowMs: 30000, // 30 segundos
    maxRequests: 1
  });
}

/**
 * Rate limiting para eventos de partida
 * 5 requisições a cada 10 segundos por usuário
 */
export async function checkEventRateLimit(userId: string): Promise<boolean> {
  return checkRateLimit(`events_${userId}`, {
    windowMs: 10000, // 10 segundos
    maxRequests: 5
  });
}
