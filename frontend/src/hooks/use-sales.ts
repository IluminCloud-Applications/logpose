import { useState, useEffect, useCallback } from "react";
import type { SaleAPI, SalesSummary, SalesFilterOptions } from "@/types/sale";
import type { DateRangeState } from "@/components/DateRangeFilter";
import { fetchTransactions, fetchSalesSummary, fetchSalesFilterOptions } from "@/services/sales";
import { useCachedQuery } from "./useCachedQuery";
import { parseProductFilterValue } from "@/utils/product-filter";

export interface SalesFilters {
  dateRange: DateRangeState;
  status: string;
  platform: string;
  productId: string;
  campaign: string;
  accountSlug: string;
  search: string;
}

export const defaultSalesFilters: SalesFilters = {
  dateRange: { preset: "today", startDate: "", endDate: "" },
  status: "approved",
  platform: "all",
  productId: "all",
  campaign: "all",
  accountSlug: "all",
  search: "",
};

export function useSales() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<SalesFilters>(defaultSalesFilters);
  const [filterOptions, setFilterOptions] = useState<SalesFilterOptions>({ products: [], upsells: [], campaigns: [], platforms: [], accounts: [] });

  const buildParams = useCallback(() => {
    const p: Record<string, unknown> = {
      preset: filters.dateRange.preset,
      page,
      per_page: 12,
    };
    if (filters.dateRange.preset === "custom") {
      p.start_date = filters.dateRange.startDate;
      p.end_date = filters.dateRange.endDate;
    }
    if (filters.status !== "all") p.status = filters.status;
    if (filters.platform !== "all") p.platform = filters.platform;
    const pf = parseProductFilterValue(filters.productId);
    if (pf.product_id) p.product_id = pf.product_id;
    if (pf.upsell_id) p.upsell_id = pf.upsell_id;
    if (filters.campaign !== "all") p.campaign = filters.campaign;
    if (filters.accountSlug !== "all") p.account_slug = filters.accountSlug;
    if (filters.search) p.search = filters.search;
    return p;
  }, [filters, page]);

  const buildSummaryParams = useCallback(() => {
    const p: Record<string, unknown> = {
      preset: filters.dateRange.preset,
    };
    if (filters.dateRange.preset === "custom") {
      p.start_date = filters.dateRange.startDate;
      p.end_date = filters.dateRange.endDate;
    }
    // status is intentionally excluded — summary always shows all statuses
    if (filters.platform !== "all") p.platform = filters.platform;
    const pf = parseProductFilterValue(filters.productId);
    if (pf.product_id) p.product_id = pf.product_id;
    if (pf.upsell_id) p.upsell_id = pf.upsell_id;
    if (filters.campaign !== "all") p.campaign = filters.campaign;
    if (filters.accountSlug !== "all") p.account_slug = filters.accountSlug;
    if (filters.search) p.search = filters.search;
    return p;
  }, [filters]);

  const params = buildParams();
  const summaryParams = buildSummaryParams();

  const { data: txData, isLoading: txLoading, reload: reloadTx } = useCachedQuery<{
    items: SaleAPI[];
    total: number;
  }>({
    cachePrefix: "sales-list",
    params,
    queryFn: () => fetchTransactions(params as Record<string, string | number | undefined>),
  });

  const { data: summary, reload: reloadSummary } = useCachedQuery<SalesSummary>({
    cachePrefix: "sales-summary",
    params: summaryParams,
    queryFn: () => fetchSalesSummary(summaryParams as Record<string, string | number | undefined>),
  });

  useEffect(() => {
    fetchSalesFilterOptions().then(setFilterOptions).catch(() => {});
  }, []);

  const updateFilters = (next: SalesFilters) => {
    setPage(1);
    setFilters(next);
  };

  const reload = useCallback(async () => {
    await Promise.all([reloadTx(), reloadSummary()]);
  }, [reloadTx, reloadSummary]);

  return {
    sales: txData?.items ?? [],
    summary,
    filterOptions,
    total: txData?.total ?? 0,
    page,
    setPage,
    loading: txLoading,
    filters,
    updateFilters,
    reload,
  };
}
