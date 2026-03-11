/**
 * In-memory cache for API responses.
 *
 * - Persists while the SPA is alive (navigation between pages).
 * - Cleared automatically on F5 / page reload (it's just JS memory).
 * - Each entry is keyed by a stable string derived from the query params.
 */

type CacheEntry<T = unknown> = {
  data: T;
  timestamp: number;
};

const store = new Map<string, CacheEntry>();

/** Build a deterministic cache key from a prefix + params object. */
export function buildCacheKey(
  prefix: string,
  params?: Record<string, unknown>,
): string {
  if (!params) return prefix;
  const sorted = Object.keys(params)
    .sort()
    .reduce<Record<string, unknown>>((acc, k) => {
      const v = params[k];
      if (v !== undefined && v !== null && v !== "") acc[k] = v;
      return acc;
    }, {});
  return `${prefix}:${JSON.stringify(sorted)}`;
}

/** Get cached data if available. */
export function getCache<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  return entry.data as T;
}

/** Store data in cache. */
export function setCache<T>(key: string, data: T): void {
  store.set(key, { data, timestamp: Date.now() });
}

/** Invalidate a specific key. */
export function invalidateCache(key: string): void {
  store.delete(key);
}

/** Invalidate all keys that start with a given prefix. */
export function invalidateCacheByPrefix(prefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key);
    }
  }
}

/** Clear the entire cache. */
export function clearCache(): void {
  store.clear();
}
