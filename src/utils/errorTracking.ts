/**
 * Error Tracking System
 * Sistema completo de tracking de erros com Sentry
 */

export interface ErrorTrackingConfig {
  enabled: boolean;
  dsn: string;
  environment: string;
  release?: string;
  debug: boolean;
  sampleRate: number;
  maxBreadcrumbs: number;
  beforeSend?: (event: any) => any;
  beforeBreadcrumb?: (breadcrumb: any) => any;
  integrations: string[];
  tags: Record<string, string>;
  user: {
    id?: string;
    email?: string;
    username?: string;
  };
  context: Record<string, any>;
}

export interface ErrorEvent {
  id: string;
  timestamp: Date;
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
  message: string;
  exception?: {
    type: string;
    value: string;
    stacktrace: string;
  };
  breadcrumbs: Breadcrumb[];
  user: {
    id?: string;
    email?: string;
    username?: string;
  };
  tags: Record<string, string>;
  extra: Record<string, any>;
  fingerprint: string[];
  environment: string;
  release?: string;
  platform: string;
  sdk: {
    name: string;
    version: string;
  };
}

export interface Breadcrumb {
  timestamp: Date;
  type: 'navigation' | 'http' | 'user' | 'debug' | 'info' | 'error';
  category: string;
  message: string;
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
  data?: Record<string, any>;
}

class ErrorTracker {
  private config: ErrorTrackingConfig;
  private breadcrumbs: Breadcrumb[] = [];
  private isInitialized = false;

  constructor(config: ErrorTrackingConfig) {
    this.config = config;
    this.initialize();
  }

  private initialize(): void {
    if (!this.config.enabled) return;

    // Configurar Sentry
    this.setupSentry();
    
    // Configurar handlers globais
    this.setupGlobalHandlers();
    
    // Configurar breadcrumbs
    this.setupBreadcrumbs();
    
    this.isInitialized = true;
  }

  private setupSentry(): void {
    // Em produção, usar Sentry SDK real
    if (this.config.debug) {
      console.log('🔍 Error Tracking initialized');
    }
  }

  private setupGlobalHandlers(): void {
    // Handler para erros não capturados
    window.addEventListener('error', (event) => {
      this.captureError(event.error, {
        type: 'unhandled_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Handler para promises rejeitadas
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(event.reason, {
        type: 'unhandled_promise_rejection'
      });
    });
  }

  private setupBreadcrumbs(): void {
    // Breadcrumbs de navegação
    window.addEventListener('popstate', () => {
      this.addBreadcrumb({
        type: 'navigation',
        category: 'navigation',
        message: 'Navigation',
        level: 'info',
        data: {
          from: document.referrer,
          to: window.location.href
        }
      });
    });

    // Breadcrumbs de cliques
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      this.addBreadcrumb({
        type: 'user',
        category: 'ui.click',
        message: 'User clicked',
        level: 'info',
        data: {
          element: target.tagName,
          id: target.id,
          className: target.className,
          text: target.textContent?.substring(0, 100)
        }
      });
    });

    // Breadcrumbs de requisições HTTP
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = args[0] as string;
      const options = args[1] as RequestInit;
      
      this.addBreadcrumb({
        type: 'http',
        category: 'http',
        message: `HTTP ${options?.method || 'GET'} ${url}`,
        level: 'info',
        data: {
          url,
          method: options?.method || 'GET',
          status_code: 0 // Será atualizado na resposta
        }
      });

      try {
        const response = await originalFetch(...args);
        
        this.addBreadcrumb({
          type: 'http',
          category: 'http',
          message: `HTTP ${response.status} ${url}`,
          level: response.ok ? 'info' : 'error',
          data: {
            url,
            method: options?.method || 'GET',
            status_code: response.status
          }
        });

        return response;
      } catch (error) {
        this.addBreadcrumb({
          type: 'http',
          category: 'http',
          message: `HTTP Error ${url}`,
          level: 'error',
          data: {
            url,
            method: options?.method || 'GET',
            error: error.message
          }
        });
        throw error;
      }
    };
  }

  // Capturar erro
  captureError(error: Error, context?: Record<string, any>): void {
    if (!this.config.enabled) return;

    const errorEvent: ErrorEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      level: 'error',
      message: error.message,
      exception: {
        type: error.name,
        value: error.message,
        stacktrace: error.stack || ''
      },
      breadcrumbs: [...this.breadcrumbs],
      user: this.config.user,
      tags: this.config.tags,
      extra: {
        ...this.config.context,
        ...context
      },
      fingerprint: this.generateFingerprint(error),
      environment: this.config.environment,
      release: this.config.release,
      platform: 'javascript',
      sdk: {
        name: 'nexus-play-error-tracker',
        version: '1.0.0'
      }
    };

    // Aplicar beforeSend se configurado
    const processedEvent = this.config.beforeSend ? this.config.beforeSend(errorEvent) : errorEvent;
    
    if (processedEvent) {
      this.sendError(processedEvent);
    }

    if (this.config.debug) {
      console.error('🚨 Error captured:', errorEvent);
    }
  }

  // Capturar mensagem
  captureMessage(message: string, level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info', context?: Record<string, any>): void {
    if (!this.config.enabled) return;

    const errorEvent: ErrorEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      level,
      message,
      breadcrumbs: [...this.breadcrumbs],
      user: this.config.user,
      tags: this.config.tags,
      extra: {
        ...this.config.context,
        ...context
      },
      fingerprint: this.generateFingerprint(new Error(message)),
      environment: this.config.environment,
      release: this.config.release,
      platform: 'javascript',
      sdk: {
        name: 'nexus-play-error-tracker',
        version: '1.0.0'
      }
    };

    this.sendError(errorEvent);
  }

  // Adicionar breadcrumb
  addBreadcrumb(breadcrumb: Omit<Breadcrumb, 'timestamp'>): void {
    if (!this.config.enabled) return;

    const fullBreadcrumb: Breadcrumb = {
      ...breadcrumb,
      timestamp: new Date()
    };

    this.breadcrumbs.push(fullBreadcrumb);

    // Manter apenas os últimos N breadcrumbs
    if (this.breadcrumbs.length > this.config.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.config.maxBreadcrumbs);
    }

    // Aplicar beforeBreadcrumb se configurado
    if (this.config.beforeBreadcrumb) {
      const processedBreadcrumb = this.config.beforeBreadcrumb(fullBreadcrumb);
      if (!processedBreadcrumb) {
        this.breadcrumbs.pop();
      }
    }
  }

  // Definir usuário
  setUser(user: { id?: string; email?: string; username?: string }): void {
    this.config.user = user;
  }

  // Definir tags
  setTags(tags: Record<string, string>): void {
    this.config.tags = { ...this.config.tags, ...tags };
  }

  // Definir contexto
  setContext(key: string, context: any): void {
    this.config.context[key] = context;
  }

  // Obter breadcrumbs
  getBreadcrumbs(): Breadcrumb[] {
    return [...this.breadcrumbs];
  }

  // Limpar breadcrumbs
  clearBreadcrumbs(): void {
    this.breadcrumbs = [];
  }

  // Enviar erro para Sentry
  private async sendError(errorEvent: ErrorEvent): Promise<void> {
    try {
      // Em produção, enviar para Sentry
      if (this.config.debug) {
        console.log('📤 Sending error to Sentry:', errorEvent);
      }
    } catch (error) {
      console.error('❌ Error sending to Sentry:', error);
    }
  }

  private generateId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateFingerprint(error: Error): string[] {
    return [
      error.name,
      error.message,
      window.location.pathname
    ];
  }
}

// Configuração padrão
export const defaultErrorTrackingConfig: ErrorTrackingConfig = {
  enabled: true,
  dsn: process.env.VITE_SENTRY_DSN || '',
  environment: process.env.NODE_ENV || 'development',
  release: process.env.VITE_APP_VERSION,
  debug: process.env.NODE_ENV === 'development',
  sampleRate: 1.0,
  maxBreadcrumbs: 100,
  integrations: ['breadcrumbs', 'http', 'console'],
  tags: {
    component: 'nexus-play'
  },
  user: {},
  context: {}
};

// Instância global do error tracker
export const errorTracker = new ErrorTracker(defaultErrorTrackingConfig);

// Funções de conveniência
export const captureError = (error: Error, context?: Record<string, any>) => {
  errorTracker.captureError(error, context);
};

export const captureMessage = (message: string, level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug', context?: Record<string, any>) => {
  errorTracker.captureMessage(message, level, context);
};

export const addBreadcrumb = (breadcrumb: Omit<Breadcrumb, 'timestamp'>) => {
  errorTracker.addBreadcrumb(breadcrumb);
};

export const setUser = (user: { id?: string; email?: string; username?: string }) => {
  errorTracker.setUser(user);
};

export const setTags = (tags: Record<string, string>) => {
  errorTracker.setTags(tags);
};

export const setContext = (key: string, context: any) => {
  errorTracker.setContext(key, context);
};



