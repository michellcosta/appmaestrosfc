import { useEffect, useCallback } from 'react';

interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

export const usePerformanceMonitor = (enabled: boolean = process.env.NODE_ENV === 'development') => {
  const logMetric = useCallback((name: string, value: number) => {
    if (!enabled) return;
    
    console.log(`🚀 Performance Metric - ${name}: ${value.toFixed(2)}ms`);
    
    // In production, you might want to send this to an analytics service
    if (process.env.NODE_ENV === 'production') {
      // Example: analytics.track('performance_metric', { name, value });
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Measure Core Web Vitals
    const measureWebVitals = () => {
      // First Contentful Paint
      const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0] as PerformanceEntry;
      if (fcpEntry) {
        logMetric('First Contentful Paint', fcpEntry.startTime);
      }

      // Navigation timing
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const ttfb = navigation.responseStart - navigation.requestStart;
        logMetric('Time to First Byte', ttfb);
        
        const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.navigationStart;
        logMetric('DOM Content Loaded', domContentLoaded);
        
        const loadComplete = navigation.loadEventEnd - navigation.navigationStart;
        logMetric('Load Complete', loadComplete);
      }
    };

    // Measure when page is fully loaded
    if (document.readyState === 'complete') {
      measureWebVitals();
    } else {
      window.addEventListener('load', measureWebVitals);
    }

    // Measure Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            logMetric('Largest Contentful Paint', lastEntry.startTime);
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // Measure First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.processingStart && entry.startTime) {
              const fid = entry.processingStart - entry.startTime;
              logMetric('First Input Delay', fid);
            }
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Measure Cumulative Layout Shift
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          if (clsValue > 0) {
            logMetric('Cumulative Layout Shift', clsValue * 1000); // Convert to ms for consistency
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        return () => {
          lcpObserver.disconnect();
          fidObserver.disconnect();
          clsObserver.disconnect();
        };
      } catch (error) {
        console.warn('Performance monitoring not supported:', error);
      }
    }

    return () => {
      window.removeEventListener('load', measureWebVitals);
    };
  }, [enabled, logMetric]);

  const measureCustomMetric = useCallback((name: string, startTime: number) => {
    if (!enabled) return;
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    logMetric(name, duration);
    
    return duration;
  }, [enabled, logMetric]);

  const startTiming = useCallback(() => {
    return performance.now();
  }, []);

  return {
    measureCustomMetric,
    startTiming,
    logMetric,
  };
};