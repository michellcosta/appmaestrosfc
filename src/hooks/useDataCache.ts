import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheOptions {
  ttl?: number; // Default TTL in milliseconds
  maxSize?: number; // Maximum cache size
}

export function useDataCache<T>(
  key: string,
  fetcher: () => Promise<T> | T,
  options: CacheOptions = {}
) {
  const { ttl = 5 * 60 * 1000, maxSize = 100 } = options; // Default 5 minutes TTL
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const cacheRef = useRef<Map<string, CacheItem<T>>>(new Map());
  const lastFetchRef = useRef<number>(0);

  // Verificar se o cache é válido
  const isCacheValid = useCallback((item: CacheItem<T>): boolean => {
    const now = Date.now();
    return (now - item.timestamp) < item.ttl;
  }, []);

  // Limpar cache expirado
  const cleanExpiredCache = useCallback(() => {
    const now = Date.now();
    const cache = cacheRef.current;
    
    for (const [key, item] of cache.entries()) {
      if ((now - item.timestamp) >= item.ttl) {
        cache.delete(key);
      }
    }
  }, []);

  // Limitar tamanho do cache
  const limitCacheSize = useCallback(() => {
    const cache = cacheRef.current;
    if (cache.size > maxSize) {
      const entries = Array.from(cache.entries());
      // Remover os itens mais antigos
      entries
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, cache.size - maxSize)
        .forEach(([key]) => cache.delete(key));
    }
  }, [maxSize]);

  // Buscar dados
  const fetchData = useCallback(async (forceRefresh = false) => {
    const cache = cacheRef.current;
    const cachedItem = cache.get(key);
    
    // Se não forçar refresh e cache é válido, usar cache
    if (!forceRefresh && cachedItem && isCacheValid(cachedItem)) {
      setData(cachedItem.data);
      setError(null);
      return cachedItem.data;
    }

    // Se já está carregando, não fazer nova requisição
    if (loading) {
      return data;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      
      // Armazenar no cache
      const cacheItem: CacheItem<T> = {
        data: result,
        timestamp: Date.now(),
        ttl
      };
      
      cache.set(key, cacheItem);
      cleanExpiredCache();
      limitCacheSize();
      
      setData(result);
      lastFetchRef.current = Date.now();
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro desconhecido');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, ttl, loading, data, isCacheValid, cleanExpiredCache, limitCacheSize]);

  // Inicializar dados
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Função para invalidar cache
  const invalidateCache = useCallback(() => {
    cacheRef.current.delete(key);
    setData(null);
  }, [key]);

  // Função para limpar todo o cache
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
    setData(null);
  }, []);

  // Função para forçar refresh
  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // Verificar se os dados estão em cache
  const isCached = useCallback(() => {
    const cache = cacheRef.current;
    const cachedItem = cache.get(key);
    return cachedItem && isCacheValid(cachedItem);
  }, [key, isCacheValid]);

  // Obter estatísticas do cache
  const getCacheStats = useCallback(() => {
    const cache = cacheRef.current;
    const now = Date.now();
    let validItems = 0;
    let expiredItems = 0;
    
    for (const item of cache.values()) {
      if (isCacheValid(item)) {
        validItems++;
      } else {
        expiredItems++;
      }
    }
    
    return {
      totalItems: cache.size,
      validItems,
      expiredItems,
      lastFetch: lastFetchRef.current,
      cacheAge: lastFetchRef.current ? now - lastFetchRef.current : 0
    };
  }, [isCacheValid]);

  return {
    data,
    loading,
    error,
    refresh,
    invalidateCache,
    clearCache,
    isCached: isCached(),
    cacheStats: getCacheStats()
  };
}

