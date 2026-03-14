import { useState, useCallback } from "react";
import { useCachedQuery } from "./useCachedQuery";
import {
  fetchCampaignsData,
  toggleCampaignStatus,
  updateBudget,
  fetchPresets,
  createPreset,
  deletePreset,
  fetchCampaignFilterOptions,
  type CampaignData,
  type PresetAPI,
  type CampaignFilterOptionsAPI,
} from "@/services/campaigns";
import { useFacebookAccounts } from "./useFacebookAccounts";
import { invalidateCacheByPrefix } from "@/lib/queryCache";


export function useCampaigns(dateStart: string, dateEnd: string) {
  const { accounts } = useFacebookAccounts();
  const [selectedAccountId, setSelectedAccountId] = useState<number | undefined>();
  const [optimisticOverrides, setOptimisticOverrides] = useState<
    Record<string, { status?: string; budget?: number }>
  >({});

  const activeAccountId = selectedAccountId ?? accounts[0]?.id;

  const { data, isLoading, error, reload } = useCachedQuery<{
    campaigns: CampaignData[];
    unidentified: CampaignData | null;
  }>({
    cachePrefix: "campaigns",
    params: { dateStart, dateEnd, activeAccountId },
    queryFn: () => fetchCampaignsData(dateStart, dateEnd, activeAccountId),
    enabled: !!dateStart && !!dateEnd,
  });

  const applyOverrides = useCallback(
    (campaigns: CampaignData[]): CampaignData[] =>
      campaigns.map((c) => {
        const override = optimisticOverrides[c.id];
        const updatedAdsets = c.adsets.map((as_) => {
          const asOverride = optimisticOverrides[as_.id];
          const updatedAds = as_.ads.map((ad) => {
            const adOverride = optimisticOverrides[ad.id];
            return adOverride ? { ...ad, ...adOverride } : ad;
          });
          return asOverride
            ? { ...as_, ...asOverride, ads: updatedAds }
            : { ...as_, ads: updatedAds };
        });
        return override
          ? { ...c, ...override, adsets: updatedAdsets }
          : { ...c, adsets: updatedAdsets };
      }),
    [optimisticOverrides],
  );

  const toggle = async (
    entityId: string,
    entityType: "campaign" | "adset" | "ad",
    active: boolean,
  ) => {
    if (!activeAccountId) return;
    const newStatus = active ? "active" : "paused";
    setOptimisticOverrides((prev) => ({
      ...prev,
      [entityId]: { ...prev[entityId], status: newStatus },
    }));
    try {
      await toggleCampaignStatus(activeAccountId, entityId, entityType, active);
      invalidateCacheByPrefix("campaigns");
      await reload();
    } catch {
      // revert
    }
    setOptimisticOverrides((prev) => {
      const next = { ...prev };
      if (next[entityId]) {
        delete next[entityId].status;
        if (Object.keys(next[entityId]).length === 0) delete next[entityId];
      }
      return next;
    });
  };

  const changeBudget = async (
    entityId: string,
    entityType: "campaign" | "adset",
    dailyBudget: number,
  ) => {
    if (!activeAccountId) return;
    setOptimisticOverrides((prev) => ({
      ...prev,
      [entityId]: { ...prev[entityId], budget: dailyBudget },
    }));
    try {
      await updateBudget(activeAccountId, entityId, entityType, dailyBudget);
      invalidateCacheByPrefix("campaigns");
      await reload();
    } catch {
      // revert
    }
    setOptimisticOverrides((prev) => {
      const next = { ...prev };
      if (next[entityId]) {
        delete next[entityId].budget;
        if (Object.keys(next[entityId]).length === 0) delete next[entityId];
      }
      return next;
    });
  };

  const rawCampaigns = data?.campaigns ?? [];
  const campaigns = applyOverrides(rawCampaigns);

  return {
    campaigns,
    unidentified: data?.unidentified ?? null,
    isLoading,
    error,
    accounts,
    activeAccountId,
    setSelectedAccountId,
    toggle,
    changeBudget,
    reload,
  };
}

export function useCampaignPresets() {
  const { data, isLoading, reload } = useCachedQuery<PresetAPI[]>({
    cachePrefix: "campaign-presets",
    queryFn: fetchPresets,
  });

  const addPreset = async (name: string, columns: string[]) => {
    const p = await createPreset(name, columns);
    invalidateCacheByPrefix("campaign-presets");
    await reload();
    return p;
  };

  const removePreset = async (id: number) => {
    await deletePreset(id);
    invalidateCacheByPrefix("campaign-presets");
    await reload();
  };

  return { presets: data ?? [], isLoading, addPreset, removePreset, reload };
}

const defaultFilterOptions: CampaignFilterOptionsAPI = { products: [], platforms: [] };

export function useCampaignFilterOptions() {
  const { data, isLoading } = useCachedQuery<CampaignFilterOptionsAPI>({
    cachePrefix: "campaign-filter-options",
    queryFn: fetchCampaignFilterOptions,
  });

  return { filterOptions: data ?? defaultFilterOptions, isLoading };
}
