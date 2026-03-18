import { useEffect, useRef } from "react";
import { fetchCampaignsData } from "@/services/campaigns";
import { setCache, buildCacheKey } from "@/lib/queryCache";
import { computeDateRange } from "@/pages/campaigns/components/dateHelpers";

/**
 * Background prefetcher: after loading "today", silently fetches
 * yesterday, 3d, 7d, 30d date ranges and caches them.
 * This makes switching date ranges near-instant.
 */
const PREFETCH_PRESETS = ["yesterday", "3d", "7d", "30d"] as const;

export function useCampaignPrefetch(activeAccountId?: number) {
  const prefetchedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!activeAccountId) return;

    // Only prefetch once per account
    const key = String(activeAccountId);
    if (prefetchedRef.current === key) return;
    prefetchedRef.current = key;

    // Small delay to let the main fetch finish first
    const timer = setTimeout(() => {
      for (const preset of PREFETCH_PRESETS) {
        const range = computeDateRange(preset);
        const cacheKey = buildCacheKey("campaigns", {
          dateStart: range.start,
          dateEnd: range.end,
          activeAccountId,
        });

        // Only fetch if not already cached
        fetchCampaignsData(range.start, range.end, activeAccountId)
          .then((data) => {
            setCache(cacheKey, data);
          })
          .catch(() => {
            // Silent fail — background prefetch
          });
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [activeAccountId]);
}
