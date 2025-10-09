/**
 * Performance Monitoring Utilities
 */

import { trackEvent } from './analytics';
import config from './config';

interface PerformanceMetrics {
  name: string;
  duration: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();
  
  startMeasure(name: string) {
    this.metrics.set(name, performance.now());
  }
  
  endMeasure(name: string): number | undefined {
    const startTime = this.metrics.get(name);
    if (!startTime) return;
    
    const duration = performance.now() - startTime;
    this.metrics.delete(name);
    
    // Track in analytics
    trackEvent('performance_metric', {
      metric_name: name,
      duration_ms: Math.round(duration),
    });
    
    // Log slow operations
    if (duration > 1000) {
      console.warn(`⚠️ Slow operation: ${name} took ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }
  
  // Monitor API calls
  async measureApiCall<T>(
    name: string,
    apiCall: () => Promise<T>
  ): Promise<T> {
    this.startMeasure(name);
    
    try {
      const result = await apiCall();
      this.endMeasure(name);
      return result;
    } catch (error) {
      this.endMeasure(name);
      throw error;
    }
  }
  
  // Get Core Web Vitals
  getCoreWebVitals() {
    if (!config.isProduction) return;
    
    // Largest Contentful Paint (LCP)
    try {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        
        trackEvent('core_web_vital', {
          metric: 'LCP',
          value: lastEntry.renderTime || lastEntry.loadTime,
          rating: this.getRating('LCP', lastEntry.renderTime || lastEntry.loadTime),
        });
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // Observer not supported
    }
    
    // First Input Delay (FID)
    try {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          trackEvent('core_web_vital', {
            metric: 'FID',
            value: entry.processingStart - entry.startTime,
            rating: this.getRating('FID', entry.processingStart - entry.startTime),
          });
        });
      }).observe({ entryTypes: ['first-input'] });
    } catch (e) {
      // Observer not supported
    }
  }
  
  private getRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds: Record<string, [number, number]> = {
      LCP: [2500, 4000],
      FID: [100, 300],
      CLS: [0.1, 0.25],
    };
    
    const [good, needsImprovement] = thresholds[metric] || [0, 0];
    
    if (value <= good) return 'good';
    if (value <= needsImprovement) return 'needs-improvement';
    return 'poor';
  }
  
  // Monitor bundle size
  logBundleSize() {
    if (typeof performance === 'undefined' || !performance.getEntriesByType) return;
    
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const scripts = resources.filter(r => r.initiatorType === 'script');
    
    const totalSize = scripts.reduce((sum, script) => {
      return sum + (script.transferSize || 0);
    }, 0);
    
    console.log(`📦 Total JS Bundle Size: ${(totalSize / 1024).toFixed(2)} KB`);
    
    trackEvent('bundle_size', {
      size_kb: Math.round(totalSize / 1024),
    });
  }
}

export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
import { useEffect } from 'react';

export function usePerformanceMonitor(componentName: string) {
  useEffect(() => {
    performanceMonitor.startMeasure(`mount_${componentName}`);
    
    return () => {
      performanceMonitor.endMeasure(`mount_${componentName}`);
    };
  }, [componentName]);
}
