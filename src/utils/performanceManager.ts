/**
 * Performance Manager
 * Gerenciador principal de performance que integra todas as otimizações
 */

import { sqlOptimizer, executeOptimizedQuery, getSQLPerformanceMetrics } from './sqlOptimizer';
import { apiCache, getCachedData, getCacheStats } from './apiCache';
import { serviceWorkerManager, registerServiceWorker, getServiceWorkerStatus } from './serviceWorker';
import { bundleOptimizer, analyzeBundle, getBundleOptimizationSuggestions } from './bundleOptimizer';
import { cdnManager, loadCriticalCDNResources, getCDNStats } from './cdnManager';

export interface PerformanceConfig {
  sqlOptimization: boolean;
  apiCaching: boolean;
  serviceWorker: boolean;
  bundleOptimization: boolean;
  cdnEnabled: boolean;
  monitoring: boolean;
}

export interface PerformanceMetrics {
  sql: {
    averageQueryTime: number;
    totalQueries: number;
    cacheHitRate: number;
  };
  cache: {
    api: any;
    user: any;
    static: any;
  };
  serviceWorker: {
    registered: boolean;
    status: any;
  };
  bundle: {
    totalSize: number;
    gzippedSize: number;
    chunks: number;
  };
  cdn: {
    totalRequests: number;
    successfulRequests: number;
    averageLoadTime: number;
  };
  overall: {
    score: number;
    recommendations: string[];
  };
}

class PerformanceManager {
  private config: PerformanceConfig;
  private isInitialized = false;

  constructor(config: PerformanceConfig) {
    this.config = config;
  }

  // Inicializar otimizações de performance
  async initialize(): Promise<boolean> {
    try {
      console.log('🚀 Inicializando otimizações de performance...');

      // 1. Inicializar Service Worker
      if (this.config.serviceWorker) {
        const swRegistered = await registerServiceWorker();
        if (swRegistered) {
          console.log('✅ Service Worker registrado');
        } else {
          console.warn('⚠️ Service Worker não pôde ser registrado');
        }
      }

      // 2. Carregar recursos críticos do CDN
      if (this.config.cdnEnabled) {
        try {
          await loadCriticalCDNResources();
          console.log('✅ Recursos críticos carregados do CDN');
        } catch (error) {
          console.warn('⚠️ Falha ao carregar recursos do CDN:', error);
        }
      }

      // 3. Analisar bundle
      if (this.config.bundleOptimization) {
        const bundleAnalysis = analyzeBundle();
        console.log('✅ Análise de bundle concluída');
        console.log(`📊 Tamanho total: ${(bundleAnalysis.totalSize / 1024).toFixed(2)}KB`);
        console.log(`📊 Tamanho gzipped: ${(bundleAnalysis.gzippedSize / 1024).toFixed(2)}KB`);
      }

      // 4. Configurar monitoramento
      if (this.config.monitoring) {
        this.setupPerformanceMonitoring();
        console.log('✅ Monitoramento de performance configurado');
      }

      this.isInitialized = true;
      console.log('🎉 Otimizações de performance inicializadas com sucesso!');
      return true;

    } catch (error) {
      console.error('❌ Erro ao inicializar otimizações de performance:', error);
      return false;
    }
  }

  // Obter métricas de performance
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    const metrics: PerformanceMetrics = {
      sql: {
        averageQueryTime: 0,
        totalQueries: 0,
        cacheHitRate: 0
      },
      cache: {
        api: {},
        user: {},
        static: {}
      },
      serviceWorker: {
        registered: false,
        status: null
      },
      bundle: {
        totalSize: 0,
        gzippedSize: 0,
        chunks: 0
      },
      cdn: {
        totalRequests: 0,
        successfulRequests: 0,
        averageLoadTime: 0
      },
      overall: {
        score: 0,
        recommendations: []
      }
    };

    try {
      // Métricas SQL
      if (this.config.sqlOptimization) {
        const sqlMetrics = getSQLPerformanceMetrics();
        metrics.sql = {
          averageQueryTime: sqlMetrics.averageQueryTime,
          totalQueries: sqlMetrics.totalQueries,
          cacheHitRate: sqlMetrics.cacheHitRate
        };
      }

      // Métricas de Cache
      if (this.config.apiCaching) {
        metrics.cache = getCacheStats();
      }

      // Métricas Service Worker
      if (this.config.serviceWorker) {
        const swStatus = await getServiceWorkerStatus();
        metrics.serviceWorker = {
          registered: swStatus.registered,
          status: swStatus
        };
      }

      // Métricas Bundle
      if (this.config.bundleOptimization) {
        const bundleAnalysis = analyzeBundle();
        metrics.bundle = {
          totalSize: bundleAnalysis.totalSize,
          gzippedSize: bundleAnalysis.gzippedSize,
          chunks: bundleAnalysis.chunks.length
        };
      }

      // Métricas CDN
      if (this.config.cdnEnabled) {
        const cdnStats = getCDNStats();
        metrics.cdn = {
          totalRequests: cdnStats.totalRequests,
          successfulRequests: cdnStats.successfulRequests,
          averageLoadTime: cdnStats.averageLoadTime
        };
      }

      // Calcular score geral
      metrics.overall.score = this.calculateOverallScore(metrics);
      metrics.overall.recommendations = this.generateRecommendations(metrics);

      return metrics;

    } catch (error) {
      console.error('Erro ao obter métricas de performance:', error);
      return metrics;
    }
  }

  // Executar query otimizada
  async executeOptimizedQuery<T>(
    queryKey: string,
    queryFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    if (this.config.sqlOptimization) {
      return executeOptimizedQuery(queryKey, queryFn, ttl);
    }
    return queryFn();
  }

  // Obter dados com cache
  async getCachedData<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    if (this.config.apiCaching) {
      return getCachedData(key, fetchFn, ttl);
    }
    return fetchFn();
  }

  // Configurar monitoramento de performance
  private setupPerformanceMonitoring(): void {
    // Monitorar Core Web Vitals
    if ('web-vital' in window) {
      // Em produção, integrar com biblioteca de Core Web Vitals
      console.log('📊 Monitoramento de Core Web Vitals configurado');
    }

    // Monitorar performance de recursos
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            console.log(`📊 Recurso carregado: ${entry.name} em ${entry.duration}ms`);
          }
        });
      });

      observer.observe({ entryTypes: ['resource'] });
    }

    // Monitorar performance de navegação
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            console.log(`📊 Navegação: ${entry.duration}ms`);
          }
        });
      });

      observer.observe({ entryTypes: ['navigation'] });
    }
  }

  // Calcular score geral de performance
  private calculateOverallScore(metrics: PerformanceMetrics): number {
    let score = 0;
    let factors = 0;

    // Score SQL (25%)
    if (this.config.sqlOptimization) {
      const sqlScore = Math.max(0, 100 - (metrics.sql.averageQueryTime / 10));
      score += sqlScore * 0.25;
      factors += 0.25;
    }

    // Score Cache (25%)
    if (this.config.apiCaching) {
      const cacheScore = metrics.cache.api?.hitRate || 0;
      score += cacheScore * 0.25;
      factors += 0.25;
    }

    // Score Bundle (25%)
    if (this.config.bundleOptimization) {
      const bundleScore = Math.max(0, 100 - (metrics.bundle.totalSize / 10000));
      score += bundleScore * 0.25;
      factors += 0.25;
    }

    // Score CDN (25%)
    if (this.config.cdnEnabled) {
      const cdnScore = metrics.cdn.totalRequests > 0 
        ? (metrics.cdn.successfulRequests / metrics.cdn.totalRequests) * 100 
        : 100;
      score += cdnScore * 0.25;
      factors += 0.25;
    }

    return factors > 0 ? Math.round(score / factors) : 0;
  }

  // Gerar recomendações de otimização
  private generateRecommendations(metrics: PerformanceMetrics): string[] {
    const recommendations: string[] = [];

    // Recomendações SQL
    if (metrics.sql.averageQueryTime > 100) {
      recommendations.push('Otimizar queries SQL - tempo médio muito alto');
    }

    if (metrics.sql.cacheHitRate < 50) {
      recommendations.push('Melhorar cache de queries SQL');
    }

    // Recomendações de Cache
    if (metrics.cache.api?.hitRate < 60) {
      recommendations.push('Otimizar estratégia de cache da API');
    }

    // Recomendações de Bundle
    if (metrics.bundle.totalSize > 1000000) { // 1MB
      recommendations.push('Reduzir tamanho do bundle');
    }

    if (metrics.bundle.chunks > 20) {
      recommendations.push('Consolidar chunks do bundle');
    }

    // Recomendações de CDN
    if (metrics.cdn.averageLoadTime > 1000) {
      recommendations.push('Otimizar CDN - tempo de carregamento alto');
    }

    if (metrics.cdn.successfulRequests < metrics.cdn.totalRequests * 0.9) {
      recommendations.push('Melhorar confiabilidade do CDN');
    }

    return recommendations;
  }

  // Obter status de inicialização
  isInitialized(): boolean {
    return this.isInitialized;
  }

  // Obter configuração
  getConfig(): PerformanceConfig {
    return { ...this.config };
  }

  // Atualizar configuração
  updateConfig(newConfig: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Configuração padrão
export const defaultPerformanceConfig: PerformanceConfig = {
  sqlOptimization: true,
  apiCaching: true,
  serviceWorker: true,
  bundleOptimization: true,
  cdnEnabled: true,
  monitoring: true
};

// Instância global do performance manager
export const performanceManager = new PerformanceManager(defaultPerformanceConfig);

// Funções de conveniência
export async function initializePerformance(): Promise<boolean> {
  return performanceManager.initialize();
}

export async function getPerformanceMetrics(): Promise<PerformanceMetrics> {
  return performanceManager.getPerformanceMetrics();
}

export async function executeOptimizedQuery<T>(
  queryKey: string,
  queryFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  return performanceManager.executeOptimizedQuery(queryKey, queryFn, ttl);
}

export async function getCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  return performanceManager.getCachedData(key, fetchFn, ttl);
}

export function isPerformanceInitialized(): boolean {
  return performanceManager.isInitialized();
}

export function getPerformanceConfig(): PerformanceConfig {
  return performanceManager.getConfig();
}

export function updatePerformanceConfig(config: Partial<PerformanceConfig>): void {
  performanceManager.updateConfig(config);
}



