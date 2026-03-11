import { useState } from "react";
import { useCachedQuery } from "./useCachedQuery";
import {
  fetchChannelConfigs,
  updateChannelConfigs,
  type ChannelConfig,
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
      invalidateCacheByPrefix("channel-configs");
      await reload();
    } finally {
      setIsSaving(false);
    }
  };

  return { configs: data ?? [], isLoading, isSaving, save, reload };
}
