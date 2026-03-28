import { useState, useEffect, useCallback, useRef } from "react";
import {
  buildCacheKey,
  getCache,
  setCache,
  invalidateCache,
  isCacheStale,
} from "@/lib/queryCache";

interface UseCachedQueryOptions<T> {
  /** Unique prefix for this data domain (e.g. "campaigns", "dashboard"). */
  cachePrefix: string;
  /** Parameters that form the cache key. When they change, a new fetch happens. */
  params?: Record<string, unknown>;
  /** The async function that fetches data from the API. */
  queryFn: () => Promise<T>;
  /** If true, skip fetching (useful for conditional queries). */
  enabled?: boolean;
  /** Stale TTL in ms. If cache is older than this on mount, refetch in bg. Default: 120s. */
  staleTtlMs?: number;
  /** If set, automatically refetch silently every N ms. */
  autoRefreshMs?: number;
}

interface UseCachedQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  /** Force a fresh fetch, ignoring cache. Shows loading state. */
  reload: () => Promise<void>;
  /** Fetch fresh data in background without showing loading state. */
  silentReload: () => Promise<void>;
  /** Invalidate the cache for this key without refetching. */
  invalidate: () => void;
}

// In-flight requests dedup — evita chamadas duplicadas simultâneas
const inflightRequests = new Map<string, Promise<unknown>>();

/**
 * Generic hook that wraps any API call with in-memory caching.
 *
 * - On mount or param change: serves cached data instantly if available,
 *   otherwise fetches from API and caches the result.
 * - `reload()` forces a fresh fetch and updates the cache.
 * - Deduplicates in-flight requests for the same cache key.
 * - Stabilizes params via JSON serialization to prevent unnecessary re-fetches.
 */
export function useCachedQuery<T>(
  options: UseCachedQueryOptions<T>,
): UseCachedQueryResult<T> {
  const { cachePrefix, params, queryFn, enabled = true, staleTtlMs = 120_000, autoRefreshMs } = options;

  // Estabiliza params por valor (JSON) para evitar re-renders com objetos novos
  const paramsStr = params ? JSON.stringify(params) : "";
  const stableParamsRef = useRef(params);

  if (JSON.stringify(stableParamsRef.current) !== paramsStr) {
    stableParamsRef.current = params;
  }

  const stableParams = stableParamsRef.current;

  const cacheKey = buildCacheKey(cachePrefix, stableParams);
  const cached = getCache<T>(cacheKey);

  const [data, setData] = useState<T | null>(cached);
  const [isLoading, setIsLoading] = useState(!cached && enabled);
  const [error, setError] = useState<string | null>(null);
  const silentRef = useRef(false);

  const queryFnRef = useRef(queryFn);
  queryFnRef.current = queryFn;

  const fetchData = useCallback(
    async (skipCache = false) => {
      if (!enabled) return;

      const key = buildCacheKey(cachePrefix, stableParams);
      const isSilent = silentRef.current;

      // Serve from cache if available and not forcing refresh
      if (!skipCache) {
        const hit = getCache<T>(key);
        if (hit) {
          setData(hit);
          setIsLoading(false);
          setError(null);
          return;
        }
      }

      // Dedup: se já tem um request em andamento com a mesma key, aguarda ele
      const inflight = inflightRequests.get(key);
      if (inflight && !skipCache) {
        if (!isSilent) setIsLoading(true);
        try {
          const result = (await inflight) as T;
          setData(result);
          setError(null);
        } catch (err) {
          if (!isSilent) setError(err instanceof Error ? err.message : "Erro ao carregar dados");
        } finally {
          if (!isSilent) setIsLoading(false);
        }
        return;
      }

      if (!isSilent) {
        setIsLoading(true);
        setError(null);
      }

      const promise = queryFnRef.current();
      inflightRequests.set(key, promise);

      try {
        const result = await promise;
        setCache(key, result);
        setData(result);
      } catch (err) {
        if (!isSilent) setError(err instanceof Error ? err.message : "Erro ao carregar dados");
      } finally {
        if (!isSilent) setIsLoading(false);
        inflightRequests.delete(key);
        silentRef.current = false;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cachePrefix, paramsStr, enabled],
  );

  // Auto-fetch on mount or when params change.
  // If cache hit but stale (> staleTtlMs), refetch in background
  // keeping the existing data visible while the fresh data loads.
  useEffect(() => {
    const key = buildCacheKey(cachePrefix, stableParams);
    if (enabled && isCacheStale(key, staleTtlMs)) {
      fetchData(true);
    } else {
      fetchData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData]);

  const reload = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  const silentReload = useCallback(async () => {
    silentRef.current = true;
    await fetchData(true);
  }, [fetchData]);

  // Auto-refresh in background
  useEffect(() => {
    if (!autoRefreshMs || !enabled) return;
    const id = setInterval(() => {
      silentRef.current = true;
      fetchData(true);
    }, autoRefreshMs);
    return () => clearInterval(id);
  }, [autoRefreshMs, enabled, fetchData]);

  const invalidate = useCallback(() => {
    invalidateCache(cacheKey);
  }, [cacheKey]);

  return { data, isLoading, error, reload, silentReload, invalidate };
}
