import { useCachedQuery } from "./useCachedQuery";
import {
  fetchGeminiAccounts,
  createGeminiAccount,
  updateGeminiAccountModel,
  deleteGeminiAccount,
  type GeminiAccountAPI,
} from "@/services/integrations";
import { invalidateCacheByPrefix } from "@/lib/queryCache";

export function useGeminiAccounts() {
  const { data, isLoading, error, reload } = useCachedQuery<GeminiAccountAPI[]>({
    cachePrefix: "gemini-accounts",
    queryFn: fetchGeminiAccounts,
  });

  const addAccount = async (name: string, apiKey: string, model: string) => {
    const newAccount = await createGeminiAccount(name, apiKey, model);
    invalidateCacheByPrefix("gemini-accounts");
    await reload();
    return newAccount;
  };

  const updateModel = async (id: number, model: string) => {
    const updated = await updateGeminiAccountModel(id, model);
    invalidateCacheByPrefix("gemini-accounts");
    await reload();
    return updated;
  };

  const removeAccount = async (id: number) => {
    await deleteGeminiAccount(id);
    invalidateCacheByPrefix("gemini-accounts");
    await reload();
  };

  return {
    accounts: data ?? [],
    isLoading,
    error,
    addAccount,
    updateModel,
    removeAccount,
    reload,
  };
}
