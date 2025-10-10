/**
 * Security Middleware
 * Middleware principal que integra todas as funcionalidades de segurança
 */

import { applyRateLimit, getRateLimitIdentifier } from './rateLimiter';
import { getSecurityHeaders, applySecurityHeaders } from './securityHeaders';
import { EmailValidator, validateEmailWithSecurity } from '../utils/emailValidation';
import { auditLogger, logAuth, logDataAccess, logDataModification, logSecurityViolation } from '../utils/auditLogger';
import { initializeBackupManager, getBackupManager } from '../utils/backupManager';

export interface SecurityContext {
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export interface SecurityResponse {
  success: boolean;
  error?: string;
  headers?: Record<string, string>;
  auditLog?: any;
}

class SecurityMiddleware {
  private backupManager: any = null;

  constructor() {
    // Inicializar backup manager se necessário
    this.initializeBackup();
  }

  private async initializeBackup() {
    try {
      // Em produção, inicializar com configuração real
      // this.backupManager = initializeBackupManager(supabase, backupConfig);
    } catch (error) {
      console.warn('Backup manager não inicializado:', error);
    }
  }

  // Middleware principal de segurança
  async processRequest(
    request: Request,
    context: SecurityContext
  ): Promise<SecurityResponse> {
    const response: SecurityResponse = { success: true };

    try {
      // 1. Rate Limiting
      const rateLimitResult = this.checkRateLimit(request, context);
      if (!rateLimitResult.success) {
        return rateLimitResult;
      }

      // 2. Validação de email se aplicável
      const emailValidation = await this.validateEmailIfNeeded(request, context);
      if (!emailValidation.success) {
        return emailValidation;
      }

      // 3. Headers de segurança
      response.headers = getSecurityHeaders();

      // 4. Log de auditoria
      this.logRequest(request, context);

      return response;

    } catch (error) {
      console.error('Erro no middleware de segurança:', error);
      
      // Log de violação de segurança
      logSecurityViolation(
        'middleware_error',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        context
      );

      return {
        success: false,
        error: 'Erro interno de segurança'
      };
    }
  }

  private checkRateLimit(request: Request, context: SecurityContext): SecurityResponse {
    const identifier = getRateLimitIdentifier(context.userId, context.ipAddress, context.userAgent);
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Determinar tipo de rate limiting baseado na rota
    let rateLimitType: 'auth' | 'api' | 'data' | 'upload' = 'api';
    
    if (pathname.includes('/auth/') || pathname.includes('/login')) {
      rateLimitType = 'auth';
    } else if (pathname.includes('/upload') || pathname.includes('/file')) {
      rateLimitType = 'upload';
    } else if (pathname.includes('/api/') || pathname.includes('/data/')) {
      rateLimitType = 'data';
    }

    const rateLimitResult = applyRateLimit(identifier, rateLimitType);
    
    if (!rateLimitResult.allowed) {
      // Log de tentativa de rate limiting
      logSecurityViolation(
        'rate_limit_exceeded',
        {
          identifier,
          rateLimitType,
          pathname,
          userAgent: context.userAgent,
          ipAddress: context.ipAddress
        },
        context
      );

      return {
        success: false,
        error: 'Muitas requisições. Tente novamente mais tarde.',
        headers: rateLimitResult.headers
      };
    }

    return { success: true, headers: rateLimitResult.headers };
  }

  private async validateEmailIfNeeded(request: Request, context: SecurityContext): Promise<SecurityResponse> {
    // Verificar se a requisição contém dados de email
    if (request.method === 'POST' || request.method === 'PUT') {
      try {
        const body = await request.json();
        
        if (body.email) {
          const emailValidation = await validateEmailWithSecurity(body.email);
          
          if (!emailValidation.isValid) {
            logSecurityViolation(
              'invalid_email',
              {
                email: body.email,
                validationErrors: emailValidation.validation.errors,
                securityWarnings: emailValidation.securityCheck
              },
              context
            );

            return {
              success: false,
              error: 'Email inválido ou suspeito'
            };
          }

          if (emailValidation.securityCheck.riskLevel === 'high') {
            logSecurityViolation(
              'high_risk_email',
              {
                email: body.email,
                securityCheck: emailValidation.securityCheck
              },
              context
            );

            return {
              success: false,
              error: 'Email não permitido por questões de segurança'
            };
          }
        }
      } catch (error) {
        // Se não conseguir fazer parse do JSON, continuar
        console.warn('Erro ao validar email:', error);
      }
    }

    return { success: true };
  }

  private logRequest(request: Request, context: SecurityContext): void {
    const url = new URL(request.url);
    const method = request.method;
    const pathname = url.pathname;

    // Log de acesso a dados
    if (pathname.includes('/api/') || pathname.includes('/data/')) {
      logDataAccess(
        'api_request',
        pathname,
        context.userId || 'anonymous',
        context.userEmail || 'anonymous',
        context
      );
    }

    // Log de autenticação
    if (pathname.includes('/auth/') || pathname.includes('/login')) {
      logAuth(
        'login',
        context.userEmail || 'anonymous',
        true,
        context
      );
    }
  }

  // Métodos específicos para diferentes tipos de operações
  async processAuthentication(
    email: string,
    context: SecurityContext
  ): Promise<SecurityResponse> {
    // Validação robusta de email
    const emailValidation = await validateEmailWithSecurity(email);
    
    if (!emailValidation.isValid) {
      logSecurityViolation(
        'authentication_failed_invalid_email',
        {
          email,
          validationErrors: emailValidation.validation.errors
        },
        context
      );

      return {
        success: false,
        error: 'Email inválido'
      };
    }

    // Log de tentativa de autenticação
    logAuth(
      'login_attempt',
      email,
      true,
      context
    );

    return { success: true };
  }

  async processDataModification(
    action: 'create' | 'update' | 'delete',
    resource: string,
    resourceId: string,
    data: any,
    context: SecurityContext
  ): Promise<SecurityResponse> {
    // Log de modificação de dados
    logDataModification(
      action,
      resource,
      resourceId,
      context.userId || 'anonymous',
      context.userEmail || 'anonymous',
      data,
      context
    );

    return { success: true };
  }

  async processPermissionChange(
    targetUserId: string,
    targetUserEmail: string,
    oldRole: string,
    newRole: string,
    context: SecurityContext
  ): Promise<SecurityResponse> {
    // Log de mudança de permissão
    logPermissionChange(
      targetUserId,
      targetUserEmail,
      oldRole,
      newRole,
      context.userId || 'anonymous',
      context.userEmail || 'anonymous',
      context
    );

    return { success: true };
  }

  // Métodos de monitoramento
  getSecurityStatus(): {
    rateLimiting: boolean;
    emailValidation: boolean;
    auditLogging: boolean;
    backupStatus: any;
  } {
    return {
      rateLimiting: true,
      emailValidation: true,
      auditLogging: true,
      backupStatus: this.backupManager?.getBackupStatus() || null
    };
  }

  getAuditLogs(limit: number = 50): any[] {
    return auditLogger.getRecentLogs(limit);
  }

  getSecurityViolations(limit: number = 20): any[] {
    return auditLogger.getLogsBySeverity('critical', limit);
  }
}

// Instância global do middleware
export const securityMiddleware = new SecurityMiddleware();

// Funções de conveniência
export async function secureRequest(
  request: Request,
  context: SecurityContext
): Promise<SecurityResponse> {
  return securityMiddleware.processRequest(request, context);
}

export async function secureAuthentication(
  email: string,
  context: SecurityContext
): Promise<SecurityResponse> {
  return securityMiddleware.processAuthentication(email, context);
}

export async function secureDataModification(
  action: 'create' | 'update' | 'delete',
  resource: string,
  resourceId: string,
  data: any,
  context: SecurityContext
): Promise<SecurityResponse> {
  return securityMiddleware.processDataModification(action, resource, resourceId, data, context);
}



