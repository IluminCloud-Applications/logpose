import { useState } from "react";
import { useCachedQuery } from "./useCachedQuery";
import {
  fetchChannelConfigs,
  updateChannelConfigs,
  createCustomChannel,
  deleteCustomChannel,
  type ChannelConfig,
  type CustomChannelPayload,
} from "@/services/recovery";
import { invalidateCacheByPrefix } from "@/lib/queryCache";

export function useChannelConfigs() {
  const [isSaving, setIsSaving] = useState(false);

  const { data, isLoading, reload } = useCachedQuery<ChannelConfig[]>({
    cachePrefix: "channel-configs",
    queryFn: fetchChannelConfigs,
  });

  const save = async (updated: ChannelConfig[]) => {
    try {
      setIsSaving(true);
      await updateChannelConfigs(updated);
      _invalidateAndReload();
    } finally {
      setIsSaving(false);
    }
  };

  const addCustom = async (payload: CustomChannelPayload) => {
    try {
      setIsSaving(true);
      await createCustomChannel(payload);
      _invalidateAndReload();
    } finally {
      setIsSaving(false);
    }
  };

  const removeCustom = async (channel: string) => {
    try {
      setIsSaving(true);
      await deleteCustomChannel(channel);
      _invalidateAndReload();
    } finally {
      setIsSaving(false);
    }
  };

  const _invalidateAndReload = () => {
    invalidateCacheByPrefix("channel-configs");
    invalidateCacheByPrefix("recoveries");
    reload();
  };

  return {
    configs: data ?? [],
    isLoading,
    isSaving,
    save,
    addCustom,
    removeCustom,
    reload,
  };
}
