/**
 * A/B Testing System
 * Sistema completo de A/B testing e experimentação
 */

export interface ABTestConfig {
  enabled: boolean;
  debug: boolean;
  sampleRate: number;
  maxTests: number;
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

export interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'archived';
  startDate: Date;
  endDate?: Date;
  trafficAllocation: number; // 0-100
  variants: ABTestVariant[];
  metrics: ABTestMetric[];
  audience: ABTestAudience;
  results?: ABTestResults;
  createdAt: Date;
  updatedAt: Date;
}

export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  trafficAllocation: number; // 0-100
  configuration: Record<string, any>;
  isControl: boolean;
  isWinner: boolean;
}

export interface ABTestMetric {
  id: string;
  name: string;
  type: 'conversion' | 'revenue' | 'engagement' | 'custom';
  goal: string;
  value: number;
  isPrimary: boolean;
}

export interface ABTestAudience {
  segments: string[];
  countries: string[];
  devices: string[];
  browsers: string[];
  trafficSources: string[];
  customRules: ABTestRule[];
}

export interface ABTestRule {
  id: string;
  name: string;
  condition: string;
  value: any;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'regex';
}

export interface ABTestResults {
  totalUsers: number;
  totalSessions: number;
  totalConversions: number;
  conversionRate: number;
  revenue: number;
  averageOrderValue: number;
  variants: ABTestVariantResults[];
  statisticalSignificance: number;
  confidenceLevel: number;
  winner?: string;
  recommendation: 'continue' | 'stop' | 'extend';
  notes: string;
}

export interface ABTestVariantResults {
  variantId: string;
  users: number;
  sessions: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  averageOrderValue: number;
  improvement: number; // % de melhoria vs controle
  statisticalSignificance: number;
  confidenceLevel: number;
}

export interface ABTestEvent {
  id: string;
  testId: string;
  variantId: string;
  userId: string;
  sessionId: string;
  eventType: 'exposure' | 'conversion' | 'revenue' | 'engagement';
  value?: number;
  properties?: Record<string, any>;
  timestamp: Date;
  page: string;
  referrer?: string;
  userAgent: string;
  device: {
    type: string;
    os: string;
    browser: string;
  };
  location: {
    country: string;
    region: string;
    city: string;
  };
}

class ABTestingManager {
  private config: ABTestConfig;
  private tests: Map<string, ABTest> = new Map();
  private events: ABTestEvent[] = [];
  private userTests: Map<string, string[]> = new Map(); // userId -> testIds
  private isInitialized = false;

  constructor(config: ABTestConfig) {
    this.config = config;
    this.initialize();
  }

  private initialize(): void {
    if (!this.config.enabled) return;

    this.loadTests();
    this.setupEventListeners();
    
    this.isInitialized = true;
  }

  private loadTests(): void {
    // Em produção, carregar testes do servidor
    const defaultTests: ABTest[] = [
      {
        id: 'button-color-test',
        name: 'Button Color Test',
        description: 'Test different button colors to improve conversion',
        status: 'running',
        startDate: new Date(),
        trafficAllocation: 100,
        variants: [
          {
            id: 'control',
            name: 'Control',
            description: 'Original blue button',
            trafficAllocation: 50,
            configuration: { color: 'blue' },
            isControl: true,
            isWinner: false
          },
          {
            id: 'variant-a',
            name: 'Variant A',
            description: 'Green button',
            trafficAllocation: 50,
            configuration: { color: 'green' },
            isControl: false,
            isWinner: false
          }
        ],
        metrics: [
          {
            id: 'conversion',
            name: 'Conversion Rate',
            type: 'conversion',
            goal: 'click',
            value: 0,
            isPrimary: true
          }
        ],
        audience: {
          segments: ['all'],
          countries: ['BR'],
          devices: ['desktop', 'mobile', 'tablet'],
          browsers: ['chrome', 'firefox', 'safari', 'edge'],
          trafficSources: ['organic', 'direct', 'referral'],
          customRules: []
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    defaultTests.forEach(test => {
      this.tests.set(test.id, test);
    });
  }

  private setupEventListeners(): void {
    // Exposição automática em page load
    window.addEventListener('load', () => {
      this.exposeUserToTests();
    });

    // Tracking de conversões
    document.addEventListener('click', (event) => {
      this.trackConversion(event);
    });

    // Tracking de receita
    window.addEventListener('beforeunload', () => {
      this.trackRevenue();
    });
  }

  // Expor usuário a testes
  private exposeUserToTests(): void {
    const userId = this.getUserId();
    const sessionId = this.getSessionId();
    
    if (!userId || !sessionId) return;

    this.tests.forEach(test => {
      if (this.shouldExposeUserToTest(test, userId)) {
        const variant = this.assignVariant(test, userId);
        if (variant) {
          this.recordExposure(test.id, variant.id, userId, sessionId);
          this.applyVariant(test.id, variant);
        }
      }
    });
  }

  private shouldExposeUserToTest(test: ABTest, userId: string): boolean {
    // Verificar se o teste está ativo
    if (test.status !== 'running') return false;

    // Verificar alocação de tráfego
    if (Math.random() * 100 > test.trafficAllocation) return false;

    // Verificar se o usuário já foi exposto
    const userTests = this.userTests.get(userId) || [];
    if (userTests.includes(test.id)) return false;

    // Verificar audiência
    if (!this.matchesAudience(test.audience)) return false;

    return true;
  }

  private assignVariant(test: ABTest, userId: string): ABTestVariant | null {
    const random = Math.random() * 100;
    let cumulative = 0;

    for (const variant of test.variants) {
      cumulative += variant.trafficAllocation;
      if (random <= cumulative) {
        return variant;
      }
    }

    return test.variants[0]; // Fallback para o primeiro
  }

  private matchesAudience(audience: ABTestAudience): boolean {
    // Verificar segmentos
    if (audience.segments.length > 0 && !audience.segments.includes('all')) {
      // Implementar lógica de segmentação
    }

    // Verificar países
    if (audience.countries.length > 0) {
      const userCountry = this.getUserCountry();
      if (!audience.countries.includes(userCountry)) return false;
    }

    // Verificar dispositivos
    if (audience.devices.length > 0) {
      const userDevice = this.getUserDevice();
      if (!audience.devices.includes(userDevice)) return false;
    }

    // Verificar navegadores
    if (audience.browsers.length > 0) {
      const userBrowser = this.getUserBrowser();
      if (!audience.browsers.includes(userBrowser)) return false;
    }

    // Verificar fontes de tráfego
    if (audience.trafficSources.length > 0) {
      const userTrafficSource = this.getUserTrafficSource();
      if (!audience.trafficSources.includes(userTrafficSource)) return false;
    }

    // Verificar regras customizadas
    for (const rule of audience.customRules) {
      if (!this.evaluateRule(rule)) return false;
    }

    return true;
  }

  private evaluateRule(rule: ABTestRule): boolean {
    // Implementar avaliação de regras customizadas
    return true;
  }

  private recordExposure(testId: string, variantId: string, userId: string, sessionId: string): void {
    const event: ABTestEvent = {
      id: this.generateEventId(),
      testId,
      variantId,
      userId,
      sessionId,
      eventType: 'exposure',
      timestamp: new Date(),
      page: window.location.pathname,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      device: this.getDeviceInfo(),
      location: this.getLocationInfo()
    };

    this.events.push(event);
    
    // Adicionar teste ao usuário
    const userTests = this.userTests.get(userId) || [];
    userTests.push(testId);
    this.userTests.set(userId, userTests);

    if (this.config.debug) {
      console.log(`🧪 A/B Test Exposure: ${testId} -> ${variantId}`);
    }
  }

  private applyVariant(testId: string, variant: ABTestVariant): void {
    const test = this.tests.get(testId);
    if (!test) return;

    // Aplicar configuração da variante
    Object.entries(variant.configuration).forEach(([key, value]) => {
      this.applyConfiguration(key, value);
    });

    // Adicionar classes CSS para identificação
    document.body.classList.add(`ab-test-${testId}`);
    document.body.classList.add(`ab-variant-${variant.id}`);
  }

  private applyConfiguration(key: string, value: any): void {
    switch (key) {
      case 'color':
        document.documentElement.style.setProperty('--primary-color', value);
        break;
      case 'fontSize':
        document.documentElement.style.setProperty('--font-size', `${value}px`);
        break;
      case 'layout':
        document.body.classList.add(`layout-${value}`);
        break;
      default:
        // Aplicar configuração customizada
        this.applyCustomConfiguration(key, value);
    }
  }

  private applyCustomConfiguration(key: string, value: any): void {
    // Implementar lógica para configurações customizadas
    console.log(`Applying custom configuration: ${key} = ${value}`);
  }

  private trackConversion(event: Event): void {
    const target = event.target as HTMLElement;
    const testId = this.getTestIdFromElement(target);
    
    if (!testId) return;

    const userId = this.getUserId();
    const sessionId = this.getSessionId();
    
    if (!userId || !sessionId) return;

    const variantId = this.getVariantId(testId, userId);
    if (!variantId) return;

    const conversionEvent: ABTestEvent = {
      id: this.generateEventId(),
      testId,
      variantId,
      userId,
      sessionId,
      eventType: 'conversion',
      timestamp: new Date(),
      page: window.location.pathname,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      device: this.getDeviceInfo(),
      location: this.getLocationInfo()
    };

    this.events.push(conversionEvent);

    if (this.config.debug) {
      console.log(`🧪 A/B Test Conversion: ${testId} -> ${variantId}`);
    }
  }

  private trackRevenue(): void {
    // Implementar tracking de receita
    // Em produção, integrar com sistema de e-commerce
  }

  private getTestIdFromElement(element: HTMLElement): string | null {
    // Verificar se o elemento está em um teste A/B
    const testElement = element.closest('[data-ab-test]');
    if (testElement) {
      return testElement.getAttribute('data-ab-test');
    }

    // Verificar classes CSS
    const testClass = Array.from(element.classList).find(cls => cls.startsWith('ab-test-'));
    if (testClass) {
      return testClass.replace('ab-test-', '');
    }

    return null;
  }

  private getVariantId(testId: string, userId: string): string | null {
    const userTests = this.userTests.get(userId) || [];
    if (!userTests.includes(testId)) return null;

    // Em produção, obter do servidor ou localStorage
    return localStorage.getItem(`ab-test-${testId}`) || null;
  }

  // Obter dados do usuário
  private getUserId(): string | null {
    return localStorage.getItem('user_id') || null;
  }

  private getSessionId(): string | null {
    return localStorage.getItem('session_id') || null;
  }

  private getUserCountry(): string {
    // Em produção, usar serviço de geolocalização
    return 'BR';
  }

  private getUserDevice(): string {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad/i.test(userAgent)) return 'tablet';
    if (/mobile|android|iphone/i.test(userAgent)) return 'mobile';
    return 'desktop';
  }

  private getUserBrowser(): string {
    const userAgent = navigator.userAgent;
    if (/chrome/i.test(userAgent)) return 'chrome';
    if (/firefox/i.test(userAgent)) return 'firefox';
    if (/safari/i.test(userAgent)) return 'safari';
    if (/edge/i.test(userAgent)) return 'edge';
    return 'other';
  }

  private getUserTrafficSource(): string {
    const referrer = document.referrer;
    if (!referrer) return 'direct';
    if (referrer.includes('google')) return 'organic';
    if (referrer.includes('facebook')) return 'social';
    return 'referral';
  }

  private getDeviceInfo(): ABTestEvent['device'] {
    const userAgent = navigator.userAgent;
    
    return {
      type: this.getUserDevice(),
      os: this.getOS(userAgent),
      browser: this.getUserBrowser()
    };
  }

  private getOS(userAgent: string): string {
    if (/windows/i.test(userAgent)) return 'Windows';
    if (/macintosh|mac os x/i.test(userAgent)) return 'macOS';
    if (/linux/i.test(userAgent)) return 'Linux';
    if (/android/i.test(userAgent)) return 'Android';
    if (/iphone|ipad/i.test(userAgent)) return 'iOS';
    return 'Unknown';
  }

  private getLocationInfo(): ABTestEvent['location'] {
    return {
      country: 'Brazil',
      region: 'São Paulo',
      city: 'São Paulo'
    };
  }

  private generateEventId(): string {
    return `ab_event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Obter testes ativos
  getActiveTests(): ABTest[] {
    return Array.from(this.tests.values()).filter(test => test.status === 'running');
  }

  // Obter resultados de um teste
  getTestResults(testId: string): ABTestResults | null {
    const test = this.tests.get(testId);
    if (!test || !test.results) return null;

    return test.results;
  }

  // Obter eventos de um teste
  getTestEvents(testId: string): ABTestEvent[] {
    return this.events.filter(event => event.testId === testId);
  }

  // Obter estatísticas gerais
  getStats(): {
    totalTests: number;
    activeTests: number;
    totalEvents: number;
    totalUsers: number;
  } {
    const totalTests = this.tests.size;
    const activeTests = this.getActiveTests().length;
    const totalEvents = this.events.length;
    const totalUsers = this.userTests.size;

    return {
      totalTests,
      activeTests,
      totalEvents,
      totalUsers
    };
  }

  // Limpar dados
  clear(): void {
    this.events = [];
    this.userTests.clear();
  }

  // Destruir
  destroy(): void {
    this.clear();
    this.isInitialized = false;
  }
}

// Configuração padrão
export const defaultABTestConfig: ABTestConfig = {
  enabled: true,
  debug: process.env.NODE_ENV === 'development',
  sampleRate: 1.0,
  maxTests: 10,
  endpoints: {
    custom: process.env.VITE_AB_TEST_ENDPOINT,
    googleAnalytics: process.env.VITE_GA_MEASUREMENT_ID
  },
  privacy: {
    anonymizeData: true,
    respectDoNotTrack: true,
    cookieConsent: true
  }
};

// Instância global do A/B testing
export const abTesting = new ABTestingManager(defaultABTestConfig);

// Funções de conveniência
export const getActiveTests = () => {
  return abTesting.getActiveTests();
};

export const getTestResults = (testId: string) => {
  return abTesting.getTestResults(testId);
};

export const getTestEvents = (testId: string) => {
  return abTesting.getTestEvents(testId);
};

export const getStats = () => {
  return abTesting.getStats();
};



