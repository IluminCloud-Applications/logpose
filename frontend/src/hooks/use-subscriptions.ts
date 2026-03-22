import { useState, useCallback, useMemo } from "react";
import { useCachedQuery } from "./useCachedQuery";
import {
  fetchSubscriptionMetrics,
  fetchStripeProducts,
  fetchMrrHistory,
  type SubscriptionMetrics,
  type StripeProduct,
  type MrrHistoryPoint,
} from "@/services/stripe";

export interface SubscriptionFilters {
  dateFrom: string;
  dateTo: string;
  productId: string;
}

function getDefaultFilters(): SubscriptionFilters {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

  return {
    dateFrom: firstDay.toISOString().split("T")[0],
    dateTo: now.toISOString().split("T")[0],
    productId: "",
  };
}

export function useSubscriptions() {
  const [filters, setFilters] = useState<SubscriptionFilters>(getDefaultFilters);

  const params = useMemo(
    () => ({
      date_from: filters.dateFrom,
      date_to: filters.dateTo,
      product_id: filters.productId || undefined,
    }),
    [filters]
  );

  const {
    data: metrics,
    isLoading,
    error,
    reload,
  } = useCachedQuery<SubscriptionMetrics>({
    cachePrefix: "subscription-metrics",
    params,
    queryFn: () => fetchSubscriptionMetrics(params),
  });

  const { data: products } = useCachedQuery<StripeProduct[]>({
    cachePrefix: "stripe-products",
    queryFn: fetchStripeProducts,
  });

  const { data: mrrHistoryData, isLoading: mrrHistoryLoading } = useCachedQuery<{
    mrr_history: MrrHistoryPoint[];
  }>({
    cachePrefix: "mrr-history",
    queryFn: () => fetchMrrHistory(12),
  });

  const updateFilters = useCallback((patch: Partial<SubscriptionFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  return {
    metrics,
    products: products ?? [],
    mrrHistory: mrrHistoryData?.mrr_history ?? [],
    mrrHistoryLoading,
    isLoading,
    error,
    filters,
    setFilters: updateFilters,
    reload,
  };
}

