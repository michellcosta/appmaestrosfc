/**
 * Rate Limiter Middleware
 * Implementa rate limiting para proteger APIs contra abuso
 */

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message: string;
  skipSuccessfulRequests?: boolean;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    this.cleanup();
  }

  private cleanup() {
    // Limpa entradas expiradas a cada 5 minutos
    setInterval(() => {
      const now = Date.now();
      Object.keys(this.store).forEach(key => {
        if (this.store[key].resetTime < now) {
          delete this.store[key];
        }
      });
    }, 5 * 60 * 1000);
  }

  private getKey(identifier: string): string {
    return `rate_limit:${identifier}`;
  }

  private getCurrentWindow(): number {
    return Math.floor(Date.now() / this.config.windowMs);
  }

  isAllowed(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const key = this.getKey(identifier);
    const now = Date.now();
    const currentWindow = this.getCurrentWindow();
    const resetTime = (currentWindow + 1) * this.config.windowMs;

    if (!this.store[key] || this.store[key].resetTime < now) {
      // Nova janela de tempo
      this.store[key] = {
        count: 1,
        resetTime: resetTime
      };
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime
      };
    }

    if (this.store[key].count >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: this.store[key].resetTime
      };
    }

    this.store[key].count++;
    return {
      allowed: true,
      remaining: this.config.maxRequests - this.store[key].count,
      resetTime: this.store[key].resetTime
    };
  }
}

// Configurações de rate limiting por tipo de operação
export const rateLimiters = {
  // Rate limiting para autenticação (mais restritivo)
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 5, // 5 tentativas por 15 minutos
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
  }),

  // Rate limiting para operações de API (moderado)
  api: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 100, // 100 requests por 15 minutos
    message: 'Muitas requisições. Tente novamente em 15 minutos.'
  }),

  // Rate limiting para operações de dados (mais permissivo)
  data: new RateLimiter({
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 30, // 30 requests por minuto
    message: 'Muitas operações de dados. Tente novamente em 1 minuto.'
  }),

  // Rate limiting para uploads (muito restritivo)
  upload: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hora
    maxRequests: 10, // 10 uploads por hora
    message: 'Limite de uploads atingido. Tente novamente em 1 hora.'
  })
};

// Função para aplicar rate limiting
export function applyRateLimit(
  identifier: string,
  type: keyof typeof rateLimiters
): { allowed: boolean; error?: string; headers?: Record<string, string> } {
  const limiter = rateLimiters[type];
  const result = limiter.isAllowed(identifier);

  if (!result.allowed) {
    return {
      allowed: false,
      error: 'Rate limit exceeded',
      headers: {
        'X-RateLimit-Limit': limiter['config'].maxRequests.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': result.resetTime.toString(),
        'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
      }
    };
  }

  return {
    allowed: true,
    headers: {
      'X-RateLimit-Limit': limiter['config'].maxRequests.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': result.resetTime.toString()
    }
  };
}

// Função para obter identificador do usuário
export function getRateLimitIdentifier(
  userId?: string,
  ip?: string,
  userAgent?: string
): string {
  // Prioriza userId se disponível, senão usa IP + UserAgent
  if (userId) {
    return `user:${userId}`;
  }
  
  if (ip && userAgent) {
    return `ip:${ip}:${userAgent.slice(0, 50)}`;
  }
  
  if (ip) {
    return `ip:${ip}`;
  }
  
  return 'anonymous';
}



