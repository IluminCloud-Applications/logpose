import { useState, useEffect, useCallback, useRef } from "react";
import {
  buildCacheKey,
  getCache,
  setCache,
  invalidateCache,
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
}

interface UseCachedQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  /** Force a fresh fetch, ignoring cache. */
  reload: () => Promise<void>;
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
  const { cachePrefix, params, queryFn, enabled = true } = options;

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

  const queryFnRef = useRef(queryFn);
  queryFnRef.current = queryFn;

  const fetchData = useCallback(
    async (skipCache = false) => {
      if (!enabled) return;

      const key = buildCacheKey(cachePrefix, stableParams);

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
        setIsLoading(true);
        try {
          const result = (await inflight) as T;
          setData(result);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Erro ao carregar dados");
        } finally {
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setError(null);

      const promise = queryFnRef.current();
      inflightRequests.set(key, promise);

      try {
        const result = await promise;
        setCache(key, result);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar dados");
      } finally {
        setIsLoading(false);
        inflightRequests.delete(key);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cachePrefix, paramsStr, enabled],
  );

  // Auto-fetch on mount or when params change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const reload = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  const invalidate = useCallback(() => {
    invalidateCache(cacheKey);
  }, [cacheKey]);

  return { data, isLoading, error, reload, invalidate };
}
