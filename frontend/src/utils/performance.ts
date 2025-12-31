/**
 * Performance Monitoring Utility
 *
 * Provides Web Vitals monitoring and performance tracking for the application.
 * Monitors key metrics like LCP, INP, CLS, FCP, and TTFB.
 *
 * Web Vitals Targets:
 * - LCP (Largest Contentful Paint): < 2.5s
 * - INP (Interaction to Next Paint): < 200ms (replaced FID in web-vitals v3+)
 * - CLS (Cumulative Layout Shift): < 0.1
 * - FCP (First Contentful Paint): < 1.8s
 * - TTFB (Time to First Byte): < 600ms
 */

import { onCLS, onINP, onFCP, onLCP, onTTFB, Metric } from "web-vitals";

/**
 * Performance metric thresholds for warnings
 */
const THRESHOLDS = {
  LCP: 2500, // 2.5s
  INP: 200, // 200ms (replaced FID)
  CLS: 0.1,
  FCP: 1800, // 1.8s
  TTFB: 600, // 600ms
};

/**
 * Log performance metric to console
 */
function logMetric(metric: Metric) {
  const { name, value, rating } = metric;

  // Determine if metric exceeds threshold
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  const exceedsThreshold = threshold && value > threshold;

  // Log with appropriate level
  if (exceedsThreshold || rating === "poor") {
    console.warn(
      `[Performance] ${name}:`,
      `${value.toFixed(2)}${name === "CLS" ? "" : "ms"}`,
      `(${rating}) - Exceeds threshold of ${threshold}${name === "CLS" ? "" : "ms"}`
    );
  } else {
    console.log(
      `[Performance] ${name}:`,
      `${value.toFixed(2)}${name === "CLS" ? "" : "ms"}`,
      `(${rating})`
    );
  }
}

/**
 * Send metric to analytics service (placeholder)
 * In production, this would send to your analytics platform
 */
function sendToAnalytics(metric: Metric) {
  // TODO: Implement analytics integration
  // Example: analytics.track('web-vital', { name: metric.name, value: metric.value })

  // For now, we'll just log to console in development
  if (import.meta.env.DEV) {
    logMetric(metric);
  }
}

/**
 * Initialize Web Vitals monitoring
 *
 * Call this once in your application entry point (main.tsx or App.tsx)
 * to start monitoring performance metrics.
 */
export function initPerformanceMonitoring() {
  // Only run in browser environment
  if (typeof window === "undefined") {
    return;
  }

  console.log("[Performance] Initializing Web Vitals monitoring...");

  // Monitor Cumulative Layout Shift
  onCLS(sendToAnalytics);

  // Monitor Interaction to Next Paint (replaces FID)
  onINP(sendToAnalytics);

  // Monitor First Contentful Paint
  onFCP(sendToAnalytics);

  // Monitor Largest Contentful Paint
  onLCP(sendToAnalytics);

  // Monitor Time to First Byte
  onTTFB(sendToAnalytics);

  console.log("[Performance] Web Vitals monitoring initialized");
}

/**
 * Get current performance metrics summary
 * Useful for debugging and manual inspection
 */
export function getPerformanceMetrics() {
  if (typeof window === "undefined" || !window.performance) {
    return null;
  }

  const navigation = performance.getEntriesByType(
    "navigation"
  )[0] as PerformanceNavigationTiming;

  if (!navigation) {
    return null;
  }

  return {
    // Time to First Byte
    ttfb: navigation.responseStart - navigation.requestStart,

    // DOM Content Loaded
    domContentLoaded:
      navigation.domContentLoadedEventEnd -
      navigation.domContentLoadedEventStart,

    // Load complete
    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,

    // Total page load time
    totalLoadTime: navigation.loadEventEnd - navigation.fetchStart,

    // DNS lookup time
    dns: navigation.domainLookupEnd - navigation.domainLookupStart,

    // TCP connection time
    tcp: navigation.connectEnd - navigation.connectStart,

    // Request time
    request: navigation.responseEnd - navigation.requestStart,
  };
}

/**
 * Mark a custom performance event
 * Useful for tracking specific operations
 */
export function markPerformance(name: string) {
  if (typeof window !== "undefined" && window.performance) {
    performance.mark(name);
  }
}

/**
 * Measure time between two performance marks
 */
export function measurePerformance(
  name: string,
  startMark: string,
  endMark: string
) {
  if (typeof window !== "undefined" && window.performance) {
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];
      if (measure) {
        console.log(`[Performance] ${name}: ${measure.duration.toFixed(2)}ms`);
        return measure.duration;
      }
    } catch (error) {
      console.error(`[Performance] Failed to measure ${name}:`, error);
    }
  }
  return null;
}
