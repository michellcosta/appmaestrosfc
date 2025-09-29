import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  componentName: string;
}

export function usePerformanceOptimization(componentName: string) {
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);

  // Medir tempo de render
  const startRender = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  const endRender = useCallback(() => {
    if (renderStartTime.current > 0) {
      const renderTime = performance.now() - renderStartTime.current;
      renderCount.current += 1;
      
      // Log apenas se o tempo for maior que 16ms (60fps)
      if (renderTime > 16) {
        console.warn(`🐌 Slow render in ${componentName}: ${renderTime.toFixed(2)}ms (render #${renderCount.current})`);
      }
      
      // Log de memória se disponível
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        console.log(`📊 Memory usage for ${componentName}:`, {
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
        });
      }
    }
  }, [componentName]);

  // Debounce para evitar logs excessivos
  const debouncedLog = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (message: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          console.log(message);
        }, 1000);
      };
    })(),
    []
  );

  // Monitorar re-renders
  useEffect(() => {
    renderCount.current += 1;
    
    if (renderCount.current > 10) {
      debouncedLog(`⚠️ ${componentName} has re-rendered ${renderCount.current} times`);
    }
  });

  // Cleanup
  useEffect(() => {
    return () => {
      console.log(`🧹 ${componentName} unmounted after ${renderCount.current} renders`);
    };
  }, [componentName]);

  return {
    startRender,
    endRender,
    renderCount: renderCount.current
  };
}

// Hook para otimizar listas grandes
export function useVirtualization<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight),
    items.length - 1
  );
  
  const startIndex = Math.max(0, visibleStart - overscan);
  const endIndex = Math.min(items.length - 1, visibleEnd + overscan);
  
  const visibleItems = items.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;
  
  return {
    visibleItems,
    offsetY,
    totalHeight: items.length * itemHeight,
    onScroll: (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    }
  };
}

// Hook para debounce de valores
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Hook para throttle de funções
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args: any[]) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
}



