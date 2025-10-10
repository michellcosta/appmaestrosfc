/**
 * Performance Monitoring System
 * Sistema completo de monitoramento de performance
 */

export interface PerformanceConfig {
  enabled: boolean;
  sampleRate: number;
  maxEntries: number;
  thresholds: {
    pageLoad: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    firstInputDelay: number;
    cumulativeLayoutShift: number;
    timeToInteractive: number;
  };
  endpoints: {
    custom?: string;
    googleAnalytics?: string;
  };
}

export interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  
  // Additional metrics
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
  tti: number; // Time to Interactive
  tbt: number; // Total Blocking Time
  si: number; // Speed Index
  
  // Custom metrics
  pageLoadTime: number;
  domContentLoaded: number;
  resourceLoadTime: number;
  jsLoadTime: number;
  cssLoadTime: number;
  imageLoadTime: number;
  
  // Network metrics
  networkLatency: number;
  bandwidth: number;
  connectionType: string;
  
  // User experience
  userInteraction: {
    clicks: number;
    scrolls: number;
    keypresses: number;
    mouseMovements: number;
  };
  
  // Memory usage
  memoryUsage: {
    used: number;
    total: number;
    limit: number;
  };
  
  // Timing
  timestamp: Date;
  url: string;
  userAgent: string;
  viewport: {
    width: number;
    height: number;
  };
}

export interface PerformanceEntry {
  id: string;
  name: string;
  entryType: string;
  startTime: number;
  duration: number;
  timestamp: Date;
  metrics: PerformanceMetrics;
  thresholds: PerformanceConfig['thresholds'];
  status: 'good' | 'needs-improvement' | 'poor';
  recommendations: string[];
}

class PerformanceMonitor {
  private config: PerformanceConfig;
  private entries: PerformanceEntry[] = [];
  private observers: PerformanceObserver[] = [];
  private isInitialized = false;

  constructor(config: PerformanceConfig) {
    this.config = config;
    this.initialize();
  }

  private initialize(): void {
    if (!this.config.enabled) return;

    this.setupCoreWebVitals();
    this.setupCustomMetrics();
    this.setupUserInteractionTracking();
    this.setupMemoryMonitoring();
    
    this.isInitialized = true;
  }

  private setupCoreWebVitals(): void {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('lcp', lastEntry.startTime);
      });
      
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (error) {
        console.warn('LCP observer not supported:', error);
      }
    }

    // First Input Delay (FID)
    if ('PerformanceObserver' in window) {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.recordMetric('fid', entry.processingStart - entry.startTime);
        });
      });
      
      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (error) {
        console.warn('FID observer not supported:', error);
      }
    }

    // Cumulative Layout Shift (CLS)
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.recordMetric('cls', clsValue);
      });
      
      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (error) {
        console.warn('CLS observer not supported:', error);
      }
    }
  }

  private setupCustomMetrics(): void {
    // Navigation timing
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      this.recordMetric('pageLoadTime', navigation.loadEventEnd - navigation.navigationStart);
      this.recordMetric('domContentLoaded', navigation.domContentLoadedEventEnd - navigation.navigationStart);
      this.recordMetric('ttfb', navigation.responseStart - navigation.navigationStart);
    });

    // Resource timing
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (entry.initiatorType === 'script') {
            this.recordMetric('jsLoadTime', entry.duration);
          } else if (entry.initiatorType === 'link') {
            this.recordMetric('cssLoadTime', entry.duration);
          } else if (entry.initiatorType === 'img') {
            this.recordMetric('imageLoadTime', entry.duration);
          }
        });
      });
      
      try {
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch (error) {
        console.warn('Resource observer not supported:', error);
      }
    }
  }

  private setupUserInteractionTracking(): void {
    let interactionCount = 0;
    
    // Clicks
    document.addEventListener('click', () => {
      interactionCount++;
      this.recordMetric('clicks', interactionCount);
    });

    // Scrolls
    let scrollCount = 0;
    document.addEventListener('scroll', () => {
      scrollCount++;
      this.recordMetric('scrolls', scrollCount);
    });

    // Keypresses
    let keypressCount = 0;
    document.addEventListener('keydown', () => {
      keypressCount++;
      this.recordMetric('keypresses', keypressCount);
    });

    // Mouse movements
    let mouseMoveCount = 0;
    document.addEventListener('mousemove', () => {
      mouseMoveCount++;
      this.recordMetric('mouseMovements', mouseMoveCount);
    });
  }

  private setupMemoryMonitoring(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.recordMetric('memoryUsed', memory.usedJSHeapSize);
        this.recordMetric('memoryTotal', memory.totalJSHeapSize);
        this.recordMetric('memoryLimit', memory.jsHeapSizeLimit);
      }, 5000);
    }
  }

  private recordMetric(name: string, value: number): void {
    // Em produção, armazenar métricas e enviar para endpoint
    if (this.config.debug) {
      console.log(`📊 Performance metric: ${name} = ${value}ms`);
    }
  }

  // Obter métricas atuais
  getCurrentMetrics(): PerformanceMetrics {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    
    const fcp = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
    const lcp = this.getLCP();
    const fid = this.getFID();
    const cls = this.getCLS();
    
    return {
      lcp,
      fid,
      cls,
      fcp,
      ttfb: navigation.responseStart - navigation.navigationStart,
      tti: navigation.domInteractive - navigation.navigationStart,
      tbt: 0, // Seria calculado com PerformanceObserver
      si: 0, // Seria calculado com PerformanceObserver
      pageLoadTime: navigation.loadEventEnd - navigation.navigationStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
      resourceLoadTime: 0,
      jsLoadTime: 0,
      cssLoadTime: 0,
      imageLoadTime: 0,
      networkLatency: 0,
      bandwidth: 0,
      connectionType: this.getConnectionType(),
      userInteraction: {
        clicks: 0,
        scrolls: 0,
        keypresses: 0,
        mouseMovements: 0
      },
      memoryUsage: {
        used: 0,
        total: 0,
        limit: 0
      },
      timestamp: new Date(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
  }

  private getLCP(): number {
    const entries = performance.getEntriesByType('largest-contentful-paint');
    return entries.length > 0 ? entries[entries.length - 1].startTime : 0;
  }

  private getFID(): number {
    const entries = performance.getEntriesByType('first-input');
    return entries.length > 0 ? (entries[0] as any).processingStart - entries[0].startTime : 0;
  }

  private getCLS(): number {
    const entries = performance.getEntriesByType('layout-shift');
    return entries.reduce((sum, entry: any) => sum + entry.value, 0);
  }

  private getConnectionType(): string {
    if ('connection' in navigator) {
      return (navigator as any).connection.effectiveType || 'unknown';
    }
    return 'unknown';
  }

  // Avaliar performance
  evaluatePerformance(metrics: PerformanceMetrics): {
    status: 'good' | 'needs-improvement' | 'poor';
    score: number;
    recommendations: string[];
  } {
    let score = 100;
    const recommendations: string[] = [];

    // LCP evaluation
    if (metrics.lcp > this.config.thresholds.largestContentfulPaint) {
      score -= 20;
      recommendations.push('Otimize o Largest Contentful Paint (LCP)');
    }

    // FID evaluation
    if (metrics.fid > this.config.thresholds.firstInputDelay) {
      score -= 20;
      recommendations.push('Reduza o First Input Delay (FID)');
    }

    // CLS evaluation
    if (metrics.cls > this.config.thresholds.cumulativeLayoutShift) {
      score -= 20;
      recommendations.push('Melhore o Cumulative Layout Shift (CLS)');
    }

    // Page load time
    if (metrics.pageLoadTime > this.config.thresholds.pageLoad) {
      score -= 15;
      recommendations.push('Otimize o tempo de carregamento da página');
    }

    // TTI evaluation
    if (metrics.tti > this.config.thresholds.timeToInteractive) {
      score -= 15;
      recommendations.push('Melhore o Time to Interactive (TTI)');
    }

    // Memory usage
    if (metrics.memoryUsage.used > metrics.memoryUsage.limit * 0.8) {
      score -= 10;
      recommendations.push('Otimize o uso de memória');
    }

    let status: 'good' | 'needs-improvement' | 'poor';
    if (score >= 90) {
      status = 'good';
    } else if (score >= 70) {
      status = 'needs-improvement';
    } else {
      status = 'poor';
    }

    return { status, score, recommendations };
  }

  // Obter relatório de performance
  getPerformanceReport(): {
    metrics: PerformanceMetrics;
    evaluation: {
      status: 'good' | 'needs-improvement' | 'poor';
      score: number;
      recommendations: string[];
    };
    entries: PerformanceEntry[];
  } {
    const metrics = this.getCurrentMetrics();
    const evaluation = this.evaluatePerformance(metrics);
    
    return {
      metrics,
      evaluation,
      entries: [...this.entries]
    };
  }

  // Limpar dados
  clear(): void {
    this.entries = [];
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }

  // Destruir
  destroy(): void {
    this.clear();
    this.isInitialized = false;
  }
}

// Configuração padrão
export const defaultPerformanceConfig: PerformanceConfig = {
  enabled: true,
  sampleRate: 1.0,
  maxEntries: 100,
  thresholds: {
    pageLoad: 3000,
    firstContentfulPaint: 1800,
    largestContentfulPaint: 2500,
    firstInputDelay: 100,
    cumulativeLayoutShift: 0.1,
    timeToInteractive: 3800
  },
  endpoints: {
    custom: process.env.VITE_PERFORMANCE_ENDPOINT,
    googleAnalytics: process.env.VITE_GA_MEASUREMENT_ID
  }
};

// Instância global do performance monitor
export const performanceMonitor = new PerformanceMonitor(defaultPerformanceConfig);

// Funções de conveniência
export const getCurrentMetrics = () => {
  return performanceMonitor.getCurrentMetrics();
};

export const getPerformanceReport = () => {
  return performanceMonitor.getPerformanceReport();
};

export const evaluatePerformance = (metrics: PerformanceMetrics) => {
  return performanceMonitor.evaluatePerformance(metrics);
};



