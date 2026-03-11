import { useState } from "react";
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

  const toggle = async (
    entityId: string,
    entityType: "campaign" | "adset" | "ad",
    active: boolean,
  ) => {
    if (!activeAccountId) return;
    await toggleCampaignStatus(activeAccountId, entityId, entityType, active);
    invalidateCacheByPrefix("campaigns");
    await reload();
  };

  const changeBudget = async (
    entityId: string,
    entityType: "campaign" | "adset",
    dailyBudget: number,
  ) => {
    if (!activeAccountId) return;
    await updateBudget(activeAccountId, entityId, entityType, dailyBudget);
    invalidateCacheByPrefix("campaigns");
    await reload();
  };

  return {
    campaigns: data?.campaigns ?? [],
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
