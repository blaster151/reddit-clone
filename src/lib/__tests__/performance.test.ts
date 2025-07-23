import { performanceMonitor, memoryLeakDetector, usePerformanceMonitor, useMemoryLeakDetection } from '../performance';
import { renderHook, act } from '@testing-library/react';
import React from 'react';

// Mock performance API
const mockPerformance = {
  now: jest.fn(),
  memory: {
    usedJSHeapSize: 1000000,
  },
};

Object.defineProperty(global, 'performance', {
  value: mockPerformance,
  writable: true,
});

// Mock console methods
const originalConsole = { ...console };
const mockConsole = {
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn(),
};

beforeAll(() => {
  global.console = mockConsole as any;
});

afterAll(() => {
  global.console = originalConsole;
});

describe('Performance Monitor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    performanceMonitor.clearMetrics();
    memoryLeakDetector.clearSnapshots();
    mockPerformance.now.mockReturnValue(0);
  });

  describe('PerformanceMonitor Class', () => {
    it('measures render performance correctly', () => {
      mockPerformance.now
        .mockReturnValueOnce(0) // start time
        .mockReturnValueOnce(50); // end time

      const result = performanceMonitor.measureRender('TestComponent', () => {
        return 'test result';
      });

      expect(result).toBe('test result');

      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0]).toMatchObject({
        name: 'TestComponent',
        renderTime: 50,
        timestamp: expect.any(Number),
      });
    });

    it('measures async performance correctly', async () => {
      mockPerformance.now
        .mockReturnValueOnce(0) // start time
        .mockReturnValueOnce(100); // end time

      const result = await performanceMonitor.measureAsync('AsyncTest', async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'async result';
      });

      expect(result).toBe('async result');

      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0]).toMatchObject({
        name: 'AsyncTest',
        renderTime: 100,
        timestamp: expect.any(Number),
      });
    });

    it('records metadata with metrics', () => {
      mockPerformance.now
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(25);

      performanceMonitor.measureRender('TestComponent', () => {
        return 'result';
      }, { propCount: 5, hasChildren: true });

      const metrics = performanceMonitor.getMetrics();
      expect(metrics[0].metadata).toEqual({
        propCount: 5,
        hasChildren: true,
      });
    });

    it('limits metrics to prevent memory leaks', () => {
      // Add more than 1000 metrics
      for (let i = 0; i < 1100; i++) {
        mockPerformance.now
          .mockReturnValueOnce(i)
          .mockReturnValueOnce(i + 10);

        performanceMonitor.measureRender(`Component${i}`, () => {
          return 'result';
        });
      }

      const metrics = performanceMonitor.getMetrics();
      expect(metrics.length).toBe(1000);
      expect(metrics[0].name).toBe('Component100');
    });

    it('gets metrics for specific component', () => {
      mockPerformance.now
        .mockReturnValueOnce(0).mockReturnValueOnce(10)
        .mockReturnValueOnce(10).mockReturnValueOnce(20)
        .mockReturnValueOnce(20).mockReturnValueOnce(30);

      performanceMonitor.measureRender('ComponentA', () => 'result1');
      performanceMonitor.measureRender('ComponentB', () => 'result2');
      performanceMonitor.measureRender('ComponentA', () => 'result3');

      const componentAMetrics = performanceMonitor.getMetricsForComponent('ComponentA');
      expect(componentAMetrics).toHaveLength(2);
      expect(componentAMetrics[0].name).toBe('ComponentA');
      expect(componentAMetrics[1].name).toBe('ComponentA');
    });

    it('calculates average render time correctly', () => {
      mockPerformance.now
        .mockReturnValueOnce(0).mockReturnValueOnce(10)
        .mockReturnValueOnce(10).mockReturnValueOnce(30)
        .mockReturnValueOnce(30).mockReturnValueOnce(50);

      performanceMonitor.measureRender('TestComponent', () => 'result1');
      performanceMonitor.measureRender('TestComponent', () => 'result2');
      performanceMonitor.measureRender('TestComponent', () => 'result3');

      const avgTime = performanceMonitor.getAverageRenderTime('TestComponent');
      expect(avgTime).toBe(20); // (10 + 20 + 30) / 3
    });

    it('returns 0 for average when no metrics exist', () => {
      const avgTime = performanceMonitor.getAverageRenderTime('NonExistentComponent');
      expect(avgTime).toBe(0);
    });

    it('gets slowest renders correctly', () => {
      mockPerformance.now
        .mockReturnValueOnce(0).mockReturnValueOnce(10)
        .mockReturnValueOnce(10).mockReturnValueOnce(50)
        .mockReturnValueOnce(50).mockReturnValueOnce(30);

      performanceMonitor.measureRender('ComponentA', () => 'result1');
      performanceMonitor.measureRender('ComponentB', () => 'result2');
      performanceMonitor.measureRender('ComponentC', () => 'result3');

      const slowest = performanceMonitor.getSlowestRenders(2);
      expect(slowest).toHaveLength(2);
      expect(slowest[0].renderTime).toBe(40); // ComponentB: 50 - 10
      expect(slowest[1].renderTime).toBe(20); // ComponentC: 30 - 10
    });

    it('generates performance report correctly', () => {
      mockPerformance.now
        .mockReturnValueOnce(0).mockReturnValueOnce(10)
        .mockReturnValueOnce(10).mockReturnValueOnce(30);

      performanceMonitor.measureRender('ComponentA', () => 'result1');
      performanceMonitor.measureRender('ComponentB', () => 'result2');

      const report = performanceMonitor.generateReport();
      
      expect(report).toContain('📊 Performance Report (2 measurements)');
      expect(report).toContain('Average render time: 15.00ms');
      expect(report).toContain('ComponentA');
      expect(report).toContain('ComponentB');
    });

    it('handles disabled monitoring', () => {
      performanceMonitor.setEnabled(false);

      mockPerformance.now
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(50);

      const result = performanceMonitor.measureRender('TestComponent', () => {
        return 'result';
      });

      expect(result).toBe('result');

      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(0);

      performanceMonitor.setEnabled(true);
    });

    it('updates thresholds correctly', () => {
      performanceMonitor.updateThresholds({
        maxRenderTime: 200,
        warningRenderTime: 100,
      });

      // Test with a render time that would trigger warning but not error
      mockPerformance.now
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(150);

      performanceMonitor.measureRender('TestComponent', () => 'result');

      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('Performance Warning: TestComponent took 150.00ms')
      );
      expect(mockConsole.error).not.toHaveBeenCalled();
    });
  });

  describe('usePerformanceMonitor Hook', () => {
    it('provides measureRender function', () => {
      const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));

      mockPerformance.now
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(25);

      const testResult = result.current.measureRender(() => 'hook result');
      expect(testResult).toBe('hook result');

      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('TestComponent');
    });

    it('provides measureAsync function', async () => {
      const { result } = renderHook(() => usePerformanceMonitor('TestComponent'));

      mockPerformance.now
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(75);

      const testResult = await result.current.measureAsync(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'async hook result';
      });

      expect(testResult).toBe('async hook result');

      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('TestComponent');
    });
  });

  describe('Memory Leak Detector', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('takes memory snapshots correctly', () => {
      const snapshot1 = memoryLeakDetector.takeSnapshot('before');
      const snapshot2 = memoryLeakDetector.takeSnapshot('after');

      expect(snapshot1).toBe(1000000);
      expect(snapshot2).toBe(1000000);
    });

    it('compares snapshots correctly', () => {
      memoryLeakDetector.takeSnapshot('before');
      
      // Simulate memory increase
      mockPerformance.memory.usedJSHeapSize = 1100000;
      memoryLeakDetector.takeSnapshot('after');

      const difference = memoryLeakDetector.compareSnapshots('before', 'after');
      expect(difference).toBe(100000);
    });

    it('returns undefined for non-existent snapshots', () => {
      const difference = memoryLeakDetector.compareSnapshots('nonexistent1', 'nonexistent2');
      expect(difference).toBeUndefined();
    });

    it('starts and stops monitoring correctly', () => {
      const setIntervalSpy = jest.spyOn(global, 'setInterval');
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      memoryLeakDetector.startMonitoring('TestComponent', 1000);
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000);

      memoryLeakDetector.stopMonitoring('TestComponent');
      expect(clearIntervalSpy).toHaveBeenCalled();

      setIntervalSpy.mockRestore();
      clearIntervalSpy.mockRestore();
    });

    it('detects potential memory leaks', () => {
      memoryLeakDetector.startMonitoring('TestComponent', 1000);

      // Simulate memory growth
      mockPerformance.memory.usedJSHeapSize = 1000000;
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      mockPerformance.memory.usedJSHeapSize = 1200000; // 20% growth
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      mockPerformance.memory.usedJSHeapSize = 1400000; // 40% growth
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('Potential memory leak detected in TestComponent')
      );

      memoryLeakDetector.stopMonitoring('TestComponent');
    });

    it('clears snapshots correctly', () => {
      memoryLeakDetector.takeSnapshot('test1');
      memoryLeakDetector.takeSnapshot('test2');

      memoryLeakDetector.clearSnapshots();

      const difference = memoryLeakDetector.compareSnapshots('test1', 'test2');
      expect(difference).toBeUndefined();
    });
  });

  describe('useMemoryLeakDetection Hook', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('starts monitoring on mount and stops on unmount', () => {
      const setIntervalSpy = jest.spyOn(global, 'setInterval');
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      const { unmount } = renderHook(() => useMemoryLeakDetection('TestComponent'));

      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 5000);

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();

      setIntervalSpy.mockRestore();
      clearIntervalSpy.mockRestore();
    });

    it('provides takeSnapshot function', () => {
      const { result } = renderHook(() => useMemoryLeakDetection('TestComponent'));

      const snapshot = result.current.takeSnapshot('test');
      expect(snapshot).toBe(1000000);
    });
  });

  describe('Utility Functions', () => {
    it('measureExecutionTime works correctly', () => {
      mockPerformance.now
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(30);

      const result = performanceMonitor.measureRender('UtilityTest', () => {
        return 'utility result';
      });

      expect(result).toBe('utility result');

      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('UtilityTest');
    });

    it('measureAsyncExecutionTime works correctly', async () => {
      mockPerformance.now
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(60);

      const result = await performanceMonitor.measureAsync('AsyncUtilityTest', async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'async utility result';
      });

      expect(result).toBe('async utility result');

      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('AsyncUtilityTest');
    });
  });

  describe('Error Handling', () => {
    it('handles errors in render function gracefully', () => {
      mockPerformance.now
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(25);

      expect(() => {
        performanceMonitor.measureRender('ErrorComponent', () => {
          throw new Error('Test error');
        });
      }).toThrow('Test error');

      // Should still record the metric
      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('ErrorComponent');
    });

    it('handles errors in async function gracefully', async () => {
      mockPerformance.now
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(50);

      await expect(
        performanceMonitor.measureAsync('AsyncErrorComponent', async () => {
          throw new Error('Async test error');
        })
      ).rejects.toThrow('Async test error');

      // Should still record the metric
      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('AsyncErrorComponent');
    });
  });

  describe('Performance Thresholds', () => {
    it('logs warning when render time exceeds warning threshold', () => {
      mockPerformance.now
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(75); // Above warning threshold (50ms)

      performanceMonitor.measureRender('SlowComponent', () => 'result');

      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('Performance Warning: SlowComponent took 75.00ms')
      );
      expect(mockConsole.error).not.toHaveBeenCalled();
    });

    it('logs error when render time exceeds max threshold', () => {
      mockPerformance.now
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(150); // Above max threshold (100ms)

      performanceMonitor.measureRender('VerySlowComponent', () => 'result');

      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('Performance Alert: VerySlowComponent took 150.00ms')
      );
    });

    it('does not log when render time is within thresholds', () => {
      mockPerformance.now
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(25); // Below warning threshold

      performanceMonitor.measureRender('FastComponent', () => 'result');

      expect(mockConsole.warn).not.toHaveBeenCalled();
      expect(mockConsole.error).not.toHaveBeenCalled();
    });
  });
}); 