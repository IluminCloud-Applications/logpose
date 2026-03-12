import { useState, useEffect, useCallback } from "react";
import type { DateRangeState } from "@/components/DateRangeFilter";
import {
  fetchRefunds, fetchRefundsSummary, fetchReasonStats,
  type RefundItem, type RefundsSummary, type ReasonStat,
} from "@/services/refunds";
import { fetchSalesFilterOptions } from "@/services/sales";
import type { SalesFilterOptions } from "@/types/sale";
import { useCachedQuery } from "./useCachedQuery";

export interface RefundsFilters {
  dateRange: DateRangeState;
  status: string;
  platform: string;
  productId: string;
  search: string;
  hasReason: string;
}

export const defaultRefundsFilters: RefundsFilters = {
  dateRange: { preset: "30d", startDate: "", endDate: "" },
  status: "all",
  platform: "all",
  productId: "all",
  search: "",
  hasReason: "all",
};

export function useRefunds() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<RefundsFilters>(defaultRefundsFilters);
  const [filterOptions, setFilterOptions] = useState<SalesFilterOptions>({
    products: [], campaigns: [], platforms: [],
  });

  useEffect(() => {
    fetchSalesFilterOptions().then(setFilterOptions).catch(() => {});
  }, []);

  const buildParams = useCallback(() => {
    const p: Record<string, string | number | undefined> = {
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
    if (filters.productId !== "all") p.product_id = Number(filters.productId);
    if (filters.search) p.search = filters.search;
    if (filters.hasReason !== "all") p.has_reason = filters.hasReason;
    return p;
  }, [filters, page]);

  const params = buildParams();

  const summaryParams: Record<string, string | number | undefined> = {
    preset: filters.dateRange.preset,
  };
  if (filters.dateRange.preset === "custom") {
    summaryParams.start_date = filters.dateRange.startDate;
    summaryParams.end_date = filters.dateRange.endDate;
  }

  const { data: listData, isLoading, reload: reloadList } = useCachedQuery<{
    items: RefundItem[];
    total: number;
  }>({
    cachePrefix: "refunds-list",
    params,
    queryFn: () => fetchRefunds(params),
  });

  const { data: summary, reload: reloadSummary } = useCachedQuery<RefundsSummary>({
    cachePrefix: "refunds-summary",
    params: summaryParams,
    queryFn: () => fetchRefundsSummary(summaryParams),
  });

  const { data: reasonStats, reload: reloadReasons } = useCachedQuery<ReasonStat[]>({
    cachePrefix: "refunds-reasons-stats",
    params: summaryParams,
    queryFn: () => fetchReasonStats(summaryParams),
  });

  const updateFilters = (next: RefundsFilters) => {
    setPage(1);
    setFilters(next);
  };

  const reload = useCallback(async () => {
    await Promise.all([reloadList(), reloadSummary(), reloadReasons()]);
  }, [reloadList, reloadSummary, reloadReasons]);

  return {
    refunds: listData?.items ?? [],
    total: listData?.total ?? 0,
    summary,
    reasonStats: reasonStats ?? [],
    filterOptions,
    page,
    setPage,
    loading: isLoading,
    filters,
    updateFilters,
    reload,
  };
}
