/**
 * Performance optimization utilities for frontend
 * Caching, memoization, and performance monitoring
 */

import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import useSWR, { SWRConfiguration } from 'swr';

// ============================================================================
// API CACHING
// ============================================================================

/**
 * SWR configuration for optimal caching
 * - Deduplicates requests
 * - Auto-revalidates on focus/reconnect
 * - Includes retry logic
 */
export const SWR_CONFIG: SWRConfiguration = {
  revalidateOnFocus: false,           // Don't refetch on window focus
  revalidateOnReconnect: true,        // Refetch when reconnecting
  dedupingInterval: 60 * 1000,        // 60 seconds dedup window
  focusThrottleInterval: 300 * 1000,  // 5 minutes refetch throttle
  errorRetryCount: 3,                 // Retry 3 times on error
  errorRetryInterval: 5000,           // Wait 5s between retries
  loadingTimeout: 10000,              // Timeout after 10s
  compare: (a, b) => JSON.stringify(a) === JSON.stringify(b),  // Deep compare
};

/**
 * SWR config for data that rarely changes
 */
export const SWR_CONFIG_STATIC: SWRConfiguration = {
  ...SWR_CONFIG,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateOnMount: false,
  dedupingInterval: 30 * 60 * 1000,  // 30 minutes
};

/**
 * SWR config for real-time data
 */
export const SWR_CONFIG_REALTIME: SWRConfiguration = {
  ...SWR_CONFIG,
  refreshInterval: 10 * 1000,         // Revalidate every 10 seconds
  focusThrottleInterval: 0,           // Always revalidate on focus
};

// ============================================================================
// LOCAL STORAGE CACHING
// ============================================================================

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

/**
 * Local storage cache with TTL support
 */
export class StorageCache {
  private prefix: string;
  private ttl: number;

  constructor(prefix = 'app_cache', ttl = 5 * 60 * 1000) {
    this.prefix = prefix;
    this.ttl = ttl;
  }

  private getKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  set<T>(key: string, data: T, ttl?: number): void {
    if (typeof window === 'undefined') return;

    try {
      const entry: CacheEntry<T> = {
        data,
        expiry: Date.now() + (ttl || this.ttl),
      };
      localStorage.setItem(this.getKey(key), JSON.stringify(entry));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }

  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;

    try {
      const item = localStorage.getItem(this.getKey(key));
      if (!item) return null;

      const entry: CacheEntry<T> = JSON.parse(item);

      // Check if expired
      if (Date.now() > entry.expiry) {
        this.remove(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn('Failed to retrieve cached data:', error);
      return null;
    }
  }

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.getKey(key));
  }

  clear(): void {
    if (typeof window === 'undefined') return;

    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }
}

export const storageCache = new StorageCache();

// ============================================================================
// REACT HOOKS FOR CACHING
// ============================================================================

/**
 * Hook for cached API requests with fallback to storage
 * Usage:
 *   const { data, isLoading } = useCachedApi('/api/payments', 5 * 60 * 1000);
 */
export function useCachedApi<T>(
  url: string | null,
  ttl = 5 * 60 * 1000,
  swrConfig?: SWRConfiguration
) {
  const cacheKey = `api:${url}`;

  const { data, error, isLoading, mutate } = useSWR<T>(
    url,
    (url) => fetch(url).then(r => r.json()),
    {
      ...SWR_CONFIG,
      onSuccess: (data) => {
        // Cache successful responses
        storageCache.set(cacheKey, data, ttl);
      },
      ...swrConfig,
    }
  );

  // Fallback to storage cache if request fails
  const cachedData = !data && !isLoading ? storageCache.get<T>(cacheKey) : data;

  return {
    data: cachedData,
    error,
    isLoading,
    mutate,
  };
}

/**
 * Hook for efficient list data with caching and pagination
 */
export function usePaginatedData<T>(
  baseUrl: string,
  pageSize = 50,
  ttl = 5 * 60 * 1000
) {
  const [page, setPage] = useState(1);
  const url = `${baseUrl}?limit=${pageSize}&offset=${(page - 1) * pageSize}`;

  const { data, error, isLoading } = useSWR(
    url,
    (url) => fetch(url).then(r => r.json()),
    { ...SWR_CONFIG, onSuccess: (data) => storageCache.set(url, data, ttl) }
  );

  return {
    data: data?.results || [],
    total: data?.count || 0,
    isLoading,
    error,
    page,
    setPage,
    hasMore: data?.next !== null,
    hasPrev: page > 1,
  };
}

// ============================================================================
// MEMOIZATION HELPERS
// ============================================================================

/**
 * Hook for expensive computations with dependency tracking
 */
export function useExpensiveMemo<T>(
  compute: () => T,
  deps: React.DependencyList
): T {
  const startTime = useRef(0);

  const result = useMemo(() => {
    startTime.current = performance.now();
    const value = compute();
    const duration = performance.now() - startTime.current;

    if (duration > 100) {
      console.warn(
        `Expensive computation took ${duration.toFixed(2)}ms`,
        new Error().stack
      );
    }

    return value;
  }, deps);

  return result;
}

/**
 * Hook for stable callback references
 */
export function useStableCallback<Args extends any[], Return>(
  callback: (...args: Args) => Return,
  deps: React.DependencyList
): (...args: Args) => Return {
  return useCallback(callback, deps);
}

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

/**
 * Monitor component render performance
 */
export function useRenderMetrics(componentName: string) {
  const renderCount = useRef(0);
  const renderTimes: number[] = useRef([]).current;
  const startTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current++;
    const duration = performance.now() - startTime.current;
    renderTimes.push(duration);

    // Keep last 10 render times
    if (renderTimes.length > 10) {
      renderTimes.shift();
    }

    const avgDuration = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;

    if (avgDuration > 16.67) {  // Exceeds 60fps frame budget
      console.warn(
        `${componentName} render time: ${avgDuration.toFixed(2)}ms (avg of ${renderTimes.length})`
      );
    }

    startTime.current = performance.now();
  });

  return {
    renderCount: renderCount.current,
    avgRenderTime: renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length,
  };
}

/**
 * Report Web Vitals
 */
export function reportWebVitals() {
  if (typeof window === 'undefined') return;

  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(metric => console.log(`CLS: ${metric.value.toFixed(3)}`));
    getFID(metric => console.log(`FID: ${metric.value.toFixed(3)}ms`));
    getFCP(metric => console.log(`FCP: ${metric.value.toFixed(3)}ms`));
    getLCP(metric => console.log(`LCP: ${metric.value.toFixed(3)}ms`));
    getTTFB(metric => console.log(`TTFB: ${metric.value.toFixed(3)}ms`));
  });
}

// ============================================================================
// LAZY LOADING
// ============================================================================

/**
 * Lazy load components
 */
export function useLazyComponent<T extends React.ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>
) {
  const [Component, setComponent] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    componentImport().then(({ default: Comp }) => {
      setComponent(() => Comp);
      setIsLoading(false);
    });
  }, [componentImport]);

  return { Component, isLoading };
}

// ============================================================================
// NETWORK STATE
// ============================================================================

/**
 * Hook to detect network status changes
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline };
}

// ============================================================================
// REQUEST DEDUPLICATION
// ============================================================================

/**
 * Deduplicate simultaneous identical requests
 */
class RequestDeduplicator {
  private requests = new Map<string, Promise<any>>();

  async fetch<T>(
    key: string,
    fetcher: () => Promise<T>
  ): Promise<T> {
    // Return existing request if in progress
    if (this.requests.has(key)) {
      return this.requests.get(key);
    }

    // Create new request
    const request = fetcher()
      .finally(() => this.requests.delete(key));

    this.requests.set(key, request);
    return request;
  }
}

export const requestDeduplicator = new RequestDeduplicator();

// ============================================================================
// PREFETCHING
// ============================================================================

/**
 * Prefetch data for anticipated user actions
 */
export function usePrefetch() {
  const prefetch = useCallback(async (url: string) => {
    if (typeof window === 'undefined') return;

    try {
      // Check if already cached
      if (storageCache.get(url)) return;

      // Prefetch data
      const response = await fetch(url);
      const data = await response.json();
      storageCache.set(`api:${url}`, data);
    } catch (error) {
      console.debug('Prefetch failed:', error);
    }
  }, []);

  return { prefetch };
}

// ============================================================================
// OPTIMIZATION TIPS
// ============================================================================

export const OPTIMIZATION_TIPS = `
Performance Optimization Checklist:

1. ✅ Use React.memo() for expensive components
   - Prevents unnecessary re-renders
   - Wrap components that receive stable props

2. ✅ Use useMemo() for expensive computations
   - Memoize derived data
   - Keep dependency arrays tight

3. ✅ Use useCallback() for stable function references
   - Prevents child re-renders
   - Helps with memoization effectiveness

4. ✅ Implement virtual scrolling for large lists
   - Only render visible items
   - Use react-window or react-virtualized

5. ✅ Use SWR/React Query for caching
   - Automatic deduplication
   - Built-in refetch strategies
   - Offline support

6. ✅ Lazy load routes and components
   - Use React.lazy() + Suspense
   - Dynamic imports

7. ✅ Use Next.js Image component
   - Automatic optimization
   - Responsive images
   - Format conversion (avif, webp)

8. ✅ Enable compression (gzip, brotli)
   - Next.js does this by default
   - Check in production

9. ✅ Monitor performance metrics
   - Use Web Vitals
   - Track render times
   - Log slow operations

10. ✅ Use production build
    - npm run build && npm run start
    - Never use dev build in production
`;
