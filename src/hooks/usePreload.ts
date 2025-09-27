import { useCallback } from 'react';

/**
 * Hook para preload de páginas e componentes
 * Melhora a performance carregando recursos em background
 */
export function usePreload() {
  const preloadPage = useCallback((importFn: () => Promise<any>) => {
    // Preload apenas em conexões rápidas ou quando não está em modo economia de dados
    if (
      navigator.connection && 
      (navigator.connection.effectiveType === '4g' || 
       navigator.connection.effectiveType === '5g') &&
      !navigator.connection.saveData
    ) {
      importFn().catch(console.warn);
    }
  }, []);

  const preloadOnHover = useCallback((importFn: () => Promise<any>) => {
    return {
      onMouseEnter: () => preloadPage(importFn),
      onFocus: () => preloadPage(importFn)
    };
  }, [preloadPage]);

  return {
    preloadPage,
    preloadOnHover
  };
}
