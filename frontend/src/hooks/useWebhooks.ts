import { useCachedQuery } from "./useCachedQuery";
import {
  fetchWebhooks,
  createWebhook,
  deleteWebhook,
  type WebhookEndpointAPI,
} from "@/services/integrations";
import { invalidateCacheByPrefix } from "@/lib/queryCache";

export function useWebhooks() {
  const { data, isLoading, error, reload } = useCachedQuery<WebhookEndpointAPI[]>({
    cachePrefix: "webhooks",
    queryFn: fetchWebhooks,
  });

  const addWebhook = async (platform: string, name: string) => {
    const newEndpoint = await createWebhook(platform, name);
    invalidateCacheByPrefix("webhooks");
    await reload();
    return newEndpoint;
  };

  const removeWebhook = async (id: number) => {
    await deleteWebhook(id);
    invalidateCacheByPrefix("webhooks");
    await reload();
  };

  return {
    endpoints: data ?? [],
    isLoading,
    error,
    addWebhook,
    removeWebhook,
    reload,
  };
}
