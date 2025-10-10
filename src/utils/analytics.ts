/**
 * Analytics System
 * Sistema completo de analytics e tracking de eventos
 */

export interface AnalyticsEvent {
  name: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId: string;
  page: string;
  referrer?: string;
  userAgent: string;
  ip?: string;
  location?: {
    country: string;
    region: string;
    city: string;
  };
}

export interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
  trackPageViews: boolean;
  trackUserInteractions: boolean;
  trackPerformance: boolean;
  trackErrors: boolean;
  trackCustomEvents: boolean;
  batchSize: number;
  flushInterval: number; // em ms
  maxRetries: number;
  endpoints: {
    googleAnalytics?: string;
    custom?: string;
    sentry?: string;
  };
  privacy: {
    anonymizeIP: boolean;
    respectDoNotTrack: boolean;
    cookieConsent: boolean;
  };
}

export interface UserSession {
  id: string;
  userId?: string;
  startTime: Date;
  lastActivity: Date;
  pageViews: number;
  events: number;
  duration: number;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  device: {
    type: 'desktop' | 'mobile' | 'tablet';
    os: string;
    browser: string;
    screen: string;
  };
  location: {
    country: string;
    region: string;
    city: string;
  };
}

export interface PerformanceMetrics {
  pageLoadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
  totalBlockingTime: number;
  speedIndex: number;
}

class AnalyticsManager {
  private config: AnalyticsConfig;
  private session: UserSession | null = null;
  private events: AnalyticsEvent[] = [];
  private isFlushing = false;
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(config: AnalyticsConfig) {
    this.config = config;
    this.initializeSession();
    this.startFlushTimer();
  }

  private initializeSession(): void {
    this.session = {
      id: this.generateSessionId(),
      userId: this.getUserId(),
      startTime: new Date(),
      lastActivity: new Date(),
      pageViews: 0,
      events: 0,
      duration: 0,
      referrer: document.referrer,
      utmSource: this.getUTMParameter('utm_source'),
      utmMedium: this.getUTMParameter('utm_medium'),
      utmCampaign: this.getUTMParameter('utm_campaign'),
      device: this.getDeviceInfo(),
      location: this.getLocationInfo()
    };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getUserId(): string | undefined {
    // Em produção, obter do sistema de autenticação
    return localStorage.getItem('user_id') || undefined;
  }

  private getUTMParameter(name: string): string | undefined {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name) || undefined;
  }

  private getDeviceInfo(): UserSession['device'] {
    const userAgent = navigator.userAgent;
    
    return {
      type: this.getDeviceType(userAgent),
      os: this.getOS(userAgent),
      browser: this.getBrowser(userAgent),
      screen: `${screen.width}x${screen.height}`
    };
  }

  private getDeviceType(userAgent: string): 'desktop' | 'mobile' | 'tablet' {
    if (/tablet|ipad/i.test(userAgent)) return 'tablet';
    if (/mobile|android|iphone/i.test(userAgent)) return 'mobile';
    return 'desktop';
  }

  private getOS(userAgent: string): string {
    if (/windows/i.test(userAgent)) return 'Windows';
    if (/macintosh|mac os x/i.test(userAgent)) return 'macOS';
    if (/linux/i.test(userAgent)) return 'Linux';
    if (/android/i.test(userAgent)) return 'Android';
    if (/iphone|ipad/i.test(userAgent)) return 'iOS';
    return 'Unknown';
  }

  private getBrowser(userAgent: string): string {
    if (/chrome/i.test(userAgent)) return 'Chrome';
    if (/firefox/i.test(userAgent)) return 'Firefox';
    if (/safari/i.test(userAgent)) return 'Safari';
    if (/edge/i.test(userAgent)) return 'Edge';
    if (/opera/i.test(userAgent)) return 'Opera';
    return 'Unknown';
  }

  private getLocationInfo(): UserSession['location'] {
    // Em produção, usar serviço de geolocalização
    return {
      country: 'Brazil',
      region: 'São Paulo',
      city: 'São Paulo'
    };
  }

  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  // Tracking de eventos
  track(eventName: string, properties?: Record<string, any>): void {
    if (!this.config.enabled) return;

    const event: AnalyticsEvent = {
      name: eventName,
      category: properties?.category || 'general',
      action: properties?.action || 'click',
      label: properties?.label,
      value: properties?.value,
      properties: properties,
      timestamp: new Date(),
      userId: this.session?.userId,
      sessionId: this.session?.id || '',
      page: window.location.pathname,
      referrer: document.referrer,
      userAgent: navigator.userAgent
    };

    this.events.push(event);
    this.session!.events++;
    this.session!.lastActivity = new Date();

    if (this.config.debug) {
      console.log('📊 Analytics Event:', event);
    }

    // Flush se atingir o batch size
    if (this.events.length >= this.config.batchSize) {
      this.flush();
    }
  }

  // Tracking de page views
  trackPageView(page?: string): void {
    if (!this.config.enabled || !this.config.trackPageViews) return;

    const pageName = page || window.location.pathname;
    
    this.track('page_view', {
      category: 'navigation',
      action: 'view',
      label: pageName,
      page: pageName
    });

    this.session!.pageViews++;
  }

  // Tracking de interações do usuário
  trackUserInteraction(element: string, action: string, properties?: Record<string, any>): void {
    if (!this.config.enabled || !this.config.trackUserInteractions) return;

    this.track('user_interaction', {
      category: 'interaction',
      action: action,
      label: element,
      element: element,
      ...properties
    });
  }

  // Tracking de performance
  trackPerformance(metrics: PerformanceMetrics): void {
    if (!this.config.enabled || !this.config.trackPerformance) return;

    this.track('performance', {
      category: 'performance',
      action: 'measure',
      value: metrics.pageLoadTime,
      metrics: metrics
    });
  }

  // Tracking de erros
  trackError(error: Error, context?: Record<string, any>): void {
    if (!this.config.enabled || !this.config.trackErrors) return;

    this.track('error', {
      category: 'error',
      action: 'occurred',
      label: error.name,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context: context
    });
  }

  // Tracking de eventos customizados
  trackCustomEvent(name: string, properties?: Record<string, any>): void {
    if (!this.config.enabled || !this.config.trackCustomEvents) return;

    this.track(name, properties);
  }

  // Flush de eventos
  async flush(): Promise<void> {
    if (this.isFlushing || this.events.length === 0) return;

    this.isFlushing = true;
    const eventsToFlush = [...this.events];
    this.events = [];

    try {
      // Enviar para Google Analytics
      if (this.config.endpoints.googleAnalytics) {
        await this.sendToGoogleAnalytics(eventsToFlush);
      }

      // Enviar para endpoint customizado
      if (this.config.endpoints.custom) {
        await this.sendToCustomEndpoint(eventsToFlush);
      }

      if (this.config.debug) {
        console.log(`📊 Flushed ${eventsToFlush.length} events`);
      }
    } catch (error) {
      console.error('❌ Error flushing analytics:', error);
      // Re-adicionar eventos em caso de erro
      this.events.unshift(...eventsToFlush);
    } finally {
      this.isFlushing = false;
    }
  }

  private async sendToGoogleAnalytics(events: AnalyticsEvent[]): Promise<void> {
    // Implementar envio para Google Analytics
    // Em produção, usar gtag ou Google Analytics 4
    console.log('📊 Sending to Google Analytics:', events.length);
  }

  private async sendToCustomEndpoint(events: AnalyticsEvent[]): Promise<void> {
    if (!this.config.endpoints.custom) return;

    const response = await fetch(this.config.endpoints.custom, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events,
        session: this.session,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  // Obter métricas de performance
  getPerformanceMetrics(): PerformanceMetrics | null {
    if (!('performance' in window)) return null;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    
    const firstContentfulPaint = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
    const largestContentfulPaint = performance.getEntriesByType('largest-contentful-paint')[0]?.startTime || 0;

    return {
      pageLoadTime: navigation.loadEventEnd - navigation.navigationStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
      firstContentfulPaint,
      largestContentfulPaint,
      firstInputDelay: 0, // Seria calculado com PerformanceObserver
      cumulativeLayoutShift: 0, // Seria calculado com PerformanceObserver
      timeToInteractive: navigation.domInteractive - navigation.navigationStart,
      totalBlockingTime: 0, // Seria calculado com PerformanceObserver
      speedIndex: 0 // Seria calculado com PerformanceObserver
    };
  }

  // Obter dados da sessão
  getSessionData(): UserSession | null {
    if (!this.session) return null;

    this.session.duration = Date.now() - this.session.startTime.getTime();
    return { ...this.session };
  }

  // Obter estatísticas
  getStats(): {
    totalEvents: number;
    sessionDuration: number;
    pageViews: number;
    eventsPerMinute: number;
  } {
    if (!this.session) {
      return {
        totalEvents: 0,
        sessionDuration: 0,
        pageViews: 0,
        eventsPerMinute: 0
      };
    }

    const duration = Date.now() - this.session.startTime.getTime();
    const eventsPerMinute = (this.session.events / duration) * 60000;

    return {
      totalEvents: this.session.events,
      sessionDuration: duration,
      pageViews: this.session.pageViews,
      eventsPerMinute: eventsPerMinute
    };
  }

  // Atualizar configuração
  updateConfig(newConfig: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.flushInterval) {
      this.startFlushTimer();
    }
  }

  // Limpar dados
  clear(): void {
    this.events = [];
    this.initializeSession();
  }

  // Destruir
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}

// Configuração padrão
export const defaultAnalyticsConfig: AnalyticsConfig = {
  enabled: true,
  debug: process.env.NODE_ENV === 'development',
  trackPageViews: true,
  trackUserInteractions: true,
  trackPerformance: true,
  trackErrors: true,
  trackCustomEvents: true,
  batchSize: 10,
  flushInterval: 30000, // 30 segundos
  maxRetries: 3,
  endpoints: {
    googleAnalytics: process.env.VITE_GA_MEASUREMENT_ID,
    custom: process.env.VITE_ANALYTICS_ENDPOINT
  },
  privacy: {
    anonymizeIP: true,
    respectDoNotTrack: true,
    cookieConsent: true
  }
};

// Instância global do analytics
export const analytics = new AnalyticsManager(defaultAnalyticsConfig);

// Funções de conveniência
export const trackEvent = (name: string, properties?: Record<string, any>) => {
  analytics.track(name, properties);
};

export const trackPageView = (page?: string) => {
  analytics.trackPageView(page);
};

export const trackUserInteraction = (element: string, action: string, properties?: Record<string, any>) => {
  analytics.trackUserInteraction(element, action, properties);
};

export const trackPerformance = (metrics: PerformanceMetrics) => {
  analytics.trackPerformance(metrics);
};

export const trackError = (error: Error, context?: Record<string, any>) => {
  analytics.trackError(error, context);
};

export const trackCustomEvent = (name: string, properties?: Record<string, any>) => {
  analytics.trackCustomEvent(name, properties);
};

export const getAnalyticsStats = () => {
  return analytics.getStats();
};

export const getSessionData = () => {
  return analytics.getSessionData();
};



