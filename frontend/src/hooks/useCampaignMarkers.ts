import { useMemo } from "react";
import { useCachedQuery } from "./useCachedQuery";
import {
  fetchCampaignMarkers,
  upsertCampaignMarker,
  type CampaignMarkerAPI,
} from "@/services/campaigns";
import { invalidateCacheByPrefix } from "@/lib/queryCache";

export function useCampaignMarkers() {
  const { data, isLoading, reload } = useCachedQuery<CampaignMarkerAPI[]>({
    cachePrefix: "campaign-markers",
    queryFn: fetchCampaignMarkers,
  });

  const markersMap = useMemo(() => {
    const map: Record<string, { video?: CampaignMarkerAPI; checkout?: CampaignMarkerAPI }> = {};
    (data ?? []).forEach((m) => {
      if (!map[m.campaign_id]) map[m.campaign_id] = {};
      map[m.campaign_id][m.marker_type] = m;
    });
    return map;
  }, [data]);

  const saveMarker = async (
    campaignId: string,
    markerType: "video" | "checkout",
    referenceId: string,
    referenceLabel: string,
  ) => {
    await upsertCampaignMarker({
      campaign_id: campaignId,
      marker_type: markerType,
      reference_id: referenceId,
      reference_label: referenceLabel,
    });
    invalidateCacheByPrefix("campaign-markers");
    await reload();
  };

  return { markersMap, isLoading, saveMarker, reload };
}
