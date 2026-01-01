/**
 * Performance Monitoring Hook
 *
 * React hook for monitoring component render performance.
 * Tracks component mount/unmount times and warns about slow renders.
 *
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   usePerformanceMonitor('MyComponent');
 *   // ... component code
 * }
 * ```
 */

import { useEffect, useRef } from "react";

/**
 * Threshold for slow component operations (100ms)
 * Components taking longer than this will trigger a warning
 */
const SLOW_THRESHOLD_MS = 100;

/**
 * Hook to monitor component lifecycle performance
 *
 * @param componentName - Name of the component being monitored
 * @param slowThreshold - Custom threshold in ms (default: 100ms)
 */
export function usePerformanceMonitor(
  componentName: string,
  slowThreshold: number = SLOW_THRESHOLD_MS
) {
  const mountTimeRef = useRef<number>(0);
  const renderCountRef = useRef<number>(0);

  // Track component mount time
  useEffect(() => {
    const mountTime = performance.now();
    mountTimeRef.current = mountTime;

    // Mark component mount
    performance.mark(`${componentName}-mount`);

    console.log(`[Performance] ${componentName} mounted`);

    // Cleanup: measure total lifetime when component unmounts
    return () => {
      const unmountTime = performance.now();
      const lifetime = unmountTime - mountTime;

      // Mark component unmount
      performance.mark(`${componentName}-unmount`);

      // Measure lifetime
      try {
        performance.measure(
          `${componentName}-lifetime`,
          `${componentName}-mount`,
          `${componentName}-unmount`
        );
      } catch (error) {
        // Marks might not exist in some cases
      }

      // Log lifetime stats
      console.log(
        `[Performance] ${componentName} unmounted after ${lifetime.toFixed(2)}ms (${renderCountRef.current} renders)`
      );

      // Warn if component had an unusually long lifetime with many renders
      if (lifetime > 10000 && renderCountRef.current > 100) {
        console.warn(
          `[Performance] ${componentName} had ${renderCountRef.current} renders over ${lifetime.toFixed(2)}ms - consider optimization`
        );
      }
    };
  }, [componentName]);

  // Track render count and slow renders
  useEffect(() => {
    renderCountRef.current += 1;
    const renderStart = performance.now();

    // Measure render time on next tick
    const timeoutId = setTimeout(() => {
      const renderDuration = performance.now() - renderStart;

      if (renderDuration > slowThreshold) {
        console.warn(
          `[Performance] ${componentName} slow render #${renderCountRef.current}: ${renderDuration.toFixed(2)}ms (threshold: ${slowThreshold}ms)`
        );
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  });
}

/**
 * Hook to monitor async operations performance
 *
 * Returns a function to time async operations
 *
 * Usage:
 * ```tsx
 * const trackOperation = useOperationTimer('MyComponent');
 *
 * const handleClick = async () => {
 *   await trackOperation('fetchData', async () => {
 *     await fetchData();
 *   });
 * };
 * ```
 */
export function useOperationTimer(componentName: string) {
  return async function trackOperation<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const startMark = `${componentName}-${operationName}-start`;
    const endMark = `${componentName}-${operationName}-end`;
    const measureName = `${componentName}-${operationName}`;

    performance.mark(startMark);
    const startTime = performance.now();

    try {
      const result = await operation();

      const duration = performance.now() - startTime;
      performance.mark(endMark);

      // Measure the operation
      try {
        performance.measure(measureName, startMark, endMark);
      } catch (error) {
        // Marks might not exist
      }

      // Log the operation time
      console.log(
        `[Performance] ${componentName}.${operationName}: ${duration.toFixed(2)}ms`
      );

      // Warn if operation was slow
      if (duration > SLOW_THRESHOLD_MS) {
        console.warn(
          `[Performance] ${componentName}.${operationName} was slow: ${duration.toFixed(2)}ms`
        );
      }

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      performance.mark(endMark);

      console.error(
        `[Performance] ${componentName}.${operationName} failed after ${duration.toFixed(2)}ms:`,
        error
      );

      throw error;
    }
  };
}

/**
 * Hook to track component re-render causes
 *
 * Logs which props/state changed between renders
 * Useful for debugging unnecessary re-renders
 *
 * Usage:
 * ```tsx
 * function MyComponent({ user, settings }) {
 *   useWhyDidYouUpdate('MyComponent', { user, settings });
 *   // ... component code
 * }
 * ```
 */
export function useWhyDidYouUpdate(
  componentName: string,
  props: Record<string, unknown>
) {
  const previousProps = useRef<Record<string, unknown>>({});

  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps: Record<string, { from: unknown; to: unknown }> = {};

      allKeys.forEach((key) => {
        if (previousProps.current[key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current[key],
            to: props[key],
          };
        }
      });

      if (Object.keys(changedProps).length > 0) {
        console.log(`[Performance] ${componentName} re-rendered due to:`, {
          changed: Object.keys(changedProps),
          details: changedProps,
        });
      }
    }

    previousProps.current = props;
  });
}
