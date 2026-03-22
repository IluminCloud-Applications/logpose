import { useCachedQuery } from "./useCachedQuery";
import {
  fetchStripeAccounts,
  createStripeAccount,
  deleteStripeAccount,
  type StripeAccountAPI,
} from "@/services/stripe";
import { invalidateCacheByPrefix } from "@/lib/queryCache";

export function useStripeAccounts() {
  const { data, isLoading, error, reload } = useCachedQuery<StripeAccountAPI[]>({
    cachePrefix: "stripe-accounts",
    queryFn: fetchStripeAccounts,
  });

  const addAccount = async (name: string, apiKey: string) => {
    const newAccount = await createStripeAccount(name, apiKey);
    invalidateCacheByPrefix("stripe-accounts");
    await reload();
    return newAccount;
  };

  const removeAccount = async (id: number) => {
    await deleteStripeAccount(id);
    invalidateCacheByPrefix("stripe-accounts");
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
