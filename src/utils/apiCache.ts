/**
 * API Cache Manager
 * Sistema de cache inteligente para APIs
 */

export interface CacheConfig {
  ttl: number; // Time to live em ms
  maxSize: number; // Tamanho máximo do cache
  strategy: 'lru' | 'lfu' | 'fifo'; // Estratégia de eviction
  compress: boolean; // Comprimir dados
  persist: boolean; // Persistir cache
}

export interface CacheEntry<T = any> {
  key: string;
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
  size: number;
  compressed?: boolean;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalSize: number;
  entryCount: number;
  evictions: number;
}

class APICache {
  private cache = new Map<string, CacheEntry>();
  private config: CacheConfig;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    totalSize: 0,
    entryCount: 0,
    evictions: 0
  };

  constructor(config: CacheConfig) {
    this.config = config;
    this.startCleanupInterval();
  }

  // Obter dados do cache
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Verificar se expirou
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Atualizar estatísticas
    entry.hits++;
    this.stats.hits++;
    this.updateHitRate();

    // Descomprimir se necessário
    if (entry.compressed) {
      try {
        return this.decompress(entry.data);
      } catch (error) {
        console.error('Erro ao descomprimir cache:', error);
        this.cache.delete(key);
        return null;
      }
    }

    return entry.data;
  }

  // Armazenar dados no cache
  set<T>(key: string, data: T, customTtl?: number): void {
    const ttl = customTtl || this.config.ttl;
    const timestamp = Date.now();
    
    let processedData = data;
    let compressed = false;
    let size = this.calculateSize(data);

    // Comprimir se configurado
    if (this.config.compress && size > 1024) { // Comprimir apenas se > 1KB
      try {
        processedData = this.compress(data);
        compressed = true;
        size = this.calculateSize(processedData);
      } catch (error) {
        console.warn('Falha ao comprimir dados, armazenando sem compressão:', error);
        processedData = data;
        compressed = false;
      }
    }

    const entry: CacheEntry<T> = {
      key,
      data: processedData,
      timestamp,
      ttl,
      hits: 0,
      size,
      compressed
    };

    // Verificar se precisa evictar entradas
    this.evictIfNeeded(size);

    // Armazenar entrada
    this.cache.set(key, entry);
    this.stats.totalSize += size;
    this.stats.entryCount++;

    // Persistir se configurado
    if (this.config.persist) {
      this.persistEntry(key, entry);
    }
  }

  // Verificar se existe no cache
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // Verificar se expirou
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  // Remover do cache
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.stats.totalSize -= entry.size;
      this.stats.entryCount--;
      this.cache.delete(key);
      return true;
    }
    return false;
  }

  // Limpar cache
  clear(): void {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalSize: 0,
      entryCount: 0,
      evictions: 0
    };
    console.log('🧹 Cache limpo');
  }

  // Obter estatísticas
  getStats(): CacheStats {
    return { ...this.stats };
  }

  // Obter todas as chaves
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  // Obter tamanho do cache
  size(): number {
    return this.cache.size;
  }

  private calculateSize(data: any): number {
    try {
      return JSON.stringify(data).length;
    } catch (error) {
      return 0;
    }
  }

  private compress(data: any): string {
    // Implementação básica de compressão
    // Em produção, usar uma biblioteca como pako ou lz-string
    const jsonString = JSON.stringify(data);
    return btoa(jsonString); // Base64 encoding como compressão básica
  }

  private decompress(compressedData: string): any {
    try {
      const jsonString = atob(compressedData);
      return JSON.parse(jsonString);
    } catch (error) {
      throw new Error('Falha ao descomprimir dados');
    }
  }

  private evictIfNeeded(newEntrySize: number): void {
    const maxSize = this.config.maxSize * 1024 * 1024; // Converter MB para bytes
    
    if (this.stats.totalSize + newEntrySize <= maxSize) {
      return;
    }

    // Evictar entradas baseado na estratégia
    const entries = Array.from(this.cache.values());
    let entriesToEvict: CacheEntry[] = [];

    switch (this.config.strategy) {
      case 'lru':
        entriesToEvict = entries
          .sort((a, b) => a.timestamp - b.timestamp)
          .slice(0, Math.ceil(entries.length * 0.1)); // Evictar 10% mais antigas
        break;
      
      case 'lfu':
        entriesToEvict = entries
          .sort((a, b) => a.hits - b.hits)
          .slice(0, Math.ceil(entries.length * 0.1)); // Evictar 10% menos usadas
        break;
      
      case 'fifo':
        entriesToEvict = entries
          .sort((a, b) => a.timestamp - b.timestamp)
          .slice(0, Math.ceil(entries.length * 0.1)); // Evictar 10% mais antigas
        break;
    }

    // Remover entradas selecionadas
    entriesToEvict.forEach(entry => {
      this.cache.delete(entry.key);
      this.stats.totalSize -= entry.size;
      this.stats.entryCount--;
      this.stats.evictions++;
    });
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  private startCleanupInterval(): void {
    // Limpar entradas expiradas a cada 5 minutos
    setInterval(() => {
      const now = Date.now();
      let cleaned = 0;
      
      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.timestamp > entry.ttl) {
          this.cache.delete(key);
          this.stats.totalSize -= entry.size;
          this.stats.entryCount--;
          cleaned++;
        }
      }
      
      if (cleaned > 0) {
        console.log(`🧹 Limpeza automática: ${cleaned} entradas expiradas removidas`);
      }
    }, 5 * 60 * 1000);
  }

  private persistEntry(key: string, entry: CacheEntry): void {
    try {
      // Em produção, persistir em localStorage ou IndexedDB
      const storageKey = `api_cache_${key}`;
      localStorage.setItem(storageKey, JSON.stringify(entry));
    } catch (error) {
      console.warn('Falha ao persistir entrada do cache:', error);
    }
  }

  private loadPersistedEntries(): void {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('api_cache_'));
      
      keys.forEach(storageKey => {
        const entryData = localStorage.getItem(storageKey);
        if (entryData) {
          const entry = JSON.parse(entryData);
          const key = storageKey.replace('api_cache_', '');
          
          // Verificar se não expirou
          if (Date.now() - entry.timestamp <= entry.ttl) {
            this.cache.set(key, entry);
            this.stats.totalSize += entry.size;
            this.stats.entryCount++;
          } else {
            localStorage.removeItem(storageKey);
          }
        }
      });
    } catch (error) {
      console.warn('Falha ao carregar entradas persistidas:', error);
    }
  }
}

// Configurações padrão
export const defaultCacheConfig: CacheConfig = {
  ttl: 300000, // 5 minutos
  maxSize: 50, // 50MB
  strategy: 'lru',
  compress: true,
  persist: true
};

// Instâncias de cache para diferentes tipos de dados
export const apiCache = new APICache(defaultCacheConfig);

// Cache específico para dados de usuários (TTL maior)
export const userCache = new APICache({
  ...defaultCacheConfig,
  ttl: 600000, // 10 minutos
  maxSize: 20 // 20MB
});

// Cache específico para dados estáticos (TTL muito maior)
export const staticCache = new APICache({
  ...defaultCacheConfig,
  ttl: 3600000, // 1 hora
  maxSize: 100 // 100MB
});

// Funções de conveniência
export async function getCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cached = apiCache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  const data = await fetchFn();
  apiCache.set(key, data, ttl);
  return data;
}

export function invalidateCache(pattern?: string): void {
  if (pattern) {
    const keys = apiCache.keys().filter(key => key.includes(pattern));
    keys.forEach(key => apiCache.delete(key));
  } else {
    apiCache.clear();
  }
}

export function getCacheStats() {
  return {
    api: apiCache.getStats(),
    user: userCache.getStats(),
    static: staticCache.getStats()
  };
}



