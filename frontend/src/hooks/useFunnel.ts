import { useCachedQuery } from "./useCachedQuery";
import {
  fetchFunnelData,
  type FunnelProduct,
} from "@/services/funnel";

interface UseFunnelOptions {
  preset: string;
  dateStart?: string;
  dateEnd?: string;
}

export function useFunnel({ preset, dateStart, dateEnd }: UseFunnelOptions) {
  const { data, isLoading, error, reload } = useCachedQuery<FunnelProduct[]>({
    cachePrefix: "funnel",
    params: { preset, dateStart, dateEnd },
    queryFn: () => fetchFunnelData(preset, dateStart, dateEnd),
  });

  return { funnels: data ?? [], isLoading, error, reload };
}
