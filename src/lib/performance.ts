/**
 * Performance monitoring utilities for tracking component performance and memory usage
 */

export interface PerformanceMetrics {
  /** Component name or identifier */
  name: string;
  /** Render time in milliseconds */
  renderTime: number;
  /** Memory usage in bytes (if available) */
  memoryUsage?: number;
  /** Timestamp of the measurement */
  timestamp: number;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

export interface PerformanceThresholds {
  /** Maximum acceptable render time in milliseconds */
  maxRenderTime: number;
  /** Maximum acceptable memory usage in bytes */
  maxMemoryUsage?: number;
  /** Warning threshold for render time */
  warningRenderTime: number;
}

/**
 * Default performance thresholds
 */
const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  maxRenderTime: 100,
  warningRenderTime: 50,
};

/**
 * Performance monitoring class
 */
class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private thresholds: PerformanceThresholds;
  private isEnabled: boolean = true;

  constructor(thresholds: Partial<PerformanceThresholds> = {}) {
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
  }

  /**
   * Enable or disable performance monitoring
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Update performance thresholds
   */
  updateThresholds(thresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  /**
   * Measure render performance of a component
   */
  measureRender<T>(
    name: string,
    renderFn: () => T,
    metadata?: Record<string, any>
  ): T {
    if (!this.isEnabled) {
      return renderFn();
    }

    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();

    try {
      const result = renderFn();
      return result;
    } finally {
      const endTime = performance.now();
      const endMemory = this.getMemoryUsage();
      
      const renderTime = endTime - startTime;
      const memoryUsage = endMemory ? endMemory - startMemory : undefined;

      this.recordMetric({
        name,
        renderTime,
        memoryUsage,
        timestamp: Date.now(),
        metadata,
      });

      this.checkThresholds(name, renderTime, memoryUsage);
    }
  }

  /**
   * Measure async operation performance
   */
  async measureAsync<T>(
    name: string,
    asyncFn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    if (!this.isEnabled) {
      return asyncFn();
    }

    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();

    try {
      const result = await asyncFn();
      return result;
    } finally {
      const endTime = performance.now();
      const endMemory = this.getMemoryUsage();
      
      const executionTime = endTime - startTime;
      const memoryUsage = endMemory ? endMemory - startMemory : undefined;

      this.recordMetric({
        name,
        renderTime: executionTime,
        memoryUsage,
        timestamp: Date.now(),
        metadata,
      });

      this.checkThresholds(name, executionTime, memoryUsage);
    }
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);

    // Keep only the last 1000 metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get metrics for a specific component
   */
  getMetricsForComponent(name: string): PerformanceMetrics[] {
    return this.metrics.filter(metric => metric.name === name);
  }

  /**
   * Get average render time for a component
   */
  getAverageRenderTime(name: string): number {
    const componentMetrics = this.getMetricsForComponent(name);
    if (componentMetrics.length === 0) return 0;

    const totalTime = componentMetrics.reduce((sum, metric) => sum + metric.renderTime, 0);
    return totalTime / componentMetrics.length;
  }

  /**
   * Get the slowest render times
   */
  getSlowestRenders(limit: number = 10): PerformanceMetrics[] {
    return [...this.metrics]
      .sort((a, b) => b.renderTime - a.renderTime)
      .slice(0, limit);
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Get memory usage if available
   */
  private getMemoryUsage(): number | undefined {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize;
    }
    return undefined;
  }

  /**
   * Check if metrics exceed thresholds and log warnings
   */
  private checkThresholds(name: string, renderTime: number, memoryUsage?: number): void {
    if (renderTime > this.thresholds.maxRenderTime) {
      console.error(
        `🚨 Performance Alert: ${name} took ${renderTime.toFixed(2)}ms to render (threshold: ${this.thresholds.maxRenderTime}ms)`
      );
    } else if (renderTime > this.thresholds.warningRenderTime) {
      console.warn(
        `⚠️ Performance Warning: ${name} took ${renderTime.toFixed(2)}ms to render (threshold: ${this.thresholds.warningRenderTime}ms)`
      );
    }

    if (memoryUsage && this.thresholds.maxMemoryUsage && memoryUsage > this.thresholds.maxMemoryUsage) {
      console.error(
        `🚨 Memory Alert: ${name} used ${this.formatBytes(memoryUsage)} (threshold: ${this.formatBytes(this.thresholds.maxMemoryUsage)})`
      );
    }
  }

  /**
   * Format bytes to human readable format
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const totalMetrics = this.metrics.length;
    if (totalMetrics === 0) {
      return 'No performance metrics recorded.';
    }

    const avgRenderTime = this.metrics.reduce((sum, m) => sum + m.renderTime, 0) / totalMetrics;
    const slowestRenders = this.getSlowestRenders(5);
    const componentAverages = this.getComponentAverages();

    let report = `📊 Performance Report (${totalMetrics} measurements)\n\n`;
    report += `Average render time: ${avgRenderTime.toFixed(2)}ms\n\n`;
    
    report += '🏆 Slowest renders:\n';
    slowestRenders.forEach((metric, index) => {
      report += `${index + 1}. ${metric.name}: ${metric.renderTime.toFixed(2)}ms\n`;
    });

    report += '\n📈 Component averages:\n';
    Object.entries(componentAverages).forEach(([name, avg]) => {
      report += `- ${name}: ${avg.toFixed(2)}ms\n`;
    });

    return report;
  }

  /**
   * Get average render times by component
   */
  private getComponentAverages(): Record<string, number> {
    const componentGroups = this.metrics.reduce((groups, metric) => {
      if (!groups[metric.name]) {
        groups[metric.name] = [];
      }
      groups[metric.name].push(metric.renderTime);
      return groups;
    }, {} as Record<string, number[]>);

    const averages: Record<string, number> = {};
    Object.entries(componentGroups).forEach(([name, times]) => {
      averages[name] = times.reduce((sum, time) => sum + time, 0) / times.length;
    });

    return averages;
  }
}

/**
 * Global performance monitor instance
 */
export const performanceMonitor = new PerformanceMonitor();

/**
 * React hook for measuring component render performance
 */
export function usePerformanceMonitor(componentName: string) {
  const measureRender = <T>(renderFn: () => T, metadata?: Record<string, any>): T => {
    return performanceMonitor.measureRender(componentName, renderFn, metadata);
  };

  const measureAsync = <T>(asyncFn: () => Promise<T>, metadata?: Record<string, any>): Promise<T> => {
    return performanceMonitor.measureAsync(componentName, asyncFn, metadata);
  };

  return { measureRender, measureAsync };
}

/**
 * Higher-order component for automatic performance monitoring
 */
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
): React.ComponentType<P> {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const PerformanceMonitoredComponent = React.forwardRef<any, P>((props, ref) => {
    const { measureRender } = usePerformanceMonitor(displayName);

    return measureRender(() => {
      return React.createElement(WrappedComponent, { ...props, ref });
    }, { props });
  });

  PerformanceMonitoredComponent.displayName = `withPerformanceMonitoring(${displayName})`;

  return PerformanceMonitoredComponent;
}

/**
 * Utility function to measure function execution time
 */
export function measureExecutionTime<T>(fn: () => T, name: string): T {
  return performanceMonitor.measureRender(name, fn);
}

/**
 * Utility function to measure async function execution time
 */
export function measureAsyncExecutionTime<T>(fn: () => Promise<T>, name: string): Promise<T> {
  return performanceMonitor.measureAsync(name, fn);
}

/**
 * Memory leak detection utilities
 */
export class MemoryLeakDetector {
  private snapshots: Map<string, number> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Take a memory snapshot
   */
  takeSnapshot(label: string): number | undefined {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usage = memory.usedJSHeapSize;
      this.snapshots.set(label, usage);
      return usage;
    }
    return undefined;
  }

  /**
   * Compare memory usage between snapshots
   */
  compareSnapshots(label1: string, label2: string): number | undefined {
    const snapshot1 = this.snapshots.get(label1);
    const snapshot2 = this.snapshots.get(label2);

    if (snapshot1 && snapshot2) {
      return snapshot2 - snapshot1;
    }
    return undefined;
  }

  /**
   * Start monitoring memory usage for potential leaks
   */
  startMonitoring(componentName: string, intervalMs: number = 5000): void {
    if (this.intervals.has(componentName)) {
      this.stopMonitoring(componentName);
    }

    const interval = setInterval(() => {
      const currentUsage = this.takeSnapshot(`${componentName}_${Date.now()}`);
      if (currentUsage) {
        // Check for significant memory growth
        const snapshots = Array.from(this.snapshots.entries())
          .filter(([key]) => key.startsWith(componentName))
          .sort(([, a], [, b]) => b - a);

        if (snapshots.length > 2) {
          const recent = snapshots.slice(0, 3);
          const older = snapshots.slice(-3);
          
          const recentAvg = recent.reduce((sum, [, usage]) => sum + usage, 0) / recent.length;
          const olderAvg = older.reduce((sum, [, usage]) => sum + usage, 0) / older.length;
          
          const growth = recentAvg - olderAvg;
          const growthPercent = (growth / olderAvg) * 100;

          if (growthPercent > 10) {
            console.warn(
              `⚠️ Potential memory leak detected in ${componentName}: ${growthPercent.toFixed(2)}% growth`
            );
          }
        }
      }
    }, intervalMs);

    this.intervals.set(componentName, interval);
  }

  /**
   * Stop monitoring memory usage
   */
  stopMonitoring(componentName: string): void {
    const interval = this.intervals.get(componentName);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(componentName);
    }
  }

  /**
   * Clear all snapshots
   */
  clearSnapshots(): void {
    this.snapshots.clear();
  }
}

/**
 * Global memory leak detector instance
 */
export const memoryLeakDetector = new MemoryLeakDetector();

/**
 * React hook for memory leak detection
 */
export function useMemoryLeakDetection(componentName: string) {
  React.useEffect(() => {
    memoryLeakDetector.startMonitoring(componentName);
    
    return () => {
      memoryLeakDetector.stopMonitoring(componentName);
    };
  }, [componentName]);

  const takeSnapshot = React.useCallback((label: string) => {
    return memoryLeakDetector.takeSnapshot(label);
  }, []);

  return { takeSnapshot };
}

export default performanceMonitor; 