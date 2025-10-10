/**
 * Audit Logger
 * Sistema de logs de auditoria para rastrear ações críticas
 */

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId?: string;
  userEmail?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface SecurityEvent {
  type: 'login' | 'logout' | 'permission_change' | 'data_access' | 'data_modification' | 'security_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metadata: Record<string, any>;
}

class AuditLogger {
  private logs: AuditLogEntry[] = [];
  private maxLogs = 10000; // Limite de logs em memória

  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  private cleanupOldLogs(): void {
    if (this.logs.length > this.maxLogs) {
      // Remove os logs mais antigos
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  log(
    action: string,
    resource: string,
    details: Record<string, any>,
    context: {
      userId?: string;
      userEmail?: string;
      ipAddress?: string;
      userAgent?: string;
      success?: boolean;
      errorMessage?: string;
      severity?: 'low' | 'medium' | 'high' | 'critical';
      resourceId?: string;
    } = {}
  ): AuditLogEntry {
    const entry: AuditLogEntry = {
      id: this.generateId(),
      timestamp: this.getCurrentTimestamp(),
      userId: context.userId,
      userEmail: context.userEmail,
      action,
      resource,
      resourceId: context.resourceId,
      details,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      success: context.success ?? true,
      errorMessage: context.errorMessage,
      severity: context.severity ?? 'medium'
    };

    this.logs.push(entry);
    this.cleanupOldLogs();

    // Log para console em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Audit Log:', entry);
    }

    // Em produção, enviar para serviço de logging
    this.sendToLoggingService(entry);

    return entry;
  }

  private async sendToLoggingService(entry: AuditLogEntry): Promise<void> {
    try {
      // Em produção, implementar envio para serviço de logging
      // Exemplo: Sentry, LogRocket, DataDog, etc.
      
      if (entry.severity === 'critical' || entry.severity === 'high') {
        // Enviar alerta imediato para eventos críticos
        console.error('🚨 Critical Security Event:', entry);
      }
    } catch (error) {
      console.error('Failed to send audit log to service:', error);
    }
  }

  // Métodos específicos para diferentes tipos de eventos
  logAuthentication(
    action: 'login' | 'logout' | 'login_failed' | 'password_reset',
    userEmail: string,
    success: boolean,
    context: { ipAddress?: string; userAgent?: string; errorMessage?: string }
  ): AuditLogEntry {
    return this.log(
      `auth_${action}`,
      'user_authentication',
      { userEmail, action },
      {
        userEmail,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        success,
        errorMessage: context.errorMessage,
        severity: success ? 'low' : 'high'
      }
    );
  }

  logDataAccess(
    resource: string,
    resourceId: string,
    userId: string,
    userEmail: string,
    context: { ipAddress?: string; userAgent?: string }
  ): AuditLogEntry {
    return this.log(
      'data_access',
      resource,
      { resourceId, userId, userEmail },
      {
        userId,
        userEmail,
        resourceId,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        success: true,
        severity: 'low'
      }
    );
  }

  logDataModification(
    action: 'create' | 'update' | 'delete',
    resource: string,
    resourceId: string,
    userId: string,
    userEmail: string,
    changes: Record<string, any>,
    context: { ipAddress?: string; userAgent?: string }
  ): AuditLogEntry {
    return this.log(
      `data_${action}`,
      resource,
      { resourceId, userId, userEmail, changes },
      {
        userId,
        userEmail,
        resourceId,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        success: true,
        severity: 'medium'
      }
    );
  }

  logPermissionChange(
    targetUserId: string,
    targetUserEmail: string,
    oldRole: string,
    newRole: string,
    changedBy: string,
    changedByEmail: string,
    context: { ipAddress?: string; userAgent?: string }
  ): AuditLogEntry {
    return this.log(
      'permission_change',
      'user_permissions',
      {
        targetUserId,
        targetUserEmail,
        oldRole,
        newRole,
        changedBy,
        changedByEmail
      },
      {
        userId: changedBy,
        userEmail: changedByEmail,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        success: true,
        severity: 'high'
      }
    );
  }

  logSecurityViolation(
    violation: string,
    details: Record<string, any>,
    context: { ipAddress?: string; userAgent?: string; userId?: string; userEmail?: string }
  ): AuditLogEntry {
    return this.log(
      'security_violation',
      'security',
      { violation, details },
      {
        userId: context.userId,
        userEmail: context.userEmail,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        success: false,
        severity: 'critical'
      }
    );
  }

  // Métodos de consulta
  getLogsByUser(userId: string, limit: number = 100): AuditLogEntry[] {
    return this.logs
      .filter(log => log.userId === userId)
      .slice(-limit)
      .reverse();
  }

  getLogsByAction(action: string, limit: number = 100): AuditLogEntry[] {
    return this.logs
      .filter(log => log.action === action)
      .slice(-limit)
      .reverse();
  }

  getLogsBySeverity(severity: string, limit: number = 100): AuditLogEntry[] {
    return this.logs
      .filter(log => log.severity === severity)
      .slice(-limit)
      .reverse();
  }

  getRecentLogs(limit: number = 100): AuditLogEntry[] {
    return this.logs.slice(-limit).reverse();
  }

  // Método para exportar logs
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = [
        'id', 'timestamp', 'userId', 'userEmail', 'action', 'resource',
        'resourceId', 'success', 'severity', 'ipAddress'
      ];
      
      const csvRows = [
        headers.join(','),
        ...this.logs.map(log => 
          headers.map(header => 
            JSON.stringify(log[header as keyof AuditLogEntry] || '')
          ).join(',')
        )
      ];
      
      return csvRows.join('\n');
    }
    
    return JSON.stringify(this.logs, null, 2);
  }
}

// Instância global do logger
export const auditLogger = new AuditLogger();

// Funções de conveniência
export const logAuth = auditLogger.logAuthentication.bind(auditLogger);
export const logDataAccess = auditLogger.logDataAccess.bind(auditLogger);
export const logDataModification = auditLogger.logDataModification.bind(auditLogger);
export const logPermissionChange = auditLogger.logPermissionChange.bind(auditLogger);
export const logSecurityViolation = auditLogger.logSecurityViolation.bind(auditLogger);



