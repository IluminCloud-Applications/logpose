import { useCachedQuery } from "./useCachedQuery";
import {
  fetchVturbAccounts,
  createVturbAccount,
  deleteVturbAccount,
  type VturbAccountAPI,
} from "@/services/integrations";
import { invalidateCacheByPrefix } from "@/lib/queryCache";

export function useVturbAccounts() {
  const { data, isLoading, error, reload } = useCachedQuery<VturbAccountAPI[]>({
    cachePrefix: "vturb-accounts",
    queryFn: fetchVturbAccounts,
  });

  const addAccount = async (name: string, apiKey: string) => {
    const newAccount = await createVturbAccount(name, apiKey);
    invalidateCacheByPrefix("vturb-accounts");
    await reload();
    return newAccount;
  };

  const removeAccount = async (id: number) => {
    await deleteVturbAccount(id);
    invalidateCacheByPrefix("vturb-accounts");
    await reload();
  };

  return {
    accounts: data ?? [],
    isLoading,
    error,
    addAccount,
    removeAccount,
    reload,
  };
}
