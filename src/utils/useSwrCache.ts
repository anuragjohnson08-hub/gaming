import { useEffect, useState } from 'react';

/**
 * 6. STALE-WHILE-REVALIDATE (SWR) CACHE
 * Instantly serves cached data from memory/localStorage (stale)
 * then performs silent background synchronization (revalidate),
 * updating state only if modified.
 */

const memoryCache = new Map<string, unknown>();

export function useSwrCache<T>(
  key: string,
  fetcher: () => T | Promise<T>,
  fallbackValue: T
): { data: T; isRevalidating: boolean } {
  const [data, setData] = useState<T>(() => {
    if (memoryCache.has(key)) {
      return memoryCache.get(key) as T;
    }
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`swr_${key}`);
        if (stored) {
          const parsed = JSON.parse(stored) as T;
          memoryCache.set(key, parsed);
          return parsed;
        }
      } catch {
        // fallback
      }
    }
    return fallbackValue;
  });

  const [isRevalidating, setIsRevalidating] = useState(false);

  useEffect(() => {
    let active = true;
    setIsRevalidating(true);

    Promise.resolve(fetcher())
      .then((fresh) => {
        if (!active) return;
        memoryCache.set(key, fresh);
        try {
          localStorage.setItem(`swr_${key}`, JSON.stringify(fresh));
        } catch {
          // ignore
        }
        setData(fresh);
      })
      .catch(() => {
        // keep stale data gracefully
      })
      .finally(() => {
        if (active) setIsRevalidating(false);
      });

    return () => {
      active = false;
    };
  }, [key]);

  return { data, isRevalidating };
}
