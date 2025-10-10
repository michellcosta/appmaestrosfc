/**
 * User Behavior Tracking System
 * Sistema completo de tracking de comportamento do usuário
 */

export interface BehaviorConfig {
  enabled: boolean;
  trackClicks: boolean;
  trackScrolls: boolean;
  trackKeystrokes: boolean;
  trackMouseMovements: boolean;
  trackPageViews: boolean;
  trackFormInteractions: boolean;
  trackVideoInteractions: boolean;
  trackSearchQueries: boolean;
  trackErrors: boolean;
  sampleRate: number;
  maxEvents: number;
  sessionTimeout: number; // em ms
  endpoints: {
    custom?: string;
    googleAnalytics?: string;
  };
  privacy: {
    anonymizeData: boolean;
    respectDoNotTrack: boolean;
    cookieConsent: boolean;
  };
}

export interface BehaviorEvent {
  id: string;
  type: 'click' | 'scroll' | 'keystroke' | 'mouse' | 'pageview' | 'form' | 'video' | 'search' | 'error';
  timestamp: Date;
  sessionId: string;
  userId?: string;
  page: string;
  element: {
    tagName: string;
    id?: string;
    className?: string;
    text?: string;
    href?: string;
    src?: string;
  };
  position: {
    x: number;
    y: number;
    viewport: {
      width: number;
      height: number;
    };
  };
  data: Record<string, any>;
  context: {
    referrer?: string;
    userAgent: string;
    language: string;
    timezone: string;
    device: {
      type: 'desktop' | 'mobile' | 'tablet';
      os: string;
      browser: string;
    };
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
  behavior: {
    clicks: number;
    scrolls: number;
    keystrokes: number;
    mouseMovements: number;
    formInteractions: number;
    videoInteractions: number;
    searchQueries: number;
    errors: number;
  };
  pages: {
    [key: string]: {
      views: number;
      timeSpent: number;
      events: number;
    };
  };
  funnels: {
    [key: string]: {
      step: number;
      timestamp: Date;
      data: Record<string, any>;
    }[];
  };
}

class UserBehaviorTracker {
  private config: BehaviorConfig;
  private session: UserSession | null = null;
  private events: BehaviorEvent[] = [];
  private isInitialized = false;
  private eventListeners: (() => void)[] = [];

  constructor(config: BehaviorConfig) {
    this.config = config;
    this.initialize();
  }

  private initialize(): void {
    if (!this.config.enabled) return;

    this.initializeSession();
    this.setupEventListeners();
    this.setupSessionManagement();
    
    this.isInitialized = true;
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
      location: this.getLocationInfo(),
      behavior: {
        clicks: 0,
        scrolls: 0,
        keystrokes: 0,
        mouseMovements: 0,
        formInteractions: 0,
        videoInteractions: 0,
        searchQueries: 0,
        errors: 0
      },
      pages: {},
      funnels: {}
    };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getUserId(): string | undefined {
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
    return {
      country: 'Brazil',
      region: 'São Paulo',
      city: 'São Paulo'
    };
  }

  private setupEventListeners(): void {
    // Clicks
    if (this.config.trackClicks) {
      const clickListener = (event: MouseEvent) => {
        this.trackClick(event);
      };
      document.addEventListener('click', clickListener);
      this.eventListeners.push(() => document.removeEventListener('click', clickListener));
    }

    // Scrolls
    if (this.config.trackScrolls) {
      const scrollListener = (event: Event) => {
        this.trackScroll(event);
      };
      document.addEventListener('scroll', scrollListener);
      this.eventListeners.push(() => document.removeEventListener('scroll', scrollListener));
    }

    // Keystrokes
    if (this.config.trackKeystrokes) {
      const keyListener = (event: KeyboardEvent) => {
        this.trackKeystroke(event);
      };
      document.addEventListener('keydown', keyListener);
      this.eventListeners.push(() => document.removeEventListener('keydown', keyListener));
    }

    // Mouse movements
    if (this.config.trackMouseMovements) {
      const mouseListener = (event: MouseEvent) => {
        this.trackMouseMovement(event);
      };
      document.addEventListener('mousemove', mouseListener);
      this.eventListeners.push(() => document.removeEventListener('mousemove', mouseListener));
    }

    // Page views
    if (this.config.trackPageViews) {
      const pageViewListener = () => {
        this.trackPageView();
      };
      window.addEventListener('popstate', pageViewListener);
      this.eventListeners.push(() => window.removeEventListener('popstate', pageViewListener));
    }

    // Form interactions
    if (this.config.trackFormInteractions) {
      const formListener = (event: Event) => {
        this.trackFormInteraction(event);
      };
      document.addEventListener('submit', formListener);
      document.addEventListener('change', formListener);
      this.eventListeners.push(() => {
        document.removeEventListener('submit', formListener);
        document.removeEventListener('change', formListener);
      });
    }

    // Video interactions
    if (this.config.trackVideoInteractions) {
      const videoListener = (event: Event) => {
        this.trackVideoInteraction(event);
      };
      document.addEventListener('play', videoListener);
      document.addEventListener('pause', videoListener);
      document.addEventListener('ended', videoListener);
      this.eventListeners.push(() => {
        document.removeEventListener('play', videoListener);
        document.removeEventListener('pause', videoListener);
        document.removeEventListener('ended', videoListener);
      });
    }

    // Search queries
    if (this.config.trackSearchQueries) {
      const searchListener = (event: Event) => {
        this.trackSearchQuery(event);
      };
      document.addEventListener('submit', searchListener);
      this.eventListeners.push(() => document.removeEventListener('submit', searchListener));
    }

    // Errors
    if (this.config.trackErrors) {
      const errorListener = (event: ErrorEvent) => {
        this.trackError(event);
      };
      window.addEventListener('error', errorListener);
      this.eventListeners.push(() => window.removeEventListener('error', errorListener));
    }
  }

  private setupSessionManagement(): void {
    // Atualizar atividade da sessão
    const updateActivity = () => {
      if (this.session) {
        this.session.lastActivity = new Date();
        this.session.duration = Date.now() - this.session.startTime.getTime();
      }
    };

    // Atualizar a cada 5 segundos
    setInterval(updateActivity, 5000);

    // Atualizar ao interagir
    document.addEventListener('click', updateActivity);
    document.addEventListener('keydown', updateActivity);
    document.addEventListener('scroll', updateActivity);
  }

  private trackClick(event: MouseEvent): void {
    if (!this.session) return;

    const target = event.target as HTMLElement;
    const eventData: BehaviorEvent = {
      id: this.generateEventId(),
      type: 'click',
      timestamp: new Date(),
      sessionId: this.session.id,
      userId: this.session.userId,
      page: window.location.pathname,
      element: {
        tagName: target.tagName,
        id: target.id,
        className: target.className,
        text: target.textContent?.substring(0, 100),
        href: target.getAttribute('href') || undefined
      },
      position: {
        x: event.clientX,
        y: event.clientY,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      },
      data: {
        button: event.button,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey
      },
      context: this.getEventContext()
    };

    this.recordEvent(eventData);
    this.session.behavior.clicks++;
  }

  private trackScroll(event: Event): void {
    if (!this.session) return;

    const eventData: BehaviorEvent = {
      id: this.generateEventId(),
      type: 'scroll',
      timestamp: new Date(),
      sessionId: this.session.id,
      userId: this.session.userId,
      page: window.location.pathname,
      element: {
        tagName: 'document'
      },
      position: {
        x: 0,
        y: window.scrollY,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      },
      data: {
        scrollTop: window.scrollY,
        scrollLeft: window.scrollX,
        documentHeight: document.documentElement.scrollHeight
      },
      context: this.getEventContext()
    };

    this.recordEvent(eventData);
    this.session.behavior.scrolls++;
  }

  private trackKeystroke(event: KeyboardEvent): void {
    if (!this.session) return;

    const target = event.target as HTMLElement;
    const eventData: BehaviorEvent = {
      id: this.generateEventId(),
      type: 'keystroke',
      timestamp: new Date(),
      sessionId: this.session.id,
      userId: this.session.userId,
      page: window.location.pathname,
      element: {
        tagName: target.tagName,
        id: target.id,
        className: target.className
      },
      position: {
        x: 0,
        y: 0,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      },
      data: {
        key: event.key,
        code: event.code,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey
      },
      context: this.getEventContext()
    };

    this.recordEvent(eventData);
    this.session.behavior.keystrokes++;
  }

  private trackMouseMovement(event: MouseEvent): void {
    if (!this.session) return;

    const eventData: BehaviorEvent = {
      id: this.generateEventId(),
      type: 'mouse',
      timestamp: new Date(),
      sessionId: this.session.id,
      userId: this.session.userId,
      page: window.location.pathname,
      element: {
        tagName: 'document'
      },
      position: {
        x: event.clientX,
        y: event.clientY,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      },
      data: {
        movementX: event.movementX,
        movementY: event.movementY
      },
      context: this.getEventContext()
    };

    this.recordEvent(eventData);
    this.session.behavior.mouseMovements++;
  }

  private trackPageView(): void {
    if (!this.session) return;

    const eventData: BehaviorEvent = {
      id: this.generateEventId(),
      type: 'pageview',
      timestamp: new Date(),
      sessionId: this.session.id,
      userId: this.session.userId,
      page: window.location.pathname,
      element: {
        tagName: 'document'
      },
      position: {
        x: 0,
        y: 0,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      },
      data: {
        referrer: document.referrer,
        title: document.title
      },
      context: this.getEventContext()
    };

    this.recordEvent(eventData);
    this.session.pageViews++;
    this.session.behavior.clicks++;
  }

  private trackFormInteraction(event: Event): void {
    if (!this.session) return;

    const target = event.target as HTMLElement;
    const eventData: BehaviorEvent = {
      id: this.generateEventId(),
      type: 'form',
      timestamp: new Date(),
      sessionId: this.session.id,
      userId: this.session.userId,
      page: window.location.pathname,
      element: {
        tagName: target.tagName,
        id: target.id,
        className: target.className
      },
      position: {
        x: 0,
        y: 0,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      },
      data: {
        eventType: event.type,
        formId: target.closest('form')?.id
      },
      context: this.getEventContext()
    };

    this.recordEvent(eventData);
    this.session.behavior.formInteractions++;
  }

  private trackVideoInteraction(event: Event): void {
    if (!this.session) return;

    const target = event.target as HTMLVideoElement;
    const eventData: BehaviorEvent = {
      id: this.generateEventId(),
      type: 'video',
      timestamp: new Date(),
      sessionId: this.session.id,
      userId: this.session.userId,
      page: window.location.pathname,
      element: {
        tagName: target.tagName,
        id: target.id,
        className: target.className,
        src: target.src
      },
      position: {
        x: 0,
        y: 0,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      },
      data: {
        eventType: event.type,
        currentTime: target.currentTime,
        duration: target.duration,
        paused: target.paused
      },
      context: this.getEventContext()
    };

    this.recordEvent(eventData);
    this.session.behavior.videoInteractions++;
  }

  private trackSearchQuery(event: Event): void {
    if (!this.session) return;

    const target = event.target as HTMLFormElement;
    const eventData: BehaviorEvent = {
      id: this.generateEventId(),
      type: 'search',
      timestamp: new Date(),
      sessionId: this.session.id,
      userId: this.session.userId,
      page: window.location.pathname,
      element: {
        tagName: target.tagName,
        id: target.id,
        className: target.className
      },
      position: {
        x: 0,
        y: 0,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      },
      data: {
        query: target.querySelector('input[type="search"]')?.value || '',
        formId: target.id
      },
      context: this.getEventContext()
    };

    this.recordEvent(eventData);
    this.session.behavior.searchQueries++;
  }

  private trackError(event: ErrorEvent): void {
    if (!this.session) return;

    const eventData: BehaviorEvent = {
      id: this.generateEventId(),
      type: 'error',
      timestamp: new Date(),
      sessionId: this.session.id,
      userId: this.session.userId,
      page: window.location.pathname,
      element: {
        tagName: 'document'
      },
      position: {
        x: 0,
        y: 0,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      },
      data: {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      },
      context: this.getEventContext()
    };

    this.recordEvent(eventData);
    this.session.behavior.errors++;
  }

  private recordEvent(event: BehaviorEvent): void {
    this.events.push(event);
    this.session!.events++;

    // Manter apenas os últimos N eventos
    if (this.events.length > this.config.maxEvents) {
      this.events = this.events.slice(-this.config.maxEvents);
    }

    // Atualizar estatísticas da página
    const page = event.page;
    if (!this.session!.pages[page]) {
      this.session!.pages[page] = {
        views: 0,
        timeSpent: 0,
        events: 0
      };
    }
    this.session!.pages[page].events++;
  }

  private getEventContext(): BehaviorEvent['context'] {
    return {
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      device: this.session?.device || this.getDeviceInfo()
    };
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Obter dados da sessão
  getSessionData(): UserSession | null {
    if (!this.session) return null;

    this.session.duration = Date.now() - this.session.startTime.getTime();
    return { ...this.session };
  }

  // Obter eventos
  getEvents(): BehaviorEvent[] {
    return [...this.events];
  }

  // Obter estatísticas
  getStats(): {
    totalEvents: number;
    sessionDuration: number;
    pageViews: number;
    eventsPerMinute: number;
    behavior: UserSession['behavior'];
  } {
    if (!this.session) {
      return {
        totalEvents: 0,
        sessionDuration: 0,
        pageViews: 0,
        eventsPerMinute: 0,
        behavior: {
          clicks: 0,
          scrolls: 0,
          keystrokes: 0,
          mouseMovements: 0,
          formInteractions: 0,
          videoInteractions: 0,
          searchQueries: 0,
          errors: 0
        }
      };
    }

    const duration = Date.now() - this.session.startTime.getTime();
    const eventsPerMinute = (this.session.events / duration) * 60000;

    return {
      totalEvents: this.session.events,
      sessionDuration: duration,
      pageViews: this.session.pageViews,
      eventsPerMinute: eventsPerMinute,
      behavior: { ...this.session.behavior }
    };
  }

  // Limpar dados
  clear(): void {
    this.events = [];
    this.initializeSession();
  }

  // Destruir
  destroy(): void {
    this.eventListeners.forEach(removeListener => removeListener());
    this.eventListeners = [];
    this.clear();
    this.isInitialized = false;
  }
}

// Configuração padrão
export const defaultBehaviorConfig: BehaviorConfig = {
  enabled: true,
  trackClicks: true,
  trackScrolls: true,
  trackKeystrokes: false,
  trackMouseMovements: false,
  trackPageViews: true,
  trackFormInteractions: true,
  trackVideoInteractions: true,
  trackSearchQueries: true,
  trackErrors: true,
  sampleRate: 1.0,
  maxEvents: 1000,
  sessionTimeout: 30 * 60 * 1000, // 30 minutos
  endpoints: {
    custom: process.env.VITE_BEHAVIOR_ENDPOINT,
    googleAnalytics: process.env.VITE_GA_MEASUREMENT_ID
  },
  privacy: {
    anonymizeData: true,
    respectDoNotTrack: true,
    cookieConsent: true
  }
};

// Instância global do behavior tracker
export const behaviorTracker = new UserBehaviorTracker(defaultBehaviorConfig);

// Funções de conveniência
export const getSessionData = () => {
  return behaviorTracker.getSessionData();
};

export const getEvents = () => {
  return behaviorTracker.getEvents();
};

export const getStats = () => {
  return behaviorTracker.getStats();
};



