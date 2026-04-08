import { useCachedQuery } from "./useCachedQuery";
import {
  fetchRecoveryFunnelData,
  type FunnelProduct,
} from "@/services/funnel";

interface UseRecoveryFunnelOptions {
  preset: string;
  dateStart?: string;
  dateEnd?: string;
  enabled?: boolean;
}

export function useRecoveryFunnel({
  preset, dateStart, dateEnd, enabled = true,
}: UseRecoveryFunnelOptions) {
  const { data, isLoading, error, reload } = useCachedQuery<FunnelProduct[]>({
    cachePrefix: "recovery-funnel",
    params: { preset, dateStart, dateEnd },
    queryFn: () => fetchRecoveryFunnelData(preset, dateStart, dateEnd),
    enabled,
  });

  return { funnels: data ?? [], isLoading, error, reload };
}
