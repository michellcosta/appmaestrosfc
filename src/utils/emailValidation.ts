/**
 * Email Validation Utilities
 * Validação robusta de email com verificações de segurança
 */

interface EmailValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  normalizedEmail?: string;
}

interface EmailSecurityCheck {
  isDisposable: boolean;
  isSuspicious: boolean;
  hasValidMX: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}

// Lista de domínios de email descartáveis conhecidos
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  '10minutemail.com',
  'tempmail.org',
  'guerrillamail.com',
  'mailinator.com',
  'throwaway.email',
  'temp-mail.org',
  'yopmail.com',
  'maildrop.cc',
  'getnada.com',
  'tempail.com'
]);

// Padrões suspeitos de email
const SUSPICIOUS_PATTERNS = [
  /^.{1,2}@/, // Muito curto antes do @
  /@.{1,2}$/, // Muito curto depois do @
  /[<>]/, // Caracteres perigosos
  /\.{2,}/, // Múltiplos pontos consecutivos
  /_{3,}/, // Múltiplos underscores
  /-{3,}/, // Múltiplos hífens
  /^[0-9]+@/, // Apenas números antes do @
  /@[0-9]+$/, // Apenas números depois do @
];

export class EmailValidator {
  private static readonly EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  private static readonly MAX_EMAIL_LENGTH = 254;
  private static readonly MAX_LOCAL_LENGTH = 64;
  private static readonly MAX_DOMAIN_LENGTH = 253;

  static validate(email: string): EmailValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let normalizedEmail: string | undefined;

    // Verificações básicas
    if (!email || typeof email !== 'string') {
      errors.push('Email é obrigatório');
      return { isValid: false, errors, warnings };
    }

    // Normalizar email
    normalizedEmail = email.trim().toLowerCase();

    // Verificar comprimento
    if (normalizedEmail.length > this.MAX_EMAIL_LENGTH) {
      errors.push(`Email muito longo (máximo ${this.MAX_EMAIL_LENGTH} caracteres)`);
    }

    // Verificar formato básico
    if (!this.EMAIL_REGEX.test(normalizedEmail)) {
      errors.push('Formato de email inválido');
    }

    // Verificar partes do email
    const [localPart, domainPart] = normalizedEmail.split('@');
    
    if (localPart && localPart.length > this.MAX_LOCAL_LENGTH) {
      errors.push(`Parte local muito longa (máximo ${this.MAX_LOCAL_LENGTH} caracteres)`);
    }

    if (domainPart && domainPart.length > this.MAX_DOMAIN_LENGTH) {
      errors.push(`Domínio muito longo (máximo ${this.MAX_DOMAIN_LENGTH} caracteres)`);
    }

    // Verificar padrões suspeitos
    const suspiciousPattern = SUSPICIOUS_PATTERNS.find(pattern => pattern.test(normalizedEmail));
    if (suspiciousPattern) {
      warnings.push('Email com padrão suspeito detectado');
    }

    // Verificar domínio descartável
    if (domainPart && DISPOSABLE_EMAIL_DOMAINS.has(domainPart)) {
      warnings.push('Email descartável detectado');
    }

    // Verificar caracteres especiais perigosos
    if (/[<>"'&]/.test(normalizedEmail)) {
      errors.push('Email contém caracteres perigosos');
    }

    // Verificar sequências suspeitas
    if (/(.)\1{4,}/.test(normalizedEmail)) {
      warnings.push('Email contém sequências repetitivas suspeitas');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      normalizedEmail: errors.length === 0 ? normalizedEmail : undefined
    };
  }

  static async securityCheck(email: string): Promise<EmailSecurityCheck> {
    const domain = email.split('@')[1];
    
    // Verificar se é email descartável
    const isDisposable = DISPOSABLE_EMAIL_DOMAINS.has(domain);
    
    // Verificar padrões suspeitos
    const isSuspicious = SUSPICIOUS_PATTERNS.some(pattern => pattern.test(email));
    
    // Verificar MX record (simulado - em produção, usar DNS lookup)
    const hasValidMX = await this.checkMXRecord(domain);
    
    // Calcular nível de risco
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (isDisposable) riskLevel = 'high';
    else if (isSuspicious || !hasValidMX) riskLevel = 'medium';
    
    return {
      isDisposable,
      isSuspicious,
      hasValidMX,
      riskLevel
    };
  }

  private static async checkMXRecord(domain: string): Promise<boolean> {
    // Em produção, implementar verificação real de MX record
    // Por enquanto, simular verificação
    const validDomains = [
      'gmail.com',
      'yahoo.com',
      'hotmail.com',
      'outlook.com',
      'live.com',
      'icloud.com',
      'protonmail.com'
    ];
    
    return validDomains.includes(domain);
  }

  static sanitize(email: string): string {
    return email
      .trim()
      .toLowerCase()
      .replace(/[<>"'&]/g, '') // Remove caracteres perigosos
      .replace(/\s+/g, '') // Remove espaços
      .slice(0, this.MAX_EMAIL_LENGTH); // Limita comprimento
  }

  static isBusinessEmail(email: string): boolean {
    const businessDomains = [
      'gmail.com',
      'yahoo.com',
      'hotmail.com',
      'outlook.com',
      'live.com',
      'icloud.com'
    ];
    
    const domain = email.split('@')[1];
    return !businessDomains.includes(domain);
  }
}

// Função de conveniência para validação rápida
export function validateEmail(email: string): boolean {
  const result = EmailValidator.validate(email);
  return result.isValid;
}

// Função para validação com segurança
export async function validateEmailWithSecurity(email: string): Promise<{
  isValid: boolean;
  securityCheck: EmailSecurityCheck;
  validation: EmailValidationResult;
}> {
  const validation = EmailValidator.validate(email);
  const securityCheck = await EmailValidator.securityCheck(email);
  
  return {
    isValid: validation.isValid && securityCheck.riskLevel !== 'high',
    securityCheck,
    validation
  };
}



