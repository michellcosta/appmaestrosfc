/**
 * Security Headers Middleware
 * Configura headers de segurança para proteger contra ataques comuns
 */

export interface SecurityHeadersConfig {
  contentSecurityPolicy?: string;
  strictTransportSecurity?: string;
  xFrameOptions?: string;
  xContentTypeOptions?: string;
  xXSSProtection?: string;
  referrerPolicy?: string;
  permissionsPolicy?: string;
}

export const defaultSecurityHeaders: SecurityHeadersConfig = {
  // Content Security Policy - Previne XSS e injection attacks
  contentSecurityPolicy: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://accounts.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co https://*.googleapis.com wss://*.supabase.co",
    "frame-src 'self' https://accounts.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join('; '),

  // HTTP Strict Transport Security - Força HTTPS
  strictTransportSecurity: 'max-age=31536000; includeSubDomains; preload',

  // X-Frame-Options - Previne clickjacking
  xFrameOptions: 'DENY',

  // X-Content-Type-Options - Previne MIME type sniffing
  xContentTypeOptions: 'nosniff',

  // X-XSS-Protection - Ativa proteção XSS do browser
  xXSSProtection: '1; mode=block',

  // Referrer Policy - Controla informações de referrer
  referrerPolicy: 'strict-origin-when-cross-origin',

  // Permissions Policy - Controla APIs do browser
  permissionsPolicy: [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()'
  ].join(', ')
};

export function getSecurityHeaders(config: SecurityHeadersConfig = defaultSecurityHeaders): Record<string, string> {
  const headers: Record<string, string> = {};

  if (config.contentSecurityPolicy) {
    headers['Content-Security-Policy'] = config.contentSecurityPolicy;
  }

  if (config.strictTransportSecurity) {
    headers['Strict-Transport-Security'] = config.strictTransportSecurity;
  }

  if (config.xFrameOptions) {
    headers['X-Frame-Options'] = config.xFrameOptions;
  }

  if (config.xContentTypeOptions) {
    headers['X-Content-Type-Options'] = config.xContentTypeOptions;
  }

  if (config.xXSSProtection) {
    headers['X-XSS-Protection'] = config.xXSSProtection;
  }

  if (config.referrerPolicy) {
    headers['Referrer-Policy'] = config.referrerPolicy;
  }

  if (config.permissionsPolicy) {
    headers['Permissions-Policy'] = config.permissionsPolicy;
  }

  // Headers adicionais de segurança
  headers['X-DNS-Prefetch-Control'] = 'off';
  headers['X-Download-Options'] = 'noopen';
  headers['X-Permitted-Cross-Domain-Policies'] = 'none';

  return headers;
}

// Função para aplicar headers de segurança em responses
export function applySecurityHeaders(response: Response, config?: SecurityHeadersConfig): Response {
  const securityHeaders = getSecurityHeaders(config);
  
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// Função para validar CSP violations
export function validateCSPViolation(violation: any): boolean {
  // Log CSP violations para monitoramento
  console.warn('CSP Violation:', {
    blockedURI: violation.blockedURI,
    violatedDirective: violation.violatedDirective,
    originalPolicy: violation.originalPolicy,
    timestamp: new Date().toISOString()
  });

  // Retorna true se a violação é crítica
  const criticalDirectives = [
    'script-src',
    'object-src',
    'base-uri',
    'form-action'
  ];

  return criticalDirectives.some(directive => 
    violation.violatedDirective.includes(directive)
  );
}



