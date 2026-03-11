import { useMemo } from "react";
import { useCachedQuery } from "./useCachedQuery";
import {
  fetchCampaignTags,
  saveCampaignTags,
  type CampaignTagsAPI,
} from "@/services/campaigns";
import { invalidateCacheByPrefix } from "@/lib/queryCache";

export function useCampaignTags() {
  const { data, isLoading, reload } = useCachedQuery<CampaignTagsAPI[]>({
    cachePrefix: "campaign-tags",
    queryFn: fetchCampaignTags,
  });

  const tagsMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    (data ?? []).forEach((t) => {
      map[t.campaign_id] = t.tags;
    });
    return map;
  }, [data]);

  const updateTags = async (campaignId: string, tags: string[]) => {
    const result = await saveCampaignTags(campaignId, tags);
    invalidateCacheByPrefix("campaign-tags");
    await reload();
    return result;
  };

  const allUniqueTags = useMemo(
    () => Array.from(new Set(Object.values(tagsMap).flat())).sort(),
    [tagsMap],
  );

  return { tagsMap, allUniqueTags, isLoading, updateTags, reload };
}
