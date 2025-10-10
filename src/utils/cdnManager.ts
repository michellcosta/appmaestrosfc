/**
 * CDN Manager
 * Gerenciamento de CDN para assets estáticos
 */

export interface CDNConfig {
  enabled: boolean;
  baseUrl: string;
  fallbackUrl: string;
  timeout: number;
  retryAttempts: number;
  cacheStrategy: 'cacheFirst' | 'networkFirst' | 'staleWhileRevalidate';
}

export interface CDNResource {
  url: string;
  type: 'image' | 'font' | 'script' | 'style' | 'other';
  size: number;
  cached: boolean;
  loadTime: number;
  error?: string;
}

export interface CDNStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  cacheHits: number;
  averageLoadTime: number;
  totalBandwidth: number;
}

class CDNManager {
  private config: CDNConfig;
  private stats: CDNStats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    cacheHits: 0,
    averageLoadTime: 0,
    totalBandwidth: 0
  };
  private resources: Map<string, CDNResource> = new Map();

  constructor(config: CDNConfig) {
    this.config = config;
  }

  // Carregar recurso do CDN
  async loadResource(
    path: string,
    type: CDNResource['type'] = 'other'
  ): Promise<CDNResource> {
    const startTime = performance.now();
    const url = this.buildCDNUrl(path);
    
    try {
      // Verificar cache primeiro
      const cached = this.getCachedResource(url);
      if (cached) {
        this.stats.cacheHits++;
        return cached;
      }

      // Carregar do CDN
      const response = await this.fetchWithRetry(url);
      const loadTime = performance.now() - startTime;
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const resource: CDNResource = {
        url,
        type,
        size: blob.size,
        cached: false,
        loadTime
      };

      // Armazenar no cache
      this.cacheResource(url, resource);
      
      // Atualizar estatísticas
      this.updateStats(resource);
      
      return resource;

    } catch (error) {
      // Fallback para URL local
      console.warn(`CDN falhou para ${path}, usando fallback:`, error);
      return this.loadFallbackResource(path, type);
    }
  }

  // Carregar múltiplos recursos
  async loadResources(
    paths: string[],
    type: CDNResource['type'] = 'other'
  ): Promise<CDNResource[]> {
    const promises = paths.map(path => this.loadResource(path, type));
    return Promise.all(promises);
  }

  // Carregar recursos críticos
  async loadCriticalResources(): Promise<CDNResource[]> {
    const criticalPaths = [
      '/icons/icon-192.png',
      '/icons/icon-512.png',
      '/manifest.json',
      '/sw.js'
    ];

    return this.loadResources(criticalPaths, 'other');
  }

  // Carregar recursos de fontes
  async loadFonts(): Promise<CDNResource[]> {
    const fontPaths = [
      '/fonts/inter-regular.woff2',
      '/fonts/inter-bold.woff2',
      '/fonts/inter-medium.woff2'
    ];

    return this.loadResources(fontPaths, 'font');
  }

  // Carregar recursos de imagens
  async loadImages(imagePaths: string[]): Promise<CDNResource[]> {
    return this.loadResources(imagePaths, 'image');
  }

  // Verificar se CDN está disponível
  async isCDNAvailable(): Promise<boolean> {
    try {
      const testUrl = this.buildCDNUrl('/test-connection');
      const response = await fetch(testUrl, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(this.config.timeout)
      });
      return response.ok;
    } catch (error) {
      console.warn('CDN não disponível:', error);
      return false;
    }
  }

  // Obter estatísticas
  getStats(): CDNStats {
    return { ...this.stats };
  }

  // Obter recursos carregados
  getLoadedResources(): CDNResource[] {
    return Array.from(this.resources.values());
  }

  // Limpar cache
  clearCache(): void {
    this.resources.clear();
    console.log('🧹 Cache do CDN limpo');
  }

  // Atualizar configuração
  updateConfig(newConfig: Partial<CDNConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Obter configuração
  getConfig(): CDNConfig {
    return { ...this.config };
  }

  private buildCDNUrl(path: string): string {
    const baseUrl = this.config.enabled ? this.config.baseUrl : this.config.fallbackUrl;
    return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }

  private getCachedResource(url: string): CDNResource | null {
    return this.resources.get(url) || null;
  }

  private cacheResource(url: string, resource: CDNResource): void {
    this.resources.set(url, resource);
  }

  private async fetchWithRetry(url: string): Promise<Response> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
        
        const response = await fetch(url, {
          signal: controller.signal,
          cache: this.config.cacheStrategy === 'cacheFirst' ? 'force-cache' : 'no-cache'
        });
        
        clearTimeout(timeoutId);
        return response;
        
      } catch (error) {
        lastError = error as Error;
        console.warn(`Tentativa ${attempt}/${this.config.retryAttempts} falhou:`, error);
        
        if (attempt < this.config.retryAttempts) {
          // Aguardar antes da próxima tentativa
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    throw lastError || new Error('Todas as tentativas falharam');
  }

  private async loadFallbackResource(
    path: string,
    type: CDNResource['type']
  ): Promise<CDNResource> {
    const fallbackUrl = `${this.config.fallbackUrl}${path}`;
    const startTime = performance.now();
    
    try {
      const response = await fetch(fallbackUrl);
      const blob = await response.blob();
      const loadTime = performance.now() - startTime;
      
      const resource: CDNResource = {
        url: fallbackUrl,
        type,
        size: blob.size,
        cached: false,
        loadTime
      };
      
      this.updateStats(resource);
      return resource;
      
    } catch (error) {
      const resource: CDNResource = {
        url: fallbackUrl,
        type,
        size: 0,
        cached: false,
        loadTime: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      this.updateStats(resource);
      return resource;
    }
  }

  private updateStats(resource: CDNResource): void {
    this.stats.totalRequests++;
    
    if (resource.error) {
      this.stats.failedRequests++;
    } else {
      this.stats.successfulRequests++;
    }
    
    this.stats.totalBandwidth += resource.size;
    
    // Calcular tempo médio de carregamento
    const totalTime = this.stats.averageLoadTime * (this.stats.totalRequests - 1) + resource.loadTime;
    this.stats.averageLoadTime = totalTime / this.stats.totalRequests;
  }
}

// Configuração padrão
export const defaultCDNConfig: CDNConfig = {
  enabled: true,
  baseUrl: 'https://cdn.nexus-play.com',
  fallbackUrl: '/',
  timeout: 5000,
  retryAttempts: 3,
  cacheStrategy: 'staleWhileRevalidate'
};

// Instância global do CDN manager
export const cdnManager = new CDNManager(defaultCDNConfig);

// Funções de conveniência
export async function loadCDNResource(
  path: string,
  type: CDNResource['type'] = 'other'
): Promise<CDNResource> {
  return cdnManager.loadResource(path, type);
}

export async function loadCDNResources(
  paths: string[],
  type: CDNResource['type'] = 'other'
): Promise<CDNResource[]> {
  return cdnManager.loadResources(paths, type);
}

export async function loadCriticalCDNResources(): Promise<CDNResource[]> {
  return cdnManager.loadCriticalResources();
}

export async function isCDNAvailable(): Promise<boolean> {
  return cdnManager.isCDNAvailable();
}

export function getCDNStats(): CDNStats {
  return cdnManager.getStats();
}

export function clearCDNCache(): void {
  cdnManager.clearCache();
}

export function updateCDNConfig(config: Partial<CDNConfig>): void {
  cdnManager.updateConfig(config);
}



